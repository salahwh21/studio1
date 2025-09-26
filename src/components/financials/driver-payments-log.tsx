
'use client';

import { useState, useMemo, useTransition } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
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
import { useUsersStore } from '@/store/user-store';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/date-range-picker';
import type { DateRange } from 'react-day-picker';


declare module 'jspdf' {
    interface jsPDF {
        autoTable: (options: any) => jsPDF;
    }
}

export const DriverPaymentsLog = () => {
    const { toast } = useToast();
    const { settings, formatCurrency } = useSettings();
    const { driverSlips } = useReturnsStore();
    const { users } = useUsersStore();
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
    
    const handlePrintAction = (slip: DriverSlip) => {
        startTransition(async () => {
            toast({ title: "جاري تحضير ملف PDF...", description: `سيتم طباعة كشف السائق ${slip.driverName}.` });
            try {
                const doc = new jsPDF();
                
                const reportsLogo = settings.login.reportsLogo || settings.login.headerLogo;

                doc.setRTL(true);

                if (reportsLogo) {
                    try {
                        doc.addImage(reportsLogo, 'PNG', 15, 10, 30, 10);
                    } catch (e) {
                        console.error("Error adding logo to PDF:", e);
                    }
                }

                doc.setFontSize(18);
                doc.text(`كشف استلام مرتجعات من السائق: ${slip.driverName}`, doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
                
                doc.setFontSize(10);
                doc.text(`تاريخ: ${new Date(slip.date).toLocaleDateString('ar-EG')}`, doc.internal.pageSize.getWidth() - 15, 30, { align: 'right' });
                doc.text(`رقم الكشف: ${slip.id}`, 15, 30, { align: 'left' });

                const tableColumn = ["#", "رقم الطلب", "المستلم", "الهاتف", "سبب الإرجاع", "المبلغ"];
                const tableRows = slip.orders.map((order, index) => [
                    index + 1,
                    order.id,
                    order.recipient,
                    order.phone,
                    order.previousStatus || order.status,
                    formatCurrency(order.cod),
                ]);

                (doc as any).autoTable({
                    head: [tableColumn],
                    body: tableRows,
                    startY: 45,
                    theme: 'grid',
                    styles: { font: 'Amiri', halign: 'center' },
                    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
                    columnStyles: {
                         1: { halign: 'right' },
                         2: { halign: 'right' },
                         3: { halign: 'center' },
                         4: { halign: 'right' },
                         5: { halign: 'right' },
                    },
                    didDrawPage: (data: any) => {
                        // Footer
                        doc.setFontSize(10);
                        doc.text('توقيع السائق/المندوب: .........................', doc.internal.pageSize.getWidth() - data.settings.margin.right, doc.internal.pageSize.height - 15, { align: 'right' });
                        doc.text('توقيع المستلم: .........................', data.settings.margin.left, doc.internal.pageSize.height - 15, { align: 'left' });
                    }
                });
                
                doc.save(`${slip.id}.pdf`);
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
                                        <Button variant="outline" size="sm" onClick={() => handleShowDetails(slip)}>عرض</Button>
                                        <Button size="sm" onClick={() => handlePrintAction(slip)} disabled={isPending}>
                                            {isPending ? <Icon name="Loader2" className="animate-spin ml-2" /> : <Icon name="Printer" className="ml-2" />}
                                            طباعة
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
                <DialogContent>
                    <DialogHeader><DialogTitle>تفاصيل كشف {currentSlip?.id}</DialogTitle></DialogHeader>
                    <div className="max-h-[60vh] overflow-y-auto">
                        <Table>
                             <TableHeader><TableRow><TableHead>رقم الطلب</TableHead><TableHead>سبب الإرجاع</TableHead></TableRow></TableHeader>
                            <TableBody>{currentSlip?.orders.map(o => (<TableRow key={o.id}><TableCell>{o.id}</TableCell><TableCell><Badge variant="secondary">{o.previousStatus || o.status}</Badge></TableCell></TableRow>))}</TableBody>
                        </Table>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
