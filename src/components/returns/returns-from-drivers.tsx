'use client';
import React, { useState, useMemo } from 'react';
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
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUsersStore } from '@/store/user-store';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';


const RETURNABLE_STATUSES = ['راجع', 'ملغي', 'رفض ودفع أجور', 'رفض ولم يدفع أجور', 'تبديل'];

type DriverSlip = {
  id: string;
  driverName: string;
  date: string;
  itemCount: number;
  orders: Order[];
};

export const ReturnsFromDrivers = () => {
  const { orders, updateOrderStatus } = useOrdersStore();
  const { users } = useUsersStore();
  const { toast } = useToast();

  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDrivers, setOpenDrivers] = useState<Record<string, boolean>>({});
  
  const [driverSlips, setDriverSlips] = useState<DriverSlip[]>([]);
  const [showCreateSlipDialog, setShowCreateSlipDialog] = useState(false);
  const [currentSlipDetails, setCurrentSlipDetails] = useState<DriverSlip | null>(null);


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

  const handleCreateSlip = () => {
    if (selectedOrderIds.length === 0) return;

    const selectedOrdersData = Object.values(returnsByDriver).flat().filter(o => selectedOrderIds.includes(o.id));
    const firstDriver = selectedOrdersData[0]?.driver || 'غير معين';

    if (selectedOrdersData.some(o => (o.driver || 'غير معين') !== firstDriver)) {
        toast({ variant: 'destructive', title: 'خطأ', description: 'يرجى تحديد مرتجعات لنفس السائق فقط.' });
        return;
    }
    
    const newSlip: DriverSlip = {
        id: `DS-${Date.now()}`,
        driverName: firstDriver,
        date: new Date().toISOString().slice(0, 10),
        itemCount: selectedOrdersData.length,
        orders: selectedOrdersData,
    };

    setDriverSlips(prev => [newSlip, ...prev]);

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
  
  const handleReceiveAllForDriver = (driverName: string) => {
      const driverOrders = returnsByDriver[driverName] || [];
      if(driverOrders.length === 0) return;

      const newSlip: DriverSlip = {
        id: `DS-${Date.now()}`,
        driverName: driverName,
        date: new Date().toISOString().slice(0, 10),
        itemCount: driverOrders.length,
        orders: driverOrders,
    };
    setDriverSlips(prev => [newSlip, ...prev]);

      driverOrders.forEach(o => updateOrderStatus(o.id, 'مرجع للفرع'));
      toast({ title: "تم الاستلام", description: `تم استلام كل مرتجعات السائق ${driverName} وإنشاء كشف بذلك.`});
      setSelectedOrderIds(prev => prev.filter(id => !driverOrders.map(o => o.id).includes(id)));
  }

  const driverData = useMemo(() => {
    return Object.keys(returnsByDriver).map(driverName => ({
      name: driverName,
      user: users.find(u => u.name === driverName)
    }));
  }, [returnsByDriver, users]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>قائمة المرتجعات المعلقة لدى السائقين</CardTitle>
                    <CardDescription>هذا القسم مخصص لعرض واستلام الشحنات المرتجعة من كل سائق وتسجيلها في المستودع.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12"></TableHead>
                                <TableHead>السائق</TableHead>
                                <TableHead className="text-center">عدد المرتجعات</TableHead>
                                <TableHead className="text-left">إجراءات</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {driverData.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                        <Icon name="PackageX" className="mx-auto h-10 w-10 mb-2" />
                                        لا توجد مرتجعات معلقة مع السائقين حالياً.
                                    </TableCell>
                                </TableRow>
                            )}
                            {driverData.map(({ name: driverName, user }) => {
                                const driverOrders = returnsByDriver[driverName];
                                const isAllSelectedForDriver = driverOrders.every(o => selectedOrderIds.includes(o.id));
                                const isDriverOpen = openDrivers[driverName] ?? false;

                                return (
                                    <React.Fragment key={driverName}>
                                        <TableRow 
                                            onClick={() => setOpenDrivers(prev => ({...prev, [driverName]: !isDriverOpen}))}
                                            className="cursor-pointer hover:bg-muted/50"
                                        >
                                            <TableCell>
                                                <Icon name={isDriverOpen ? 'ChevronDown' : 'ChevronLeft'} className="h-5 w-5" />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9">
                                                        <AvatarImage src={user?.avatar} />
                                                        <AvatarFallback>{driverName.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="font-medium">{driverName}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="secondary">{driverOrders.length}</Badge>
                                            </TableCell>
                                            <TableCell className="text-left">
                                                <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleReceiveAllForDriver(driverName); }}>
                                                    <Icon name="CheckCheck" className="ml-2 h-4 w-4"/> استلام الكل
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                        {isDriverOpen && (
                                            <TableRow className="bg-muted/30 hover:bg-muted/30">
                                                <TableCell colSpan={4} className="p-0">
                                                    <div className="p-4">
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
                                                                <TableRow key={o.id} data-state={selectedOrderIds.includes(o.id) && "selected"} className="bg-background">
                                                                    <TableCell><Checkbox checked={selectedOrderIds.includes(o.id)} onCheckedChange={(checked) => setSelectedOrderIds(prev => checked ? [...prev, o.id] : prev.filter(id => id !== o.id))} /></TableCell>
                                                                    <TableCell><Link href={`/dashboard/orders/${o.id}`} className="font-mono text-primary hover:underline">{o.id}</Link></TableCell>
                                                                    <TableCell>{o.merchant}</TableCell>
                                                                    <TableCell><Badge variant={getStatusBadgeVariant(o.status)}>{o.status}</Badge></TableCell>
                                                                    <TableCell className="text-muted-foreground text-xs">{o.notes}</TableCell>
                                                                </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </React.Fragment>
                                )
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>سجل كشوفات الاستلام من السائقين</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow>
                            <TableHead>رقم الكشف</TableHead><TableHead>السائق</TableHead><TableHead>التاريخ</TableHead><TableHead>عدد الشحنات</TableHead><TableHead>إجراء</TableHead>
                        </TableRow></TableHeader>
                        <TableBody>
                            {driverSlips.length === 0 ? (
                                <TableRow><TableCell colSpan={5} className="h-24 text-center">لا توجد كشوفات بعد.</TableCell></TableRow>
                            ) : (
                                driverSlips.map(slip => (
                                    <TableRow key={slip.id}>
                                        <TableCell className="font-mono">{slip.id}</TableCell>
                                        <TableCell>{slip.driverName}</TableCell>
                                        <TableCell>{slip.date}</TableCell>
                                        <TableCell>{slip.itemCount}</TableCell>
                                        <TableCell><Button variant="outline" size="sm" onClick={() => setCurrentSlipDetails(slip)}>عرض التفاصيل</Button></TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
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
                     <Button onClick={() => setShowCreateSlipDialog(true)} disabled={selectedOrderIds.length === 0} className="w-full">
                        <Icon name="PlusCircle" className="ml-2 h-4 w-4" /> إنشاء كشف استلام للمحدد
                    </Button>
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
        
        <Dialog open={!!currentSlipDetails} onOpenChange={() => setCurrentSlipDetails(null)}>
            <DialogContent className="max-w-2xl">
                 <DialogHeader><DialogTitle>تفاصيل كشف الاستلام {currentSlipDetails?.id}</DialogTitle></DialogHeader>
                 <div className="max-h-[60vh] overflow-y-auto">
                    <Table>
                        <TableHeader><TableRow><TableHead>رقم الطلب</TableHead><TableHead>التاجر</TableHead><TableHead>المستلم</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {currentSlipDetails?.orders.map(o => (
                                <TableRow key={o.id}>
                                    <TableCell>{o.id}</TableCell>
                                    <TableCell>{o.merchant}</TableCell>
                                    <TableCell>{o.recipient}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                 </div>
            </DialogContent>
        </Dialog>

    </div>
  );
};
