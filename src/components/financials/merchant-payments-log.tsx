
'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
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
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


export const MerchantPaymentsLog = () => {
    const { merchantPaymentSlips } = useFinancialsStore();
    const { settings, formatCurrency } = useSettings();
    const { toast } = useToast();
    const [isExporting, setIsExporting] = useState<string | null>(null);
    const slipPrintRef = useRef<HTMLDivElement>(null);
    const [slipToPrint, setSlipToPrint] = useState<MerchantPaymentSlip | null>(null);


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
        
        flushSync(() => {
            setSlipToPrint(slip);
        });

        const slipContainer = slipPrintRef.current?.querySelector('.slip-container');

        if (!slipContainer) {
            toast({ variant: 'destructive', title: 'فشل التنزيل', description: 'لم يتم العثور على محتوى للتصدير.' });
            setIsExporting(null);
            return;
        }

        try {
            const canvas = await html2canvas(slipContainer as HTMLElement, { scale: 3, useCORS: true });
            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
            
            const today = new Date().toISOString().split('T')[0];
            pdf.save(`${slip.merchantName}_${today}.pdf`);
            
        } catch (error) {
            toast({ variant: 'destructive', title: 'خطأ', description: 'حدث خطأ أثناء إنشاء ملف PDF.' });
        } finally {
            setIsExporting(null);
            setSlipToPrint(null);
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

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <CardTitle>سجل دفعات التجار</CardTitle>
                        <CardDescription>
                            عرض وطباعة وتأكيد كشوفات الدفع التي تم إنشاؤها للتجار.
                        </CardDescription>
                    </div>
                     <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm"><Icon name="FileSpreadsheet" className="ml-2 h-4 w-4"/>تصدير Excel</Button>
                    </div>
                </div>
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
                        {merchantPaymentSlips.length === 0 ? (
                             <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">لم يتم إنشاء أي كشوفات دفع للتجار بعد.</TableCell>
                            </TableRow>
                        ) : (
                            merchantPaymentSlips.map(payment => (
                                <TableRow key={payment.id}>
                                    <TableCell className="text-center border-l font-mono">
                                        <Link href={`/dashboard/financials/slips/${payment.id}`} className="text-primary hover:underline">
                                            {payment.id}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="text-center border-l">{payment.merchantName}</TableCell>
                                    <TableCell className="text-center border-l">{new Date(payment.date).toLocaleDateString('ar-EG')}</TableCell>
                                    <TableCell className="text-center border-l font-bold">{formatCurrency(payment.orders.reduce((sum, o) => sum + (o.itemPrice || 0), 0))}</TableCell>
                                    <TableCell className="text-center border-l">
                                        <Badge className={payment.status === 'مدفوع' ? 'bg-green-100 text-green-800' : ''}>{payment.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-center flex gap-2 justify-center">
                                         <Button variant="outline" size="sm" onClick={() => handlePrint(payment)}>
                                            <Icon name="Printer" className="ml-2 h-4 w-4" />
                                            طباعة
                                        </Button>
                                         <Button variant="outline" size="sm" onClick={() => handleDownloadPdf(payment)} disabled={isExporting === payment.id}>
                                            <Icon name={isExporting === payment.id ? "Loader2" : "FileDown"} className="ml-2 h-4 w-4" />
                                            تنزيل PDF
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
            {/* Hidden div for printing/exporting, positioned off-screen */}
             <div style={{ position: 'absolute', right: '-9999px', top: '-9999px' }}>
                <div ref={slipPrintRef}>
                    {slipToPrint && <SlipHTML slip={slipToPrint} />}
                </div>
            </div>
        </Card>
    );
}
