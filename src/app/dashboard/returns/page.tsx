
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Icon from '@/components/icon';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

// بيانات تجريبية
const mockReturns = [
  { id: 'ORD-1719810004', merchant: 'Brandlet Outlet -1', recipient: 'فاطمة علي', returnDate: '2024-07-05', reason: 'رفض العميل الاستلام' },
  { id: 'ORD-1719810010', merchant: 'N&L Botique', recipient: 'حسن محمود', returnDate: '2024-07-11', reason: 'ملغي بطلب من التاجر' },
  { id: 'ORD-1719810016', merchant: 'عود الجدايل', recipient: 'خالد وليد', returnDate: '2024-07-17', reason: 'لم يتم الرد على الهاتف' },
];

export default function ReturnsPage() {
  const [selectedReturns, setSelectedReturns] = useState<string[]>([]);
  const [slips, setSlips] = useState<any[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [currentSlip, setCurrentSlip] = useState<any>(null);

  // إنشاء كشف جديد
  const handleCreateSlip = () => {
    const newId = `RS-${new Date().getFullYear()}-${String(slips.length + 1).padStart(3, '0')}`;
    const merchant = mockReturns.find(r => selectedReturns.includes(r.id))?.merchant || 'غير محدد';

    const newSlip = {
      id: newId,
      merchant,
      date: new Date().toISOString().slice(0, 10),
      items: selectedReturns.length,
      status: 'جاهز للتسليم',
      orders: mockReturns.filter(r => selectedReturns.includes(r.id)),
    };

    setSlips(prev => [...prev, newSlip]);
    setSelectedReturns([]);
    setShowCreateDialog(false);
  };

  // فتح تفاصيل كشف محدد
  const handleShowDetails = (slip: any) => {
    setCurrentSlip(slip);
    setShowDetailsDialog(true);
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
                        checked={selectedReturns.length === mockReturns.length && mockReturns.length > 0}
                        onCheckedChange={(checked) => {
                          setSelectedReturns(checked ? mockReturns.map(r => r.id) : []);
                        }}
                      />
                    </TableHead>
                    <TableHead>رقم الطلب</TableHead>
                    <TableHead>التاجر</TableHead>
                    <TableHead>المستلم</TableHead>
                    <TableHead>تاريخ الإرجاع</TableHead>
                    <TableHead>سبب الإرجاع</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockReturns.map((item) => (
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
                      <TableCell>{item.returnDate}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{item.reason}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* لسان كشوفات الإرجاع */}
        <TabsContent value="return-slips" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>كشوفات الإرجاع</CardTitle>
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
                  {slips.map((slip) => (
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
                      <TableCell className="text-left flex gap-2">
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
          </DialogHeader>
          <div className="space-y-4">
            <p>سيتم إنشاء كشف يضم {selectedReturns.length} طلب/طلبات.</p>
            <ul className="list-disc pr-6">
              {mockReturns
                .filter(r => selectedReturns.includes(r.id))
                .map(r => (
                  <li key={r.id}>
                    <span className="font-mono">{r.id}</span> – {r.merchant}
                  </li>
                ))}
            </ul>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>إلغاء</Button>
            <Button onClick={handleCreateSlip}>تأكيد وإنشاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
