
'use client';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useOrdersStore, type Order } from '@/store/orders-store';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/icon';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUsersStore } from '@/store/user-store';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useReturnsStore, type DriverSlip } from '@/store/returns-store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PrintablePolicy } from '@/components/printable-policy';
import { type SavedTemplate, readyTemplates } from '@/contexts/SettingsContext';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import Papa from 'papaparse';

const RETURNABLE_STATUSES = ['راجع', 'ملغي', 'رفض ودفع أجور', 'رفض ولم يدفع أجور', 'تبديل'];

export const ReceiveFromDrivers = () => {
  const { orders, updateOrderStatus } = useOrdersStore();
  const { users } = useUsersStore();
  const { addDriverSlip } = useReturnsStore();
  const { toast } = useToast();

  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateSlipDialog, setShowCreateSlipDialog] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);

  // Print Dialog State
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [availableTemplates, setAvailableTemplates] = useState<SavedTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<SavedTemplate | null>(null);
  const printablePolicyRef = useRef<{ handleExport: () => void; handleDirectPrint: (order: any, type: 'zpl' | 'escpos') => Promise<void> }>(null);


  const returnsByDriver = useMemo(() => {
    let returnableOrders = orders.filter(o => (RETURNABLE_STATUSES.includes(o.status) || o.status === 'مؤجل') && o.status !== 'مرجع للفرع' );
    
    return returnableOrders.reduce((acc, order) => {
        const driverName = order.driver || 'غير معين';
        if (!acc[driverName]) {
            acc[driverName] = [];
        }
        acc[driverName].push(order);
        return acc;
    }, {} as Record<string, Order[]>);

  }, [orders]);

  const driverData = useMemo(() => {
    return Object.keys(returnsByDriver).map(driverName => ({
      name: driverName,
      user: users.find(u => u.name === driverName),
      orderCount: returnsByDriver[driverName].length
    }));
  }, [returnsByDriver, users]);
  
  // Select the first driver by default
  useEffect(() => {
    if(!selectedDriver && driverData.length > 0) {
        setSelectedDriver(driverData[0].name);
    }
  }, [driverData, selectedDriver]);

  // Load print templates
  useEffect(() => {
    try {
        const savedTemplatesJson = localStorage.getItem('policyTemplates');
        const userTemplates = savedTemplatesJson ? JSON.parse(savedTemplatesJson) : [];
        const uniqueTemplates = [...readyTemplates];
        const readyIds = new Set(readyTemplates.map(t => t.id));
        userTemplates.forEach((t: SavedTemplate) => {
            if (!readyIds.has(t.id)) {
                uniqueTemplates.push(t);
            }
        });
        setAvailableTemplates(uniqueTemplates);
    } catch(e) {
      setAvailableTemplates(readyTemplates);
    }
  }, []);

  const selectedDriverOrders = useMemo(() => {
      if (!selectedDriver) return [];
      return returnsByDriver[selectedDriver] || [];
  }, [returnsByDriver, selectedDriver]);


  const handleScan = () => {
    const allOrders = Object.values(returnsByDriver).flat();
    const foundOrder = allOrders.find(o => o.id === searchQuery || o.referenceNumber === searchQuery || o.phone === searchQuery);
    
    if(foundOrder) {
        if (!selectedOrderIds.includes(foundOrder.id)) {
            setSelectedOrderIds(prev => [...prev, foundOrder.id]);
        }
        const driverName = foundOrder.driver || 'غير معين';
        setSelectedDriver(driverName);
        setSearchQuery('');
        toast({ title: "تم تحديد الطلب", description: `تم تحديد الطلب ${foundOrder.id} بنجاح.`});
    } else {
        toast({ variant: 'destructive', title: 'لم يتم العثور على الطلب', description: 'تأكد من الرقم المدخل أو أن الطلب ضمن قائمة المرتجعات.'});
    }
  }

  const handleCreateSlip = () => {
    if (selectedOrderIds.length === 0) return;

    const selectedOrdersData = Object.values(returnsByDriver).flat().filter(o => selectedOrderIds.includes(o.id));
    const firstDriver = selectedOrdersData[0]?.driver || 'غير معين';

    if (selectedOrdersData.some(o => (o.driver || 'غير معين') !== firstDriver)) {
        toast({ variant: 'destructive', title: 'خطأ', description: 'يرجى تحديد مرتجعات لنفس السائق فقط.' });
        return;
    }
    
    const newSlip: Omit<DriverSlip, 'id'> = {
        driverName: firstDriver,
        date: new Date().toISOString().slice(0, 10),
        itemCount: selectedOrdersData.length,
        orders: selectedOrdersData,
    };

    addDriverSlip(newSlip);

    selectedOrderIds.forEach(id => {
      updateOrderStatus(id, 'مرجع للفرع');
    });
    toast({ title: "تم إنشاء كشف الاستلام", description: `تم استلام ${selectedOrderIds.length} طلبات من السائق ${firstDriver}.` });
    setSelectedOrderIds([]);
    setShowCreateSlipDialog(false);
  };

  const getStatusBadgeVariant = (status: string) => {
    if (status === 'راجع' || status === 'مرجع للفرع') return 'outline';
    if (status === 'ملغي' || status.includes('رفض')) return 'destructive';
    if (status === 'مؤجل') return 'secondary';
    return 'default';
  };
  
  const handleSelectAllForDriver = (driverName: string, checked: boolean) => {
    const driverOrderIds = (returnsByDriver[driverName] || []).map(o => o.id);
    if(checked) {
        setSelectedOrderIds(prev => [...new Set([...prev, ...driverOrderIds])]);
    } else {
        setSelectedOrderIds(prev => prev.filter(id => !driverOrderIds.includes(id)));
    }
  }
  
  const handlePrintClick = () => {
    if (selectedOrderIds.length === 0) {
        toast({
            variant: "destructive",
            title: "لم يتم تحديد طلبات",
            description: "الرجاء تحديد طلب واحد على الأقل للطباعة."
        });
        return;
    }
    setSelectedTemplate(availableTemplates.length > 0 ? availableTemplates[0] : null);
    setIsPrintDialogOpen(true);
  };

  const handleCsvExport = () => {
    if (selectedOrderIds.length === 0) {
        toast({ variant: 'destructive', title: 'لم يتم تحديد طلبات', description: 'الرجاء تحديد طلب واحد على الأقل للتصدير.' });
        return;
    }
    
    const selectedOrdersData = Object.values(returnsByDriver).flat().filter(o => selectedOrderIds.includes(o.id));

    const data = selectedOrdersData.map(order => ({
        'رقم الطلب': order.id,
        'التاجر': order.merchant,
        'المستلم': order.recipient,
        'الهاتف': order.phone,
        'العنوان': order.address,
        'المدينة': order.city,
        'سبب الارجاع': order.status,
        'المبلغ': order.cod,
    }));

    const csv = Papa.unparse(data);
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `returns_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};


  return (
    <>
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" dir="rtl">
        <div className="lg:col-span-3 xl:col-span-2">
             <Card>
                <CardHeader>
                    <CardTitle>السائقين</CardTitle>
                    <CardDescription>قائمة بالسائقين الذين لديهم مرتجعات معلقة.</CardDescription>
                </CardHeader>
                <CardContent className="p-2">
                    <ScrollArea className="h-[60vh]">
                        <div className="space-y-2">
                            {driverData.map(({name, user, orderCount}) => (
                                <button
                                    key={name}
                                    onClick={() => setSelectedDriver(name)}
                                    className={cn(
                                        "w-full p-3 rounded-lg flex items-center gap-3 text-right",
                                        selectedDriver === name ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                                    )}
                                >
                                     <Avatar className="h-9 w-9">
                                        <AvatarImage src={user?.avatar} />
                                        <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium text-sm flex-1">{name}</span>
                                    <Badge variant={selectedDriver === name ? 'secondary' : 'default'} className="w-8 h-6 justify-center">{orderCount}</Badge>
                                </button>
                            ))}
                            {driverData.length === 0 && <p className="text-center text-muted-foreground p-4">لا يوجد مرتجعات.</p>}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-9 xl:col-span-10">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center flex-wrap gap-2">
                        <div>
                            <CardTitle>مرتجعات السائق: {selectedDriver || 'لم يتم الاختيار'}</CardTitle>
                             <CardDescription>امسح باركود الشحنة لتحديدها أو حددها يدوياً من الجدول.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" disabled={selectedOrderIds.length === 0}>
                                        <Icon name="Printer" className="ml-2 h-4 w-4" />
                                        إجراءات الطباعة ({selectedOrderIds.length})
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onSelect={handlePrintClick}>
                                        <Icon name="ReceiptText" className="ml-2 h-4 w-4" />
                                        طباعة بوالص
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={handleCsvExport}>
                                        <Icon name="FileDown" className="ml-2 h-4 w-4" />
                                        تصدير المحدد (CSV)
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Button onClick={() => setShowCreateSlipDialog(true)} disabled={selectedOrderIds.length === 0}>
                                <Icon name="PlusCircle" className="ml-2 h-4 w-4" /> إنشاء كشف ({selectedOrderIds.length})
                            </Button>
                        </div>
                    </div>
                     <div className="flex gap-2 pt-4">
                        <Input 
                            id="scan-barcode"
                            placeholder="امسح الباركود هنا..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                        />
                        <Button onClick={handleScan}><Icon name="ScanLine" className="h-4 w-4"/></Button>
                    </div>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12 text-center whitespace-nowrap"><Checkbox onCheckedChange={(checked) => handleSelectAllForDriver(selectedDriver || '', !!checked)} /></TableHead>
                                <TableHead className="border-l text-center whitespace-nowrap">رقم الطلب</TableHead>
                                <TableHead className="border-l text-center whitespace-nowrap">المستلم</TableHead>
                                <TableHead className="border-l text-center whitespace-nowrap">التاجر</TableHead>
                                <TableHead className="border-l text-center whitespace-nowrap">تاريخ الطلب</TableHead>
                                <TableHead className="border-l text-center whitespace-nowrap">الحالة الأصلية</TableHead>
                                <TableHead className="border-l text-center whitespace-nowrap">سبب الإرجاع</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {!selectedDriver ? (
                                <TableRow><TableCell colSpan={7} className="h-48 text-center text-muted-foreground">الرجاء اختيار سائق لعرض مرتجعاته.</TableCell></TableRow>
                            ) : selectedDriverOrders.length === 0 ? (
                                <TableRow><TableCell colSpan={7} className="h-48 text-center text-muted-foreground">لا توجد مرتجعات لهذا السائق.</TableCell></TableRow>
                            ) : selectedDriverOrders.map(o => (
                                <TableRow key={o.id} data-state={selectedOrderIds.includes(o.id) && "selected"} className="bg-background">
                                    <TableCell className="text-center whitespace-nowrap"><Checkbox checked={selectedOrderIds.includes(o.id)} onCheckedChange={(checked) => setSelectedOrderIds(prev => checked ? [...prev, o.id] : prev.filter(id => id !== o.id))} /></TableCell>
                                    <TableCell className="border-l text-center whitespace-nowrap"><Link href={`/dashboard/orders/${o.id}`} className="font-mono text-primary hover:underline">{o.id}</Link></TableCell>
                                    <TableCell className="border-l text-center whitespace-nowrap">{o.recipient}</TableCell>
                                    <TableCell className="border-l text-center whitespace-nowrap">{o.merchant}</TableCell>
                                    <TableCell className="border-l text-center whitespace-nowrap">{o.date}</TableCell>
                                    <TableCell className="border-l text-center whitespace-nowrap"><Badge variant={getStatusBadgeVariant(o.status)}>{o.status}</Badge></TableCell>
                                    <TableCell className="border-l text-center whitespace-nowrap text-muted-foreground text-xs">{o.notes}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      
       <Dialog open={showCreateSlipDialog} onOpenChange={setShowCreateSlipDialog}>
          <DialogContent>
              <DialogHeader><DialogTitle>تأكيد إنشاء كشف استلام</DialogTitle></DialogHeader>
              <DialogDescription>
                 سيتم إنشاء كشف استلام للمرتجعات المحددة ({selectedOrderIds.length} طلبات) وتغيير حالتها إلى "مرجع للفرع". هل أنت متأكد؟
              </DialogDescription>
              <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateSlipDialog(false)}>إلغاء</Button>
                  <Button onClick={handleCreateSlip}>نعم، إنشاء الكشف</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
      <Dialog open={isPrintDialogOpen} onOpenChange={setIsPrintDialogOpen}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
            <DialogHeader>
            <DialogTitle>طباعة البوالص</DialogTitle>
            <DialogDescription>اختر القالب وقم بمعاينة البوالص قبل الطباعة النهائية.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1 min-h-0">
                <div className="md:col-span-1 flex flex-col gap-4">
                    <Card>
                        <CardHeader className='p-4'><CardTitle className='text-base'>1. اختر القالب</CardTitle></CardHeader>
                        <CardContent className='p-4'>
                            <RadioGroup
                                value={selectedTemplate?.id}
                                onValueChange={(id) => setSelectedTemplate(availableTemplates.find(t => t.id === id) || null)}
                            >
                                {availableTemplates.map(template => (
                                    <div key={template.id} className="flex items-center space-x-2 space-x-reverse">
                                        <RadioGroupItem value={template.id} id={`print-${template.id}`} />
                                        <Label htmlFor={`print-${template.id}`}>{template.name}</Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className='p-4'><CardTitle className='text-base'>2. إجراء الطباعة</CardTitle></CardHeader>
                        <CardContent className='p-4 flex flex-col gap-2'>
                             <Button onClick={() => printablePolicyRef.current?.handleExport()} className="w-full">
                                <Icon name="Save" className="ml-2 h-4 w-4 inline" /> طباعة PDF
                            </Button>
                        </CardContent>
                    </Card>
                </div>
                 <div className="md:col-span-3 bg-muted rounded-md flex items-center justify-center overflow-hidden">
                    <ScrollArea className="h-full w-full">
                        <div className="p-4 flex items-center justify-center">
                            {selectedTemplate && (
                                <PrintablePolicy ref={printablePolicyRef} orders={orders.filter(o => selectedOrderIds.includes(o.id))} template={selectedTemplate} />
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </DialogContent>
    </Dialog>
    </div>
    </>
  );
};

