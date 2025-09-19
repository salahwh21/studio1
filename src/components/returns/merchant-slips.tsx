'use client';
import React, { useState, useMemo } from 'react';
import { useReturnsStore, type MerchantSlip } from '@/store/returns-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/icon';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { parseISO, isWithinInterval, format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useSettings } from '@/contexts/SettingsContext';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import Papa from 'papaparse';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import type { Order } from '@/store/orders-store';
import { useUsersStore } from '@/store/user-store';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { usePdfMakeFonts } from '@/hooks/use-pdf-make-fonts';
import ExcelJS from 'exceljs';


// Lazy loading for PDF generation libraries
const lazyBwipJs = async () => (await import('bwip-js')).default;


export const MerchantSlips = () => {
    const { toast } = useToast();
    const { settings } = useSettings();
    const { users } = useUsersStore();
    const { merchantSlips, updateMerchantSlipStatus } = useReturnsStore();

    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const [currentSlip, setCurrentSlip] = useState<MerchantSlip | null>(null);
    const [selectedSlips, setSelectedSlips] = useState<string[]>([]);
    const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
    const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);

    const { pdfMake, isReady: isPdfReady } = usePdfMakeFonts();

    const [filterMerchant, setFilterMerchant] = useState<string | null>(null);
    const [filterStartDate, setFilterStartDate] = useState<Date | null>(null);
    const [filterEndDate, setFilterEndDate] = useState<Date | null>(null);
    const [filterStatus, setFilterStatus] = useState<string | null>(null);
    
    const filteredSlips = useMemo(() => merchantSlips.filter(slip => {
        let matchesMerchant = filterMerchant ? slip.merchant === filterMerchant : true;
        let matchesDate = true;
        if (filterStartDate && filterEndDate) {
            try {
                const slipDate = parseISO(slip.date);
                matchesDate = isWithinInterval(slipDate, { start: filterStartDate, end: filterEndDate });
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

    const printSlips = async (slips: MerchantSlip[]) => {
        if (!isPdfReady || !pdfMake) {
             toast({ title: "الطباعة غير جاهزة", description: "الرجاء الانتظار لحظات ثم المحاولة مرة أخرى." });
            return;
        }
        if (slips.length === 0) return;
    
        toast({ title: "جاري تجهيز الملفات...", description: `سيتم طباعة ${slips.length} كشوفات.` });

        const bwipjs = await lazyBwipJs();
        
        const allPagesContent: any[] = [];
        const logoBase64 = settings.login.reportsLogo || settings.login.headerLogo;
    
        for (let i = 0; i < slips.length; i++) {
            const slip = slips[i];
            let barcodeBase64 = "";
    
            try {
                const canvas = document.createElement('canvas');
                await bwipjs.toCanvas(canvas, {
                    bcid: 'code128', text: slip.id, scale: 3, height: 15, includetext: true, textsize: 12
                });
                barcodeBase64 = canvas.toDataURL('image/png');
            } catch (e) { console.error("Barcode generation error:", e); }
    
            const user = users.find(u => u.storeName === slip.merchant);
    
            const tableBody = [
                [{ text: '#', style: 'tableHeader' }, { text: 'رقم الطلب', style: 'tableHeader' }, { text: 'المستلم', style: 'tableHeader' }, { text: 'العنوان', style: 'tableHeader' }, { text: 'سبب الإرجاع', style: 'tableHeader' }, { text: 'المبلغ', style: 'tableHeader' },],
                ...slip.orders.map((o: Order, i: number) => [
                    { text: String(i + 1), style: 'tableCell' },
                    { text: String(o.id || ''), style: 'tableCell', alignment: 'center' },
                    { text: `${String(o.recipient || '')}\n${String(o.phone || '')}`, style: 'tableCell' },
                    { text: `${String(o.city || '')} - ${String(o.address || '')}`, style: 'tableCell' },
                    { text: String(o.previousStatus || o.status || 'غير محدد'), style: 'tableCell' },
                    { text: String(o.itemPrice?.toFixed(2) || '0.00'), style: 'tableCell', alignment: 'center' }
                ]),
                [{ text: 'الإجمالي', colSpan: 5, bold: true, style: 'tableCell', alignment: 'left' }, {}, {}, {}, {}, { text: slip.orders.reduce((sum, o) => sum + (o.itemPrice || 0), 0).toFixed(2), bold: true, style: 'tableCell', alignment: 'center' }]
            ];
    
            const pageContent = [
                {
                    columns: [
                        { width: 'auto', stack: [ { text: `اسم التاجر: ${slip.merchant}`, fontSize: 9 }, { text: `البريد: ${String(user?.email || 'غير متوفر')}`, fontSize: 9 }, { text: `التاريخ: ${new Date(slip.date).toLocaleString('ar-EG')}`, fontSize: 9 }, { text: `العنوان: ${String(slip.orders[0]?.city || 'غير متوفر')}`, fontSize: 9 }, ], alignment: 'right' },
                        { width: '*', stack: [ logoBase64 ? { image: logoBase64, width: 70, alignment: 'center', margin: [0, 0, 0, 5] } : {}, { text: 'كشف المرتجع', style: 'header' } ] },
                        { width: 'auto', stack: [ barcodeBase64 ? { image: barcodeBase64, width: 120, alignment: 'center' } : { text: slip.id, alignment: 'center' } ], alignment: 'left' }
                    ],
                    columnGap: 10
                },
                { table: { headerRows: 1, widths: ['auto', 'auto', '*', '*', '*', 'auto'], body: tableBody, }, layout: 'lightHorizontalLines', margin: [0, 20, 0, 10] },
                { columns: [{ text: `توقيع المستلم: .........................`, margin: [0, 50, 0, 0] },] }
            ];

            allPagesContent.push(...pageContent);

            if (i < slips.length - 1) {
                allPagesContent.push({ text: '', pageBreak: 'after' });
            }
        }

        const docDefinition: any = {
            defaultStyle: { font: "Roboto", fontSize: 10, alignment: "right" },
            content: allPagesContent,
            styles: {
                header: { fontSize: 14, bold: true, alignment: 'center', margin: [0, 0, 0, 10] },
                tableHeader: { bold: true, fontSize: 11, fillColor: '#eeeeee', alignment: 'center' },
                tableCell: { margin: [5, 5, 5, 5] },
            },
            footer: (currentPage: number, pageCount: number) => ({ text: `صفحة ${currentPage} من ${pageCount}`, alignment: 'center', fontSize: 8, margin: [0, 10, 0, 0] }),
            pageSize: 'A4',
            pageMargins: [40, 60, 40, 60]
        };

        return pdfMake.createPdf(docDefinition);
    };
    
    const handlePrintAction = async (slips: MerchantSlip[]) => {
        const pdfDoc = await printSlips(slips);
        pdfDoc?.open();
    };
    
    const handleEmailAction = async (slips: MerchantSlip[]) => {
        const pdfDoc = await printSlips(slips);
        pdfDoc?.getBlob((blob) => {
            setPdfBlob(blob);
            setIsEmailDialogOpen(true);
        });
    };
    
    const handleDownloadAttachment = () => {
        if(pdfBlob) {
            const url = URL.createObjectURL(pdfBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'slips.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    }

    const handleExcelExport = async (slips: MerchantSlip[]) => {
        if (slips.length === 0) return;
        toast({ title: "جاري تجهيز ملف Excel..." });

        const workbook = new ExcelJS.Workbook();
        const bwipjs = await lazyBwipJs();
        const logoBase64 = settings.login.reportsLogo || settings.login.headerLogo;

        for (const slip of slips) {
            const worksheet = workbook.addWorksheet(`Slip ${slip.id.substring(3, 7)}`);

            worksheet.views = [{ rightToLeft: true }];
            worksheet.pageSetup = { paperSize: 9, orientation: 'portrait', margins: { left: 0.25, right: 0.25, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 } };
            worksheet.properties.defaultColWidth = 12;
            worksheet.getColumn('C').width = 25;
            worksheet.getColumn('D').width = 25;

            let logoImageId;
            if (logoBase64) {
                 logoImageId = workbook.addImage({ base64: logoBase64, extension: 'png' });
                worksheet.addImage(logoImageId, { tl: { col: 3, row: 1 }, ext: { width: 100, height: 40 } });
            }
            
            let barcodeImageId;
            try {
                const canvas = document.createElement('canvas');
                await bwipjs.toCanvas(canvas, { bcid: 'code128', text: slip.id, scale: 3, height: 10, includetext: true, textsize: 10 });
                const barcodeBase64 = canvas.toDataURL('image/png');
                 barcodeImageId = workbook.addImage({ base64: barcodeBase64, extension: 'png' });
                 worksheet.addImage(barcodeImageId, { tl: { col: 0.5, row: 1 }, ext: { width: 150, height: 50 } });
            } catch (e) { worksheet.getCell('A2').value = slip.id; }

            worksheet.mergeCells('B2:E2');
            const titleCell = worksheet.getCell('B2');
            titleCell.value = 'كشف المرتجع';
            titleCell.font = { size: 16, bold: true };
            titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
            worksheet.getRow(2).height = 30;

            const user = users.find(u => u.storeName === slip.merchant);
            worksheet.getCell('F3').value = `اسم التاجر: ${slip.merchant}`;
            worksheet.getCell('F4').value = `البريد: ${user?.email || 'N/A'}`;
            worksheet.getCell('F5').value = `التاريخ: ${new Date(slip.date).toLocaleDateString('ar-EG')}`;
            worksheet.getCell('G3').value = `العنوان: ${slip.orders[0]?.city || ''}`;

            const headerRow = worksheet.getRow(7);
            headerRow.values = ['#', 'رقم الطلب', 'المستلم', 'العنوان', 'سبب الإرجاع', 'المبلغ'];
            headerRow.font = { bold: true };
            headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
            headerRow.eachCell(cell => {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEEEEE' } };
                cell.border = { bottom: { style: 'thin' } };
            });

            slip.orders.forEach((order, index) => {
                const row = worksheet.addRow([
                    index + 1,
                    order.id,
                    `${order.recipient}\n${order.phone}`,
                    `${order.city} - ${order.address}`,
                    order.previousStatus || order.status,
                    order.itemPrice || 0
                ]);
                row.getCell(3).alignment = { wrapText: true };
                row.getCell(4).alignment = { wrapText: true };
                row.getCell(6).numFmt = '#,##0.00 "د.أ"';
                row.eachCell(cell => { cell.alignment = { ...cell.alignment, vertical: 'middle' }; });
            });

            const totalRow = worksheet.addRow(['', 'الإجمالي', '', '', '', slip.orders.reduce((sum, o) => sum + (o.itemPrice || 0), 0)]);
            worksheet.mergeCells(`B${totalRow.number}:E${totalRow.number}`);
            totalRow.font = { bold: true };
            totalRow.getCell(6).numFmt = '#,##0.00 "د.أ"';

            const signatureRow = worksheet.addRow(['']);
            worksheet.mergeCells(`A${signatureRow.number}:C${signatureRow.number}`);
            worksheet.getCell(`A${signatureRow.number}`).value = 'توقيع المستلم: .........................';
            worksheet.getCell(`A${signatureRow.number}`).font = { size: 12 };
        }

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `merchant_slips_${new Date().toISOString().slice(0,10)}.xlsx`;
        link.click();
        URL.revokeObjectURL(link.href);
        
        toast({ title: "اكتمل التصدير", description: "تم إنشاء ملف Excel بنجاح." });
    };


    const handleSendWhatsApp = () => {
        const slipsToSend = filteredSlips.filter(s => selectedSlips.includes(s.id));
        slipsToSend.forEach(slip => {
            const user = users.find(u => u.storeName === slip.merchant);
            if(user?.whatsapp) {
                const message = `مرحباً ${slip.merchant}, تم تجهيز كشف المرتجعات الخاص بكم رقم ${slip.id}.`;
                const url = `https://wa.me/${user.whatsapp}?text=${encodeURIComponent(message)}`;
                window.open(url, '_blank');
            } else {
                 toast({ variant: 'destructive', title: `فشل الإرسال إلى ${slip.merchant}`, description: "لا يوجد رقم واتساب مسجل لهذا التاجر." });
            }
        })
    }

     const handleExport = () => {
        const slipsToExport = filteredSlips.filter(s => selectedSlips.includes(s.id));
        if (slipsToExport.length === 0) {
            toast({ variant: 'destructive', title: 'لم يتم تحديد كشوفات', description: 'الرجاء تحديد كشف واحد على الأقل للتصدير.' });
            return;
        }

        const data = slipsToExport.flatMap(slip => 
            slip.orders.map(order => ({
                'رقم الكشف': slip.id,
                'اسم التاجر': slip.merchant,
                'تاريخ الإنشاء': slip.date,
                'حالة الكشف': slip.status,
                'رقم الطلب': order.id,
                'المستلم الأصلي': order.recipient,
                'تاريخ الإرجاع الأصلي': order.date,
                'سبب الإرجاع': order.previousStatus || order.status,
            }))
        );

        const csv = Papa.unparse(data);
        const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', 'merchant_slips_export.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleSelectAll = (checked: boolean) => {
        setSelectedSlips(checked ? filteredSlips.map(s => s.id) : []);
    }
    const areAllSelected = filteredSlips.length > 0 && selectedSlips.length === filteredSlips.length;

    const selectedSlipData = useMemo(() => {
        return filteredSlips.filter(s => selectedSlips.includes(s.id));
    }, [selectedSlips, filteredSlips]);

    return (
        <div dir="rtl">
            <Card>
                 <CardHeader>
                    <CardTitle>كشوفات الإرجاع للتجار</CardTitle>
                    <CardDescription>فلترة وبحث في الكشوفات التي تم إنشاؤها.</CardDescription>
                     <div className="flex flex-col sm:flex-row items-center gap-2 pt-4">
                        <Select onValueChange={(v) => setFilterMerchant(v === 'all' ? null : v)} value={filterMerchant || 'all'}><SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="اختيار التاجر" /></SelectTrigger><SelectContent><SelectItem value="all">كل التجار</SelectItem>{Array.from(new Set(merchantSlips.map(s=>s.merchant))).map((m) => (<SelectItem key={m} value={m}>{m}</SelectItem>))}</SelectContent></Select>
                        <Select onValueChange={(v) => setFilterStatus(v === 'all' ? null : v)} value={filterStatus || 'all'}><SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="حالة الكشف" /></SelectTrigger><SelectContent><SelectItem value="all">الكل</SelectItem><SelectItem value="جاهز للتسليم">جاهز للتسليم</SelectItem><SelectItem value="تم التسليم">تم التسليم</SelectItem></SelectContent></Select>
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
                                    <Icon name="Send" className="h-4 w-4" />
                                    إجراءات ({selectedSlips.length})
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                 <DropdownMenuItem onSelect={() => handlePrintAction(selectedSlipData)} disabled={!isPdfReady}>
                                    <Icon name="Printer" className="ml-2 h-4 w-4" />
                                    طباعة المحدد (PDF)
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onSelect={handleExport}>
                                    <Icon name="FileDown" className="ml-2 h-4 w-4" />
                                    تصدير المحدد (CSV)
                                </DropdownMenuItem>
                                 <DropdownMenuItem onSelect={() => handleExcelExport(selectedSlipData)}>
                                    <Icon name="FileSpreadsheet" className="ml-2 h-4 w-4" />
                                    تصدير المحدد (Excel)
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onSelect={() => handleEmailAction(selectedSlipData)} disabled={!isPdfReady}>
                                    <Icon name="Mail" className="ml-2 h-4 w-4" />
                                    إرسال المحدد (بريد إلكتروني)
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={handleSendWhatsApp}>
                                    <Icon name="MessageSquare" className="ml-2 h-4 w-4" />
                                    إرسال المحدد (واتساب)
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
                            <TableHead className="border-l text-center whitespace-nowrap">التاجر</TableHead>
                            <TableHead className="border-l text-center whitespace-nowrap">تاريخ الإنشاء</TableHead>
                            <TableHead className="border-l text-center whitespace-nowrap">عدد الطلبات</TableHead>
                            <TableHead className="border-l text-center whitespace-nowrap">الحالة</TableHead>
                            <TableHead className="text-center whitespace-nowrap">إجراءات</TableHead>
                        </TableRow></TableHeader>
                        <TableBody>
                        {filteredSlips.map((slip) => (
                            <TableRow key={slip.id} data-state={selectedSlips.includes(slip.id) ? "selected" : "unselected"}>
                            <TableCell className="border-l text-center"><Checkbox checked={selectedSlips.includes(slip.id)} onCheckedChange={(checked) => setSelectedSlips(p => checked ? [...p, slip.id] : p.filter(id => id !== slip.id))} /></TableCell>
                            <TableCell className="font-mono border-l text-center whitespace-nowrap">
                                <Link href={`/dashboard/returns/slips/${slip.id}`} className="text-primary hover:underline">{slip.id}</Link>
                            </TableCell>
                            <TableCell className="border-l text-center whitespace-nowrap">{slip.merchant}</TableCell>
                            <TableCell className="border-l text-center whitespace-nowrap">{slip.date}</TableCell>
                            <TableCell className="border-l text-center whitespace-nowrap">{slip.items}</TableCell>
                            <TableCell className="border-l text-center whitespace-nowrap"><Badge variant={slip.status === 'تم التسليم' ? 'default' : 'outline'} className={slip.status === 'تم التسليم' ? 'bg-green-100 text-green-800' : ''}>{slip.status}</Badge></TableCell>
                            <TableCell className="text-left flex gap-2 justify-center whitespace-nowrap">
                                <Button variant="outline" size="sm" onClick={() => handleShowDetails(slip)}><Icon name="Eye" className="ml-2 h-4 w-4" /> عرض</Button>
                                <Button variant="outline" size="sm" disabled={slip.status === 'تم التسليم'} onClick={() => confirmSlipDelivery(slip.id)}><Icon name="Check" className="ml-2 h-4 w-4" /> تأكيد التسليم</Button>
                                <Button variant="ghost" size="icon" onClick={() => handlePrintAction([slip])} disabled={!isPdfReady}><Icon name="Printer" className="h-4 w-4" /></Button>
                            </TableCell>
                            </TableRow>
                        ))}
                         {filteredSlips.length === 0 && (
                             <TableRow><TableCell colSpan={7} className="h-24 text-center">لا توجد كشوفات تطابق الفلترة.</TableCell></TableRow>
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

            <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>إرسال الكشوفات عبر البريد الإلكتروني</DialogTitle>
                        <DialogDescription>
                            سيتم إرسال {selectedSlipData.length} كشوفات إلى التجار المعنيين.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="email-recipients">المستلمون</Label>
                            <Input id="email-recipients" readOnly value={selectedSlipData.map(s => `${s.merchant} <${users.find(u => u.storeName === s.merchant)?.email || 'N/A'}>`).join(', ')} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="email-subject">الموضوع</Label>
                            <Input id="email-subject" defaultValue={`كشوفات مرتجعات بتاريخ ${new Date().toLocaleDateString('ar-EG')}`} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="email-body">نص الرسالة</Label>
                            <Textarea id="email-body" defaultValue="مرحباً، مرفق طيه كشوفات المرتجعات الخاصة بكم. يرجى المراجعة." />
                        </div>
                        {pdfBlob && (
                            <Button variant="link" className="p-0 h-auto" onClick={handleDownloadAttachment}>
                                <Icon name="Paperclip" className="inline h-4 w-4 ml-1" />
                                slips.pdf ({Math.round(pdfBlob.size / 1024)} KB)
                            </Button>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)}>إلغاء</Button>
                        <Button onClick={() => toast({title: "تم الإرسال (محاكاة)", description: "في التطبيق الفعلي، سيتم إرسال البريد الآن."})}>
                            <Icon name="Send" className="ml-2 h-4 w-4" /> إرسال
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
