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
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUsersStore } from '@/store/user-store';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useReturnsStore, type DriverSlip } from '@/store/returns-store';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  React.useEffect(() => {
    if(!selectedDriver && driverData.length > 0) {
        setSelectedDriver(driverData[0].name);
    }
  }, [driverData, selectedDriver]);

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

  return (
    <div dir="rtl" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Panel - Drivers List */}
        <div className="lg:col-span-4 xl:col-span-3">
             <Card>
                <CardHeader>
                    <CardTitle>السائقين</CardTitle>
                    <CardDescription>قائمة بالسائقين الذين لديهم مرتجعات معلقة.</CardDescription>
                </CardHeader>
                <CardContent className="p-2">
                    <ScrollArea className="h-[60vh]">
                        <div className="space-y-2">
                            {driverData.map(({name, user, orderCount}) => (
                                <button key={name} onClick={() => setSelectedDriver(name)} className={cn("w-full text-right p-3 rounded-lg flex items-center justify-between transition-colors", selectedDriver === name ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src={user?.avatar} />
                                            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium">{name}</span>
                                    </div>
                                    <Badge variant={selectedDriver === name ? 'secondary' : 'default'}>{orderCount}</Badge>
                                </button>
                            ))}
                            {driverData.length === 0 && <p className="text-center text-muted-foreground p-4">لا يوجد مرتجعات.</p>}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>

        {/* Right Panel - Orders Table */}
        <div className="lg:col-span-8 xl:col-span-9">
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <CardTitle>مرتجعات السائق: {selectedDriver || 'لم يتم الاختيار'}</CardTitle>
                             <CardDescription>امسح باركود الشحنة لتحديدها أو حددها يدوياً من الجدول.</CardDescription>
                        </div>
                        <Button onClick={() => setShowCreateSlipDialog(true)} disabled={selectedOrderIds.length === 0}>
                            <Icon name="PlusCircle" className="ml-2 h-4 w-4" /> إنشاء كشف ({selectedOrderIds.length})
                        </Button>
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
                                <TableHead className="w-12"><Checkbox onCheckedChange={(checked) => handleSelectAllForDriver(selectedDriver || '', !!checked)} /></TableHead>
                                <TableHead>رقم الطلب</TableHead>
                                <TableHead>التاجر</TableHead>
                                <TableHead>الحالة</TableHead>
                                <TableHead>سبب الإرجاع</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {!selectedDriver ? (
                                <TableRow><TableCell colSpan={5} className="h-48 text-center text-muted-foreground">الرجاء اختيار سائق لعرض مرتجعاته.</TableCell></TableRow>
                            ) : selectedDriverOrders.length === 0 ? (
                                <TableRow><TableCell colSpan={5} className="h-48 text-center text-muted-foreground">لا توجد مرتجعات لهذا السائق.</TableCell></TableRow>
                            ) : selectedDriverOrders.map(o => (
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
    </div>
  );
};
