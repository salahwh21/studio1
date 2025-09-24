

'use client';

import { useState, useMemo, useRef, useCallback } from 'react';
import {
  Printer,
  ScanLine,
  Check,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import Icon from '@/components/icon';
import { useOrdersStore, type Order } from '@/store/orders-store';
import { useUsersStore } from '@/store/user-store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

// ---------------- Enums ----------------
export enum OrderStatus {
  InDelivery = 'قيد التوصيل',
  Delivered = 'تم التوصيل',
  Completed = 'مكتمل',
  ReturnedToBranch = 'مرجع للفرع',
  ReadyForMerchant = 'جاهز للتسليم للتاجر',
  ReturnedToMerchant = 'مرجع للتاجر',
}

// ---------------- Types ----------------
type ReceivingManifest = {
  id: string;
  driverName: string;
  createdAt: string;
  itemCount: number;
  items: Order[];
};

type MerchantReturnManifest = {
  id: string;
  merchantName: string;
  createdAt: string;
  itemCount: number;
  items: Order[];
  status: 'ready' | 'delivered';
};

// ---------------- Hook: usePrint ----------------
function usePrint() {
  return useCallback((content: HTMLElement | null, title = 'كشف', header?: string, footer?: string, logoUrl?: string) => {
    if (!content) return;
    const today = new Date().toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const printWindow = window.open('', '_blank');
    printWindow?.document.write(`
      <html dir="rtl" lang="ar">
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Tahoma, sans-serif; direction: rtl; margin: 20px; }
            .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
            .header img { height: 60px; }
            .header h1 { font-size: 20px; margin: 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; direction: rtl; }
            th, td { border: 1px solid #333; padding: 8px; text-align: right; font-size: 14px; }
            th { background-color: #f2f2f2; }
            .footer { margin-top: 40px; text-align: center; font-size: 14px; }
            .signature { margin-top: 60px; display: flex; justify-content: space-between; }
            .signature div { width: 40%; border-top: 1px solid #333; text-align: center; padding-top: 5px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            ${logoUrl ? `<img src="${logoUrl}" alt="شعار" />` : ''}
            <div>
              <h1>${header || title}</h1>
              <p>التاريخ: ${today}</p>
            </div>
          </div>
          
          ${content.innerHTML}

          <div class="footer">
            ${footer || ''}
            <div class="signature">
              <div>توقيع الموظف</div>
              <div>توقيع المستلم</div>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow?.document.close();
    printWindow?.focus();
    printWindow?.print();
  }, []);
}

// ---------------- Stage 1: Receive From Driver ----------------
const ReceiveFromDriver = ({ onManifestCreated }: { onManifestCreated: (manifest: ReceivingManifest) => void }) => {
  const { toast } = useToast();
  const { orders, bulkUpdateOrderStatus } = useOrdersStore();
  const { users } = useUsersStore();
  const print = usePrint();

  const drivers = useMemo(() => users.filter(u => u.roleId === 'driver'), [users]);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [scannedValue, setScannedValue] = useState('');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [receivedItems, setReceivedItems] = useState<Order[]>([]);
  const [driverPopoverOpen, setDriverPopoverOpen] = useState(false);
  
  const printableRef = useRef<HTMLDivElement>(null);


  const driverOrders = useMemo(() => {
    if (!selectedDriverId) return [];
    const driver = users.find(u => u.id === selectedDriverId);
    if (!driver) return [];
    
    return orders.filter(o =>
      o.driver === driver.name &&
      ![OrderStatus.Delivered, OrderStatus.Completed, OrderStatus.ReturnedToBranch, OrderStatus.ReadyForMerchant, OrderStatus.ReturnedToMerchant].includes(o.status as OrderStatus) &&
      !receivedItems.some(ri => ri.id === o.id)
    );
  }, [selectedDriverId, users, orders, receivedItems]);

  const handleScan = () => {
    if (!scannedValue) return;
    const order = driverOrders.find(o => o.id === scannedValue || o.referenceNumber === scannedValue);
    if (order) {
      setReceivedItems(prev => [order, ...prev]);
      setSelectedOrderIds(prev => prev.filter(id => id !== order.id));
      setScannedValue('');
      toast({ title: 'تم الاستلام', description: `تم استلام الطلب ${order.id}.` });
    } else {
      toast({ variant: 'destructive', title: 'خطأ', description: 'الطلب غير موجود في قائمة هذا السائق أو تم استلامه بالفعل.' });
    }
  };

  const handleAddSelected = () => {
    const toAdd = driverOrders.filter(o => selectedOrderIds.includes(o.id));
    setReceivedItems(prev => [...toAdd, ...prev]);
    setSelectedOrderIds([]);
  };

  const createReceivingManifest = () => {
    if (receivedItems.length === 0) {
      toast({ variant: 'destructive', title: 'خطأ', description: 'لم يتم استلام أي شحنات لإنشاء كشف.' });
      return;
    }
    const driver = users.find(u => u.id === selectedDriverId);
    if (!driver) return;

    bulkUpdateOrderStatus(receivedItems.map(i => i.id), OrderStatus.ReturnedToBranch);

    const newManifest: ReceivingManifest = {
      id: `RECV-${Date.now()}`,
      driverName: driver.name,
      createdAt: new Date().toISOString(),
      itemCount: receivedItems.length,
      items: receivedItems,
    };

    onManifestCreated(newManifest);
    toast({ title: 'تم إنشاء كشف الاستلام', description: `تم إنشاء كشف استلام للسائق ${driver.name} بـ ${receivedItems.length} شحنات.` });
    
    setReceivedItems([]);
    setSelectedOrderIds([]);
    setSelectedDriverId(null);
  };
  
    const handleSelectAllDriverOrders = (checked: boolean) => {
        if(checked) {
            setSelectedOrderIds(driverOrders.map(o => o.id));
        } else {
            setSelectedOrderIds([]);
        }
    }

  const selectedDriver = drivers.find(d => d.id === selectedDriverId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" dir="rtl">
      {/* اختيار السائق */}
      <Card>
        <CardHeader>
          <CardTitle>1. اختر السائق واستلم المرتجعات</CardTitle>
          <CardDescription>اختر سائقًا لمسح أو تحديد الشحنات المرتجعة منه.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Popover open={driverPopoverOpen} onOpenChange={setDriverPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" className="w-full justify-between">
                {selectedDriver ? selectedDriver.name : 'اختر سائق...'}
                <Icon name="ChevronsUpDown" className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
              <Command>
                <CommandInput placeholder="بحث عن سائق..." />
                <CommandList>
                  <CommandEmpty>لم يتم العثور على سائق.</CommandEmpty>
                  <CommandGroup>
                    {drivers.map(d => (
                      <CommandItem key={d.id} value={d.name} onSelect={() => { setSelectedDriverId(d.id); setDriverPopoverOpen(false); }}>
                        <Check className={cn("ml-2 h-4 w-4", selectedDriverId === d.id ? "opacity-100" : "opacity-0")} />
                        {d.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <div className="relative">
            <ScanLine className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="امسح رقم الطلب هنا..."
              className="pr-10 text-lg h-12"
              value={scannedValue}
              onChange={(e) => setScannedValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleScan()}
              disabled={!selectedDriverId}
            />
          </div>
        </CardContent>

        <CardContent>
          <div className="flex justify-between items-center mb-2">
            <CardTitle className="text-base">شحنات لم تسلم ({driverOrders.length})</CardTitle>
            <Button onClick={handleAddSelected} disabled={selectedOrderIds.length === 0} size="sm">
              إضافة المحدد للاستلام ({selectedOrderIds.length})
            </Button>
          </div>
          <ScrollArea className="h-64 border rounded-md">
          <div dir="rtl">
            <Table className="w-full border">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center border-r">
                    <Checkbox
                      checked={selectedOrderIds.length === driverOrders.length && driverOrders.length > 0}
                      indeterminate={selectedOrderIds.length > 0 && selectedOrderIds.length < driverOrders.length}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedOrderIds(driverOrders.map(order => order.id))
                        } else {
                          setSelectedOrderIds([])
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead className="w-16 text-center border-r">#</TableHead>
                  <TableHead className="text-center border-r">رقم الطلب</TableHead>
                  <TableHead className="text-center border-r">العميل</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {driverOrders.map((order, index) => (
                  <TableRow key={order.id}>
                    <TableCell className="text-center border-r">
                      <Checkbox
                        checked={selectedOrderIds.includes(order.id)}
                        onCheckedChange={(checked) => {
                          setSelectedOrderIds(prev =>
                            checked
                              ? [...prev, order.id]
                              : prev.filter(id => id !== order.id)
                          )
                        }}
                      />
                    </TableCell>
                    <TableCell className="text-center border-r">{index + 1}</TableCell>
                    <TableCell className="text-center border-r">{order.id}</TableCell>
                    <TableCell className="text-center border-r">{order.recipient}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="flex flex-col">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>2. إنشاء كشف استلام</CardTitle>
            <Button onClick={createReceivingManifest} disabled={receivedItems.length === 0}>
                <Icon name="FileCheck" className="ml-2" />
                إنشاء كشف الاستلام
            </Button>
          </div>
          <CardDescription>هذه هي قائمة الشحنات التي تم استلامها وجاهزة للتوثيق. ({receivedItems.length} شحنات)</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col gap-4">
        <div ref={printableRef} className="flex-grow">
            <ScrollArea className="h-80 border rounded-md">
              <div dir="rtl">
              <Table className="w-full border">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16 text-center border-r">#</TableHead>
                    <TableHead className="text-center border-r">رقم الطلب</TableHead>
                    <TableHead className="text-center border-r">العميل</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receivedItems.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-center border-r">{index + 1}</TableCell>
                      <TableCell className="text-center border-r">{item.id}</TableCell>
                      <TableCell className="text-center border-r">{item.recipient}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ---------------- Stage 2: Driver Receiving Log ----------------
const ReceivingLog = ({ manifests }: { manifests: ReceivingManifest[] }) => {
    const [selectedManifest, setSelectedManifest] = useState<ReceivingManifest | null>(manifests.length > 0 ? manifests[0] : null);
    const printableContentRef = useRef<HTMLDivElement>(null);
    const print = usePrint();

    const handlePrintClick = () => {
        if (selectedManifest) {
            print(printableContentRef.current, 'كشف استلام مرتجعات', `كشف استلام من السائق ${selectedManifest.driverName}`, 'تم الاستلام بواسطة قسم المرتجعات', '/logo.png');
        }
    };
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" dir="rtl">
            <Card className="lg:col-span-1">
                <CardHeader>
                    <CardTitle>سجل الاستلام من السائقين</CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-96">
                        <div dir="rtl">
                        <Table>
                             <TableHeader>
                                <TableRow>
                                    <TableHead className="w-16 text-center border-r">#</TableHead>
                                    <TableHead className="text-center border-r">رقم الكشف</TableHead>
                                    <TableHead className="text-center border-r">السائق</TableHead>
                                    <TableHead className="text-center border-r">العدد</TableHead>
                                    <TableHead className="text-center border-r">التاريخ</TableHead>
                                </TableRow>
                             </TableHeader>
                             <TableBody>
                                {manifests.map((m, index) => (
                                    <TableRow key={m.id} onClick={() => setSelectedManifest(m)} className={cn("cursor-pointer", selectedManifest?.id === m.id && "bg-muted")}>
                                        <TableCell className="text-center border-r">{index + 1}</TableCell>
                                        <TableCell className="text-center border-r">{m.id}</TableCell>
                                        <TableCell className="text-center border-r">{m.driverName}</TableCell>
                                        <TableCell className="text-center border-r">{m.itemCount}</TableCell>
                                        <TableCell className="text-center border-r">{new Date(m.createdAt).toLocaleDateString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
            <Card className="lg:col-span-2">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>تفاصيل الكشف المحدد</CardTitle>
                            {selectedManifest && <CardDescription>الشحنات المستلمة في الكشف رقم {selectedManifest.id}.</CardDescription>}
                        </div>
                        {selectedManifest && <Button variant="outline" onClick={handlePrintClick}><Printer className="ml-2 h-4 w-4"/>طباعة الكشف</Button>}
                    </div>
                </CardHeader>
                <CardContent>
                     {selectedManifest ? (
                         <>
                            <div ref={printableContentRef}>
                                <div className="hidden print:block mb-4">
                                    <h1>كشف استلام مرتجعات</h1>
                                    <p><strong>رقم الكشف:</strong> {selectedManifest.id}</p>
                                    <p><strong>اسم السائق:</strong> {selectedManifest.driverName}</p>
                                    <p><strong>تاريخ الإنشاء:</strong> {new Date(selectedManifest.createdAt).toLocaleString('ar-JO')}</p>
                                    <p><strong>إجمالي الشحنات:</strong> {selectedManifest.itemCount}</p>
                                </div>
                                <ScrollArea className="h-80 border rounded-md">
                                    <div dir="rtl">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-16 text-center border-r">#</TableHead>
                                                <TableHead className="text-center border-r">الحالة</TableHead>
                                                <TableHead className="text-center border-r">رقم الطلب</TableHead>
                                                <TableHead className="text-center border-r">العميل</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {selectedManifest.items.map((item, index) => (
                                                <TableRow key={item.id}>
                                                    <TableCell className="text-center border-r">{index + 1}</TableCell>
                                                    <TableCell className="text-center border-r"><Badge>مرجع للفرع</Badge></TableCell>
                                                    <TableCell className="text-center border-r">{item.id}</TableCell>
                                                    <TableCell className="text-center border-r">{item.recipient}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                    </div>
                                </ScrollArea>
                            </div>
                        </>
                     ) : (
                         <div className="text-center text-muted-foreground py-20">الرجاء تحديد كشف من القائمة لعرض تفاصيله.</div>
                     )}
                </CardContent>
            </Card>
        </div>
    );
};


// ---------------- Stage 3: Group Merchant Returns ----------------
const GroupMerchantReturns = ({ onManifestCreated }: { onManifestCreated: (manifest: MerchantReturnManifest) => void }) => {
    const { orders, bulkUpdateOrderStatus } = useOrdersStore();
    const { toast } = useToast();

    const merchantReturns = useMemo(() => {
        const returnsInBranch = orders.filter(o => o.status === OrderStatus.ReturnedToBranch);
        return returnsInBranch.reduce((acc, order) => {
            if (!acc[order.merchant]) {
                acc[order.merchant] = [];
            }
            acc[order.merchant].push(order);
            return acc;
        }, {} as Record<string, Order[]>);
    }, [orders]);
    
    const [selectedMerchant, setSelectedMerchant] = useState<string | null>(null);
    const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
    
    const ordersForSelectedMerchant = useMemo(() => selectedMerchant ? merchantReturns[selectedMerchant] || [] : [], [selectedMerchant, merchantReturns]);

    const handleCreateManifest = () => {
        if (!selectedMerchant || selectedOrderIds.length === 0) {
            toast({ variant: 'destructive', title: "خطأ", description: "الرجاء اختيار تاجر وتحديد شحنات." });
            return;
        }

        const itemsToReturn = (merchantReturns[selectedMerchant] || []).filter(o => selectedOrderIds.includes(o.id));
        bulkUpdateOrderStatus(itemsToReturn.map(i => i.id), OrderStatus.ReadyForMerchant);

        const newManifest: MerchantReturnManifest = {
            id: `MRTN-${Date.now()}`,
            merchantName: selectedMerchant,
            createdAt: new Date().toISOString(),
            itemCount: itemsToReturn.length,
            items: itemsToReturn,
            status: 'ready',
        };

        onManifestCreated(newManifest);
        toast({ title: "تم إنشاء كشف إرجاع", description: `تم تجميع ${itemsToReturn.length} شحنات للتاجر ${selectedMerchant}.` });
        setSelectedOrderIds([]);
        setSelectedMerchant(null);
    };
    
    const handleSelectAllMerchantOrders = (checked: boolean) => {
        if(checked) {
            setSelectedOrderIds(ordersForSelectedMerchant.map(o => o.id));
        } else {
            setSelectedOrderIds([]);
        }
    }


    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" dir="rtl">
            <Card className="lg:col-span-1">
                <CardHeader>
                    <CardTitle>التجار ذوي المرتجعات</CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-96">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-16 text-right border-l">#</TableHead>
                                    <TableHead className="text-right border-l">التاجر</TableHead>
                                    <TableHead className="text-right border-l">عدد الشحنات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Object.entries(merchantReturns).map(([merchant, items], index) => (
                                    <TableRow key={merchant} onClick={() => setSelectedMerchant(merchant)} className={cn("cursor-pointer", selectedMerchant === merchant && "bg-muted")}>
                                        <TableCell className="text-right border-l">{index + 1}</TableCell>
                                        <TableCell className="text-right border-l">{merchant}</TableCell>
                                        <TableCell className="text-right border-l">{items.length}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </CardContent>
            </Card>
             <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>تجميع شحنات التاجر المحدد</CardTitle>
                    {selectedMerchant && <CardDescription>الشحنات المرتجعة للتاجر: {selectedMerchant}.</CardDescription>}
                </CardHeader>
                <CardContent>
                    {selectedMerchant ? (
                        <>
                            <div className="flex justify-end mb-4">
                                <Button onClick={handleCreateManifest} size="sm" disabled={selectedOrderIds.length === 0}>
                                    <Icon name="FilePlus" className="ml-2" />
                                    إنشاء كشف إرجاع ({selectedOrderIds.length})
                                </Button>
                            </div>
                            <ScrollArea className="h-80 border rounded-md">
                                <div dir="rtl">
  <Table className="w-full border">
    <TableHeader>
      <TableRow>
        <TableHead className="w-12 text-center border-r">
          <Checkbox
            checked={
              ordersForSelectedMerchant.length > 0 &&
              selectedOrderIds.length === ordersForSelectedMerchant.length
            }
            indeterminate={
              selectedOrderIds.length > 0 &&
              selectedOrderIds.length < ordersForSelectedMerchant.length
            }
            onCheckedChange={(checked) => {
              if (checked) {
                setSelectedOrderIds(ordersForSelectedMerchant.map(order => order.id))
              } else {
                setSelectedOrderIds([])
              }
            }}
          />
        </TableHead>
        <TableHead className="w-16 text-center border-r">#</TableHead>
        <TableHead className="text-center border-r">العميل</TableHead>
        <TableHead className="text-center border-r">رقم الطلب</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {(merchantReturns[selectedMerchant] || []).map((order, index) => (
        <TableRow key={order.id}>
          <TableCell className="text-center border-r">
            <Checkbox
              checked={selectedOrderIds.includes(order.id)}
              onCheckedChange={(checked) => {
                setSelectedOrderIds(prev =>
                  checked
                    ? [...prev, order.id]
                    : prev.filter(id => id !== order.id)
                )
              }}
            />
          </TableCell>
          <TableCell className="text-center border-r">{index + 1}</TableCell>
          <TableCell className="text-center border-r">{order.recipient}</TableCell>
          <TableCell className="text-center border-r">{order.id}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</div>
                            </ScrollArea>
                        </>
                    ) : (
                         <div className="text-center text-muted-foreground py-20">الرجاء تحديد تاجر من القائمة لعرض شحناته.</div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};


// ---------------- Stage 4: Merchant Delivery Log ----------------
const MerchantDeliveryLog = ({ manifests, onUpdateManifests }: { manifests: MerchantReturnManifest[], onUpdateManifests: (manifests: MerchantReturnManifest[]) => void }) => {
    const { toast } = useToast();
    const [selectedManifest, setSelectedManifest] = useState<MerchantReturnManifest | null>(null);
    const printableContentRef = useRef<HTMLDivElement>(null);
    const print = usePrint();
    
    const handleConfirmDelivery = (manifestId: string) => {
        const newManifests = manifests.map(m => m.id === manifestId ? { ...m, status: 'delivered' } : m);
        onUpdateManifests(newManifests);
        toast({ title: "تم تأكيد التسليم", description: "تم تحديث حالة الكشف بنجاح." });
    };

    const handlePrint = (manifest: MerchantReturnManifest) => {
        setSelectedManifest(manifest);
        setTimeout(() => {
             print(printableContentRef.current, `كشف إرجاع للتاجر`, `إرجاع شحنات للتاجر: ${manifest.merchantName}`, 'تم التسليم بواسطة قسم المرتجعات', '/logo.png');
        }, 100);
    };

    return (
        <Card dir="rtl">
            <CardHeader>
                <CardTitle>سجل تسليم المرتجعات للتجار</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                             <TableHead className="w-16 text-right border-l">#</TableHead>
                            <TableHead className="text-right border-l">إجراءات</TableHead>
                            <TableHead className="text-right border-l">الحالة</TableHead>
                            <TableHead className="text-right border-l">عدد الشحنات</TableHead>
                            <TableHead className="text-right border-l">تاريخ الإنشاء</TableHead>
                            <TableHead className="text-right border-l">التاجر</TableHead>
                            <TableHead className="text-right border-l">رقم الكشف</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {manifests.map((m, index) => (
                             <TableRow key={m.id}>
                                <TableCell className="text-right border-l">{index + 1}</TableCell>
                                <TableCell className="flex gap-2 text-right border-l">
                                    <Button variant="outline" size="sm" onClick={() => handlePrint(m)}><Printer className="h-4 w-4 ml-1"/>طباعة</Button>
                                    {m.status === 'ready' && (
                                        <Button size="sm" onClick={() => handleConfirmDelivery(m.id)}>تأكيد التسليم</Button>
                                    )}
                                </TableCell>
                                <TableCell className="text-right border-l">
                                    <Badge variant={m.status === 'delivered' ? 'default' : 'secondary'} className={m.status === 'delivered' ? 'bg-green-100 text-green-700' : ''}>
                                        {m.status === 'delivered' ? 'تم التسليم' : 'جاهز للتسليم'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right border-l">{m.itemCount}</TableCell>
                                <TableCell className="text-right border-l">{new Date(m.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right border-l">{m.merchantName}</TableCell>
                                <TableCell className="text-right border-l">{m.id}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
            {/* Hidden printable area */}
            <div className="hidden">
                {selectedManifest && (
                    <div ref={printableContentRef}>
                        <table>
                            <thead>
                                <tr><th>رقم الطلب</th><th>العميل</th><th>ملاحظات</th></tr>
                            </thead>
                            <tbody>
                                {selectedManifest.items.map(item => (
                                    <tr key={item.id}>
                                        <td>{item.id}</td>
                                        <td>{item.recipient}</td>
                                        <td>{item.notes}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </Card>
    );
}


// ---------------- Main Component ----------------
export default function ReturnsManagementPage() {
    const [driverManifests, setDriverManifests] = useState<ReceivingManifest[]>([]);
    const [merchantManifests, setMerchantManifests] = useState<MerchantReturnManifest[]>([]);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Icon name="Undo2" /> ادارة المرتجعات
                    </CardTitle>
                    <CardDescription>
                        إدارة عملية استلام المرتجعات من السائقين وإعادتها إلى التجار في أربع مراحل منظمة.
                    </CardDescription>
                </CardHeader>
            </Card>

            <Tabs defaultValue="receive-from-driver" className="w-full">
                <TabsList className="grid w-full grid-cols-4" dir="rtl">
                    <TabsTrigger value="receive-from-driver">1. استلام من السائق</TabsTrigger>
                    <TabsTrigger value="receiving-log">2. سجل الاستلام</TabsTrigger>
                    <TabsTrigger value="group-merchant-returns">3. تجميع مرتجعات التجار</TabsTrigger>
                    <TabsTrigger value="merchant-delivery-log">4. سجل التسليم للتجار</TabsTrigger>
                </TabsList>
                <TabsContent value="receive-from-driver" className="mt-6">
                    <ReceiveFromDriver onManifestCreated={(manifest) => setDriverManifests(prev => [manifest, ...prev])} />
                </TabsContent>
                <TabsContent value="receiving-log" className="mt-6">
                    <ReceivingLog manifests={driverManifests} />
                </TabsContent>
                <TabsContent value="group-merchant-returns" className="mt-6">
                    <GroupMerchantReturns onManifestCreated={(manifest) => setMerchantManifests(prev => [manifest, ...prev])} />
                </TabsContent>
                <TabsContent value="merchant-delivery-log" className="mt-6">
                    <MerchantDeliveryLog manifests={merchantManifests} onUpdateManifests={setMerchantManifests}/>
                </TabsContent>
            </Tabs>
        </div>
    );
}

    

    
