
'use client';

import { useState, useMemo, useTransition, useRef } from 'react';
import { useReturnsStore, type DriverSlip } from '@/store/returns-store';
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
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { amiriFont } from '@/lib/amiri-font';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

pdfMake.vfs['Amiri-Regular.ttf'] = amiriFont;

pdfMake.fonts = {
  Amiri: {
    normal: 'Amiri-Regular.ttf',
    bold: 'Amiri-Regular.ttf',
    italics: 'Amiri-Regular.ttf',
    bolditalics: 'Amiri-Regular.ttf'
  }
};


export const DriverPaymentsLog = () => {
    const { toast } = useToast();
    const { settings, formatCurrency } = useSettings();
    const { driverSlips, removeOrderFromDriverSlip } = useReturnsStore();
    const [isPending, startTransition] = useTransition();
    
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const [currentSlip, setCurrentSlip] = useState<DriverSlip | null>(null);

    const [filterDriver, setFilterDriver] = useState<string>('all');
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

    const drivers = useMemo(() => Array.from(new Set(driverSlips.map(s => s.driverName))), [driverSlips]);


    const filteredSlips = useMemo(() => driverSlips.filter(slip => {
        let matchesDriver = filterDriver === 'all' ? true : slip.driverName === filterDriver;
        let matchesDate = true;
        if (dateRange?.from && dateRange?.to) {
            try {
                const slipDate = parseISO(slip.date);
                matchesDate = isWithinInterval(slipDate, { start: dateRange.from, end: dateRange.to });
            } catch(e) { matchesDate = false; }
        }
        return matchesDriver && matchesDate;
    }), [driverSlips, filterDriver, dateRange]);
    
    const handleShowDetails = (slip: DriverSlip) => {
        setCurrentSlip(slip);
        setShowDetailsDialog(true);
    };

    const handleRemoveOrderFromSlip = (orderId: string) => {
        if (!currentSlip) return;
        startTransition(async () => {
            removeOrderFromDriverSlip(currentSlip.id, orderId);
            await updateOrderAction({ orderId, field: 'status', value: 'راجع' });
            setCurrentSlip(prev => prev ? {...prev, orders: prev.orders.filter(o => o.id !== orderId), itemCount: prev.itemCount -1} : null);
            toast({ title: 'تمت الإزالة', description: `تمت إزالة الطلب ${orderId} من الكشف وإعادته للسائق.` });
        });
    }

    const handlePrintAction = (slip: DriverSlip) => {
        startTransition(() => {
            toast({ title: "جاري تحضير ملف PDF...", description: `سيتم طباعة كشف السائق ${slip.driverName}.` });
            try {
                const reportsLogo = settings.login.reportsLogo || settings.login.headerLogo;

                const tableBody = [
                    ['المبلغ', 'سبب الإرجاع', 'الهاتف', 'المستلم', 'رقم الطلب', '#'].map(h => ({text: h, style: 'tableHeader'})),
                    ...slip.orders.map((order, index) => [
                        formatCurrency(order.cod),
                        order.previousStatus || order.status,
                        order.phone,
                        order.recipient,
                        order.id,
                        index + 1
                    ].reverse())
                ];

                const docDefinition: any = {
                    content: [
                        {
                            columns: [
                                { text: `رقم الكشف: ${slip.id}`, style: 'headerInfo' },
                                { text: `تاريخ: ${new Date(slip.date).toLocaleDateString('ar-EG')}`, style: 'headerInfo', alignment: 'right' }
                            ]
                        },
                        { text: `كشف استلام مرتجعات من السائق: ${slip.driverName}`, style: 'header', alignment: 'center' },
                        {
                            table: {
                                headerRows: 1,
                                widths: ['auto', 'auto', 'auto', '*', 'auto', 'auto'],
                                body: tableBody
                            },
                            layout: 'lightHorizontalLines'
                        }
                    ],
                    styles: {
                        header: { fontSize: 18, bold: true, margin: [0, 20, 0, 10] },
                        headerInfo: { fontSize: 10, color: 'gray', margin: [0, 0, 0, 20] },
                        tableHeader: { bold: true, fontSize: 11, color: 'black' }
                    },
                    defaultStyle: { font: 'Amiri', alignment: 'right' }
                };

                pdfMake.createPdf(docDefinition).download(`${slip.id}.pdf`);
                toast({ title: 'تم تجهيز الملف', description: 'بدأ تحميل ملف الـ PDF.' });
            } catch (e: any) {
                console.error("PDF generation error:", e);
                toast({ variant: 'destructive', title: 'فشل إنشاء PDF', description: e.message || 'حدث خطأ أثناء تجهيز الملف.' });
            }
        });
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
                            <Button variant="outline" size="sm"><Icon name="FileSpreadsheet" className="ml-2 h-4 w-4"/>تصدير Excel</Button>
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
                                    <TableCell className="border-l">{new Date(slip.date).toLocaleDateString('ar-EG')}</TableCell>
                                    <TableCell className="border-l">{slip.itemCount}</TableCell>
                                    <TableCell className="border-l">
                                        <Badge className="bg-blue-100 text-blue-800">مستلم بالفرع</Badge>
                                    </TableCell>
                                     <TableCell className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => handleShowDetails(slip)}><Icon name="Eye" className="ml-2 h-4 w-4"/>عرض وتعديل</Button>
                                        <Button size="sm" onClick={() => handlePrintAction(slip)} disabled={isPending}>
                                            {isPending ? <Icon name="Loader2" className="animate-spin ml-2" /> : <Icon name="Printer" className="ml-2" />}
                                            PDF رسمي
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
