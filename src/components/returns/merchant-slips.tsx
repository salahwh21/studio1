'use client';
import { useState, useMemo } from 'react';
import { useOrdersStore, type Order } from '@/store/orders-store';
import { useReturnsStore, type MerchantSlip } from '@/store/returns-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/icon';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { parseISO, isWithinInterval } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useSettings } from '@/contexts/SettingsContext';
import { useUsersStore } from '@/store/user-store';

export const MerchantSlips = () => {
    const { toast } = useToast();
    const { users } = useUsersStore();
    const { settings } = useSettings();
    const { merchantSlips, updateMerchantSlipStatus } = useReturnsStore();

    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const [currentSlip, setCurrentSlip] = useState<MerchantSlip | null>(null);

    const [filterMerchant, setFilterMerchant] = useState<string | null>(null);
    const [filterStartDate, setFilterStartDate] = useState<string | null>(null);
    const [filterEndDate, setFilterEndDate] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<string | null>(null);
    
    const filteredSlips = useMemo(() => merchantSlips.filter(slip => {
        let matchesMerchant = filterMerchant ? slip.merchant === filterMerchant : true;
        let matchesDate = true;
        if (filterStartDate && filterEndDate) {
            try {
                const slipDate = parseISO(slip.date);
                matchesDate = isWithinInterval(slipDate, { start: parseISO(filterStartDate), end: parseISO(filterEndDate) });
            } catch(e) { matchesDate = false; }
        }
        let matchesStatus = filterStatus ? slip.status === filterStatus : true;
        return matchesMerchant && matchesDate && matchesStatus;
    }), [merchantSlips, filterMerchant, filterStartDate, filterEndDate, filterStatus]);
    
     const confirmSlipDelivery = (slipId: string) => {
        updateMerchantSlipStatus(slipId, 'تم التسليم');
        toast({
            title: "تم تأكيد التسليم",
            description: `تم تحديث حالة الكشف ${slipId}. (محاكاة: جاري تحديث الرصيد المالي للتاجر).`
        });
    }

    const handleShowDetails = (slip: MerchantSlip) => {
        setCurrentSlip(slip);
        setShowDetailsDialog(true);
    };

    const printSlip = async (slip: MerchantSlip) => {
        const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
        const merchantUser = users.find(u => u.storeName === slip.merchant);

        try {
            doc.addFont('https://raw.githack.com/MrRio/jsPDF/master/test/reference/Amiri-Regular.ttf', 'Amiri', 'normal');
            doc.setFont('Amiri');
        } catch (e) {
            console.warn("Could not load Amiri font for PDF. RTL text might not render correctly.");
        }

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 10;
        
        // --- Header ---
        doc.setFontSize(16);
        doc.text('كشف المرتجع', pageWidth / 2, margin + 5, { align: 'center' });

        const logo = settings.login.reportsLogo || settings.login.headerLogo;
        if (logo) {
            try {
               doc.addImage(logo, 'PNG', margin, margin, 30, 15);
            } catch(e) { console.error("Error adding logo to PDF:", e); }
        }
        
        // Barcode for slip ID
        try {
            // Placeholder for barcode generation library if available, e.g., JsBarcode
            // For now, we'll just write the text
            doc.setFontSize(12);
            doc.text(slip.id, pageWidth / 2, margin + 15, { align: 'center' });
        } catch (e) { console.error("Error adding barcode:", e)}


        doc.setFontSize(10);
        doc.text(`اسم التاجر: ${slip.merchant}`, pageWidth - margin, margin + 7, { align: 'right' });
        doc.text(`رقم المحمول للتاجر: ${merchantUser?.email || 'غير متوفر'}`, pageWidth - margin, margin + 12, { align: 'right' });
        doc.text(`التاريخ: ${new Date(slip.date).toLocaleString('ar-JO')}`, pageWidth - margin, margin + 17, { align: 'right' });
        doc.text(`العنوان: ${'عمان - صويلح'}`, pageWidth - margin, margin + 22, { align: 'right' });


        // --- Table ---
        const head = [['#', 'رقم الطلب', 'اسم المستلم', 'عنوان المستلم', 'سبب الارجاع', 'مطلوب للتاجر']];
        const body = slip.orders.map((order, index) => [
            index + 1,
            order.referenceNumber || order.id,
            `${order.recipient}\n${order.phone || ''}`,
            order.address,
            order.previousStatus || order.status,
            '0.0', // 'مطلوب للتاجر' seems to be always 0.0 in the example
        ]);
        
        const totalAmount = '0.00'; // As per the image example

        autoTable(doc, {
          startY: margin + 35,
          head: head,
          body: body,
          styles: { font: 'Amiri', halign: 'right', cellPadding: 2 },
          headStyles: { fillColor: [44, 62, 80], halign: 'center' },
          columnStyles: {
              0: { halign: 'center', cellWidth: 10 },
              1: { halign: 'center', cellWidth: 30 },
              2: { halign: 'right', cellWidth: 35 },
              3: { halign: 'right', cellWidth: 'auto' },
              4: { halign: 'center', cellWidth: 25 },
              5: { halign: 'center', cellWidth: 20 },
          },
          didDrawPage: (data) => {
            // --- Footer ---
            doc.setFontSize(10);
            const footerY = pageHeight - margin - 5;
            doc.text(`توقيع المستلم: ............................`, pageWidth - margin, footerY, { align: 'right' });
            doc.text(`Page ${data.pageNumber}`, margin, footerY, { align: 'left' });
          },
          didParseCell: function (data) {
            // For multi-line cells
            if (data.section === 'body' && (data.column.index === 2)) {
                data.cell.styles.valign = 'middle';
            }
          }
        });

        // Add final total row
        const finalY = (doc as any).lastAutoTable.finalY;
        doc.setFontSize(12);
        doc.setFont('Amiri', 'bold');
        doc.text(`الإجمالي`, pageWidth - margin - 25, finalY + 10, { align: 'center'});
        doc.text(`${totalAmount}`, margin + 10, finalY + 10, { align: 'center'});


        doc.save(`ReturnSlip-${slip.id}.pdf`);
    };

    return (
        <div dir="rtl">
            <Card>
                 <CardHeader>
                    <CardTitle>كشوفات الإرجاع للتجار</CardTitle>
                    <CardDescription>فلترة وبحث في الكشوفات التي تم إنشاؤها.</CardDescription>
                     <div className="flex flex-col sm:flex-row items-center gap-2 pt-4">
                        <Select onValueChange={(v) => setFilterMerchant(v === 'all' ? null : v)} value={filterMerchant || 'all'}><SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="اختيار التاجر" /></SelectTrigger><SelectContent><SelectItem value="all">كل التجار</SelectItem>{Array.from(new Set(merchantSlips.map(s=>s.merchant))).map((m) => (<SelectItem key={m} value={m}>{m}</SelectItem>))}</SelectContent></Select>
                        <Select onValueChange={(v) => setFilterStatus(v === 'all' ? null : v)} value={filterStatus || 'all'}><SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="حالة الكشف" /></SelectTrigger><SelectContent><SelectItem value="all">الكل</SelectItem><SelectItem value="جاهز للتسليم">جاهز للتسليم</SelectItem><SelectItem value="تم التسليم">تم التسليم</SelectItem></SelectContent></Select>
                        <Input type="date" placeholder="من تاريخ" value={filterStartDate || ''} onChange={(e) => setFilterStartDate(e.target.value || null)} className="w-full sm:w-auto" />
                        <Input type="date" placeholder="إلى تاريخ" value={filterEndDate || ''} onChange={(e) => setFilterEndDate(e.target.value || null)} className="w-full sm:w-auto" />
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow>
                            <TableHead className="border-l text-center whitespace-nowrap">رقم الكشف</TableHead>
                            <TableHead className="border-l text-center whitespace-nowrap">التاجر</TableHead>
                            <TableHead className="border-l text-center whitespace-nowrap">تاريخ الإنشاء</TableHead>
                            <TableHead className="border-l text-center whitespace-nowrap">عدد الطلبات</TableHead>
                            <TableHead className="border-l text-center whitespace-nowrap">الحالة</TableHead>
                            <TableHead className="text-center whitespace-nowrap">إجراءات</TableHead>
                        </TableRow></TableHeader>
                        <TableBody>
                        {filteredSlips.map((slip) => (
                            <TableRow key={slip.id}>
                            <TableCell className="font-mono border-l text-center whitespace-nowrap">{slip.id}</TableCell>
                            <TableCell className="border-l text-center whitespace-nowrap">{slip.merchant}</TableCell>
                            <TableCell className="border-l text-center whitespace-nowrap">{slip.date}</TableCell>
                            <TableCell className="border-l text-center whitespace-nowrap">{slip.items}</TableCell>
                            <TableCell className="border-l text-center whitespace-nowrap"><Badge variant={slip.status === 'تم التسليم' ? 'default' : 'outline'} className={slip.status === 'تم التسليم' ? 'bg-green-100 text-green-800' : ''}>{slip.status}</Badge></TableCell>
                            <TableCell className="text-left flex gap-2 justify-center whitespace-nowrap">
                                <Button variant="outline" size="sm" onClick={() => handleShowDetails(slip)}><Icon name="Eye" className="ml-2 h-4 w-4" /> عرض</Button>
                                <Button variant="outline" size="sm" disabled={slip.status === 'تم التسليم'} onClick={() => confirmSlipDelivery(slip.id)}><Icon name="Check" className="ml-2 h-4 w-4" /> تأكيد التسليم</Button>
                                <Button variant="ghost" size="icon" onClick={() => printSlip(slip)}><Icon name="Printer" className="h-4 w-4" /></Button>
                            </TableCell>
                            </TableRow>
                        ))}
                         {filteredSlips.length === 0 && (
                             <TableRow><TableCell colSpan={6} className="h-24 text-center">لا توجد كشوفات تطابق الفلترة.</TableCell></TableRow>
                        )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
                <DialogContent className="sm:max-w-2xl">
                <DialogHeader><DialogTitle>تفاصيل كشف {currentSlip?.id}</DialogTitle></DialogHeader>
                <div className="space-y-4">
                    <Table><TableHeader><TableRow><TableHead>رقم الطلب</TableHead><TableHead>المستلم</TableHead><TableHead>تاريخ الإرجاع الأصلي</TableHead><TableHead>الحالة الأصلية</TableHead></TableRow></TableHeader>
                    <TableBody>{currentSlip?.orders.map((order: any) => (<TableRow key={order.id}><TableCell><Link href={`/dashboard/orders/${order.id}`} className="font-mono text-primary hover:underline">{order.id}</Link></TableCell><TableCell>{order.recipient}</TableCell><TableCell>{order.date}</TableCell><TableCell><Badge variant="secondary">{order.status}</Badge></TableCell></TableRow>))}</TableBody></Table>
                </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
