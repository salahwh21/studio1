'use client';
import { useState, useMemo } from 'react';
import { useOrdersStore, type Order } from '@/store/orders-store';
import { useUsersStore, type User } from '@/store/user-store';
import { useReturnsStore } from '@/store/returns-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/icon';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

export const ReceiveFromDrivers = () => {
  const { toast } = useToast();
  const { orders, updateOrderStatus } = useOrdersStore();
  const { users } = useUsersStore();
  const { addDriverSlip } = useReturnsStore();

  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [scannedOrder, setScannedOrder] = useState('');
  const [receivedOrders, setReceivedOrders] = useState<Order[]>([]);
  const [selectedToReceive, setSelectedToReceive] = useState<string[]>([]);

  const drivers = useMemo(() => users.filter(u => u.roleId === 'driver'), [users]);
  
  const driverOrders = useMemo(() => 
    selectedDriver
      ? orders.filter(o => o.driver === drivers.find(d => d.id === selectedDriver)?.name && o.status === 'راجع')
      : [],
    [orders, selectedDriver, drivers]
  );

  const handleScan = () => {
    if (!scannedOrder) return;
    const order = driverOrders.find(o => o.id === scannedOrder || o.referenceNumber === scannedOrder);
    if (order && !receivedOrders.some(ro => ro.id === order.id)) {
      setReceivedOrders(prev => [order, ...prev]);
      setScannedOrder('');
    } else {
      toast({ variant: 'destructive', title: 'خطأ', description: 'الطلب غير موجود ضمن مرتجعات السائق أو تم استلامه بالفعل.' });
    }
  };

  const handleCreateSlip = () => {
    if (receivedOrders.length === 0 || !selectedDriver) return;

    const driver = drivers.find(d => d.id === selectedDriver);
    if (!driver) return;

    addDriverSlip({
      driverName: driver.name,
      date: new Date().toISOString(),
      itemCount: receivedOrders.length,
      orders: receivedOrders,
    });
    
    receivedOrders.forEach(order => {
        updateOrderStatus(order.id, 'مرجع للفرع');
    });

    toast({
      title: 'تم إنشاء الكشف بنجاح',
      description: `تم إنشاء كشف استلام لـ ${receivedOrders.length} شحنات من السائق ${driver.name}.`,
    });
    
    setReceivedOrders([]);
    setSelectedDriver(null);
  };
  
   const handleAddToReceive = () => {
        const toAdd = driverOrders.filter(o => selectedToReceive.includes(o.id) && !receivedOrders.some(ro => ro.id === o.id));
        setReceivedOrders(prev => [...toAdd, ...prev]);
        setSelectedToReceive([]);
   }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>استلام المرتجعات من السائقين</CardTitle>
          <CardDescription>اختر السائق ثم قم بمسح باركود الشحنات المرتجعة منه.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Select onValueChange={setSelectedDriver} value={selectedDriver || ''} disabled={receivedOrders.length > 0}>
            <SelectTrigger><SelectValue placeholder="1. اختر السائق" /></SelectTrigger>
            <SelectContent>
              {drivers.map(driver => (
                <SelectItem key={driver.id} value={driver.id}>{driver.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Input 
              placeholder="2. امسح رقم الطلب (باركود)"
              value={scannedOrder}
              onChange={(e) => setScannedOrder(e.target.value)}
              onKeyDown={(e) => { if(e.key === 'Enter') handleScan(); }}
              disabled={!selectedDriver}
            />
            <Button onClick={handleScan} disabled={!selectedDriver}>إضافة</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <Card>
            <CardHeader>
                <CardTitle>قائمة المرتجعات لدى السائق ({driverOrders.length})</CardTitle>
                 <div className="flex items-center justify-between">
                    <CardDescription>الطلبات التي يجب أن تكون مع السائق.</CardDescription>
                    <Button size="sm" variant="outline" onClick={handleAddToReceive} disabled={selectedToReceive.length === 0}><Icon name="PlusCircle" className="ml-2"/>إضافة المحدد للاستلام</Button>
                 </div>
            </CardHeader>
            <CardContent>
                <Table>
                     <TableHeader><TableRow><TableHead className="w-12"><Checkbox checked={selectedToReceive.length > 0 && selectedToReceive.length === driverOrders.length} onCheckedChange={(checked) => setSelectedToReceive(checked ? driverOrders.map(o=>o.id) : [])} /></TableHead><TableHead>رقم الطلب</TableHead><TableHead>المستلم</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {driverOrders.map(o => (
                            <TableRow key={o.id}>
                                <TableCell><Checkbox checked={selectedToReceive.includes(o.id)} onCheckedChange={(checked) => setSelectedToReceive(prev => checked ? [...prev, o.id] : prev.filter(id => id !== o.id))} /></TableCell>
                                <TableCell>{o.id}</TableCell><TableCell>{o.recipient}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="space-y-1.5">
                    <CardTitle>تم استلامها ({receivedOrders.length})</CardTitle>
                    <CardDescription>الشحنات التي تم استلامها وجاهزة لإنشاء كشف.</CardDescription>
                </div>
                <Button onClick={handleCreateSlip} disabled={receivedOrders.length === 0}><Icon name="FilePlus" className="ml-2"/> إنشاء كشف استلام</Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader><TableRow><TableHead>رقم الطلب</TableHead><TableHead>المستلم</TableHead><TableHead>سبب الإرجاع</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {receivedOrders.map(o => (
                            <TableRow key={o.id}><TableCell>{o.id}</TableCell><TableCell>{o.recipient}</TableCell><TableCell>{o.previousStatus}</TableCell></TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}