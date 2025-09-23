'use client';
import { useState, useMemo, useTransition } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useReturnsStore, type DriverSlip } from '@/store/returns-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/icon';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { parseISO, isWithinInterval } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/contexts/SettingsContext';
import Link from 'next/link';
import { amiriFont } from '@/lib/amiri-font';
import { cn } from '@/lib/utils';

declare module 'jspdf' {
    interface jsPDF {
        autoTable: (options: any) => jsPDF;
    }
}

export const DriverSlips = () => {
    const { toast } = useToast();
    const { settings, formatCurrency } = useSettings();
    const { driverSlips } = useReturnsStore();
    const [isPending, startTransition] = useTransition();

    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const [currentSlip, setCurrentSlip] = useState<DriverSlip | null>(null);
    
    const [filterDriver, setFilterDriver] = useState<string | null>(null);
    const [filterStartDate, setFilterStartDate] = useState<Date | null>(null);
    const [filterEndDate, setFilterEndDate] = useState<Date | null>(null);

    const filteredSlips = useMemo(() => driverSlips.filter(slip => {
        let matchesDriver = filterDriver ? slip.driverName === filterDriver : true;
        let matchesDate = true;
        if (filterStartDate && filterEndDate) {
            try {
                const slipDate = parseISO(slip.date);
                matchesDate = isWithinInterval(slipDate, { start: filterStartDate, end: filterEndDate });
            } catch(e) { matchesDate = false; }
        }
        return matchesDriver && matchesDate;
    }), [driverSlips, filterDriver, filterStartDate, filterEndDate]);
    
    const handleShowDetails = (slip: DriverSlip) => {
        setCurrentSlip(slip);
        setShowDetailsDialog(true);
    };
    
    const handlePrintAction = (slip: DriverSlip) => {
        startTransition(async () => {
            toast({ title: "جاري تحضير ملف PDF...", description: `سيتم طباعة كشف السائق ${slip.driverName}.` });
            try {
                const doc = new jsPDF();
                
                doc.addFileToVFS('Amiri-Regular.ttf', amiriFont);
                doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
                doc.setFont('Amiri');

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
                    <CardTitle>كشوفات استلام المرتجعات من السائقين</CardTitle>
                    <CardDescription>عرض وطباعة كشوفات استلام المرتجعات السابقة.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader><TableRow><TableHead>رقم الكشف</TableHead><TableHead>اسم السائق</TableHead><TableHead>تاريخ الإنشاء</TableHead><TableHead>عدد الشحنات</TableHead><TableHead>إجراءات</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {filteredSlips.map(slip => (
                                <TableRow key={slip.id}>
                                    <TableCell><Link href={`/dashboard/returns/slips/${slip.id}`} className="text-primary hover:underline">{slip.id}</Link></TableCell>
                                    <TableCell>{slip.driverName}</TableCell>
                                    <TableCell>{new Date(slip.date).toLocaleDateString('ar-EG')}</TableCell>
                                    <TableCell>{slip.itemCount}</TableCell>
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
