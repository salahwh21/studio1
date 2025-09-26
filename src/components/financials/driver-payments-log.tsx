
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

    return (
        <div className="space-y-6">
            <Card>
                 <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle>سجل كشوفات التحصيل المالي</CardTitle>
                            <CardDescription>
                                عرض وطباعة كشوفات المبالغ المالية التي تم استلامها من السائقين.
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                             <DateRangePicker onUpdate={(range) => setDateRange(range.range)} />
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
                            <Button variant="outline" size="sm"><Icon name="FileSpreadsheet" className="ml-2 h-4 w-4"/>تصدير Excel</Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader><TableRow><TableHead className="border-l">رقم الكشف</TableHead><TableHead className="border-l">اسم السائق</TableHead><TableHead className="border-l">تاريخ الإنشاء</TableHead><TableHead className="border-l">عدد الشحنات</TableHead><TableHead className="border-l">المبلغ المحصل</TableHead><TableHead>إجراءات</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {filteredSlips.length === 0 ? (
                                 <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24">
                                        لم يتم العثور على أي كشوفات تطابق الفلاتر المحددة.
                                    </TableCell>
                                </TableRow>
                            ) : filteredSlips.map(slip => {
                                const totalCOD = slip.orders.reduce((sum, o) => sum + (o.cod || 0), 0);
                                return (
                                <TableRow key={slip.id}>
                                    <TableCell className="font-mono border-l">
                                         <Link href={`/dashboard/financials/slips/${slip.id}`} className="text-primary hover:underline">
                                            {slip.id}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="border-l">{slip.driverName}</TableCell>
                                    <TableCell className="border-l">{new Date(slip.date).toLocaleDateString('ar-EG')}</TableCell>
                                    <TableCell className="border-l">{slip.itemCount}</TableCell>
                                    <TableCell className="border-l font-bold">{formatCurrency(totalCOD)}</TableCell>
                                     <TableCell className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => handlePrintAction(slip)}>
                                            <Icon name="Printer" className="ml-2 h-4 w-4" /> طباعة
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )})
                            }
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};
