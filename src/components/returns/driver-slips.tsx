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
import { useSettings } from '@/contexts/SettingsContext';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import Papa from 'papaparse';
import pdfMake from "pdfmake/build/pdfmake";
import { toBuffer } from "bwip-js";

// Font setup for pdfmake
const amiriRegularBase64 = "AAEAAAARAQAABAAAR0RFRgAIAAAAEgAAAABPUy8yAAABYAAAADcAAABgjb/paGNtYXAAAAFoAAAAOAAAAFRar84IZ2x5ZgAAAdQAAACsAAAAuB/0T/toZWFkAAABMAAAADAAAAA2B4IG5oZWFkAAABZAAAABgAAAAGDQQCem10eAAAAXwAAAAUAAAACAYjA/dpbmR4AAABiAAAABQAAAAUCwAAdmxvY2EAAAHEAAAAEAAAABAFuAaebWF4cAAAAVAAAAAGAAAABgAIAAhwb3N0AAACNAAAACQAAABNpkjfeAABAAAAAQAAajgOcV8PPPUACwQAAAAAANpHB9sAAAAA2kcH2wAAAAADVAEAAAACAACAAAAAAAAAAEAAAAsADgAAQAAAAAAAQAAAAoAHQAEAAAAAAACAAEAAgAgAAQAAAAAAIAAAAEAAAAAABcBAgAAAAAADgAaADQAAwABBAkAAQAUABQAAwABBAkAAgAOACAAAwABBAkAAwAQAEMAAwABBAkABAAUAFYAAwABBAkABQAYAG4AAwABBAkABgAUAH4AAwABBAkADgA0AIAAA0JAaGFtYQpDb3B5cmlnaHQgKGMpIDIwMTIgQW1pcmlIE"
const amiriBoldBase64 = "AAEAAAARAQAABAAAR0RFRgAIAAAAEgAAAABPUy8yAAABYAAAADcAAABgjb/paGNtYXAAAAFoAAAAOAAAAFRar84IZ2x5ZgAAAdQAAACsAAAAuB/0T/toZWFkAAABMAAAADAAAAA2B4IG5oZWFkAAABZAAAABgAAAAGDQQCem10eAAAAXwAAAAUAAAACAYjA/dpbmR4AAABiAAAABQAAAAUCwAAdmxvY2EAAAHEAAAAEAAAABAFuAaebWF4cAAAAVAAAAAGAAAABgAIAAhwb3N0AAACNAAAACQAAABNpkjfeAABAAAAAQAAajgOcV8PPPUACwQAAAAAANpHB9sAAAAA2kcH2wAAAAADVAEAAAACAACAAAAAAAAAAEAAAAsADgAAQAAAAAAAQAAAAoAHQAEAAAAAAACAAEAAgAgAAQAAAAAAIAAAAEAAAAAABcBAgAAAAAADgAaADQAAwABBAkAAQAUABQAAwABBAkAAgAOACAAAwABBAkAAwAQAEMAAwABBAkABAAUAFYAAwABBAkABQAYAG4AAwABBAkABgAUAH4AAwABBAkADgA0AIAAA0JAaGFtYQpDb3B5cmlnaHQgKGMpIDIwMTIgQW1pcmlIE"

pdfMake.vfs = {
  "Amiri-Regular.ttf": amiriRegularBase64,
  "Amiri-Bold.ttf": amiriBoldBase64
};

pdfMake.fonts = {
  Amiri: {
    normal: "Amiri-Regular.ttf",
    bold: "Amiri-Bold.ttf"
  }
};


