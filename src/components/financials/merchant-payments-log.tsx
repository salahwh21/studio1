
'use client';

import { useState, useMemo, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/icon';
import { useFinancialsStore, type MerchantPaymentSlip } from '@/store/financials-store';
import { useSettings } from '@/contexts/SettingsContext';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { flushSync } from 'react-dom';
import { exportToPDF, type PDFExportOptions } from '@/lib/pdf-export-utils';
import * as XLSX from 'xlsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';


export const MerchantPaymentsLog = () => {
    const { merchantPaymentSlips } = useFinancialsStore();
    const { settings, formatCurrency } = useSettings();
    const { toast } = useToast();
    const [isExporting, setIsExporting] = useState<string | null>(null);
    const slipPrintRef = useRef<HTMLDivElement>(null);
    const [slipToPrint, setSlipToPrint] = useState<MerchantPaymentSlip | null>(null);
    const [filterMerchant, setFilterMerchant] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');


    const handlePrint = (slip: MerchantPaymentSlip) => {
        if (!slip) return;
        flushSync(() => {
            setSlipToPrint(slip);
        });

        if (!slipPrintRef.current) {
            toast({ variant: 'destructive', title: 'فشل الطباعة', description: 'لم يتم العثور على محتوى للطباعة.' });
            return;
        }

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            toast({ variant: 'destructive', title: 'فشل الطباعة', description: 'يرجى السماح بفتح النوافذ المنبثقة.' });
            return;
        }
        printWindow.document.write('<html><head><title>كشف دفع</title></head><body>' + slipPrintRef.current.innerHTML + '</body></html>');
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        setSlipToPrint(null);
    };

     const handleDownloadPdf = async (slip: MerchantPaymentSlip) => {
        if (!slip) return;
        setIsExporting(slip.id);

        try {
            const totalCod = slip.orders.reduce((sum, o) => sum + (o.cod || 0), 0);
            const totalDelivery = slip.orders.reduce((sum, o) => sum + (o.deliveryFee || 0), 0);
            const totalNet = slip.orders.reduce((sum, o) => sum + (o.itemPrice || 0), 0);
            const slipDate = new Date(slip.date).toLocaleDateString('ar-EG', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            const logoUrl = settings.login.reportsLogo || settings.login.headerLogo;

            const headers = ['#', 'رقم الطلب', 'المستلم', 'قيمة التحصيل', 'أجور التوصيل', 'الصافي المستحق'];
            
            const rows = slip.orders.map((o, i) => [
                (i + 1).toString(),
                o.id,
                o.recipient,
                formatCurrency(o.cod || 0),
                formatCurrency(o.deliveryFee || 0),
                formatCurrency(o.itemPrice || 0),
            ]);

            const footerRow = ['الإجمالي', '', '', formatCurrency(totalCod), formatCurrency(totalDelivery), formatCurrency(totalNet)];

            const pdfOptions: PDFExportOptions = {
                title: `كشف دفع للتاجر: ${slip.merchantName}`,
                subtitle: `رقم الكشف: ${slip.id}`,
                logoUrl,
                companyName: settings.login.companyName || 'الشركة',
                date: slipDate,
                tableHeaders: headers,
                tableRows: rows,
                footerRow,
                showSignatures: true,
                signatureLabels: ['توقيع المستلم (التاجر)', 'توقيع الموظف المالي'],
                orientation: 'portrait' // Use portrait for single slip
            };

            const today = new Date().toISOString().split('T')[0];
            const fileName = `${slip.merchantName}_${today}.pdf`;
            await exportToPDF(pdfOptions, fileName);
            
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
        const slipDate = new Date(slip.date).toLocaleDateString('ar-EG');
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
                        <div style={{textAlign: 'right'}}>
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
                                    <td style={{fontWeight: 'bold'}}>{formatCurrency(o.itemPrice)}</td>
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

    const handleExportExcel = () => {
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
                    'تاريخ الإنشاء': new Date(slip.date).toLocaleDateString('ar-EG'),
                    'عدد الطلبات': slip.itemCount,
                    'المبلغ الإجمالي': totalAmount,
                    'الحالة': slip.status,
                };
            });

            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'دفعات التجار');

            const fileName = `دفعات_التجار_${new Date().toISOString().split('T')[0]}.xlsx`;
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

    const handleExportPDF = () => {
        if (filteredSlips.length === 0) {
            toast({ variant: 'destructive', title: 'خطأ', description: 'لا توجد كشوفات للتصدير.' });
            return;
        }

        try {
            const doc = new jsPDF('l', 'mm', 'a4');
            
            doc.setFontSize(18);
            doc.text('سجل دفعات التجار', 14, 15);
            
            doc.setFontSize(12);
            doc.text(`التاريخ: ${new Date().toLocaleDateString('ar-EG')}`, 14, 22);
            doc.text(`عدد الكشوفات: ${filteredSlips.length}`, 14, 28);

            const tableData = filteredSlips.map(slip => {
                const totalAmount = slip.orders.reduce((sum, o) => sum + (o.itemPrice || 0), 0);
                return [
                    slip.id,
                    slip.merchantName,
                    new Date(slip.date).toLocaleDateString('ar-EG'),
                    slip.itemCount.toString(),
                    formatCurrency(totalAmount),
                    slip.status,
                ];
            });

            (doc as any).autoTable({
                head: [['رقم الكشف', 'اسم التاجر', 'تاريخ الإنشاء', 'عدد الطلبات', 'المبلغ الإجمالي', 'الحالة']],
                body: tableData,
                startY: 35,
                styles: { font: 'Arial', fontSize: 9, halign: 'right' },
                headStyles: { fillColor: [66, 139, 202], textColor: 255, fontStyle: 'bold' },
                alternateRowStyles: { fillColor: [245, 245, 245] },
                margin: { top: 35 },
            });

            const fileName = `دفعات_التجار_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);

            toast({
                title: 'تم التصدير بنجاح',
                description: `تم تصدير ${filteredSlips.length} كشف إلى ملف PDF.`
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
                                                        <span>{new Date(payment.date).toLocaleDateString('ar-EG')}</span>
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
                                                        className={payment.status === 'مدفوع' 
                                                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' 
                                                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400'
                                                        }
                                                    >
                                                        {payment.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center justify-center gap-2">
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
            {/* Hidden div for printing/exporting, positioned off-screen */}
            <div style={{ position: 'absolute', right: '-9999px', top: '-9999px' }}>
                <div ref={slipPrintRef}>
                    {slipToPrint && <SlipHTML slip={slipToPrint} />}
                </div>
            </div>
        </div>
    );
}
