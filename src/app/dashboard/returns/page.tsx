
'use client';

import { useState, useMemo } from 'react';
import { useOrdersStore, type Order } from '@/store/orders-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Icon from '@/components/icon';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

// Define the shape of a return slip
type ReturnSlip = {
  id: string;
  merchant: string;
  date: string;
  items: number;
  status: 'جاهز للتسليم' | 'تم التسليم';
  orders: Order[];
};

// Statuses that qualify an order as a return waiting for reconciliation
const RETURN_QUALIFYING_STATUSES = [
    'مرتجع', 'ملغي', 'راجع', 'رفض ودفع أجور', 'رفض ولم يدفع أجور', 'لا رد', 'تبديل'
];

export default function ReturnsPage() {
  const { toast } = useToast();
  const { orders, updateOrderStatus } = useOrdersStore();
  
  // State for all created return slips
  const [slips, setSlips] = useState<ReturnSlip[]>([]);
  // State for which orders are selected in the "at-branch" table
  const [selectedReturns, setSelectedReturns] = useState<string[]>([]);
  // State to control the confirmation dialog
  const [showDialog, setShowDialog] = useState(false);

  // Memoized list of orders that are in the branch and need processing.
  // This is the source of truth for the first tab.
  const returnsAtBranch = useMemo(() => {
    const slipOrderIds = new Set(slips.flatMap(slip => slip.orders.map(o => o.id)));
    return orders.filter(order => 
      RETURN_QUALIFYING_STATUSES.includes(order.status) && !slipOrderIds.has(order.id)
    );
  }, [orders, slips]);
  
  // Memoized list of currently selected orders, used for the confirmation dialog
  const selectedOrderDetails = useMemo(() => {
      return returnsAtBranch.filter(r => selectedReturns.includes(r.id));
  }, [returnsAtBranch, selectedReturns]);


  // Handles the creation of a new return slip
  const handleCreateSlip = () => {
    if (selectedOrderDetails.length === 0) {
      toast({ variant: 'destructive', title: 'خطأ', description: 'لم يتم تحديد أي طلبات.' });
      return;
    }

    const firstOrder = selectedOrderDetails[0];
    const merchant = firstOrder.merchant;

    // Ensure all selected orders belong to the same merchant
    if (!selectedOrderDetails.every(o => o.merchant === merchant)) {
      toast({ variant: 'destructive', title: 'خطأ في التحديد', description: 'يرجى تحديد طلبات تابعة لنفس التاجر فقط في كل كشف.' });
      return;
    }

    // Generate new slip
    const newId = `RS-${new Date().getFullYear()}-${String(slips.length + 1).padStart(3, '0')}`;
    const newSlip: ReturnSlip = {
      id: newId,
      merchant,
      date: new Date().toISOString().slice(0, 10),
      items: selectedOrderDetails.length,
      status: 'جاهز للتسليم',
      orders: selectedOrderDetails,
    };

    setSlips(prev => [newSlip, ...prev]);
    setSelectedReturns([]);
    setShowDialog(false);
    toast({ title: 'تم إنشاء الكشف', description: `تم إنشاء كشف إرجاع جديد للتاجر ${merchant}.` });
  };
  
  const handleConfirmDelivery = (slipId: string) => {
    setSlips(prev =>
      prev.map(s => {
        if (s.id === slipId) {
          // Update the status of all orders within this slip
          s.orders.forEach(order => {
            updateOrderStatus(order.id, 'مرجع للتاجر');
          });
          toast({ title: 'تم تأكيد التسليم', description: `تم تحديث حالة الطلبات في الكشف ${slipId}.` });
          return { ...s, status: 'تم التسليم' };
        }
        return s;
      })
    );
  };

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

      <Tabs defaultValue="at-branch">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="at-branch">
            <Icon name="Building" className="ml-2 h-4 w-4" />
            مرتجعات في الفرع ({returnsAtBranch.length})
          </TabsTrigger>
          <TabsTrigger value="return-slips">
            <Icon name="FileText" className="ml-2 h-4 w-4" />
            كشوفات الإرجاع ({slips.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Returns at Branch */}
        <TabsContent value="at-branch" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>طلبات مرتجعة بانتظار التجهيز</CardTitle>
                <Button disabled={selectedReturns.length === 0} onClick={() => setShowDialog(true)}>
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
                        checked={returnsAtBranch.length > 0 && selectedReturns.length === returnsAtBranch.length}
                        onCheckedChange={(checked) => {
                          setSelectedReturns(checked ? returnsAtBranch.map(r => r.id) : []);
                        }}
                      />
                    </TableHead>
                    <TableHead>رقم الطلب</TableHead>
                    <TableHead>التاجر</TableHead>
                    <TableHead>المستلم</TableHead>
                    <TableHead>تاريخ الإرجاع</TableHead>
                    <TableHead>الحالة الحالية</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {returnsAtBranch.length > 0 ? returnsAtBranch.map((item) => (
                    <TableRow key={item.id} data-state={selectedReturns.includes(item.id) && "selected"}>
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
                  )) : (
                    <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                           لا توجد طلبات مرتجعة حاليًا.
                        </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Return Slips */}
        <TabsContent value="return-slips" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>كشوفات الإرجاع الصادرة</CardTitle>
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
                    {slips.length > 0 ? slips.map((slip) => (
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
                      <TableCell className="text-left">
                        <Button variant="outline" size="sm" className="ml-2">
                          <Icon name="Printer" className="ml-2 h-4 w-4" /> طباعة
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={slip.status === 'تم التسليم'}
                          onClick={() => handleConfirmDelivery(slip.id)}
                        >
                          <Icon name="Check" className="ml-2 h-4 w-4" /> تأكيد التسليم
                        </Button>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                           لم يتم إنشاء أي كشوفات بعد.
                        </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Slip Confirmation Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>إنشاء كشف إرجاع جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>سيتم إنشاء كشف للتاجر **{selectedOrderDetails[0]?.merchant || ''}** يضم **{selectedOrderDetails.length}** طلبات. هل أنت متأكد؟</p>
            <ul className="list-disc pr-6 max-h-48 overflow-y-auto">
              {selectedOrderDetails
                .map(r => (
                  <li key={r.id}>
                    <span className="font-mono">{r.id}</span> – {r.recipient}
                  </li>
                ))}
            </ul>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>إلغاء</Button>
            <Button onClick={handleCreateSlip}>تأكيد وإنشاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