export const DriverSlips = () => {
  const { driverSlips } = useReturnsStore();
  const { settings } = useSettings();
  const { toast } = useToast();
  const [currentSlipDetails, setCurrentSlipDetails] = useState<DriverSlip | null>(null);
  const [selectedSlips, setSelectedSlips] = useState<string[]>([]);

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
  
  const printSlips = async (slips: DriverSlip[]) => {
      if (slips.length === 0) return;
  
      toast({ title: "جاري تجهيز الملف...", description: `سيتم طباعة ${slips.length} كشوفات.` });
  
      for (const slip of slips) {
          let barcodeBase64 = "";
          try {
              const png = await toBuffer({ bcid: 'code128', text: slip.id, scale: 3, height: 10, includetext: true });
              barcodeBase64 = 'data:image/png;base64,' + png.toString('base64');
          } catch (e) {
              console.error("خطأ في توليد الباركود:", e);
          }
  
          const logoBase64 = settings.login.reportsLogo || settings.login.headerLogo;
  
          const tableBody = [
              [{ text: '#', bold: true }, { text: 'رقم الطلب', bold: true }, { text: 'التاجر', bold: true }, { text: 'المستلم', bold: true }],
              ...slip.orders.map((o, index) => [
                  (index + 1).toString(),
                  o.id,
                  o.merchant,
                  o.recipient
              ])
          ];
  
          const docDefinition: any = {
              defaultStyle: { font: "Amiri", fontSize: 10, alignment: "right" },
              content: [
                  {
                      columns: [
                          logoBase64 ? { image: logoBase64, width: 70 } : { text: '' },
                          [
                              { text: "كشف استلام مرتجعات من السائق", style: "header" },
                              { text: `اسم السائق: ${slip.driverName}` },
                              { text: `التاريخ: ${new Date(slip.date).toLocaleDateString('ar-JO')}` }
                          ]
                      ]
                  },
                  { image: barcodeBase64, width: 150, alignment: 'center', margin: [0, 10, 0, 10] },
                  {
                      table: { headerRows: 1, widths: ['auto', '*', '*', '*'], body: tableBody },
                      layout: 'lightHorizontalLines'
                  },
                   { text: `الإجمالي: ${slip.itemCount} شحنة`, margin: [0, 10, 0, 0] },
                  {
                      columns: [
                          { text: "توقيع المستلم: ............................", margin: [0, 30, 0, 0] },
                          { text: "توقيع المسلِّم: ............................", margin: [0, 30, 0, 0], alignment: 'left' }
                      ]
                  }
              ],
              styles: { header: { fontSize: 16, bold: true, alignment: 'right', margin: [0, 0, 0, 10] } }
          };
  
          pdfMake.createPdf(docDefinition).open();
      }
  };

    const handleExport = () => {
        const slipsToExport = filteredSlips.filter(s => selectedSlips.includes(s.id));
        if (slipsToExport.length === 0) {
            toast({ variant: 'destructive', title: 'لم يتم تحديد كشوفات', description: 'الرجاء تحديد كشف واحد على الأقل للتصدير.' });
            return;
        }

        const data = slipsToExport.flatMap(slip => 
            slip.orders.map(order => ({
                'رقم الكشف': slip.id,
                'اسم السائق': slip.driverName,
                'تاريخ الكشف': slip.date,
                'رقم الطلب': order.id,
                'التاجر': order.merchant,
                'المستلم': order.recipient,
                'سبب الارجاع': order.previousStatus || order.status,
            }))
        );

        const csv = Papa.unparse(data);
        const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', 'driver_slips_export.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleSelectAll = (checked: boolean) => {
        setSelectedSlips(checked ? filteredSlips.map(s => s.id) : []);
    }
    const areAllSelected = filteredSlips.length > 0 && selectedSlips.length === filteredSlips.length;

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
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-1.5" disabled={selectedSlips.length === 0}>
                            <Icon name="Printer" className="h-4 w-4" />
                            طباعة/تصدير ({selectedSlips.length})
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                         <DropdownMenuItem onSelect={() => printSlips(filteredSlips.filter(s => selectedSlips.includes(s.id)))}>
                            <Icon name="Printer" className="ml-2 h-4 w-4" />
                            طباعة المحدد
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={handleExport}>
                            <Icon name="FileDown" className="ml-2 h-4 w-4" />
                            تصدير المحدد (CSV)
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
              <Table>
                  <TableHeader><TableRow>
                      <TableHead className="w-12 border-l text-center"><Checkbox onCheckedChange={handleSelectAll} checked={areAllSelected}/></TableHead>
                      <TableHead className="border-l text-center whitespace-nowrap">رقم الكشف</TableHead>
                      <TableHead className="border-l text-center whitespace-nowrap">السائق</TableHead>
                      <TableHead className="border-l text-center whitespace-nowrap">التاريخ</TableHead>
                      <TableHead className="border-l text-center whitespace-nowrap">عدد الشحنات</TableHead>
                      <TableHead className="text-center whitespace-nowrap">إجراء</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                      {filteredSlips.length === 0 ? (
                          <TableRow><TableCell colSpan={6} className="h-24 text-center">لا توجد كشوفات تطابق الفلترة.</TableCell></TableRow>
                      ) : (
                          filteredSlips.map(slip => (
                              <TableRow key={slip.id} data-state={selectedSlips.includes(slip.id) ? "selected" : "unselected"}>
                                  <TableCell className="border-l text-center"><Checkbox checked={selectedSlips.includes(slip.id)} onCheckedChange={(checked) => setSelectedSlips(p => checked ? [...p, slip.id] : p.filter(id => id !== slip.id))} /></TableCell>
                                  <TableCell className="font-mono border-l text-center whitespace-nowrap">{slip.id}</TableCell>
                                  <TableCell className="border-l text-center whitespace-nowrap">{slip.driverName}</TableCell>
                                  <TableCell className="border-l text-center whitespace-nowrap">{slip.date}</TableCell>
                                  <TableCell className="border-l text-center whitespace-nowrap">{slip.itemCount}</TableCell>
                                  <TableCell className="text-left flex gap-2 justify-center whitespace-nowrap">
                                        <Button variant="outline" size="sm" onClick={() => setCurrentSlipDetails(slip)}><Icon name="Eye" className="ml-2 h-4 w-4" /> عرض</Button>
                                        <Button variant="ghost" size="icon" onClick={() => printSlips([slip])}><Icon name="Printer" className="h-4 w-4" /></Button>
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
