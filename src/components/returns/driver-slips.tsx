'use client';
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useReturnsStore, type DriverSlip } from '@/store/returns-store';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { parseISO, isWithinInterval } from 'date-fns';
import Icon from '@/components/icon';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useSettings } from '@/contexts/SettingsContext';


export const DriverSlips = () => {
  const { driverSlips } = useReturnsStore();
  const { settings } = useSettings();
  const [currentSlipDetails, setCurrentSlipDetails] = useState<DriverSlip | null>(null);

  const [filterDriver, setFilterDriver] = useState<string | null>(null);
  const [filterStartDate, setFilterStartDate] = useState<string | null>(null);
  const [filterEndDate, setFilterEndDate] = useState<string | null>(null);
  
  const uniqueDrivers = useMemo(() => Array.from(new Set(driverSlips.map(s => s.driverName))), [driverSlips]);
  
  const filteredSlips = useMemo(() => driverSlips.filter(slip => {
      let matchesDriver = filterDriver ? slip.driverName === filterDriver : true;
      let matchesDate = true;
      if (filterStartDate && filterEndDate) {
          try {
              const slipDate = parseISO(slip.date);
              matchesDate = isWithinInterval(slipDate, { start: parseISO(filterStartDate), end: parseISO(filterEndDate) });
          } catch(e) { matchesDate = false; }
      }
      return matchesDriver && matchesDate;
  }), [driverSlips, filterDriver, filterStartDate, filterEndDate]);
  
    const printSlip = async (slip: DriverSlip) => {
        const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
        
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
        doc.text('كشف استلام من السائق', pageWidth / 2, margin + 5, { align: 'center' });

        const logo = settings.login.reportsLogo || settings.login.headerLogo;
        if (logo) {
            try {
               doc.addImage(logo, 'PNG', margin, margin, 30, 15);
            } catch(e) { console.error("Error adding logo to PDF:", e); }
        }

        doc.setFontSize(10);
        doc.text(`السائق: ${slip.driverName}`, pageWidth - margin, margin + 7, { align: 'right' });
        doc.text(`التاريخ: ${new Date(slip.date).toLocaleString('ar-JO')}`, pageWidth - margin, margin + 12, { align: 'right' });
        doc.text(`رقم الكشف: ${slip.id}`, pageWidth - margin, margin + 17, { align: 'right' });


        // --- Table ---
        const head = [['#', 'رقم الطلب', 'اسم المستلم', 'عنوان المستلم', 'سبب الارجاع', 'المبلغ المطلوب']];
        const body = slip.orders.map((order, index) => [
            index + 1,
            order.referenceNumber || order.id,
            `${order.recipient}\n${order.phone || ''}`,
            order.address,
            order.previousStatus || order.status,
            order.cod > 0 ? 'يوجد تحصيل' : '0.00',
        ]);
        
        const totalCOD = slip.orders.reduce((sum, order) => sum + order.cod, 0);

        autoTable(doc, {
          startY: margin + 25,
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
            const footerY = pageHeight - margin - 10;
            doc.text(`توقيع المستلم: ............................`, pageWidth - margin, footerY, { align: 'right' });
            doc.text(`Page ${data.pageNumber}`, margin, footerY, { align: 'left' });
          }
        });

        // Add final total row
        const finalY = (doc as any).lastAutoTable.finalY;
        doc.setFontSize(12);
        doc.setFont('Amiri', 'bold');
        doc.text(`الإجمالي`, pageWidth - margin - 25, finalY + 10, { align: 'center'});
        doc.text(`${totalCOD.toFixed(2)}`, margin + 10, finalY + 10, { align: 'center'});


        doc.save(`DriverSlip-${slip.id}.pdf`);
    };


  return (
    <div dir="rtl">
      <Card>
          <CardHeader>
            <CardTitle>كشوفات استلام المرتجعات من السائقين</CardTitle>
            <CardDescription>فلترة وبحث في الكشوفات التي تم إنشاؤها.</CardDescription>
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-4">
                <Select onValueChange={(v) => setFilterDriver(v === 'all' ? null : v)} value={filterDriver || 'all'}>
                    <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="اختيار السائق" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">كل السائقين</SelectItem>
                        {uniqueDrivers.map((driver) => (
                            <SelectItem key={driver} value={driver}>{driver}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Input type="date" placeholder="من تاريخ" value={filterStartDate || ''} onChange={(e) => setFilterStartDate(e.target.value || null)} className="w-full sm:w-auto" />
                <Input type="date" placeholder="إلى تاريخ" value={filterEndDate || ''} onChange={(e) => setFilterEndDate(e.target.value || null)} className="w-full sm:w-auto" />
            </div>
          </CardHeader>
          <CardContent>
              <Table>
                  <TableHeader><TableRow>
                      <TableHead className="border-l text-center whitespace-nowrap">رقم الكشف</TableHead>
                      <TableHead className="border-l text-center whitespace-nowrap">السائق</TableHead>
                      <TableHead className="border-l text-center whitespace-nowrap">التاريخ</TableHead>
                      <TableHead className="border-l text-center whitespace-nowrap">عدد الشحنات</TableHead>
                      <TableHead className="text-center whitespace-nowrap">إجراء</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                      {filteredSlips.length === 0 ? (
                          <TableRow><TableCell colSpan={5} className="h-24 text-center">لا توجد كشوفات تطابق الفلترة.</TableCell></TableRow>
                      ) : (
                          filteredSlips.map(slip => (
                              <TableRow key={slip.id}>
                                  <TableCell className="font-mono border-l text-center whitespace-nowrap">{slip.id}</TableCell>
                                  <TableCell className="border-l text-center whitespace-nowrap">{slip.driverName}</TableCell>
                                  <TableCell className="border-l text-center whitespace-nowrap">{slip.date}</TableCell>
                                  <TableCell className="border-l text-center whitespace-nowrap">{slip.itemCount}</TableCell>
                                  <TableCell className="text-left flex gap-2 justify-center whitespace-nowrap">
                                        <Button variant="outline" size="sm" onClick={() => setCurrentSlipDetails(slip)}><Icon name="Eye" className="ml-2 h-4 w-4" /> عرض</Button>
                                        <Button variant="outline" size="sm" onClick={() => printSlip(slip)}><Icon name="Printer" className="ml-2 h-4 w-4" /> طباعة</Button>
                                  </TableCell>
                              </TableRow>
                          ))
                      )}
                  </TableBody>
              </Table>
          </CardContent>
      </Card>
      
      <Dialog open={!!currentSlipDetails} onOpenChange={() => setCurrentSlipDetails(null)}>
          <DialogContent className="max-w-2xl">
               <DialogHeader><DialogTitle>تفاصيل كشف الاستلام {currentSlipDetails?.id}</DialogTitle></DialogHeader>
               <div className="max-h-[60vh] overflow-y-auto">
                  <Table>
                      <TableHeader><TableRow><TableHead>رقم الطلب</TableHead><TableHead>التاجر</TableHead><TableHead>المستلم</TableHead></TableRow></TableHeader>
                      <TableBody>
                          {currentSlipDetails?.orders.map(o => (
                              <TableRow key={o.id}>
                                  <TableCell>{o.id}</TableCell>
                                  <TableCell>{o.merchant}</TableCell>
                                  <TableCell>{o.recipient}</TableCell>
                              </TableRow>
                          ))}
                      </TableBody>
                  </Table>
               </div>
          </DialogContent>
      </Dialog>
    </div>
  );
};
