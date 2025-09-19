'use client';
import { useState, useMemo } from 'react';
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
import { useSettings } from '@/contexts/SettingsContext';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Papa from 'papaparse';
import pdfMake from "pdfmake/build/pdfmake";

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


export const MerchantSlips = () => {
    const { toast } = useToast();
    const { settings } = useSettings();
    const { merchantSlips, updateMerchantSlipStatus } = useReturnsStore();

    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const [currentSlip, setCurrentSlip] = useState<MerchantSlip | null>(null);
    const [selectedSlips, setSelectedSlips] = useState<string[]>([]);


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

    const printSlips = async (slips: MerchantSlip[]) => {
        if (slips.length === 0) return;

        toast({ title: "جاري تجهيز الملف...", description: `سيتم طباعة ${slips.length} كشوفات.` });

        for (const slip of slips) {
            const logoBase64 = settings.login.reportsLogo || settings.login.headerLogo;

            const tableBody = [
                [{ text: '#', bold: true }, { text: 'رقم الطلب', bold: true }, { text: 'المستلم', bold: true }, { text: 'سبب الإرجاع', bold: true }],
                ...slip.orders.map((o, index) => [
                    (index + 1).toString(),
                    o.id,
                    o.recipient,
                    o.previousStatus || o.status
                ])
            ];

            const docDefinition: any = {
                defaultStyle: { font: "Amiri", fontSize: 10, alignment: "right" },
                content: [
                    {
                        columns: [
                            logoBase64 ? { image: logoBase64, width: 70 } : { text: '' },
                            [
                                { text: "كشف تسليم مرتجعات للتاجر", style: "header" },
                                { text: `اسم التاجر: ${slip.merchant}` },
                                { text: `التاريخ: ${new Date(slip.date).toLocaleDateString('ar-JO')}` }
                            ]
                        ]
                    },
                    // Barcode removed for now
                    {
                        table: { headerRows: 1, widths: ['auto', '*', '*', '*'], body: tableBody },
                        layout: 'lightHorizontalLines'
                    },
                    { text: `الإجمالي: ${slip.items} شحنة`, margin: [0, 10, 0, 0] },
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
                            <TableCell className="font-mono border-l text-center whitespace-nowrap">{slip.id}</TableCell>
                            <TableCell className="border-l text-center whitespace-nowrap">{slip.merchant}</TableCell>
                            <TableCell className="border-l text-center whitespace-nowrap">{slip.date}</TableCell>
                            <TableCell className="border-l text-center whitespace-nowrap">{slip.items}</TableCell>
                            <TableCell className="border-l text-center whitespace-nowrap"><Badge variant={slip.status === 'تم التسليم' ? 'default' : 'outline'} className={slip.status === 'تم التسليم' ? 'bg-green-100 text-green-800' : ''}>{slip.status}</Badge></TableCell>
                            <TableCell className="text-left flex gap-2 justify-center whitespace-nowrap">
                                <Button variant="outline" size="sm" onClick={() => handleShowDetails(slip)}><Icon name="Eye" className="ml-2 h-4 w-4" /> عرض</Button>
                                <Button variant="outline" size="sm" disabled={slip.status === 'تم التسليم'} onClick={() => confirmSlipDelivery(slip.id)}><Icon name="Check" className="ml-2 h-4 w-4" /> تأكيد التسليم</Button>
                                <Button variant="ghost" size="icon" onClick={() => printSlips([slip])}><Icon name="Printer" className="h-4 w-4" /></Button>
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
        </div>
    );
};
