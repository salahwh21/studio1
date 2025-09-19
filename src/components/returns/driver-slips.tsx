'use client';
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useReturnsStore, type DriverSlip } from '@/store/returns-store';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { parseISO, isWithinInterval, format } from 'date-fns';
import Icon from '@/components/icon';
import { useSettings } from '@/contexts/SettingsContext';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import Papa from 'papaparse';
import pdfMake from "pdfmake/build/pdfmake";
import bwipjs from "bwip-js/browser";
import { amiriRegularBase64, amiriBoldBase64 } from "./amiri_base64";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import type { Order } from '@/store/orders-store';
import { useUsersStore, type User } from '@/store/user-store';


// Font setup for pdfmake
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
  const { users } = useUsersStore();
  const { toast } = useToast();
  const [currentSlipDetails, setCurrentSlipDetails] = useState<DriverSlip | null>(null);
  const [selectedSlips, setSelectedSlips] = useState<string[]>([]);

  const [filterDriver, setFilterDriver] = useState<string | null>(null);
  const [filterStartDate, setFilterStartDate] = useState<Date | null>(null);
  const [filterEndDate, setFilterEndDate] = useState<Date | null>(null);
  
  const uniqueDrivers = useMemo(() => Array.from(new Set(driverSlips.map(s => s.driverName))), [driverSlips]);
  
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
  
  const printSlips = async (slips: DriverSlip[]) => {
    if (slips.length === 0) return;

    toast({ title: "جاري تجهيز الملف...", description: `سيتم طباعة ${slips.length} كشوفات.` });

    const docDefinition: any = {
      defaultStyle: { font: "Amiri", fontSize: 10, alignment: "right" },
      content: [],
      styles: {
        header: { fontSize: 14, bold: true, alignment: 'center', margin: [0, 0, 0, 10] },
        tableHeader: { bold: true, fontSize: 11, color: 'black', fillColor: '#eeeeee', alignment: 'center' },
        tableCell: { margin: [5, 5, 5, 5] },
        footer: { fontSize: 8, alignment: 'center', color: 'grey' }
      }
    };

    for (const [index, slip] of slips.entries()) {
      const logoBase64 = settings.login.reportsLogo || settings.login.headerLogo;
      let barcodeBase64 = "";

      try {
        const canvas = document.createElement('canvas');
        await bwipjs.toCanvas(canvas, {
          bcid: 'code128', text: slip.id, scale: 3, height: 12, includetext: true, textyalign: 'below', textsize: 11,
        });
        barcodeBase64 = canvas.toDataURL('image/png');
      } catch (e) {
        console.error("Barcode generation error:", e);
      }
      
      const user = users.find(u => u.name === slip.driverName);

      const tableBody = [
        [
          { text: '#', style: 'tableHeader' },
          { text: 'رقم المتسلسل', style: 'tableHeader' },
          { text: 'اسم المستلم', style: 'tableHeader' },
          { text: 'عنوان المستلم', style: 'tableHeader' },
          { text: 'سبب الارجاع', style: 'tableHeader' },
          { text: 'مطلوب للتاجر', style: 'tableHeader' },
        ],
        ...slip.orders.map((o: Order, i: number) => [
          { text: String(i + 1), style: 'tableCell' },
          { text: String(o.id || ''), style: 'tableCell', alignment: 'center' },
          { text: `${String(o.recipient || '')}\n${String(o.phone || '')}`, style: 'tableCell' },
          { text: `${String(o.city || '')} - ${String(o.address || '')}`, style: 'tableCell' },
          { text: String(o.previousStatus || o.status || 'غير محدد'), style: 'tableCell' },
          { text: String(o.itemPrice?.toFixed(2) || '0.00'), style: 'tableCell', alignment: 'center' },
        ]),
        [
          { text: 'الإجمالي', colSpan: 5, bold: true, style: 'tableCell', alignment: 'left' },
          {}, {}, {}, {},
          { text: slip.orders.reduce((sum, o) => sum + (o.itemPrice || 0), 0).toFixed(2), bold: true, style: 'tableCell', alignment: 'center' }
        ]
      ];

      docDefinition.content.push(
        {
          columns: [
            {
              width: 'auto',
              stack: [
                { text: `اسم التاجر : ${String(user?.storeName || slip.driverName)}`, fontSize: 9 },
                { text: `رقم المحمول للتاجر : ${String(user?.email || 'غير متوفر')}`, fontSize: 9 },
                { text: `التاريخ : ${new Date(slip.date).toLocaleString('ar-EG', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}`, fontSize: 9 },
                { text: `العنوان : ${String(slip.orders[0]?.city || 'غير متوفر')}`, fontSize: 9 },
              ],
              alignment: 'right'
            },
            {
              width: '*',
              stack: [
                logoBase64 ? { image: logoBase64, width: 70, alignment: 'center', margin: [0, 0, 0, 5] } : {},
                { text: 'كشف المرتجع', style: 'header', alignment: 'center' }
              ]
            },
            {
              width: 'auto',
              stack: [
                 barcodeBase64 ? { image: barcodeBase64, width: 120, alignment: 'center' } : {text: slip.id, alignment: 'center'},
              ],
              alignment: 'left'
            }
          ],
          columnGap: 10
        },
        {
          table: {
            headerRows: 1,
            widths: ['auto', 'auto', '*', '*', '*', 'auto'],
            body: tableBody,
          },
          layout: 'lightHorizontalLines',
          margin: [0, 20, 0, 10]
        },
        {
            columns: [
                { text: `توقيع المستلم: .........................`, margin: [0, 50, 0, 0] },
            ],
        },
        {
          text: `Page 1 of 1`,
          style: 'footer',
          margin: [0, 20, 0, 0]
        }
      );

      if (index < slips.length - 1) {
        docDefinition.content.push({ text: '', pageBreak: 'after' });
      }
    }

    pdfMake.createPdf(docDefinition).open();
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
                 <Popover>
                    <PopoverTrigger asChild>
                        <Button variant={"outline"} className={cn("w-full sm:w-auto justify-start text-left font-normal", !filterStartDate && "text-muted-foreground")}>
                            <Icon name="Calendar" className="ml-2 h-4 w-4" />
                            {filterStartDate ? format(filterStartDate, "yyyy/MM/dd") : <span>من تاريخ</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={filterStartDate || undefined} onSelect={(d) => setFilterStartDate(d || null)} initialFocus />
                    </PopoverContent>
                </Popover>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant={"outline"} className={cn("w-full sm:w-auto justify-start text-left font-normal", !filterEndDate && "text-muted-foreground")}>
                            <Icon name="Calendar" className="ml-2 h-4 w-4" />
                            {filterEndDate ? format(filterEndDate, "yyyy/MM/dd") : <span>إلى تاريخ</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                         <Calendar mode="single" selected={filterEndDate || undefined} onSelect={(d) => setFilterEndDate(d || null)} initialFocus />
                    </PopoverContent>
                </Popover>
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
