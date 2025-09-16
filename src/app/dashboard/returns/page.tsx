'use client';
import { useState, useMemo, useCallback } from 'react';
import { useOrdersStore, type Order } from '@/store/orders-store';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/icon';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { parseISO, isWithinInterval } from 'date-fns';
import jsPDF from 'jspdf';
import 'jspdf-autotable';


const RETURNABLE_STATUSES = ['راجع', 'ملغي', 'رفض ودفع أجور', 'رفض ولم يدفع أجور', 'تبديل'];

type Slip = {
  id: string;
  merchant: string;
  date: string;
  items: number;
  status: 'جاهز للتسليم' | 'تم التسليم';
  orders: Order[];
};

// --- Component: استلام المرتجعات من السائقين ---
const ReturnsFromDrivers = () => {
  const { orders, updateOrderStatus } = useOrdersStore();
  const { toast } = useToast();

  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  const drivers = useMemo(() => Array.from(new Set(orders.map(o => o.driver).filter(Boolean))), [orders]);

  const ordersForReturn = useMemo(() => {
    // Include orders that are in a returnable state OR are just 'مؤجل'
    const returnableOrders = orders.filter(o => RETURNABLE_STATUSES.includes(o.status) || o.status === 'مؤجل');
    if (selectedDriver) {
      return returnableOrders.filter(o => o.driver === selectedDriver);
    }
    return returnableOrders;
  }, [orders, selectedDriver]);

  const toggleSelect = (id: string) => {
    setSelectedOrders(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const markReturned = () => {
    selectedOrders.forEach(id => {
      // We are marking them as 'مرجع للفرع' which is a more specific status
      updateOrderStatus(id, 'مرجع للفرع');
    });
    toast({ title: "تم التحديث", description: `تم تحديث ${selectedOrders.length} طلب/طلبات إلى حالة "مرجع للفرع".` });
    setSelectedOrders([]);
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedOrders(checked ? ordersForReturn.map(o => o.id) : []);
  };
  
  const areAllSelected = ordersForReturn.length > 0 && selectedOrders.length === ordersForReturn.length;

  const getStatusBadgeVariant = (status: string) => {
    if (status === 'راجع' || status === 'مرجع للفرع') return 'outline';
    if (status === 'ملغي' || status.includes('رفض')) return 'destructive';
    if (status === 'مؤجل') return 'secondary';
    return 'default';
  };

  return (
    <Card>
      <CardHeader className="flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <CardTitle>استلام المرتجعات من السائقين</CardTitle>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setSelectedDriver(null)} variant={!selectedDriver ? 'default' : 'outline'} size="sm">الكل</Button>
          {drivers.map(d => (
            <Button key={d} onClick={() => setSelectedDriver(d)} variant={selectedDriver === d ? 'default' : 'outline'} size="sm">{d}</Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Button onClick={markReturned} disabled={selectedOrders.length === 0}>
            <Icon name="Check" className="ml-2 h-4 w-4" /> تعليم كـ "مرجع للفرع" ({selectedOrders.length})
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"><Checkbox checked={areAllSelected} onCheckedChange={handleSelectAll} /></TableHead>
              <TableHead>رقم الطلب</TableHead>
              <TableHead>التاجر</TableHead>
              <TableHead>المستلم</TableHead>
              <TableHead>السائق</TableHead>
              <TableHead>الحالة الحالية</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ordersForReturn.length > 0 ? ordersForReturn.map(o => (
              <TableRow key={o.id}>
                <TableCell><Checkbox checked={selectedOrders.includes(o.id)} onCheckedChange={() => toggleSelect(o.id)} /></TableCell>
                <TableCell className="font-mono">{o.id}</TableCell>
                <TableCell>{o.merchant}</TableCell>
                <TableCell>{o.recipient}</TableCell>
                <TableCell>{o.driver}</TableCell>
                <TableCell><Badge variant={getStatusBadgeVariant(o.status)}>{o.status}</Badge></TableCell>
              </TableRow>
            )) : (
              <TableRow><TableCell colSpan={6} className="h-24 text-center">لا توجد طلبات مرتجعة حالياً.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

// --- Component: كشوفات الإرجاع للتجار ---
const ReturnSlipsToMerchants = () => {
    const { orders } = useOrdersStore();
    const [selectedReturns, setSelectedReturns] = useState<string[]>([]);
    const [slips, setSlips] = useState<Slip[]>([]);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const [currentSlip, setCurrentSlip] = useState<Slip | null>(null);

    const [filterMerchant, setFilterMerchant] = useState<string | null>(null);
    const [filterStartDate, setFilterStartDate] = useState<string | null>(null);
    const [filterEndDate, setFilterEndDate] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<string | null>(null);

    const returnsAtBranch = useMemo(() => {
        const slipOrderIds = new Set(slips.flatMap(s => s.orders.map(o => o.id)));
        // Now, we also check for the new status 'مرجع للفرع'
        return orders.filter(o => [...RETURNABLE_STATUSES, 'مرجع للفرع'].includes(o.status) && !slipOrderIds.has(o.id));
    }, [orders, slips]);
    
    const merchants = useMemo(() => Array.from(new Set(returnsAtBranch.map(s => s.merchant))), [returnsAtBranch]);

    const filteredSlips = useMemo(() => slips.filter(slip => {
        let matchesMerchant = filterMerchant ? slip.merchant === filterMerchant : true;
        let matchesDate = true;
        if (filterStartDate && filterEndDate) {
            try {
                const slipDate = parseISO(slip.date);
                matchesDate = isWithinInterval(slipDate, { start: parseISO(filterStartDate), end: parseISO(filterEndDate) });
            } catch(e) { matchesDate = false; }
        }
        let matchesStatus = filterStatus ? slip.status === filterStatus : true;
        return matchesMerchant && matchesDate && matchesStatus;
    }), [slips, filterMerchant, filterStartDate, filterEndDate, filterStatus]);
    
     const handleCreateSlip = () => {
        const selectedOrdersData = returnsAtBranch.filter(o => selectedReturns.includes(o.id));
        if (selectedOrdersData.length === 0) return;

        const firstMerchant = selectedOrdersData[0].merchant;
        if (selectedOrdersData.some(o => o.merchant !== firstMerchant)) {
            alert("خطأ: يرجى تحديد طلبات لنفس التاجر فقط لإنشاء كشف.");
            return;
        }

        const newSlip: Slip = {
            id: `RS-${new Date().getFullYear()}-${String(slips.length + 1).padStart(3, '0')}`,
            merchant: firstMerchant,
            date: new Date().toISOString().slice(0, 10),
            items: selectedOrdersData.length,
            status: 'جاهز للتسليم',
            orders: selectedOrdersData,
        };

        setSlips(prev => [...prev, newSlip]);
        setSelectedReturns([]);
        setShowCreateDialog(false);
    };

    const handleShowDetails = (slip: Slip) => {
        setCurrentSlip(slip);
        setShowDetailsDialog(true);
    };

    const handleSelectAll = (checked: boolean) => {
        setSelectedReturns(checked ? returnsAtBranch.map(r => r.id) : []);
    };
    
    const areAllSelected = returnsAtBranch.length > 0 && selectedReturns.length === returnsAtBranch.length;

    const printSlip = (slip: Slip) => {
      const doc = new jsPDF();
      doc.addFont('/fonts/Tajawal-Regular.ttf', 'Tajawal', 'normal');
      doc.setFont('Tajawal');
      doc.setRTL(true);
      doc.text(`كشف إرجاع رقم: ${slip.id}`, 200, 20, { align: 'right' });
      doc.text(`التاجر: ${slip.merchant}`, 200, 30, { align: 'right' });
      doc.text(`تاريخ الإنشاء: ${slip.date}`, 200, 40, { align: 'right' });
      
      (doc as any).autoTable({
        startY: 50,
        head: [['الحالة', 'المستلم', 'رقم الطلب']],
        body: slip.orders.map(o => [o.status, o.recipient, o.id]),
        styles: { font: 'Tajawal', halign: 'right' },
        headStyles: { fillColor: [41, 128, 185], halign: 'center' },
      });
      doc.save(`ReturnSlip-${slip.id}.pdf`);
  };

    return (
        <>
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
                        <TableHeader><TableRow>
                            <TableHead className="w-[50px]"><Checkbox checked={areAllSelected} onCheckedChange={handleSelectAll} /></TableHead>
                            <TableHead>رقم الطلب</TableHead>
                            <TableHead>التاجر</TableHead>
                            <TableHead>المستلم</TableHead>
                            <TableHead>تاريخ الطلب</TableHead>
                            <TableHead>الحالة</TableHead>
                        </TableRow></TableHeader>
                        <TableBody>
                        {returnsAtBranch.map((item) => (
                            <TableRow key={item.id}>
                            <TableCell><Checkbox checked={selectedReturns.includes(item.id)} onCheckedChange={(checked) => setSelectedReturns(prev => checked ? [...prev, item.id] : prev.filter(id => id !== item.id))} /></TableCell>
                            <TableCell className="font-mono">{item.id}</TableCell>
                            <TableCell>{item.merchant}</TableCell>
                            <TableCell>{item.recipient}</TableCell>
                            <TableCell>{item.date}</TableCell>
                            <TableCell><Badge variant="secondary">{item.status}</Badge></TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card className="mt-6">
                 <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <CardTitle>كشوفات الإرجاع</CardTitle>
                    <div className="flex flex-wrap gap-2">
                        <Select onValueChange={(v) => setFilterMerchant(v === 'all' ? null : v)} value={filterMerchant || 'all'}><SelectTrigger className="w-40"><SelectValue placeholder="اختيار التاجر" /></SelectTrigger><SelectContent><SelectItem value="all">كل التجار</SelectItem>{Array.from(new Set(slips.map(s=>s.merchant))).map((m) => (<SelectItem key={m} value={m}>{m}</SelectItem>))}</SelectContent></Select>
                        <Select onValueChange={(v) => setFilterStatus(v === 'all' ? null : v)} value={filterStatus || 'all'}><SelectTrigger className="w-40"><SelectValue placeholder="حالة الكشف" /></SelectTrigger><SelectContent><SelectItem value="all">الكل</SelectItem><SelectItem value="جاهز للتسليم">جاهز للتسليم</SelectItem><SelectItem value="تم التسليم">تم التسليم</SelectItem></SelectContent></Select>
                        <Input type="date" placeholder="من" value={filterStartDate || ''} onChange={(e) => setFilterStartDate(e.target.value || null)} />
                        <Input type="date" placeholder="إلى" value={filterEndDate || ''} onChange={(e) => setFilterEndDate(e.target.value || null)} />
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow>
                            <TableHead>رقم الكشف</TableHead><TableHead>التاجر</TableHead><TableHead>تاريخ الإنشاء</TableHead><TableHead>عدد الطلبات</TableHead><TableHead>الحالة</TableHead><TableHead className="text-left">إجراءات</TableHead>
                        </TableRow></TableHeader>
                        <TableBody>
                        {filteredSlips.map((slip) => (
                            <TableRow key={slip.id}>
                            <TableCell className="font-mono">{slip.id}</TableCell>
                            <TableCell>{slip.merchant}</TableCell>
                            <TableCell>{slip.date}</TableCell>
                            <TableCell>{slip.items}</TableCell>
                            <TableCell><Badge variant={slip.status === 'تم التسليم' ? 'default' : 'outline'} className={slip.status === 'تم التسليم' ? 'bg-green-100 text-green-800' : ''}>{slip.status}</Badge></TableCell>
                            <TableCell className="text-left flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleShowDetails(slip)}><Icon name="Eye" className="ml-2 h-4 w-4" /> عرض</Button>
                                <Button variant="outline" size="sm" disabled={slip.status === 'تم التسليم'} onClick={() => setSlips(prev => prev.map(s => s.id === slip.id ? { ...s, status: 'تم التسليم' } : s))}><Icon name="Check" className="ml-2 h-4 w-4" /> تأكيد التسليم</Button>
                                <Button variant="outline" size="sm" onClick={() => printSlip(slip)}><Icon name="Printer" className="ml-2 h-4 w-4" /> طباعة</Button>
                            </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent className="sm:max-w-lg">
                <DialogHeader><DialogTitle>إنشاء كشف إرجاع جديد</DialogTitle></DialogHeader>
                <div className="space-y-4"><p>سيتم إنشاء كشف يضم {selectedReturns.length} طلب/طلبات.</p><ul className="list-disc pr-6">{returnsAtBranch.filter(r => selectedReturns.includes(r.id)).map(r => (<li key={r.id}><span className="font-mono">{r.id}</span> – {r.merchant}</li>))}</ul></div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>إلغاء</Button>
                    <Button onClick={handleCreateSlip}>تأكيد وإنشاء</Button>
                </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
                <DialogContent className="sm:max-w-2xl">
                <DialogHeader><DialogTitle>تفاصيل كشف {currentSlip?.id}</DialogTitle></DialogHeader>
                <div className="space-y-4">
                    <Table><TableHeader><TableRow><TableHead>رقم الطلب</TableHead><TableHead>المستلم</TableHead><TableHead>تاريخ الإرجاع الأصلي</TableHead><TableHead>الحالة الأصلية</TableHead></TableRow></TableHeader>
                    <TableBody>{currentSlip?.orders.map((order: any) => (<TableRow key={order.id}><TableCell className="font-mono">{order.id}</TableCell><TableCell>{order.recipient}</TableCell><TableCell>{order.date}</TableCell><TableCell><Badge variant="secondary">{order.status}</Badge></TableCell></TableRow>))}</TableBody></Table>
                </div>
                <DialogFooter><Button onClick={() => setShowDetailsDialog(false)}>إغلاق</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};


// --- Main Page Component ---
export default function ReturnsPage() {
  return (
    <div className="space-y-6" dir="rtl">
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

      <Tabs defaultValue="returns-from-drivers">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="returns-from-drivers">
            <Icon name="Truck" className="ml-2 h-4 w-4" />
            استلام من السائقين
          </TabsTrigger>
          <TabsTrigger value="return-slips-to-merchants">
            <Icon name="FileText" className="ml-2 h-4 w-4" />
            كشوفات إرجاع للتجار
          </TabsTrigger>
        </TabsList>

        <TabsContent value="returns-from-drivers" className="mt-4">
            <ReturnsFromDrivers />
        </TabsContent>

        <TabsContent value="return-slips-to-merchants" className="mt-4">
            <ReturnSlipsToMerchants />
        </TabsContent>
      </Tabs>
    </div>
  );
}