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
import { Separator } from '@/components/ui/separator';


const RETURNABLE_STATUSES = ['راجع', 'ملغي', 'رفض ودفع أجور', 'رفض ولم يدفع أجور', 'تبديل'];

type Slip = {
  id: string;
  merchant: string;
  date: string;
  items: number;
  status: 'جاهز للتسليم' | 'تم التسليم';
  orders: Order[];
};

type AutomationRule = {
    id: string;
    conditionField: 'age_in_branch' | 'reason';
    conditionOperator: 'greater_than' | 'equals';
    conditionValue: string;
    action: 'change_status' | 'notify_merchant';
    actionValue: string;
    enabled: boolean;
};

// --- Component: محرك الأتمتة ---
const AutomationEngine = () => {
    const [rules, setRules] = useState<AutomationRule[]>([
        { id: 'rule1', conditionField: 'age_in_branch', conditionOperator: 'greater_than', conditionValue: '3', action: 'change_status', actionValue: 'يتطلب مراجعة', enabled: true },
        { id: 'rule2', conditionField: 'reason', conditionOperator: 'equals', conditionValue: 'عنوان خاطئ', action: 'notify_merchant', actionValue: 'تنبيه بتحديث العنوان', enabled: false },
    ]);

    const handleAddRule = () => {
        setRules(prev => [...prev, { id: `rule${Date.now()}`, conditionField: 'age_in_branch', conditionOperator: 'greater_than', conditionValue: '', action: 'change_status', actionValue: '', enabled: true }]);
    };

    const handleRemoveRule = (id: string) => {
        setRules(prev => prev.filter(r => r.id !== id));
    };

    return (
        <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Icon name="Wand2"/> محرك الأتمتة للمرتجعات</CardTitle>
                <CardDescription>إنشاء قواعد تلقائية لتسهيل إدارة المرتجعات. سيتم تنفيذ هذه القواعد مرة واحدة يوميًا.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-1/4">إذا كان</TableHead>
                            <TableHead className="w-1/4">والشرط</TableHead>
                            <TableHead className="w-1/4">إذن نفذ الإجراء</TableHead>
                            <TableHead>إجراء</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rules.map(rule => (
                            <TableRow key={rule.id}>
                                <TableCell className="flex flex-col gap-2">
                                     <Select defaultValue={rule.conditionField}>
                                        <SelectTrigger><SelectValue/></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="age_in_branch">عمر المرتجع بالفرع (أيام)</SelectItem>
                                            <SelectItem value="reason">سبب الإرجاع</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell>
                                     <div className="flex gap-2">
                                        <Select defaultValue={rule.conditionOperator} className="w-1/3">
                                            <SelectTrigger><SelectValue/></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="greater_than">&gt;</SelectItem>
                                                <SelectItem value="equals">=</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Input placeholder="القيمة" defaultValue={rule.conditionValue} className="w-2/3"/>
                                     </div>
                                </TableCell>
                                <TableCell>
                                     <Select defaultValue={rule.action}>
                                        <SelectTrigger><SelectValue/></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="change_status">تغيير الحالة إلى</SelectItem>
                                            <SelectItem value="notify_merchant">إرسال تنبيه للتاجر</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveRule(rule.id)}><Icon name="Trash2" className="h-4 w-4 text-destructive"/></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <Button variant="outline" className="mt-4 w-full" onClick={handleAddRule}><Icon name="PlusCircle" className="mr-2 h-4 w-4"/> إضافة قاعدة جديدة</Button>
            </CardContent>
        </Card>
    );
};


// --- Component: استلام المرتجعات من السائقين ---
const ReturnsFromDrivers = () => {
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
                            <TableRow key={item.id} data-state={selectedReturns.includes(item.id) && "selected"}>
                            <TableCell><Checkbox checked={selectedReturns.includes(item.id)} onCheckedChange={(checked) => setSelectedReturns(prev => checked ? [...prev, item.id] : prev.filter(id => id !== item.id))} /></TableCell>
                            <TableCell className="font-mono">{item.id}</TableCell>
                            <TableCell>{item.merchant}</TableCell>
                            <TableCell>{item.recipient}</TableCell>
                            <TableCell>{item.date}</TableCell>
                            <TableCell><Badge variant="secondary">{item.status}</Badge></TableCell>
                            </TableRow>
                        ))}
                        {returnsAtBranch.length === 0 && (
                             <TableRow><TableCell colSpan={6} className="h-24 text-center">لا توجد طلبات مرتجعة بالفرع حالياً.</TableCell></TableRow>
                        )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card className="mt-6">
                 <CardHeader>
                    <CardTitle>كشوفات الإرجاع</CardTitle>
                    <CardDescription>فلترة وبحث في الكشوفات التي تم إنشاؤها.</CardDescription>
                     <div className="flex flex-col sm:flex-row items-center gap-2 pt-4">
                        <Select onValueChange={(v) => setFilterMerchant(v === 'all' ? null : v)} value={filterMerchant || 'all'}><SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="اختيار التاجر" /></SelectTrigger><SelectContent><SelectItem value="all">كل التجار</SelectItem>{Array.from(new Set(slips.map(s=>s.merchant))).map((m) => (<SelectItem key={m} value={m}>{m}</SelectItem>))}</SelectContent></Select>
                        <Select onValueChange={(v) => setFilterStatus(v === 'all' ? null : v)} value={filterStatus || 'all'}><SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="حالة الكشف" /></SelectTrigger><SelectContent><SelectItem value="all">الكل</SelectItem><SelectItem value="جاهز للتسليم">جاهز للتسليم</SelectItem><SelectItem value="تم التسليم">تم التسليم</SelectItem></SelectContent></Select>
                        <Input type="date" placeholder="من تاريخ" value={filterStartDate || ''} onChange={(e) => setFilterStartDate(e.target.value || null)} className="w-full sm:w-auto" />
                        <Input type="date" placeholder="إلى تاريخ" value={filterEndDate || ''} onChange={(e) => setFilterEndDate(e.target.value || null)} className="w-full sm:w-auto" />
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
                            <TableCell className="text-left flex gap-2 justify-end">
                                <Button variant="outline" size="sm" onClick={() => handleShowDetails(slip)}><Icon name="Eye" className="ml-2 h-4 w-4" /> عرض</Button>
                                <Button variant="outline" size="sm" disabled={slip.status === 'تم التسليم'} onClick={() => setSlips(prev => prev.map(s => s.id === slip.id ? { ...s, status: 'تم التسليم' } : s))}><Icon name="Check" className="ml-2 h-4 w-4" /> تأكيد التسليم</Button>
                                <Button variant="ghost" size="icon" onClick={() => printSlip(slip)}><Icon name="Printer" className="h-4 w-4" /></Button>
                            </TableCell>
                            </TableRow>
                        ))}
                         {filteredSlips.length === 0 && (
                             <TableRow><TableCell colSpan={6} className="h-24 text-center">لا توجد كشوفات تطابق الفلترة.</TableCell></TableRow>
                        )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent className="sm:max-w-lg">
                <DialogHeader><DialogTitle>إنشاء كشف إرجاع جديد</DialogTitle></DialogHeader>
                <div className="space-y-4"><p>سيتم إنشاء كشف يضم {selectedReturns.length} طلب/طلبات.</p><ul className="list-disc pr-6 text-sm">{returnsAtBranch.filter(r => selectedReturns.includes(r.id)).map(r => (<li key={r.id}><span className="font-mono">{r.id}</span> – {r.merchant}</li>))}</ul></div>
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


const StatCard = ({ title, value, icon, color }: { title: string, value: number, icon: any, color: string }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon name={icon} className="h-4 w-4 text-muted-foreground" style={{ color }} />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">شحنة</p>
        </CardContent>
    </Card>
);


// --- Main Page Component ---
export default function ReturnsPage() {
    const { orders } = useOrdersStore();
    
    const stats = useMemo(() => {
        const withDrivers = orders.filter(o => RETURNABLE_STATUSES.includes(o.status)).length;
        const atBranch = orders.filter(o => o.status === 'مرجع للفرع').length;
        return { withDrivers, atBranch };
    }, [orders]);

  return (
    <div className="space-y-6" dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold">
            <Icon name="Undo2" />
            إدارة المرتجعات
          </CardTitle>
          <CardDescription>
            استلام الشحنات الراجعة من السائقين وتجهيزها في كشوفات لإعادتها إلى التجار.
          </CardDescription>
        </CardHeader>
      </Card>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="مرتجعات مع السائقين" value={stats.withDrivers} icon="Truck" color="#F9A825" />
        <StatCard title="مرتجعات في الفرع" value={stats.atBranch} icon="Building" color="#8E24AA" />
      </div>


      <Tabs defaultValue="returns-from-drivers">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="returns-from-drivers">
            <Icon name="Truck" className="ml-2 h-4 w-4" />
            استلام من السائقين
          </TabsTrigger>
          <TabsTrigger value="return-slips-to-merchants">
            <Icon name="FileText" className="ml-2 h-4 w-4" />
            كشوفات إرجاع للتجار
          </TabsTrigger>
          <TabsTrigger value="automation">
            <Icon name="Wand2" className="ml-2 h-4 w-4" />
            الأتمتة
          </TabsTrigger>
        </TabsList>

        <TabsContent value="returns-from-drivers" className="mt-4">
            <ReturnsFromDrivers />
        </TabsContent>

        <TabsContent value="return-slips-to-merchants" className="mt-4">
            <ReturnSlipsToMerchants />
        </TabsContent>
        
        <TabsContent value="automation" className="mt-4">
            <AutomationEngine />
        </TabsContent>

      </Tabs>
    </div>
  );
}
