'use client';
import { useState, useMemo } from 'react';
import { useOrdersStore, type Order } from '@/store/orders-store';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import Link from 'next/link';

const RETURNABLE_STATUSES = ['راجع', 'ملغي', 'رفض ودفع أجور', 'رفض ولم يدفع أجور', 'تبديل'];

export const ReturnsFromDrivers = () => {
  const { orders, updateOrderStatus } = useOrdersStore();
  const { toast } = useToast();

  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDrivers, setOpenDrivers] = useState<Record<string, boolean>>({});

  const returnsByDriver = useMemo(() => {
    let returnableOrders = orders.filter(o => RETURNABLE_STATUSES.includes(o.status) || o.status === 'مؤجل');
    
    return returnableOrders.reduce((acc, order) => {
        const driverName = order.driver || 'غير معين';
        if (!acc[driverName]) {
            acc[driverName] = [];
        }
        acc[driverName].push(order);
        return acc;
    }, {} as Record<string, Order[]>);

  }, [orders]);

  const handleScan = () => {
    const allOrders = Object.values(returnsByDriver).flat();
    const foundOrder = allOrders.find(o => o.id === searchQuery || o.referenceNumber === searchQuery || o.phone === searchQuery);
    
    if(foundOrder) {
        if (!selectedOrderIds.includes(foundOrder.id)) {
            setSelectedOrderIds(prev => [...prev, foundOrder.id]);
        }
        const driverName = foundOrder.driver || 'غير معين';
        setOpenDrivers(prev => ({...prev, [driverName]: true }));
        setSearchQuery('');
        toast({ title: "تم تحديد الطلب", description: `تم تحديد الطلب ${foundOrder.id} بنجاح.`});
    } else {
        toast({ variant: 'destructive', title: 'لم يتم العثور على الطلب', description: 'تأكد من الرقم المدخل أو أن الطلب ضمن قائمة المرتجعات.'});
    }
  }

  const markReturned = () => {
    selectedOrderIds.forEach(id => {
      updateOrderStatus(id, 'مرجع للفرع');
    });
    toast({ title: "تم التحديث", description: `تم تحديث ${selectedOrderIds.length} طلب/طلبات إلى حالة "مرجع للفرع".` });
    setSelectedOrderIds([]);
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
  
  const handleReceiveAllForDriver = (driverName: string) => {
      const driverOrderIds = (returnsByDriver[driverName] || []).map(o => o.id);
      driverOrderIds.forEach(id => updateOrderStatus(id, 'مرجع للفرع'));
      toast({ title: "تم الاستلام", description: `تم استلام كل مرتجعات السائق ${driverName}.`});
      setSelectedOrderIds(prev => prev.filter(id => !driverOrderIds.includes(id)));
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-4">
             {Object.entries(returnsByDriver).map(([driverName, driverOrders]) => {
                const isAllSelectedForDriver = driverOrders.every(o => selectedOrderIds.includes(o.id));
                const isDriverOpen = openDrivers[driverName] ?? false;

                return (
                 <Collapsible key={driverName} open={isDriverOpen} onOpenChange={(isOpen) => setOpenDrivers(prev => ({...prev, [driverName]: isOpen}))}>
                    <Card>
                        <CollapsibleTrigger asChild>
                            <CardHeader className="p-4 cursor-pointer hover:bg-muted/50 flex flex-row items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Icon name={isDriverOpen ? 'ChevronDown' : 'ChevronLeft'} className="h-5 w-5" />
                                    <Icon name="User" className="h-5 w-5 text-muted-foreground"/>
                                    <CardTitle className="text-base">{driverName}</CardTitle>
                                    <Badge variant="secondary">{driverOrders.length} طلبات</Badge>
                                </div>
                                <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); handleReceiveAllForDriver(driverName); }}>
                                    <Icon name="CheckCheck" className="ml-2 h-4 w-4"/> استلام الكل
                                </Button>
                            </CardHeader>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-12"><Checkbox checked={isAllSelectedForDriver} onCheckedChange={(checked) => handleSelectAllForDriver(driverName, !!checked)} /></TableHead>
                                            <TableHead>رقم الطلب</TableHead>
                                            <TableHead>التاجر</TableHead>
                                            <TableHead>الحالة</TableHead>
                                            <TableHead>سبب الإرجاع</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {driverOrders.map(o => (
                                        <TableRow key={o.id} data-state={selectedOrderIds.includes(o.id) && "selected"}>
                                            <TableCell><Checkbox checked={selectedOrderIds.includes(o.id)} onCheckedChange={(checked) => setSelectedOrderIds(prev => checked ? [...prev, o.id] : prev.filter(id => id !== o.id))} /></TableCell>
                                            <TableCell><Link href={`/dashboard/orders/${o.id}`} className="font-mono text-primary hover:underline">{o.id}</Link></TableCell>
                                            <TableCell>{o.merchant}</TableCell>
                                            <TableCell><Badge variant={getStatusBadgeVariant(o.status)}>{o.status}</Badge></TableCell>
                                            <TableCell className="text-muted-foreground text-xs">{o.notes}</TableCell>
                                        </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                         </CollapsibleContent>
                    </Card>
                </Collapsible>
                )
             })}
              {Object.keys(returnsByDriver).length === 0 && (
                <Card>
                    <CardContent className="p-10 text-center text-muted-foreground">
                        <Icon name="PackageX" className="mx-auto h-12 w-12 mb-4" />
                        <p>لا توجد أي مرتجعات حالياً مع السائقين.</p>
                    </CardContent>
                </Card>
            )}
        </div>
        <div className="lg:sticky lg:top-24 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>تأكيد الاستلام</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="scan-barcode">مسح الباركود أو الرقم المرجعي</Label>
                        <div className="flex gap-2">
                            <Input 
                                id="scan-barcode"
                                placeholder="امسح الباركود هنا..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                            />
                            <Button onClick={handleScan}><Icon name="ScanLine" className="h-4 w-4"/></Button>
                        </div>
                    </div>
                     <Separator />
                     <p className="text-sm text-center text-muted-foreground">تم تحديد {selectedOrderIds.length} شحنة للاستلام.</p>
                     <Button onClick={markReturned} disabled={selectedOrderIds.length === 0} className="w-full">
                        <Icon name="Check" className="ml-2 h-4 w-4" /> تأكيد استلام المحدد في الفرع
                    </Button>
                </CardContent>
            </Card>
        </div>
    </div>
  );
};
