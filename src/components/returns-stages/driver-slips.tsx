'use client';
import { useState, useMemo, useTransition } from 'react';
import { useReturnsStore, type DriverReturnSlip } from '@/store/returns-store';
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
import { updateOrderAction } from '@/app/actions/update-order';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/date-range-picker';
import type { DateRange } from 'react-day-picker';
import { generatePdf, downloadPdf } from '@/services/pdf-service';


export const DriverSlips = () => {
    const { toast } = useToast();
    const { settings, formatCurrency, formatDate } = useSettings();
    const { driverReturnSlips, removeOrderFromDriverReturnSlip } = useReturnsStore();
    const [isPending, startTransition] = useTransition();

    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const [currentSlip, setCurrentSlip] = useState<DriverReturnSlip | null>(null);

    const [filterDriver, setFilterDriver] = useState<string>('all');
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

    const drivers = useMemo(() => Array.from(new Set(driverReturnSlips.map(s => s.driverName))), [driverReturnSlips]);


    const filteredSlips = useMemo(() => driverReturnSlips.filter(slip => {
        let matchesDriver = filterDriver === 'all' ? true : slip.driverName === filterDriver;
        let matchesDate = true;
        if (dateRange?.from && dateRange?.to) {
            try {
                const slipDate = parseISO(slip.date);
                matchesDate = isWithinInterval(slipDate, { start: dateRange.from, end: dateRange.to });
            } catch (e) { matchesDate = false; }
        }
        return matchesDriver && matchesDate;
    }), [driverReturnSlips, filterDriver, dateRange]);

    const handleShowDetails = (slip: DriverReturnSlip) => {
        setCurrentSlip(slip);
        setShowDetailsDialog(true);
    };

    const handleRemoveOrderFromSlip = (orderId: string) => {
        if (!currentSlip) return;
        startTransition(async () => {
            removeOrderFromDriverReturnSlip(currentSlip.id, orderId);
            await updateOrderAction({ orderId, field: 'status', value: 'مرتجع' });
            setCurrentSlip(prev => prev ? { ...prev, orders: prev.orders.filter(o => o.id !== orderId), itemCount: prev.itemCount - 1 } : null);
            toast({ title: 'تمت الإزالة', description: `تمت إزالة الطلب ${orderId} من الكشف وإعادته للسائق.` });
        });
    }

    const handlePrintAction = async (slip: DriverReturnSlip) => {
        const tableHeader = `
            <tr>
                <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">#</th>
                <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">رقم الطلب</th>
                <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">المستلم</th>
                <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">سبب الإرجاع</th>
                <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">المبلغ</th>
            </tr>
        `;

        const tableRows = slip.orders.map((o, i) => `
            <tr>
                <td style="padding: 8px; border: 1px solid #ddd;">${i + 1}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${o.id}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${o.recipient}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${o.previousStatus || o.status}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${formatCurrency(o.cod)}</td>
            </tr>
        `).join('');

        const slipDate = formatDate(slip.date);
        const logoUrl = settings.login.reportsLogo || settings.login.headerLogo;

        const html = `
            <!DOCTYPE html>
            <html dir="rtl" lang="ar">
                <head>
                    <meta charset="UTF-8">
                    <title>كشف استلام: ${slip.id}</title>
                    <style>
                        body { direction: rtl; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; }
                        table { width: 100%; border-collapse: collapse; }
                        th, td { padding: 8px; border: 1px solid #ddd; text-align: right; }
                        th { background-color: #f2f2f2; }
                        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                        .signatures { margin-top: 40px; display: flex; justify-content: space-between; }
                        .signature { border-top: 1px solid #000; padding-top: 5px; width: 200px; text-align: center; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        ${logoUrl ? `<img src="${logoUrl}" alt="Logo" style="height: 50px;">` : `<h1>${settings.login.companyName || 'الشركة'}</h1>`}
                        <div>
                            <h2>كشف استلام من السائق: ${slip.driverName}</h2>
                            <p>رقم الكشف: ${slip.id}</p>
                            <p>التاريخ: ${slipDate}</p>
                        </div>
                    </div>
                    <table>
                        <thead>${tableHeader}</thead>
                        <tbody>${tableRows}</tbody>
                    </table>
                    <div class="signatures">
                        <div class="signature">توقيع المستلم</div>
                        <div class="signature">توقيع المندوب</div>
                    </div>
                </body>
            </html>
        `;

        try {
            const blob = await generatePdf(html, { filename: `driver-slip-${slip.id}.pdf` });
            downloadPdf(blob, `driver-slip-${slip.id}.pdf`);
            toast({ title: "تم التصدير", description: `تم تصدير كشف ${slip.id} بنجاح` });
        } catch (error) {
            console.error('PDF generation error:', error);
            toast({ variant: "destructive", title: "فشل التصدير", description: "حدث خطأ أثناء إنشاء ملف PDF" });
        }
    };

    return (
        <div className="space-y-6">
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
                            <Button variant="outline" size="sm"><Icon name="FileSpreadsheet" className="ml-2 h-4 w-4" />تصدير Excel</Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead className="border-l">رقم الكشف</TableHead><TableHead className="border-l">اسم السائق</TableHead><TableHead className="border-l">تاريخ الإنشاء</TableHead><TableHead className="border-l">عدد الشحنات</TableHead><TableHead className="border-l">الحالة</TableHead><TableHead>إجراءات</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {filteredSlips.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24">
                                        لم يتم العثور على أي كشوفات تطابق الفلاتر المحددة.
                                    </TableCell>
                                </TableRow>
                            ) : filteredSlips.map(slip => (
                                <TableRow key={slip.id}>
                                    <TableCell className="font-mono border-l">
                                        <Link href={`/dashboard/returns/slips/${slip.id}`} className="text-primary hover:underline">
                                            {slip.id}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="border-l">{slip.driverName}</TableCell>
                                    <TableCell className="border-l">{formatDate(slip.date)}</TableCell>
                                    <TableCell className="border-l">{slip.itemCount}</TableCell>
                                    <TableCell className="border-l">
                                        <Badge className="bg-blue-100 text-blue-800">مستلم بالفرع</Badge>
                                    </TableCell>
                                    <TableCell className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => handlePrintAction(slip)}>
                                            <Icon name="Printer" className="ml-2 h-4 w-4" /> عرض للطباعة
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader><DialogTitle>تفاصيل كشف {currentSlip?.id}</DialogTitle></DialogHeader>
                    <div className="max-h-[60vh] overflow-y-auto">
                        <Table>
                            <TableHeader><TableRow>
                                <TableHead className="w-16">#</TableHead>
                                <TableHead>رقم الطلب</TableHead>
                                <TableHead>المستلم</TableHead>
                                <TableHead>سبب الإرجاع</TableHead>
                                <TableHead className="text-center">إجراء</TableHead>
                            </TableRow></TableHeader>
                            <TableBody>{currentSlip?.orders.map((o, index) => (
                                <TableRow key={o.id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{o.id}</TableCell>
                                    <TableCell>{o.recipient}</TableCell>
                                    <TableCell><Badge variant="secondary">{o.previousStatus || o.status}</Badge></TableCell>
                                    <TableCell className="text-center">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleRemoveOrderFromSlip(o.id)}
                                            disabled={isPending}
                                        >
                                            <Icon name="Trash2" className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}</TableBody>
                        </Table>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
