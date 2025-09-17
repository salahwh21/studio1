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

const RETURNABLE_STATUSES = ['راجع', 'ملغي', 'رفض ودفع أجور', 'رفض ولم يدفع أجور', 'تبديل'];

export const ReturnsFromDrivers = () => {
  const { orders, updateOrderStatus } = useOrdersStore();
  const { toast } = useToast();

  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<Order | null>(null);

  const drivers = useMemo(() => Array.from(new Set(orders.map(o => o.driver).filter(Boolean))), [orders]);

  const ordersForReturn = useMemo(() => {
    let returnableOrders = orders.filter(o => RETURNABLE_STATUSES.includes(o.status) || o.status === 'مؤجل');
    if (selectedDriver) {
      returnableOrders = returnableOrders.filter(o => o.driver === selectedDriver);
    }
    return returnableOrders;
  }, [orders, selectedDriver]);

  const handleScan = () => {
    const foundOrder = ordersForReturn.find(o => o.id === searchQuery || o.referenceNumber === searchQuery || o.phone === searchQuery);
    if(foundOrder) {
        if (!selectedOrderIds.includes(foundOrder.id)) {
            setSelectedOrderIds(prev => [...prev, foundOrder.id]);
        }
        setSelectedOrderForDetails(foundOrder);
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
    setSelectedOrderForDetails(null);
  };
  
  const getStatusBadgeVariant = (status: string) => {
    if (status === 'راجع' || status === 'مرجع للفرع') return 'outline';
    if (status === 'ملغي' || status.includes('رفض')) return 'destructive';
    if (status === 'مؤجل') return 'secondary';
    return 'default';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <CardTitle>قائمة الاستلام</CardTitle>
                            <CardDescription>جميع المرتجعات والمؤجلات الموجودة مع السائقين.</CardDescription>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button onClick={() => setSelectedDriver(null)} variant={!selectedDriver ? 'default' : 'outline'} size="sm">الكل</Button>
                            {drivers.map(d => (
                                <Button key={d} onClick={() => setSelectedDriver(d)} variant={selectedDriver === d ? 'default' : 'outline'} size="sm">{d}</Button>
                            ))}
                        </div>
                    </div>
                </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>رقم الطلب</TableHead>
                      <TableHead>التاجر</TableHead>
                      <TableHead>المستلم</TableHead>
                      <TableHead>السائق</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>سبب الإرجاع</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ordersForReturn.length > 0 ? ordersForReturn.map(o => (
                      <TableRow 
                        key={o.id} 
                        data-state={selectedOrderIds.includes(o.id) && "selected"}
                        className="cursor-pointer"
                        onClick={() => setSelectedOrderForDetails(o)}
                      >
                        <TableCell><Checkbox checked={selectedOrderIds.includes(o.id)} onCheckedChange={(checked) => setSelectedOrderIds(prev => checked ? [...prev, o.id] : prev.filter(id => id !== o.id))} /></TableCell>
                        <TableCell className="font-mono">{o.id}</TableCell>
                        <TableCell>{o.merchant}</TableCell>
                        <TableCell>{o.recipient}</TableCell>
                        <TableCell>{o.driver}</TableCell>
                        <TableCell><Badge variant={getStatusBadgeVariant(o.status)}>{o.status}</Badge></TableCell>
                        <TableCell className="text-muted-foreground text-xs">{o.notes}</TableCell>
                      </TableRow>
                    )) : (
                      <TableRow><TableCell colSpan={7} className="h-24 text-center">لا توجد طلبات مرتجعة لهذا السائق.</TableCell></TableRow>
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
                     <Button onClick={markReturned} disabled={selectedOrderIds.length === 0} className="w-full">
                        <Icon name="Check" className="ml-2 h-4 w-4" /> تأكيد استلام المحدد في الفرع
                    </Button>
                </CardContent>
            </Card>
            {selectedOrderForDetails && (
                <Card className="animate-in fade-in">
                    <CardHeader>
                        <CardTitle className="text-base">تفاصيل الشحنة المحددة</CardTitle>
                         <CardDescription className="font-mono">{selectedOrderForDetails.id}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                        <p><strong>العميل:</strong> {selectedOrderForDetails.recipient}</p>
                        <p><strong>الهاتف:</strong> {selectedOrderForDetails.phone}</p>
                        <p><strong>العنوان:</strong> {selectedOrderForDetails.address}</p>
                        <p><strong>الحالة:</strong> <Badge variant={getStatusBadgeVariant(selectedOrderForDetails.status)}>{selectedOrderForDetails.status}</Badge></p>
                        <p><strong>السبب:</strong> {selectedOrderForDetails.notes || 'لا يوجد'}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    </div>
  );
};
