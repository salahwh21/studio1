'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '../icon';
import { useReturnsStore } from '@/store/returns-store';
import Link from 'next/link';

export const DriverPaymentsLog = () => {
    const { driverSlips } = useReturnsStore();

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <CardTitle>سجل كشوفات استلام المرتجعات</CardTitle>
                        <CardDescription>
                            عرض وطباعة وتعديل كشوفات المرتجعات التي تم استلامها من السائقين.
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm"><Icon name="FileDown" className="ml-2 h-4 w-4"/>تصدير PDF</Button>
                        <Button variant="outline" size="sm"><Icon name="FileSpreadsheet" className="ml-2 h-4 w-4"/>تصدير Excel</Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-center border-l">رقم الكشف</TableHead>
                            <TableHead className="text-center border-l">اسم السائق</TableHead>
                            <TableHead className="text-center border-l">تاريخ الإنشاء</TableHead>
                            <TableHead className="text-center border-l">عدد الشحنات</TableHead>
                            <TableHead className="text-center">الحالة</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {driverSlips.length === 0 ? (
                             <TableRow>
                                <TableCell colSpan={5} className="text-center h-24">
                                    لم يتم إنشاء أي كشوفات بعد.
                                </TableCell>
                            </TableRow>
                        ) : driverSlips.map(slip => (
                            <TableRow key={slip.id}>
                                <TableCell className="text-center border-l font-mono">
                                    <Link href={`/dashboard/returns/slips/${slip.id}`} className="text-primary hover:underline">
                                        {slip.id}
                                    </Link>
                                </TableCell>
                                <TableCell className="text-center border-l">{slip.driverName}</TableCell>
                                <TableCell className="text-center border-l">{new Date(slip.date).toLocaleDateString('ar-EG')}</TableCell>
                                <TableCell className="text-center border-l">{slip.itemCount}</TableCell>
                                <TableCell className="text-center">
                                    <Badge className="bg-blue-100 text-blue-800">مستلم بالفرع</Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};
