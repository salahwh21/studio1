'use client';
import React, { useState, useMemo, useTransition, useEffect } from 'react';
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import Papa from 'papaparse';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useUsersStore } from '@/store/user-store';
import Link from 'next/link';
import { generatePdfSlipAction, PdfActionInputSchema } from '@/app/actions/generate-pdf-slip';
import { jsPDF } from 'jspdf';


export const DriverSlips = () => {
    const { driverSlips } = useReturnsStore();
    const { settings } = useSettings();
    const { users } = useUsersStore();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const [currentSlipDetails, setCurrentSlipDetails] = useState<DriverSlip | null>(null);
    const [selectedSlips, setSelectedSlips] = useState<string[]>([]);

    const [filterDriver, setFilterDriver] = useState<string | null>(null);
    const [filterStartDate, setFilterStartDate] = useState<Date | null>(null);
    const [filterEndDate, setFilterEndDate] = useState<Date | null>(null);

    const [pdfToPrint, setPdfToPrint] = useState<DriverSlip[] | null>(null);

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
    
    const selectedSlipData = useMemo(() => {
        return filteredSlips.filter(s => selectedSlips.includes(s.id));
    }, [selectedSlips, filteredSlips]);

    const handlePrintAction = (slipsToPrint: DriverSlip[]) => {
        if (slipsToPrint.length === 0) return;
        
        startTransition(async () => {
            toast({ title: "جاري تجهيز ملف PDF...", description: `سيتم طباعة ${slipsToPrint.length} كشوفات.` });
            
            try {
                const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
                const reportsLogo = settings.login.reportsLogo || settings.login.headerLogo;

                for (let i = 0; i < slipsToPrint.length; i++) {
                    const slip = slipsToPrint[i];
                    const slipData = {
                        id: slip.id,
                        partyName: slip.driverName,
                        partyLabel: 'اسم السائق',
                        date: slip.date,
                        branch: slip.orders[0]?.city || 'غير متوفر',
                        orders: slip.orders.map(o => ({
                            id: o.id || '', recipient: o.recipient || '', phone: o.phone || '', city: o.city || '',
                            address: o.address || '', previousStatus: o.previousStatus || o.status || 'غير محدد',
                            itemPrice: o.itemPrice || 0,
                        })),
                        total: slip.orders.reduce((sum, o) => sum + (o.itemPrice || 0), 0),
                    };

                    const result = await generatePdfSlipAction({ slipData, reportsLogo, isDriver: true });

                    if (result.success && result.data) {
                        if (i > 0) pdf.addPage();
                        const imgData = 'data:image/jpeg;base64,' + result.data;
                        const { width, height } = pdf.internal.pageSize;
                        pdf.addImage(imgData, 'JPEG', 0, 0, width, height);
                    } else {
                        throw new Error(result.error || `فشل إنشاء PDF للكشف ${slip.id}`);
                    }
                }
                if (typeof window !== 'undefined') {
                  pdf.output('dataurlnewwindow');
                }

            } catch (e: any) {
                console.error("PDF generation error:", e);
                toast({ variant: 'destructive', title: 'فشل إنشاء PDF', description: e.message || 'حدث خطأ أثناء تجهيز الملف.' });
            }
        });
    };


    const handleSendWhatsApp = () => {
        if (selectedSlipData.length === 0) return;
        selectedSlipData.forEach(slip => {
            const user = users.find(u => u.name === slip.driverName);
            if(user?.whatsapp) {
                const message = `مرحباً ${slip.driverName}, تم إنشاء كشف المرتجعات رقم ${slip.id}.`;
                const url = `https://wa.me/${user.whatsapp}?text=${encodeURIComponent(message)}`;
                window.open(url, '_blank');
            } else {
                 toast({ variant: 'destructive', title: `فشل الإرسال إلى ${slip.driverName}`, description: "لا يوجد رقم واتساب مسجل لهذا السائق." });
            }
        })
    }

    const handleCsvExport = () => {
        if (selectedSlipData.length === 0) {
            toast({ variant: 'destructive', title: 'لم يتم تحديد كشوفات', description: 'الرجاء تحديد كشف واحد على الأقل للتصدير.' });
            return;
        }

        const data = selectedSlipData.flatMap(slip => 
            slip.orders.map(order => ({
                'رقم الكشف': slip.id,
                'اسم السائق': slip.driverName,
                'تاريخ الكشف': slip.date,
                'رقم الطلب': order.id,
                'التاجر': order.merchant,
                'المستلم': order.recipient,
                'سبب الإرجاع': order.previousStatus || order.status,
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
                                    <Icon name="Send" className="h-4 w-4" />
                                    إجراءات ({selectedSlips.length})
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onSelect={() => handlePrintAction(selectedSlipData)} disabled={isPending}>
                                    <Icon name="Printer" className="ml-2 h-4 w-4" />
                                    طباعة المحدد (PDF)
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onSelect={handleCsvExport}>
                                    <Icon name="FileDown" className="ml-2 h-4 w-4" />
                                    تصدير المحدد (CSV)
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
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
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12 border-l text-center"><Checkbox onCheckedChange={handleSelectAll} checked={areAllSelected}/></TableHead>
                                <TableHead className="border-l text-center whitespace-nowrap">رقم الكشف</TableHead>
                                <TableHead className="border-l text-center whitespace-nowrap">السائق</TableHead>
                                <TableHead className="border-l text-center whitespace-nowrap">التاريخ</TableHead>
                                <TableHead className="border-l text-center whitespace-nowrap">عدد الشحنات</TableHead>
                                <TableHead className="text-center whitespace-nowrap">إجراء</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredSlips.length === 0 ? (
                                <TableRow><TableCell colSpan={6} className="h-24 text-center">لا توجد كشوفات تطابق الفلترة.</TableCell></TableRow>
                            ) : (
                                filteredSlips.map(slip => (
                                    <TableRow key={slip.id} data-state={selectedSlips.includes(slip.id) ? "selected" : "unselected"}>
                                        <TableCell className="border-l text-center"><Checkbox checked={selectedSlips.includes(slip.id)} onCheckedChange={(checked) => setSelectedSlips(p => checked ? [...p, slip.id] : p.filter(id => id !== slip.id))} /></TableCell>
                                        <TableCell className="font-mono border-l text-center whitespace-nowrap">
                                            <Link href={`/dashboard/returns/slips/${slip.id}`} className="text-primary hover:underline">{slip.id}</Link>
                                        </TableCell>
                                        <TableCell className="border-l text-center whitespace-nowrap">{slip.driverName}</TableCell>
                                        <TableCell className="border-l text-center whitespace-nowrap">{slip.date}</TableCell>
                                        <TableCell className="border-l text-center whitespace-nowrap">{slip.itemCount}</TableCell>
                                        <TableCell className="text-left flex gap-2 justify-center whitespace-nowrap">
                                            <Button variant="outline" size="sm" onClick={() => setCurrentSlipDetails(slip)}><Icon name="Eye" className="ml-2 h-4 w-4" /> عرض</Button>
                                            <Button variant="ghost" size="icon" onClick={() => handlePrintAction([slip])} disabled={isPending}><Icon name="Printer" className="h-4 w-4" /></Button>
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
                            <TableHeader>
                                <TableRow>
                                    <TableHead>رقم الطلب</TableHead>
                                    <TableHead>التاجر</TableHead>
                                    <TableHead>المستلم</TableHead>
                                </TableRow>
                            </TableHeader>
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
