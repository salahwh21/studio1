
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/icon';

const mockMerchantPayments = [
    { id: 'MP-2023-001', merchantName: 'Brands of less', date: '2023-10-02', amount: '1,230.00 د.أ', status: 'مدفوع' },
    { id: 'MP-2023-002', merchantName: 'Stress Killer', date: '2023-10-02', amount: '850.50 د.أ', status: 'مدفوع' },
    { id: 'MP-2023-003', merchantName: 'جنان صغيرة', date: '2023-09-28', amount: '970.00 د.أ', status: 'مدفوع' },
];

export const MerchantPaymentsLog = () => {
     return (
        <Card>
            <CardHeader>
                <CardTitle>سجل دفعات التجار</CardTitle>
                 <CardDescription>
                    عرض وطباعة وتأكيد كشوفات الدفع التي تم إنشاؤها للتجار.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-center border-l">رقم الكشف</TableHead>
                            <TableHead className="text-center border-l">اسم التاجر</TableHead>
                            <TableHead className="text-center border-l">تاريخ الدفعة</TableHead>
                            <TableHead className="text-center border-l">المبلغ الإجمالي</TableHead>
                            <TableHead className="text-center border-l">الحالة</TableHead>
                            <TableHead className="text-center">إجراءات</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockMerchantPayments.map(payment => (
                            <TableRow key={payment.id}>
                                <TableCell className="text-center border-l font-mono">{payment.id}</TableCell>
                                <TableCell className="text-center border-l">{payment.merchantName}</TableCell>
                                <TableCell className="text-center border-l">{payment.date}</TableCell>
                                <TableCell className="text-center border-l font-bold">{payment.amount}</TableCell>
                                <TableCell className="text-center border-l">
                                    <Badge className="bg-green-100 text-green-800">{payment.status}</Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                    <Button variant="outline" size="sm">
                                        <Icon name="Printer" className="ml-2 h-4 w-4" />
                                        طباعة الكشف
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
