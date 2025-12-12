'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/icon';
import { useUsersStore } from '@/store/user-store';
import { useOrdersStore } from '@/store/orders-store';
import { useFinancialsStore } from '@/store/financials-store';
import { useSettings } from '@/contexts/SettingsContext';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { exportToExcel } from '@/lib/export-utils';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface DriverFinancialInfo {
    id: string;
    name: string;
    avatar?: string;
    phone: string;
    status: 'نشط' | 'غير نشط';
    // معلومات مالية
    totalOrders: number;
    deliveredOrders: number;
    pendingCollection: number;
    totalCOD: number;
    totalDriverFees: number;
    netPayable: number;
    collectedAmount: number;
    outstandingAmount: number;
    // إحصائيات الكشوفات
    totalSlips: number;
    lastCollectionDate?: string;
}

export const DriversFinancialTable = () => {
    const { users } = useUsersStore();
    const { orders } = useOrdersStore();
    const { driverPaymentSlips } = useFinancialsStore();
    const { formatCurrency } = useSettings();
    const { toast } = useToast();

    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'outstanding' | 'totalOrders'>('outstanding');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const drivers = useMemo(() => users.filter(u => u.roleId === 'driver'), [users]);

    const driversFinancialData = useMemo(() => {
        return drivers.map(driver => {
            const driverOrders = orders.filter(o => o.driver === driver.name);
            const deliveredOrders = driverOrders.filter(o => o.status === 'تم التوصيل');
            const collectedOrders = driverOrders.filter(o => o.status === 'تم استلام المال في الفرع');

            const totalCOD = deliveredOrders.reduce((sum, o) => sum + (o.cod || 0), 0);
            const totalDriverFees = deliveredOrders.reduce((sum, o) => sum + (o.driverFee || 0), 0);
            const collectedAmount = collectedOrders.reduce((sum, o) => sum + (o.cod || 0), 0);
            const outstandingAmount = totalCOD - collectedAmount;

            const driverSlips = driverPaymentSlips.filter(slip => slip.driverName === driver.name);
            const lastSlip = driverSlips.length > 0
                ? driverSlips.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
                : null;

            return {
                id: driver.id,
                name: driver.name,
                avatar: driver.avatar,
                phone: driver.email || driver.phone || '',
                status: driverOrders.length > 0 ? 'نشط' as const : 'غير نشط' as const,
                totalOrders: driverOrders.length,
                deliveredOrders: deliveredOrders.length,
                pendingCollection: deliveredOrders.length - collectedOrders.length,
                totalCOD,
                totalDriverFees,
                netPayable: totalCOD - totalDriverFees,
                collectedAmount,
                outstandingAmount,
                totalSlips: driverSlips.length,
                lastCollectionDate: lastSlip ? lastSlip.date : undefined,
            };
        });
    }, [drivers, orders, driverPaymentSlips]);

    const filteredAndSorted = useMemo(() => {
        let filtered = driversFinancialData.filter(driver => {
            if (searchQuery === '') return true;
            const query = searchQuery.toLowerCase();
            return (
                driver.name.toLowerCase().includes(query) ||
                driver.phone.toLowerCase().includes(query) ||
                driver.id.toLowerCase().includes(query)
            );
        });

        filtered.sort((a, b) => {
            let comparison = 0;
            switch (sortBy) {
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                case 'outstanding':
                    comparison = a.outstandingAmount - b.outstandingAmount;
                    break;
                case 'totalOrders':
                    comparison = a.totalOrders - b.totalOrders;
                    break;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return filtered;
    }, [driversFinancialData, searchQuery, sortBy, sortOrder]);

    const totals = useMemo(() => {
        return driversFinancialData.reduce((acc, driver) => {
            acc.totalCOD += driver.totalCOD;
            acc.totalDriverFees += driver.totalDriverFees;
            acc.totalCollected += driver.collectedAmount;
            acc.totalOutstanding += driver.outstandingAmount;
            acc.totalNetPayable += driver.netPayable;
            return acc;
        }, {
            totalCOD: 0,
            totalDriverFees: 0,
            totalCollected: 0,
            totalOutstanding: 0,
            totalNetPayable: 0,
        });
    }, [driversFinancialData]);

    const handleExportExcel = async () => {
        try {
            const data = filteredAndSorted.map(driver => ({
                'اسم السائق': driver.name,
                'الهاتف': driver.phone,
                'الحالة': driver.status,
                'إجمالي الطلبات': driver.totalOrders,
                'طلبات مكتملة': driver.deliveredOrders,
                'طلبات قيد التحصيل': driver.pendingCollection,
                'إجمالي التحصيل': driver.totalCOD,
                'إجمالي أجور السائق': driver.totalDriverFees,
                'الصافي المستحق': driver.netPayable,
                'المبلغ المستلم': driver.collectedAmount,
                'المبلغ المتبقي': driver.outstandingAmount,
                'عدد الكشوفات': driver.totalSlips,
                'تاريخ آخر تحصيل': driver.lastCollectionDate
                    ? new Date(driver.lastCollectionDate).toLocaleDateString('ar-EG')
                    : '-',
            }));

            const fileName = `معلومات_السائقين_المالية_${new Date().toISOString().split('T')[0]}.xlsx`;
            await exportToExcel(data, fileName, 'معلومات السائقين المالية');

            toast({
                title: 'تم التصدير بنجاح',
                description: `تم تصدير معلومات ${filteredAndSorted.length} سائق إلى ملف Excel.`
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'خطأ في التصدير',
                description: 'حدث خطأ أثناء تصدير البيانات.'
            });
        }
    };

    const handleExportPDF = () => {
        try {
            const doc = new jsPDF('l', 'mm', 'a4');

            doc.setFontSize(18);
            doc.text('معلومات السائقين المالية', 14, 15);

            doc.setFontSize(12);
            doc.text(`التاريخ: ${new Date().toLocaleDateString('ar-EG')}`, 14, 22);
            doc.text(`عدد السائقين: ${filteredAndSorted.length}`, 14, 28);

            const tableData = filteredAndSorted.map(driver => [
                driver.name,
                driver.status,
                driver.totalOrders.toString(),
                driver.deliveredOrders.toString(),
                formatCurrency(driver.totalCOD),
                formatCurrency(driver.totalDriverFees),
                formatCurrency(driver.netPayable),
                formatCurrency(driver.collectedAmount),
                formatCurrency(driver.outstandingAmount),
                driver.totalSlips.toString(),
            ]);

            (doc as any).autoTable({
                head: [['اسم السائق', 'الحالة', 'إجمالي الطلبات', 'مكتملة', 'إجمالي التحصيل', 'أجور السائق', 'الصافي', 'مستلم', 'متبقي', 'كشوفات']],
                body: tableData,
                startY: 35,
                styles: { font: 'Arial', fontSize: 8, halign: 'right' },
                headStyles: { fillColor: [66, 139, 202], textColor: 255, fontStyle: 'bold' },
                alternateRowStyles: { fillColor: [245, 245, 245] },
                margin: { top: 35 },
            });

            const fileName = `معلومات_السائقين_المالية_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);

            toast({
                title: 'تم التصدير بنجاح',
                description: `تم تصدير معلومات ${filteredAndSorted.length} سائق إلى ملف PDF.`
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'خطأ في التصدير',
                description: 'حدث خطأ أثناء تصدير البيانات.'
            });
        }
    };

    return (
        <Card className="border-2 shadow-sm">
            <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <Icon name="Users" className="h-5 w-5 text-primary" />
                            </div>
                            <CardTitle>معلومات السائقين المالية</CardTitle>
                        </div>
                        <CardDescription>
                            عرض شامل للمعلومات المالية لكل سائق مع إمكانية التصدير والطباعة
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative w-full max-w-xs">
                            <Icon name="Search" className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="بحث بالاسم أو الهاتف..."
                                className="pr-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="ترتيب حسب" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="outstanding">المبلغ المتبقي</SelectItem>
                                <SelectItem value="totalOrders">عدد الطلبات</SelectItem>
                                <SelectItem value="name">الاسم</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm" onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                            <Icon name={sortOrder === 'asc' ? 'ArrowUp' : 'ArrowDown'} className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleExportExcel} className="gap-2">
                            <Icon name="FileSpreadsheet" className="h-4 w-4" />
                            <span className="hidden sm:inline">Excel</span>
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleExportPDF} className="gap-2">
                            <Icon name="FileText" className="h-4 w-4" />
                            <span className="hidden sm:inline">PDF</span>
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="text-center border-l">السائق</TableHead>
                                <TableHead className="text-center border-l">الحالة</TableHead>
                                <TableHead className="text-center border-l">إجمالي الطلبات</TableHead>
                                <TableHead className="text-center border-l">مكتملة</TableHead>
                                <TableHead className="text-center border-l">قيد التحصيل</TableHead>
                                <TableHead className="text-center border-l">إجمالي التحصيل</TableHead>
                                <TableHead className="text-center border-l">أجور السائق</TableHead>
                                <TableHead className="text-center border-l">الصافي المستحق</TableHead>
                                <TableHead className="text-center border-l">المبلغ المستلم</TableHead>
                                <TableHead className="text-center border-l">المبلغ المتبقي</TableHead>
                                <TableHead className="text-center border-l">الكشوفات</TableHead>
                                <TableHead className="text-center border-l">آخر تحصيل</TableHead>
                                <TableHead className="text-center">الإجراءات</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAndSorted.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={13} className="text-center h-24">
                                        لا توجد بيانات لعرضها
                                    </TableCell>
                                </TableRow>
                            ) : (
                                <>
                                    {filteredAndSorted.map((driver) => (
                                        <TableRow key={driver.id} className="hover:bg-muted/30">
                                            <TableCell className="border-l">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10 border-2 border-background">
                                                        <AvatarImage src={driver.avatar} alt={driver.name} />
                                                        <AvatarFallback className="font-semibold">
                                                            {driver.name.charAt(0)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-semibold">{driver.name}</div>
                                                        <div className="text-xs text-muted-foreground">{driver.phone}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center border-l">
                                                <Badge variant={driver.status === 'نشط' ? 'default' : 'secondary'}>
                                                    {driver.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center border-l font-bold">{driver.totalOrders}</TableCell>
                                            <TableCell className="text-center border-l">
                                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                                                    {driver.deliveredOrders}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center border-l">
                                                <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
                                                    {driver.pendingCollection}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center border-l font-semibold">{formatCurrency(driver.totalCOD)}</TableCell>
                                            <TableCell className="text-center border-l">{formatCurrency(driver.totalDriverFees)}</TableCell>
                                            <TableCell className="text-center border-l font-bold text-primary">
                                                {formatCurrency(driver.netPayable)}
                                            </TableCell>
                                            <TableCell className="text-center border-l font-semibold text-emerald-600 dark:text-emerald-400">
                                                {formatCurrency(driver.collectedAmount)}
                                            </TableCell>
                                            <TableCell className="text-center border-l font-bold text-red-600 dark:text-red-400">
                                                {formatCurrency(driver.outstandingAmount)}
                                            </TableCell>
                                            <TableCell className="text-center border-l">
                                                <Badge variant="secondary">{driver.totalSlips}</Badge>
                                            </TableCell>
                                            <TableCell className="text-center border-l text-sm text-muted-foreground">
                                                {driver.lastCollectionDate
                                                    ? new Date(driver.lastCollectionDate).toLocaleDateString('ar-EG')
                                                    : '-'
                                                }
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        asChild
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <Link href={`/dashboard/financials?tab=collect-from-driver&driver=${encodeURIComponent(driver.name)}`}>
                                                            <Icon name="Wallet" className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        asChild
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <Link href={`/dashboard/orders?driver=${encodeURIComponent(driver.name)}`}>
                                                            <Icon name="Eye" className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {/* صف الإجمالي */}
                                    <TableRow className="bg-muted/50 font-bold">
                                        <TableCell colSpan={5} className="text-center border-l">
                                            الإجمالي
                                        </TableCell>
                                        <TableCell className="text-center border-l">{formatCurrency(totals.totalCOD)}</TableCell>
                                        <TableCell className="text-center border-l">{formatCurrency(totals.totalDriverFees)}</TableCell>
                                        <TableCell className="text-center border-l text-primary">{formatCurrency(totals.totalNetPayable)}</TableCell>
                                        <TableCell className="text-center border-l text-emerald-600 dark:text-emerald-400">
                                            {formatCurrency(totals.totalCollected)}
                                        </TableCell>
                                        <TableCell className="text-center border-l text-red-600 dark:text-red-400">
                                            {formatCurrency(totals.totalOutstanding)}
                                        </TableCell>
                                        <TableCell colSpan={3}></TableCell>
                                    </TableRow>
                                </>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
};

