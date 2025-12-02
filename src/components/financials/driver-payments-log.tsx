
'use client';

import { useState, useMemo, useTransition, useRef } from 'react';
import { useFinancialsStore, type DriverPaymentSlip } from '@/store/financials-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '../icon';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { parseISO, isWithinInterval } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/contexts/SettingsContext';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/date-range-picker';
import type { DateRange } from 'react-day-picker';
import { htmlToText } from 'html-to-text';
import * as XLSX from 'xlsx';
import { exportToPDF, type PDFExportOptions } from '@/lib/pdf-export-utils';


export const DriverPaymentsLog = () => {
    const { toast } = useToast();
    const { settings, formatCurrency } = useSettings();
    const { driverPaymentSlips } = useFinancialsStore();
    const [isPending, startTransition] = useTransition();
    
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const [currentSlip, setCurrentSlip] = useState<DriverPaymentSlip | null>(null);

    const [filterDriver, setFilterDriver] = useState<string>('all');
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

    const drivers = useMemo(() => Array.from(new Set(driverPaymentSlips.map(s => s.driverName))), [driverPaymentSlips]);


    const filteredSlips = useMemo(() => driverPaymentSlips.filter(slip => {
        let matchesDriver = filterDriver === 'all' ? true : slip.driverName === filterDriver;
        let matchesDate = true;
        if (dateRange?.from && dateRange?.to) {
            try {
                const slipDate = parseISO(slip.date);
                matchesDate = isWithinInterval(slipDate, { start: dateRange.from, end: dateRange.to });
            } catch(e) { matchesDate = false; }
        }
        return matchesDriver && matchesDate;
    }), [driverPaymentSlips, filterDriver, dateRange]);
    
    const handleShowDetails = (slip: DriverPaymentSlip) => {
        setCurrentSlip(slip);
        setShowDetailsDialog(true);
    };

    const handlePrintAction = (slip: DriverPaymentSlip) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            toast({ variant: "destructive", title: "فشل الطباعة", description: "يرجى السماح بفتح النوافذ المنبثقة." });
            return;
        }

        const tableHeader = `
            <thead>
                <tr>
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">#</th>
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">رقم الطلب</th>
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">المستلم</th>
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">قيمة التحصيل</th>
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">أجرة السائق</th>
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">الصافي</th>
                </tr>
            </thead>
        `;

        const tableRows = slip.orders.map((o, i) => `
            <tr>
                <td style="padding: 8px; border: 1px solid #ddd;">${i + 1}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${o.id}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${o.recipient}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${formatCurrency(o.cod)}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${formatCurrency(o.driverFee)}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${formatCurrency((o.cod || 0) - (o.driverFee || 0))}</td>
            </tr>
        `).join('');

        const totalCOD = slip.orders.reduce((sum, o) => sum + (o.cod || 0), 0);
        const totalDriverFare = slip.orders.reduce((sum, o) => sum + (o.driverFee || 0), 0);
        const totalNet = totalCOD - totalDriverFare;

        const tableFooter = `
            <tfoot>
                <tr>
                    <th colspan="3" style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold;">الإجمالي</th>
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold;">${formatCurrency(totalCOD)}</th>
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold;">${formatCurrency(totalDriverFare)}</th>
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold;">${formatCurrency(totalNet)}</th>
                </tr>
            </tfoot>
        `;

        const slipDate = new Date(slip.date).toLocaleDateString('ar-EG');
        const logoUrl = settings.login.reportsLogo || settings.login.headerLogo;

        const content = `
            <html>
                <head>
                    <title>كشف تحصيل من: ${slip.driverName}</title>
                    <style>
                        body { direction: rtl; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                        th, td { padding: 8px; border: 1px solid #ddd; text-align: right; }
                        th { background-color: #f2f2f2; }
                        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                        .signatures { margin-top: 40px; display: flex; justify-content: space-between; }
                        .signature { border-top: 1px solid #000; padding-top: 5px; width: 200px; text-align: center; }
                        tfoot { background-color: #f9f9f9; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        ${logoUrl ? `<img src="${logoUrl}" alt="Logo" style="height: 50px;">` : `<h1>${settings.login.companyName || 'الشركة'}</h1>`}
                        <div>
                            <h2>كشف تحصيل من السائق: ${slip.driverName}</h2>
                            <p>التاريخ: ${slipDate}</p>
                        </div>
                    </div>
                    <table>
                        ${tableHeader}
                        <tbody>${tableRows}</tbody>
                        ${tableFooter}
                    </table>
                    <div class="signatures">
                        <div class="signature">توقيع المستلم (المحاسب)</div>
                        <div class="signature">توقيع السائق</div>
                    </div>
                </body>
            </html>
        `;
        printWindow.document.write(content);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    };

    const handleExportExcel = () => {
        if (filteredSlips.length === 0) {
            toast({ variant: 'destructive', title: 'خطأ', description: 'لا توجد كشوفات للتصدير.' });
            return;
        }

        try {
            const data = filteredSlips.map(slip => {
                const totalCOD = slip.orders.reduce((sum, o) => sum + (o.cod || 0), 0);
                const totalDriverFare = slip.orders.reduce((sum, o) => sum + (o.driverFee || 0), 0);
                const totalNet = totalCOD - totalDriverFare;
                
                return {
                    'رقم الكشف': slip.id,
                    'اسم السائق': slip.driverName,
                    'تاريخ الإنشاء': new Date(slip.date).toLocaleDateString('ar-EG'),
                    'عدد الشحنات': slip.itemCount,
                    'إجمالي التحصيل': totalCOD,
                    'إجمالي أجرة السائق': totalDriverFare,
                    'الصافي': totalNet,
                };
            });

            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'كشوفات التحصيل');

            const fileName = `كشوفات_التحصيل_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(wb, fileName);

            toast({
                title: 'تم التصدير بنجاح',
                description: `تم تصدير ${filteredSlips.length} كشف إلى ملف Excel.`
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'خطأ في التصدير',
                description: 'حدث خطأ أثناء تصدير البيانات.'
            });
        }
    };

    const handleExportPDF = async () => {
        if (filteredSlips.length === 0) {
            toast({ variant: 'destructive', title: 'خطأ', description: 'لا توجد كشوفات للتصدير.' });
            return;
        }

        try {
            const slipDate = new Date().toLocaleDateString('ar-EG', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            const logoUrl = settings.login.reportsLogo || settings.login.headerLogo;

            const headers = ['رقم الكشف', 'اسم السائق', 'تاريخ الإنشاء', 'عدد الشحنات', 'إجمالي التحصيل', 'إجمالي أجرة السائق', 'الصافي'];
            
            const rows = filteredSlips.map(slip => {
                const totalCOD = slip.orders.reduce((sum, o) => sum + (o.cod || 0), 0);
                const totalDriverFare = slip.orders.reduce((sum, o) => sum + (o.driverFee || 0), 0);
                const totalNet = totalCOD - totalDriverFare;
                
                return [
                    slip.id,
                    slip.driverName,
                    new Date(slip.date).toLocaleDateString('ar-EG'),
                    slip.itemCount.toString(),
                    formatCurrency(totalCOD),
                    formatCurrency(totalDriverFare),
                    formatCurrency(totalNet),
                ];
            });

            const totalCOD = filteredSlips.reduce((sum, slip) => {
                return sum + slip.orders.reduce((s, o) => s + (o.cod || 0), 0);
            }, 0);
            const totalDriverFare = filteredSlips.reduce((sum, slip) => {
                return sum + slip.orders.reduce((s, o) => s + (o.driverFee || 0), 0);
            }, 0);
            const totalNet = totalCOD - totalDriverFare;

            const footerRow = ['الإجمالي', '', '', filteredSlips.reduce((sum, s) => sum + s.itemCount, 0).toString(), formatCurrency(totalCOD), formatCurrency(totalDriverFare), formatCurrency(totalNet)];

            const pdfOptions: PDFExportOptions = {
                title: 'كشوفات التحصيل المالي',
                subtitle: `عدد الكشوفات: ${filteredSlips.length}`,
                logoUrl,
                companyName: settings.login.companyName || 'الشركة',
                date: slipDate,
                tableHeaders: headers,
                tableRows: rows,
                footerRow,
                showSignatures: false,
                orientation: 'landscape' // Use landscape for multiple slips
            };

            const fileName = `كشوفات_التحصيل_${new Date().toISOString().split('T')[0]}.pdf`;
            await exportToPDF(pdfOptions, fileName);

            toast({
                title: 'تم التصدير بنجاح',
                description: `تم تصدير ${filteredSlips.length} كشف إلى ملف PDF.`
            });
        } catch (error) {
            console.error('PDF export error:', error);
            toast({
                variant: 'destructive',
                title: 'خطأ في التصدير',
                description: 'حدث خطأ أثناء تصدير البيانات.'
            });
        }
    };

    const totalStats = useMemo(() => {
        return filteredSlips.reduce((acc, slip) => {
            const totalCOD = slip.orders.reduce((sum, o) => sum + (o.cod || 0), 0);
            const totalDriverFare = slip.orders.reduce((sum, o) => sum + (o.driverFee || 0), 0);
            acc.totalAmount += totalCOD;
            acc.totalDriverFares += totalDriverFare;
            acc.totalNet += totalCOD - totalDriverFare;
            acc.totalOrders += slip.itemCount;
            return acc;
        }, { totalAmount: 0, totalDriverFares: 0, totalNet: 0, totalOrders: 0 });
    }, [filteredSlips]);

    return (
        <div className="space-y-6">
            <Card className="border-2 shadow-sm">
                <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <Icon name="FileText" className="h-5 w-5 text-primary" />
                                </div>
                                <CardTitle>سجل كشوفات التحصيل المالي</CardTitle>
                            </div>
                            <CardDescription>
                                عرض وطباعة كشوفات المبالغ المالية التي تم استلامها من السائقين
                            </CardDescription>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <DateRangePicker 
                                onUpdate={(range) => setDateRange(range.range)} 
                                className="[&>button]:w-[200px]"
                            />
                            <Select value={filterDriver || 'all'} onValueChange={setFilterDriver}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="فلترة حسب السائق" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">كل السائقين</SelectItem>
                                    {drivers.map(driver => (
                                        <SelectItem key={driver} value={driver}>{driver}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={handleExportExcel}
                                className="gap-2"
                                disabled={filteredSlips.length === 0}
                            >
                                <Icon name="FileSpreadsheet" className="h-4 w-4"/>
                                <span className="hidden sm:inline">تصدير Excel</span>
                                <span className="sm:hidden">Excel</span>
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={handleExportPDF}
                                className="gap-2"
                                disabled={filteredSlips.length === 0}
                            >
                                <Icon name="FileText" className="h-4 w-4"/>
                                <span className="hidden sm:inline">تصدير PDF</span>
                                <span className="sm:hidden">PDF</span>
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* إحصائيات سريعة */}
                    {filteredSlips.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 border border-blue-200 dark:border-blue-900">
                                <div className="flex items-center gap-2 mb-2">
                                    <Icon name="FileText" className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    <span className="text-xs font-medium text-blue-700 dark:text-blue-300">عدد الكشوفات</span>
                                </div>
                                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                                    {filteredSlips.length}
                                </div>
                            </div>
                            <div className="p-4 rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/20 border border-emerald-200 dark:border-emerald-900">
                                <div className="flex items-center gap-2 mb-2">
                                    <Icon name="ShoppingCart" className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                    <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">إجمالي الطلبات</span>
                                </div>
                                <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                                    {totalStats.totalOrders}
                                </div>
                            </div>
                            <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 border border-purple-200 dark:border-purple-900">
                                <div className="flex items-center gap-2 mb-2">
                                    <Icon name="Banknote" className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                    <span className="text-xs font-medium text-purple-700 dark:text-purple-300">إجمالي المبلغ</span>
                                </div>
                                <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                                    {formatCurrency(totalStats.totalAmount)}
                                </div>
                            </div>
                            <div className="p-4 rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20 border border-amber-200 dark:border-amber-900">
                                <div className="flex items-center gap-2 mb-2">
                                    <Icon name="TrendingUp" className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                    <span className="text-xs font-medium text-amber-700 dark:text-amber-300">الصافي</span>
                                </div>
                                <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                                    {formatCurrency(totalStats.totalNet)}
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div className="overflow-x-auto rounded-lg border">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="text-center border-l">رقم الكشف</TableHead>
                                    <TableHead className="text-center border-l">اسم السائق</TableHead>
                                    <TableHead className="text-center border-l">تاريخ الإنشاء</TableHead>
                                    <TableHead className="text-center border-l">عدد الشحنات</TableHead>
                                    <TableHead className="text-center border-l">إجمالي التحصيل</TableHead>
                                    <TableHead className="text-center border-l">أجرة السائق</TableHead>
                                    <TableHead className="text-center border-l">الصافي</TableHead>
                                    <TableHead className="text-center">إجراءات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredSlips.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center h-24">
                                            <div className="flex flex-col items-center gap-2">
                                                <Icon name="FileText" className="h-12 w-12 text-muted-foreground opacity-50" />
                                                <p className="text-muted-foreground font-medium">لم يتم العثور على أي كشوفات تطابق الفلاتر المحددة</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredSlips.map(slip => {
                                    const totalCOD = slip.orders.reduce((sum, o) => sum + (o.cod || 0), 0);
                                    const totalDriverFare = slip.orders.reduce((sum, o) => sum + (o.driverFee || 0), 0);
                                    const totalNet = totalCOD - totalDriverFare;
                                    return (
                                        <TableRow key={slip.id} className="hover:bg-muted/30">
                                            <TableCell className="font-mono border-l">
                                                <Link 
                                                    href={`/dashboard/financials/slips/${slip.id}`} 
                                                    className="text-primary hover:underline font-semibold"
                                                >
                                                    {slip.id}
                                                </Link>
                                            </TableCell>
                                            <TableCell className="border-l font-semibold">{slip.driverName}</TableCell>
                                            <TableCell className="border-l">
                                                <div className="flex flex-col">
                                                    <span>{new Date(slip.date).toLocaleDateString('ar-EG')}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {new Date(slip.date).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="border-l text-center">
                                                <Badge variant="secondary">{slip.itemCount}</Badge>
                                            </TableCell>
                                            <TableCell className="border-l font-bold text-center">{formatCurrency(totalCOD)}</TableCell>
                                            <TableCell className="border-l text-center text-muted-foreground">{formatCurrency(totalDriverFare)}</TableCell>
                                            <TableCell className="border-l font-bold text-center text-primary">{formatCurrency(totalNet)}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-center gap-2">
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm" 
                                                        onClick={() => handlePrintAction(slip)}
                                                        className="gap-2"
                                                    >
                                                        <Icon name="Printer" className="h-4 w-4" />
                                                        <span className="hidden sm:inline">طباعة</span>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        asChild
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <Link href={`/dashboard/financials/slips/${slip.id}`}>
                                                            <Icon name="Eye" className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
