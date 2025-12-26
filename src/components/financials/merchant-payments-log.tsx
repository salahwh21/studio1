
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/icon';
import { useFinancialsStore, type MerchantPaymentSlip } from '@/store/financials-store';
import { useSettings } from '@/contexts/SettingsContext';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { exportToExcel } from '@/lib/export-utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { SlipTemplates } from '@/lib/unified-slip-templates';
import { exportSlipToPDF, printSlip } from '@/lib/unified-print-export';


export const MerchantPaymentsLog = () => {
    const { merchantPaymentSlips, setMerchantPaymentSlips } = useFinancialsStore();
    const { settings, formatCurrency, formatDate } = useSettings();
    const { toast } = useToast();
    const [isExporting, setIsExporting] = useState<string | null>(null);
    const [filterMerchant, setFilterMerchant] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // PDF Preview states
    const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

    useEffect(() => {
        const fetchSlips = async () => {
            try {
                const data = await api.getMerchantPaymentSlips();
                if (Array.isArray(data)) {
                    setMerchantPaymentSlips(data);
                }
            } catch (error) {
                console.error('Failed to fetch merchant payments', error);
            }
        };
        fetchSlips();
    }, [setMerchantPaymentSlips]);

    const handleConfirmPayment = async (slip: MerchantPaymentSlip) => {
        if (!confirm(`هل أنت متأكد من تسليم المبلغ للتاجر "${slip.merchantName}"؟\nسيتم تغيير حالة ${slip.itemCount} طلب إلى "تم محاسبة التاجر".`)) return;

        try {
            await api.updateMerchantPaymentStatus(slip.id, 'تم التسليم');
            toast({ title: 'تم التحديث', description: 'تم تأكيد تسليم المبلغ بنجاح.' });

            const data = await api.getMerchantPaymentSlips();
            if (Array.isArray(data)) {
                setMerchantPaymentSlips(data);
            }
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'خطأ', description: err.message || 'فشل تحديث الحالة' });
        }
    };

    const handlePrint = async (slip: MerchantPaymentSlip) => {
        if (!slip) return;

        try {
            const slipData = SlipTemplates.merchantPayment(
                slip.merchantName,
                slip.orders,
                {}, // No adjustments for this case
                formatCurrency,
                formatDate,
                {
                    name: settings.login?.companyName || 'الشركة',
                    logo: settings.login?.reportsLogo || settings.login?.headerLogo
                }
            );

            await printSlip(slipData, {
                orientation: 'portrait',
                showSignatures: true
            });

            toast({ title: 'تم إرسال للطباعة', description: 'تم إرسال الكشف للطباعة بنجاح.' });
        } catch (error) {
            console.error('Print error:', error);
            toast({ variant: 'destructive', title: 'فشل الطباعة', description: 'حدث خطأ أثناء الطباعة.' });
        }
    };

    const handleDownloadPdf = async (slip: MerchantPaymentSlip) => {
        if (!slip) return;
        setIsExporting(slip.id);

        try {
            const slipData = SlipTemplates.merchantPayment(
                slip.merchantName,
                slip.orders,
                {}, // No adjustments for this case
                formatCurrency,
                formatDate,
                {
                    name: settings.login?.companyName || 'الشركة',
                    logo: settings.login?.reportsLogo || settings.login?.headerLogo
                }
            );

            await exportSlipToPDF(slipData, {
                orientation: 'portrait',
                showSignatures: true,
                filename: `كشف_دفع_${slip.merchantName}_${new Date().toISOString().split('T')[0]}`
            });

            toast({ title: 'تم التصدير بنجاح', description: `تم تحميل كشف ${slip.merchantName}.` });
        } catch (error) {
            console.error('PDF export error:', error);
            toast({ variant: 'destructive', title: 'خطأ', description: 'حدث خطأ أثناء إنشاء ملف PDF.' });
        } finally {
            setIsExporting(null);
        }
    };

    const SlipHTML = ({ slip }: { slip: MerchantPaymentSlip | null }) => {
        if (!slip) return null;

        const totalCod = slip.orders.reduce((sum, o) => sum + (o.cod || 0), 0);
        const totalDelivery = slip.orders.reduce((sum, o) => sum + (o.deliveryFee || 0), 0);
        const totalNet = slip.orders.reduce((sum, o) => sum + (o.itemPrice || 0), 0);
        const slipDate = formatDate(slip.date);
        const logoUrl = settings.login.reportsLogo || settings.login.headerLogo;

        return (
            <div className="slip-container" style={{ width: '210mm', minHeight: '297mm', padding: '15mm', boxSizing: 'border-box', backgroundColor: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <style>{`
                    .slip-container { direction: rtl; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: black; }
                    .slip-table { width: 100%; border-collapse: collapse; margin: 40px 0; font-size: 11px; }
                    .slip-table th, .slip-table td { padding: 8px 10px; border: 1px solid #ddd; text-align: right; }
                    .slip-table th { background-color: #f2f2f2; font-weight: bold; }
                    .slip-header { display: flex; justify-content: space-between; align-items: flex-start; }
                    .slip-header h2 { font-size: 18px; margin: 0; font-weight: bold; }
                    .slip-header p { font-size: 11px; margin: 4px 0; color: #555; }
                    .slip-signatures { margin-top: 60px; display: flex; justify-content: space-between; font-size: 12px; }
                    .slip-signature { border-top: 1px solid #000; padding-top: 8px; width: 220px; text-align: center; }
                    .slip-table tfoot { background-color: #f9f9f9; font-weight: bold; }
                    .slip-logo { font-size: 18px; font-weight: bold; }
                `}</style>
                <div>
                    <div className="slip-header">
                        <div style={{ textAlign: 'right' }}>
                            <h2>كشف دفع للتاجر: {slip.merchantName}</h2>
                            <p>التاريخ: {slipDate}</p>
                            <p>رقم الكشف: {slip.id}</p>
                        </div>
                        <div className="slip-logo">
                            {logoUrl ? <img src={logoUrl} alt="Logo" style={{ maxHeight: '40px' }} /> : (settings.login.companyName || 'الوميض')}
                        </div>
                    </div>
                    <table className="slip-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>رقم الطلب</th>
                                <th>المستلم</th>
                                <th>قيمة التحصيل</th>
                                <th>أجور التوصيل</th>
                                <th>الصافي المستحق</th>
                            </tr>
                        </thead>
                        <tbody>
                            {slip.orders.map((o, i) => (
                                <tr key={o.id}>
                                    <td>{i + 1}</td>
                                    <td>{o.id}</td>
                                    <td>{o.recipient}</td>
                                    <td>{formatCurrency(o.cod)}</td>
                                    <td>{formatCurrency(o.deliveryFee)}</td>
                                    <td style={{ fontWeight: 'bold' }}>{formatCurrency(o.itemPrice)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <th colSpan={3}>الإجمالي</th>
                                <th>{formatCurrency(totalCod)}</th>
                                <th>{formatCurrency(totalDelivery)}</th>
                                <th>{formatCurrency(totalNet)}</th>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                <div className="slip-signatures">
                    <div className="slip-signature">توقيع المستلم (التاجر)</div>
                    <div className="slip-signature">توقيع الموظف المالي</div>
                </div>
            </div>
        )
    }

    const merchants = useMemo(() => Array.from(new Set(merchantPaymentSlips.map(s => s.merchantName))), [merchantPaymentSlips]);

    const filteredSlips = useMemo(() => {
        return merchantPaymentSlips.filter(slip => {
            const matchesMerchant = filterMerchant === 'all' || slip.merchantName === filterMerchant;
            const matchesStatus = filterStatus === 'all' || slip.status === filterStatus;
            const matchesSearch = searchQuery === '' ||
                slip.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                slip.merchantName.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesMerchant && matchesStatus && matchesSearch;
        });
    }, [merchantPaymentSlips, filterMerchant, filterStatus, searchQuery]);

    const totalStats = useMemo(() => {
        return filteredSlips.reduce((acc, slip) => {
            const totalAmount = slip.orders.reduce((sum, o) => sum + (o.itemPrice || 0), 0);
            acc.totalAmount += totalAmount;
            acc.totalOrders += slip.itemCount;
            return acc;
        }, { totalAmount: 0, totalOrders: 0 });
    }, [filteredSlips]);

    const handleExportExcel = async () => {
        if (filteredSlips.length === 0) {
            toast({ variant: 'destructive', title: 'خطأ', description: 'لا توجد كشوفات للتصدير.' });
            return;
        }

        try {
            const data = filteredSlips.map(slip => {
                const totalAmount = slip.orders.reduce((sum, o) => sum + (o.itemPrice || 0), 0);
                return {
                    'رقم الكشف': slip.id,
                    'اسم التاجر': slip.merchantName,
                    'تاريخ الإنشاء': formatDate(slip.date),
                    'عدد الطلبات': slip.itemCount,
                    'المبلغ الإجمالي': totalAmount,
                    'الحالة': slip.status,
                };
            });

            const fileName = `دفعات_التجار_${new Date().toISOString().split('T')[0]}.xlsx`;
            await exportToExcel(data, fileName, 'دفعات التجار');

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

    const handleDownloadPDF = async () => {
        try {
            setIsGeneratingPreview(true);

            // Create a simple slip data for merchant payments log
            const slipData = {
                title: 'سجل دفعات التجار',
                subtitle: `عدد الكشوفات: ${filteredSlips.length}`,
                date: formatDate(new Date()),
                headers: ['التاجر', 'التاريخ', 'عدد الطلبات', 'الحالة', 'المبلغ الإجمالي'],
                rows: filteredSlips.map(slip => [
                    slip.merchantName,
                    formatDate(slip.date),
                    slip.itemCount.toString(),
                    slip.status,
                    formatCurrency(slip.orders.reduce((sum, order) => sum + (order.itemPrice || 0), 0))
                ]),
                totalsRow: [
                    'الإجمالي',
                    '',
                    filteredSlips.reduce((sum, slip) => sum + slip.itemCount, 0).toString(),
                    '',
                    formatCurrency(filteredSlips.reduce((sum, slip) =>
                        sum + slip.orders.reduce((orderSum, order) => orderSum + (order.itemPrice || 0), 0), 0
                    ))
                ],
                companyInfo: {
                    name: settings.login?.companyName || 'الشركة',
                    logo: settings.login?.reportsLogo || settings.login?.headerLogo || undefined
                }
            };

            await exportSlipToPDF(slipData, {
                orientation: 'landscape',
                showSignatures: false,
                filename: `سجل_دفعات_التجار_${new Date().toISOString().split('T')[0]}`
            });

            toast({
                title: 'تم التحميل بنجاح',
                description: `تم تحميل سجل ${filteredSlips.length} كشف دفع.`
            });
        } catch (error) {
            console.error('PDF export error:', error);
            toast({
                variant: 'destructive',
                title: 'خطأ في التصدير',
                description: 'حدث خطأ أثناء تصدير PDF'
            });
        } finally {
            setIsGeneratingPreview(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card className="border-2 shadow-sm">
                <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <Icon name="Receipt" className="h-5 w-5 text-primary" />
                                </div>
                                <CardTitle>سجل دفعات التجار</CardTitle>
                            </div>
                            <CardDescription>
                                عرض وطباعة وتأكيد كشوفات الدفع التي تم إنشاؤها للتجار
                            </CardDescription>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="relative w-full sm:w-auto sm:min-w-[200px]">
                                <Icon name="Search" className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="بحث..."
                                    className="pr-10"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Select value={filterMerchant || 'all'} onValueChange={setFilterMerchant}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="فلترة حسب التاجر" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">كل التجار</SelectItem>
                                    {merchants.map(merchant => (
                                        <SelectItem key={merchant} value={merchant}>{merchant}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={filterStatus || 'all'} onValueChange={setFilterStatus}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="فلترة حسب الحالة" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">كل الحالات</SelectItem>
                                    <SelectItem value="جاهز للتسليم">جاهز للتسليم</SelectItem>
                                    <SelectItem value="مدفوع">مدفوع</SelectItem>
                                    <SelectItem value="تم التسليم">تم التسليم</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs disabled:opacity-40 text-green-600 hover:bg-green-50 hover:text-green-700 transition-all hover:scale-105"
                                onClick={handleExportExcel}
                                disabled={filteredSlips.length === 0}
                            >
                                <Icon name="FileSpreadsheet" className="h-4 w-4 ml-1" /> تصدير
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs disabled:opacity-40 text-red-600 hover:bg-red-50 hover:text-red-700 transition-all hover:scale-105"
                                onClick={handleDownloadPDF}
                                disabled={filteredSlips.length === 0 || isGeneratingPreview}
                            >
                                <Icon name={isGeneratingPreview ? "Loader2" : "Download"} className={cn("h-4 w-4 ml-1", { "animate-spin": isGeneratingPreview })} /> PDF
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* إحصائيات سريعة */}
                    {filteredSlips.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                            <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 border border-blue-200 dark:border-blue-900">
                                <div className="flex items-center gap-2 mb-2">
                                    <Icon name="Receipt" className="h-4 w-4 text-blue-600 dark:text-blue-400" />
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
                        </div>
                    )}

                    <div className="overflow-x-auto rounded-lg border">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="text-center border-l">رقم الكشف</TableHead>
                                    <TableHead className="text-center border-l">اسم التاجر</TableHead>
                                    <TableHead className="text-center border-l">تاريخ الدفعة</TableHead>
                                    <TableHead className="text-center border-l">عدد الطلبات</TableHead>
                                    <TableHead className="text-center border-l">المبلغ الإجمالي</TableHead>
                                    <TableHead className="text-center border-l">الحالة</TableHead>
                                    <TableHead className="text-center">إجراءات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredSlips.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <Icon name="Receipt" className="h-12 w-12 text-muted-foreground opacity-50" />
                                                <p className="text-muted-foreground font-medium">لم يتم العثور على أي كشوفات تطابق الفلاتر المحددة</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredSlips.map(payment => {
                                        const totalAmount = payment.orders.reduce((sum, o) => sum + (o.itemPrice || 0), 0);
                                        return (
                                            <TableRow key={payment.id} className="hover:bg-muted/30">
                                                <TableCell className="text-center border-l font-mono">
                                                    <Link
                                                        href={`/dashboard/financials/slips/${payment.id}`}
                                                        className="text-primary hover:underline font-semibold"
                                                    >
                                                        {payment.id}
                                                    </Link>
                                                </TableCell>
                                                <TableCell className="text-center border-l font-semibold">{payment.merchantName}</TableCell>
                                                <TableCell className="text-center border-l">
                                                    <div className="flex flex-col">
                                                        <span>{formatDate(payment.date)}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {new Date(payment.date).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center border-l">
                                                    <Badge variant="secondary">{payment.itemCount}</Badge>
                                                </TableCell>
                                                <TableCell className="text-center border-l font-bold">{formatCurrency(totalAmount)}</TableCell>
                                                <TableCell className="text-center border-l">
                                                    <Badge
                                                        className={payment.status === 'مدفوع' || payment.status === 'تم التسليم'
                                                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400'
                                                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400'
                                                        }
                                                    >
                                                        {payment.status === 'تم التسليم' ? 'مدفوع' : payment.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center justify-center gap-2">
                                                        {(payment.status === 'جاهز للتسليم') && (
                                                            <Button
                                                                variant="default"
                                                                size="sm"
                                                                onClick={() => handleConfirmPayment(payment)}
                                                                className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                                                            >
                                                                <Icon name="CheckCircle" className="h-4 w-4" />
                                                                <span className="hidden sm:inline">تسليم</span>
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handlePrint(payment)}
                                                            className="gap-2"
                                                        >
                                                            <Icon name="Printer" className="h-4 w-4" />
                                                            <span className="hidden sm:inline">طباعة</span>
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDownloadPdf(payment)}
                                                            disabled={isExporting === payment.id}
                                                            className="gap-2"
                                                        >
                                                            <Icon name={isExporting === payment.id ? "Loader2" : "FileDown"} className="h-4 w-4" />
                                                            <span className="hidden sm:inline">PDF</span>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            asChild
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <Link href={`/dashboard/financials/slips/${payment.id}`}>
                                                                <Icon name="Eye" className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
