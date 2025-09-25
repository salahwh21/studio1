
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const mockDriverPayments = [
    { id: 'DP-001', driverName: 'ابو العبد', date: '2023-10-01', amount: '150.00 د.أ', status: 'مدفوع' },
    { id: 'DP-002', driverName: 'سامر الطباخي', date: '2023-10-01', amount: '125.50 د.أ', status: 'مدفوع' },
    { id: 'DP-003', driverName: 'محمد سويد', date: '2023-09-25', amount: '210.00 د.أ', status: 'مدفوع' },
];

export const DriverPaymentsLog = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>سجل دفعات أجور السائقين</CardTitle>
                 <CardDescription>
                    عرض وتأكيد دفع أجور السائقين المستحقة.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-center border-l">رقم الدفعة</TableHead>
                            <TableHead className="text-center border-l">اسم السائق</TableHead>
                            <TableHead className="text-center border-l">تاريخ الدفعة</TableHead>
                            <TableHead className="text-center border-l">المبلغ</TableHead>
                            <TableHead className="text-center">الحالة</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockDriverPayments.map(payment => (
                            <TableRow key={payment.id}>
                                <TableCell className="text-center border-l font-mono">{payment.id}</TableCell>
                                <TableCell className="text-center border-l">{payment.driverName}</TableCell>
                                <TableCell className="text-center border-l">{payment.date}</TableCell>
                                <TableCell className="text-center border-l font-bold">{payment.amount}</TableCell>
                                <TableCell className="text-center">
                                    <Badge className="bg-green-100 text-green-800">{payment.status}</Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};
