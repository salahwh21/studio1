'use client';
import { useState, useMemo, useTransition } from 'react';
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
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { amiriFont } from '@/lib/amiri-font';


export const DriverSlips = () => {
    const { toast } = useToast();
    const { settings } = useSettings();
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
            toast({ title: "جاري تجهيز ملف PDF...", description: `سيتم طباعة كشف السائق ${slip.driverName}.` });
            try {
                const doc = new jsPDF();

                doc.addFileToVFS('Amiri-Regular.ttf', amiriFont);
                doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
                doc.setFont('Amiri');
                doc.setRtl(true);

                const reportsLogo = settings.login.reportsLogo || settings.login.headerLogo;
                if (reportsLogo) {
                    try {
                        doc.addImage(reportsLogo, 'PNG', 15, 15, 40, 20);
                    } catch(e) {
                        console.error("Error adding logo image to PDF:", e);
                    }
                }
                
                doc.setFontSize(20);
                doc.text('كشف استلام مرتجعات من السائق', doc.internal.pageSize.getWidth() / 2, 25, { align: 'center' });

                doc.setFontSize(12);
                doc.text(`الكشف: ${slip.id}`, 200, 45, { align: 'right' });
                doc.text(`التاريخ: ${new Date(slip.date).toLocaleDateString('ar-EG')}`, 200, 52, { align: 'right' });
                doc.text(`اسم السائق: ${slip.driverName}`, 200, 59, { align: 'right' });
                
                const tableColumn = ["المبلغ", "سبب الإرجاع", "الهاتف", "المستلم", "رقم الطلب", "#"];
                const tableRows: (string | number)[][] = slip.orders.map((order, index) => [
                    (order.itemPrice || 0).toFixed(2),
                    order.previousStatus || order.status || 'غير محدد',
                    order.phone,
                    order.recipient,
                    order.id,
                    index + 1,
                ]);

                (doc as any).autoTable({
                    head: [tableColumn],
                    body: tableRows,
                    startY: 70,
                    theme: 'grid',
                    headStyles: {
                        font: 'Amiri',
                        halign: 'center',
                        fillColor: [230, 230, 230],
                        textColor: 20
                    },
                    styles: {
                        font: 'Amiri',
                        halign: 'right'
                    },
                    columnStyles: {
                        0: { halign: 'center' },
                        5: { halign: 'center' }
                    }
                });

                let finalY = (doc as any).lastAutoTable.finalY;

                doc.setFontSize(14);
                const total = slip.orders.reduce((sum, o) => sum + (o.itemPrice || 0), 0);
                doc.text(`الإجمالي: ${total.toFixed(2)}`, 200, finalY + 15, { align: 'right' });
                doc.text(`توقيع المستلم: .........................`, 200, finalY + 30, { align: 'right' });
                doc.text(`توقيع السائق/المندوب: .........................`, 60, finalY + 30, { align: 'right' });

                doc.save(`${slip.id}.pdf`);

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
