'use client';
import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useOrdersStore, type Order } from '@/store/orders-store';
import { useUsersStore } from '@/store/user-store';
import { useToast } from '@/hooks/use-toast';

export default function ReturnsPage() {
  const { orders, updateOrderStatus } = useOrdersStore();
  const { users } = useUsersStore();
  const { toast } = useToast();

  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  
  const drivers = useMemo(() => Array.from(new Set(orders.map(o => o.driver))), [orders]);

  const ordersForReturn = useMemo(() => orders.filter(o => o.status === 'جاري التوصيل' || o.status === 'مؤجل'), [orders]);

  const filteredOrders = selectedDriver ? ordersForReturn.filter(o => o.driver === selectedDriver) : ordersForReturn;

  const toggleSelect = (id: string) => {
    setSelectedOrders(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const markReturned = () => {
    selectedOrders.forEach(id => {
      updateOrderStatus(id, 'مرتجع');
    });
    toast({ title: "تم التحديث", description: `تم تحديث ${selectedOrders.length} طلبات إلى حالة "مرتجع".`});
    setSelectedOrders([]);
  };

  return (
    <div dir="rtl" className="space-y-4 p-4">
      <h2 className="text-2xl font-bold mb-2">استلام المرتجعات من السائقين</h2>

      {/* قائمة السائقين */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <Button onClick={() => setSelectedDriver(null)} variant={!selectedDriver ? 'default' : 'outline'}>الكل</Button>
        {drivers.map(d => (
          <Button key={d} onClick={() => setSelectedDriver(d)} variant={selectedDriver === d ? 'default' : 'outline'}>
            {d}
          </Button>
        ))}
      </div>

      <Button onClick={markReturned} disabled={selectedOrders.length === 0} className="mb-2">
        تعليم كمرتجع ({selectedOrders.length})
      </Button>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                onCheckedChange={(checked) => {
                  setSelectedOrders(checked ? filteredOrders.map(o => o.id) : []);
                }}
              />
            </TableHead>
            <TableHead>رقم الطلب</TableHead>
            <TableHead>التاجر</TableHead>
            <TableHead>المستلم</TableHead>
            <TableHead>السائق</TableHead>
            <TableHead>الحالة</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredOrders.map(o => (
            <TableRow key={o.id}>
              <TableCell>
                <Checkbox checked={selectedOrders.includes(o.id)} onCheckedChange={() => toggleSelect(o.id)} />
              </TableCell>
              <TableCell className="font-mono">{o.id}</TableCell>
              <TableCell>{o.merchant}</TableCell>
              <TableCell>{o.recipient}</TableCell>
              <TableCell>{o.driver}</TableCell>
              <TableCell>
                <Badge variant={o.status === 'مرتجع' ? 'outline' : 'default'}>{o.status}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
