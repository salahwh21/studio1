'use client';
import { useState, useMemo, useRef } from 'react';
import { useOrdersStore, type Order } from '@/store/orders-store';
import { useUsersStore, type User } from '@/store/user-store';
import { useReturnsStore } from '@/store/returns-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/icon';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check } from 'lucide-react';


export const ReceiveFromDrivers = () => {
  const { toast } = useToast();
  const { orders, updateOrderStatus } = useOrdersStore();
  const { users } = useUsersStore();
  const { addDriverSlip } = useReturnsStore();

  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [scannedValue, setScannedValue] = useState('');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [receivedItems, setReceivedItems] = useState<Order[]>([]);
  const [driverPopoverOpen, setDriverPopoverOpen] = useState(false);
  
  const printableRef = useRef<HTMLDivElement>(null);


  const drivers = useMemo(() => users.filter(u => u.roleId === 'driver'), [users]);

  const driverOrders = useMemo(() => {
    if (!selectedDriverId) return [];
    const driver = users.find(u => u.id === selectedDriverId);
    if (!driver) return [];
    
    return orders.filter(o =>
      o.driver === driver.name && o.status === 'راجع' &&
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

    receivedItems.forEach(order => {
        updateOrderStatus(order.id, 'مرجع للفرع');
    });

    addDriverSlip({
      driverName: driver.name,
      date: new Date().toISOString(),
      itemCount: receivedItems.length,
      orders: receivedItems,
    });

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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            <Icon name="ScanLine" className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
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
            <Table>
              <TableHeader>
                <TableRow>
                   <TableHead className="w-12 text-center border-l"><Checkbox onCheckedChange={handleSelectAllDriverOrders} checked={driverOrders.length > 0 && selectedOrderIds.length === driverOrders.length} /></TableHead>
                  <TableHead className="w-16 text-right border-l">#</TableHead>
                  <TableHead className="text-right border-l">العميل</TableHead>
                  <TableHead className="text-right border-l">رقم الطلب</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {driverOrders.map((order, index) => (
                  <TableRow key={order.id}>
                    <TableCell className="text-center border-l">
                      <Checkbox
                        checked={selectedOrderIds.includes(order.id)}
                        onCheckedChange={(checked) => setSelectedOrderIds(p => checked ? [...p, order.id] : p.filter(id => id !== order.id))}
                      />
                    </TableCell>
                     <TableCell className="text-right border-l">{index + 1}</TableCell>
                     <TableCell className="text-right border-l">{order.recipient}</TableCell>
                     <TableCell className="text-right border-l">{order.id}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>2. إنشاء كشف استلام</CardTitle>
          <CardDescription>هذه هي قائمة الشحنات التي تم استلامها وجاهزة للتوثيق.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col gap-4">
            <div ref={printableRef} className="flex-grow">
                <div className='flex items-center justify-between mb-2'>
                    <CardTitle className="text-base">شحنات تم استلامها ({receivedItems.length})</CardTitle>
                    <Button onClick={createReceivingManifest} size="sm" disabled={receivedItems.length === 0}>
                        <Icon name="FileCheck" className="ml-2" />
                        إنشاء كشف الاستلام
                    </Button>
                </div>
                <ScrollArea className="h-[26rem] border rounded-md">
                    <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-16 text-right border-l">#</TableHead>
                            <TableHead className="text-right border-l">العميل</TableHead>
                            <TableHead className="text-right border-l">رقم الطلب</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {receivedItems.map((item, index) => (
                        <TableRow key={item.id}>
                            <TableCell className="text-right border-l">{index + 1}</TableCell>
                            <TableCell className="text-right border-l">{item.recipient}</TableCell>
                            <TableCell className="text-right border-l">{item.id}</TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                </ScrollArea>
           </div>
        </CardContent>
      </Card>
    </div>
  );
};
