'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import Icon from '@/components/icon';
import { useUsersStore } from '@/store/user-store';
import { useOrdersStore } from '@/store/orders-store';
import { useFinancialsStore } from '@/store/financials-store';
import { useSettings } from '@/contexts/SettingsContext';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { exportToExcel } from '@/lib/export-utils';
import { SlipTemplates } from '@/lib/unified-slip-templates-clean';
import { printSlip, exportSlipToPDF, previewSlipPDF } from '@/lib/unified-print-export';

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
    const { formatCurrency, formatDate, settings } = useSettings();
    const { toast } = useToast();

    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'outstanding' | 'totalOrders'>('outstanding');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [showPdfPreview, setShowPdfPreview] = useState(false);
    const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
    const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

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
                phone: driver.email || driver.name || '',
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
                    ? formatDate(driver.lastCollectionDate)
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

    const handlePrintPDF = async () => {
        try {
            const slipData = SlipTemplates.driversFinancial(
                filteredAndSorted,
                formatCurrency,
                formatDate,
                {
                    name: settings.login?.companyName || 'الشركة',
                    logo: settings.login?.reportsLogo || settings.login?.headerLogo
                }
            );

            await printSlip(slipData, {
                orientation: 'landscape',
                showSignatures: false
            });

            toast({
                title: 'تم إرسال للطباعة',
                description: `تم إرسال معلومات ${filteredAndSorted.length} سائق للطباعة.`
            });
        } catch (error: unknown) {
            console.error('[Drivers Print] Error:', error);
            const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير معروف';
            toast({
                variant: 'destructive',
                title: 'خطأ في الطباعة',
                description: errorMessage
            });
        }
    };

    const handlePreviewPDF = async () => {
        try {
            setIsGeneratingPreview(true);
            console.log('[Drivers PDF Preview] Starting preview...');

            const slipData = SlipTemplates.driversFinancial(
                filteredAndSorted,
                formatCurrency,
                formatDate,
                {
                    name: settings.login?.companyName || 'الشركة',
                    logo: settings.login?.reportsLogo || settings.login?.headerLogo
                }
            );

            const dataUrl = await previewSlipPDF(slipData, {
                orientation: 'landscape',
                showSignatures: false
            });

            setPdfPreviewUrl(dataUrl);
            setShowPdfPreview(true);

            console.log('[Drivers PDF Preview] Success!');
        } catch (error: unknown) {
            console.error('[Drivers PDF Preview] Error:', error);
            const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير معروف';
            toast({
                variant: 'destructive',
                title: 'خطأ في المعاينة',
                description: errorMessage
            });
        } finally {
            setIsGeneratingPreview(false);
        }
    };

    const handleExportPDF = async () => {
        try {
            console.log('[Drivers PDF] Starting export...');

            const slipData = SlipTemplates.driversFinancial(
                filteredAndSorted,
                formatCurrency,
                formatDate,
                {
                    name: settings.login?.companyName || 'الشركة',
                    logo: settings.login?.reportsLogo || settings.login?.headerLogo
                }
            );

            await exportSlipToPDF(slipData, {
                orientation: 'landscape',
                showSignatures: false,
                filename: `معلومات_السائقين_المالية_${new Date().toISOString().split('T')[0]}`
            });

            console.log('[Drivers PDF] Success!');

            toast({
                title: 'تم التصدير بنجاح',
                description: `تم تصدير معلومات ${filteredAndSorted.length} سائق إلى ملف PDF.`
            });
        } catch (error: unknown) {
            console.error('[Drivers PDF] Error:', error);

            const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير معروف';

            toast({
                variant: 'destructive',
                title: 'خطأ في التصدير',
                description: errorMessage
            });
        }
    };

    return (
        <>
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
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-orange-600 hover:bg-orange-50 hover:text-orange-700 transition-all hover:scale-105"
                                onClick={handlePrintPDF}
                            >
                                <Icon name="Printer" className="h-4 w-4 ml-1" /> طباعة
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-green-600 hover:bg-green-50 hover:text-green-700 transition-all hover:scale-105"
                                onClick={handleExportExcel}
                            >
                                <Icon name="FileSpreadsheet" className="h-4 w-4 ml-1" /> تصدير
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-blue-600 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-40 transition-all hover:scale-105"
                                onClick={handlePreviewPDF}
                                disabled={isGeneratingPreview}
                            >
                                <Icon name={isGeneratingPreview ? "Loader2" : "Eye"} className={cn("h-4 w-4 ml-1", { "animate-spin": isGeneratingPreview })} /> معاينة
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 transition-all hover:scale-105"
                                onClick={handleExportPDF}
                            >
                                <Icon name="Download" className="h-4 w-4 ml-1" /> PDF
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
                                                        ? formatDate(driver.lastCollectionDate)
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

            {/* PDF Preview Dialog */}
            <Dialog open={showPdfPreview} onOpenChange={setShowPdfPreview}>
                <DialogContent className="max-w-4xl max-h-[90vh] p-0">
                    <DialogHeader className="p-6 pb-2">
                        <DialogTitle>معاينة PDF - معلومات السائقين المالية</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 p-6 pt-2">
                        {pdfPreviewUrl ? (
                            <iframe
                                src={pdfPreviewUrl}
                                className="w-full h-[70vh] border rounded"
                                title="PDF Preview"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-[70vh]">
                                <div className="text-center">
                                    <Icon name="Loader2" className="h-8 w-8 animate-spin mx-auto mb-4" />
                                    <p>جاري تحميل المعاينة...</p>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end gap-2 p-6 pt-2 border-t">
                        <Button variant="outline" onClick={() => setShowPdfPreview(false)}>
                            إغلاق
                        </Button>
                        <Button onClick={handleExportPDF}>
                            <Icon name="Download" className="h-4 w-4 mr-2" />
                            تحميل PDF
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};