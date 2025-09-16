
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Icon from '@/components/icon';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

// Mock data for demonstration purposes
const mockReturns = [
  { id: 'ORD-1719810004', merchant: 'Brandlet Outlet -1', recipient: 'فاطمة علي', returnDate: '2024-07-05', reason: 'رفض العميل الاستلام' },
  { id: 'ORD-1719810010', merchant: 'N&L Botique', recipient: 'حسن محمود', returnDate: '2024-07-11', reason: 'ملغي بطلب من التاجر' },
  { id: 'ORD-1719810016', merchant: 'عود الجدايل', recipient: 'خالد وليد', returnDate: '2024-07-17', reason: 'لم يتم الرد على الهاتف' },
];

const mockSlips = [
    { id: 'RS-2024-001', merchant: 'Brandlet Outlet -1', date: '2024-07-06', items: 1, status: 'جاهز للتسليم' },
    { id: 'RS-2024-002', merchant: 'N&L Botique', date: '2024-07-12', items: 1, status: 'تم التسليم' },
];

export default function ReturnsPage() {
  const [selectedReturns, setSelectedReturns] = useState<string[]>([]);

  return (
    <div className="space-y-6">
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
            مرتجعات في الفرع (جاهزة للتجهيز)
          </TabsTrigger>
          <TabsTrigger value="return-slips">
            <Icon name="FileText" className="ml-2 h-4 w-4" />
            كشوفات الإرجاع
          </TabsTrigger>
        </TabsList>

        <TabsContent value="at-branch" className="mt-4">
          <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>طلبات مرتجعة بانتظار التجهيز</CardTitle>
                    <Button disabled={selectedReturns.length === 0}>
                        <Icon name="PlusCircle" className="ml-2 h-4 w-4" />
                        إنشاء كشف إرجاع للمحدد ({selectedReturns.length})
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
                    <TableHead>المستلم الأصلي</TableHead>
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
                                <TableHead>عدد القطع</TableHead>
                                <TableHead>الحالة</TableHead>
                                <TableHead className="text-left">إجراءات</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockSlips.map((slip) => (
                                <TableRow key={slip.id}>
                                    <TableCell className="font-mono">{slip.id}</TableCell>
                                    <TableCell>{slip.merchant}</TableCell>
                                    <TableCell>{slip.date}</TableCell>
                                    <TableCell>{slip.items}</TableCell>
                                    <TableCell>
                                        <Badge variant={slip.status === 'تم التسليم' ? 'default' : 'outline'} className={slip.status === 'تم التسليم' ? 'bg-green-100 text-green-800' : ''}>
                                            {slip.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-left">
                                        <Button variant="outline" size="sm" className="ml-2">
                                            <Icon name="Printer" className="ml-2 h-4 w-4" /> طباعة
                                        </Button>
                                         <Button variant="outline" size="sm" disabled={slip.status === 'تم التسليم'}>
                                            <Icon name="Check" className="ml-2 h-4 w-4" /> تأكيد التسليم
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
    </div>
  );
}
