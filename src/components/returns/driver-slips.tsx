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


export const DriverSlips = () => {
  const { driverSlips } = useReturnsStore();
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
        const doc = new jsPDF();
        
        try {
            // This is a workaround for jsPDF font issues with Arabic in some environments.
            // You might need a more robust solution.
            doc.addFont('https://raw.githack.com/MrRio/jsPDF/master/test/reference/Amiri-Regular.ttf', 'Amiri', 'normal');
            doc.setFont('Amiri');
        } catch (e) {
            console.warn("Could not load Amiri font for PDF. RTL text might not render correctly.");
        }

        doc.text(`كشف استلام من السائق: ${slip.driverName}`, 200, 20, { align: 'right' });
        doc.text(`رقم الكشف: ${slip.id}`, 200, 30, { align: 'right' });
        doc.text(`التاريخ: ${slip.date}`, 200, 40, { align: 'right' });
        
        autoTable(doc, {
          startY: 50,
          head: [['التاجر', 'المستلم', 'رقم الطلب']],
          body: slip.orders.map(o => [o.merchant, o.recipient, o.id]),
          styles: { halign: 'right', font: 'Amiri' },
          headStyles: { fillColor: [41, 128, 185], halign: 'center' },
        });
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
                                        <Button variant="ghost" size="icon" onClick={() => printSlip(slip)}><Icon name="Printer" className="h-4 w-4" /></Button>
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
