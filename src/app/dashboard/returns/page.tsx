'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Icon from '@/components/icon';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { useOrdersStore, type Order } from '@/store/orders-store';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { format, parseISO, isWithinInterval } from 'date-fns';

const RETURNABLE_STATUSES = ['راجع', 'مؤجل', 'ملغي', 'رفض ودفع أجور', 'رفض ولم يدفع أجور', 'تبديل'];

export default function ReturnsPage() {
  const { orders } = useOrdersStore();
  const { toast } = useToast();
  
  const [selectedReturns, setSelectedReturns] = useState<string[]>([]);
  const [slips, setSlips] = useState<any[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [currentSlip, setCurrentSlip] = useState<any>(null);

  // فلترة كشوف الإرجاع
  const [filterMerchant, setFilterMerchant] = useState<string | null>(null);
  const [filterStartDate, setFilterStartDate] = useState<string | null>(null);
  const [filterEndDate, setFilterEndDate] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  
  const returnsAtBranch = useMemo(() => {
    const ordersInSlips = new Set(slips.flatMap(slip => slip.orders.map((o: Order) => o.id)));
    return orders.filter(order => 
      RETURNABLE_STATUSES.includes(order.status) && !ordersInSlips.has(order.id)
    );
  }, [orders, slips]);

  const merchants = Array.from(new Set(slips.map(s => s.merchant)));

  const filteredSlips = slips.filter(slip => {
    let matchesMerchant = filterMerchant ? slip.merchant === filterMerchant : true;
    let matchesDate = true;
    if (filterStartDate && filterEndDate) {
      try {
        const slipDate = parseISO(slip.date);
        matchesDate = isWithinInterval(slipDate, { start: parseISO(filterStartDate), end: parseISO(filterEndDate) });
      } catch (e) {
        matchesDate = false;
      }
    }
    let matchesStatus = filterStatus ? slip.status === filterStatus : true;
    return matchesMerchant && matchesDate && matchesStatus;
  });

  // إنشاء كشف جديد
  const handleCreateSlip = () => {
    const selectedOrders = returnsAtBranch.filter(r => selectedReturns.includes(r.id));
    if(selectedOrders.length === 0) {
        toast({ variant: 'destructive', title: 'خطأ', description: 'لم يتم تحديد أي طلبات.'});
        return;
    }

    const firstMerchant = selectedOrders[0].merchant;
    if (selectedOrders.some(o => o.merchant !== firstMerchant)) {
        toast({ variant: 'destructive', title: 'خطأ', description: 'يرجى تحديد طلبات لنفس التاجر فقط.'});
        return;
    }

    const newId = `RS-${new Date().getFullYear()}-${String(slips.length + 1).padStart(3, '0')}`;
    
    const newSlip = {
      id: newId,
      merchant: firstMerchant,
      date: new Date().toISOString().slice(0, 10),
      items: selectedReturns.length,
      status: 'جاهز للتسليم',
      orders: selectedOrders,
    };

    setSlips(prev => [...prev, newSlip]);
    setSelectedReturns([]);
    setShowCreateDialog(false);
    toast({ title: 'تم إنشاء الكشف بنجاح!' });
  };

  const handleShowDetails = (slip: any) => {
    setCurrentSlip(slip);
    setShowDetailsDialog(true);
  };
  
  const ordersForDialog = useMemo(() => {
    return returnsAtBranch.filter(r => selectedReturns.includes(r.id));
  }, [returnsAtBranch, selectedReturns]);

  return (
    <div className="space-y-6" dir="rtl">
      {/* عنوان الصفحة */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold">
            <Icon name="Undo2" />
            إدارة المرتجعات
          </CardTitle>
           <CardDescription>
            تجهيز ومتابعة الطلبات المرتجعة لإعادتها إلى التجار.
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="at-branch">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="at-branch">
            <Icon name="Building" className="ml-2 h-4 w-4" />
            مرتجعات في الفرع
          </TabsTrigger>
          <TabsTrigger value="return-slips">
            <Icon name="FileText" className="ml-2 h-4 w-4" />
            كشوفات الإرجاع
          </TabsTrigger>
        </TabsList>

        {/* لسان مرتجعات في الفرع */}
        <TabsContent value="at-branch" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>طلبات مرتجعة بانتظار التجهيز</CardTitle>
                <Button disabled={selectedReturns.length === 0} onClick={() => setShowCreateDialog(true)}>
                  <Icon name="PlusCircle" className="ml-2 h-4 w-4" />
                  إنشاء كشف إرجاع ({selectedReturns.length})
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={selectedReturns.length === returnsAtBranch.length && returnsAtBranch.length > 0}
                        onCheckedChange={(checked) => {
                          setSelectedReturns(checked ? returnsAtBranch.map(r => r.id) : []);
                        }}
                      />
                    </TableHead>
                    <TableHead>رقم الطلب</TableHead>
                    <TableHead>التاجر</TableHead>
                    <TableHead>المستلم</TableHead>
                    <TableHead>تاريخ الطلب</TableHead>
                    <TableHead>الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {returnsAtBranch.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        لا توجد مرتجعات بانتظار التجهيز حاليًا.
                      </TableCell>
                    </TableRow>
                  ) : (
                    returnsAtBranch.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedReturns.includes(item.id)}
                            onCheckedChange={(checked) => {
                              setSelectedReturns(prev =>
                                checked ? [...prev, item.id] : prev.filter(id => id !== item.id)
                              );
                            }}
                          />
                        </TableCell>
                        <TableCell className="font-mono">{item.id}</TableCell>
                        <TableCell>{item.merchant}</TableCell>
                        <TableCell>{item.recipient}</TableCell>
                        <TableCell>{item.date}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{item.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* لسان كشوفات الإرجاع مع الفلاتر */}
        <TabsContent value="return-slips" className="mt-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <CardTitle>كشوفات الإرجاع</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Select onValueChange={(v) => setFilterMerchant(v === 'all' ? null : v)} value={filterMerchant || 'all'}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="اختيار التاجر" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">كل التجار</SelectItem>
                    {merchants.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select onValueChange={(v) => setFilterStatus(v === 'all' ? null : v)} value={filterStatus || 'all'}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="حالة الكشف" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    <SelectItem value="جاهز للتسليم">جاهز للتسليم</SelectItem>
                    <SelectItem value="تم التسليم">تم التسليم</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  type="date"
                  placeholder="من"
                  value={filterStartDate || ''}
                  onChange={(e) => setFilterStartDate(e.target.value || null)}
                />
                <Input
                  type="date"
                  placeholder="إلى"
                  value={filterEndDate || ''}
                  onChange={(e) => setFilterEndDate(e.target.value || null)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم الكشف</TableHead>
                    <TableHead>التاجر</TableHead>
                    <TableHead>تاريخ الإنشاء</TableHead>
                    <TableHead>عدد الطلبات</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead className="text-left">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSlips.map((slip) => (
                    <TableRow key={slip.id}>
                      <TableCell className="font-mono">{slip.id}</TableCell>
                      <TableCell>{slip.merchant}</TableCell>
                      <TableCell>{slip.date}</TableCell>
                      <TableCell>{slip.items}</TableCell>
                      <TableCell>
                        <Badge
                          variant={slip.status === 'تم التسليم' ? 'default' : 'outline'}
                          className={slip.status === 'تم التسليم' ? 'bg-green-100 text-green-800' : ''}
                        >
                          {slip.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-left flex gap-2 justify-end">
                        <Button variant="outline" size="sm" onClick={() => handleShowDetails(slip)}>
                          <Icon name="Eye" className="ml-2 h-4 w-4" /> عرض التفاصيل
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={slip.status === 'تم التسليم'}
                          onClick={() =>
                            setSlips(prev =>
                              prev.map(s => s.id === slip.id ? { ...s, status: 'تم التسليم' } : s)
                            )
                          }
                        >
                          <Icon name="Check" className="ml-2 h-4 w-4" /> تأكيد التسليم
                        </Button>
                        <Button variant="outline" size="sm">
                          <Icon name="Printer" className="ml-2 h-4 w-4" /> طباعة
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog لإنشاء كشف */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>إنشاء كشف إرجاع جديد</DialogTitle>
            <DialogDescription>سيتم إنشاء كشف يضم الطلبات المحددة. تأكد من أن جميعها لنفس التاجر.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p>سيتم إنشاء كشف يضم {ordersForDialog.length} طلب/طلبات.</p>
            <ul className="list-disc pr-6 max-h-60 overflow-y-auto">
              {ordersForDialog.map(r => (
                  <li key={r.id}>
                    <span className="font-mono">{r.id}</span> – {r.merchant}
                  </li>
                ))}
            </ul>
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline">إلغاء</Button>
            </DialogClose>
            <Button onClick={handleCreateSlip}>تأكيد وإنشاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog عرض تفاصيل الكشف */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>تفاصيل كشف {currentSlip?.id}</DialogTitle>
             <DialogDescription>
                للتاجر: {currentSlip?.merchant} | التاريخ: {currentSlip?.date}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم الطلب</TableHead>
                  <TableHead>المستلم</TableHead>
                  <TableHead>تاريخ الطلب الأصلي</TableHead>
                  <TableHead>الحالة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentSlip?.orders.map((order: Order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono">{order.id}</TableCell>
                    <TableCell>{order.recipient}</TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{order.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
             <DialogClose asChild>
                <Button>إغلاق</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
