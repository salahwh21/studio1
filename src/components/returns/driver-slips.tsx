
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
import { generateDriverSlipPdf } from '@/services/pdf-export-service';


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

    const handlePrintAction = (slips: DriverSlip[]) => {
        if (slips.length === 0) return;
        setPdfToPrint(slips);
    };

    
    useEffect(() => {
        if (!pdfToPrint) return;
        startTransition(() => {
            toast({ title: "جاري تجهيز ملف PDF...", description: `سيتم طباعة ${pdfToPrint.length} كشوفات.` });
            const reportsLogo = settings.login.reportsLogo || settings.login.headerLogo;
            generateDriverSlipPdf(pdfToPrint, users, reportsLogo).then(pdfDoc => {
                pdfDoc.open();
                setPdfToPrint(null);
            }).catch(e => {
                console.error("PDF generation error:", e);
                toast({ variant: 'destructive', title: 'فشل إنشاء PDF', description: 'حدث خطأ أثناء تجهيز الملف.' });
                setPdfToPrint(null);
            });
        });
    }, [pdfToPrint, settings.login, users, toast]);

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
```
</change>
<change>
<file>/src/components/returns/merchant-slips.tsx</file>
<content><![CDATA[
'use client';
import React, { useState, useMemo, useTransition, useEffect } from 'react';
import { useReturnsStore, type MerchantSlip } from '@/store/returns-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/icon';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { useUsersStore } from '@/store/user-store';
import { generateMerchantSlipPdf } from '@/services/pdf-export-service';


export const MerchantSlips = () => {
    const { toast } = useToast();
    const { settings } = useSettings();
    const { users } = useUsersStore();
    const { merchantSlips, updateMerchantSlipStatus } = useReturnsStore();
    const [isPending, startTransition] = useTransition();

    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const [currentSlip, setCurrentSlip] = useState<MerchantSlip | null>(null);
    const [selectedSlips, setSelectedSlips] = useState<string[]>([]);
    
    const [pdfToPrint, setPdfToPrint] = useState<MerchantSlip[] | null>(null);

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
    
    const selectedSlipData = useMemo(() => {
        return filteredSlips.filter(s => selectedSlips.includes(s.id));
    }, [selectedSlips, filteredSlips]);

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
    
    const handlePrintAction = (slips: MerchantSlip[]) => {
        if (slips.length === 0) return;
        setPdfToPrint(slips);
    };
    
    useEffect(() => {
        if (!pdfToPrint) return;
        startTransition(() => {
            toast({ title: "جاري تجهيز ملف PDF...", description: `سيتم طباعة ${pdfToPrint.length} كشوفات.` });
            const reportsLogo = settings.login.reportsLogo || settings.login.headerLogo;
            generateMerchantSlipPdf(pdfToPrint, users, reportsLogo).then(pdfDoc => {
                pdfDoc.open();
                setPdfToPrint(null);
            }).catch(e => {
                console.error("PDF generation error:", e);
                toast({ variant: 'destructive', title: 'فشل إنشاء PDF', description: 'حدث خطأ أثناء تجهيز الملف.' });
                setPdfToPrint(null);
            });
        });
    }, [pdfToPrint, settings.login, users, toast]);

    const handleSendWhatsApp = () => {
        if (selectedSlipData.length === 0) return;
        selectedSlipData.forEach(slip => {
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
        if (selectedSlipData.length === 0) {
            toast({ variant: 'destructive', title: 'لم يتم تحديد كشوفات', description: 'الرجاء تحديد كشف واحد على الأقل للتصدير.' });
            return;
        }

        const data = selectedSlipData.flatMap(slip => 
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
                    <CardTitle>كشوفات إرجاع الشحنات إلى التجار</CardTitle>
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
                                 <DropdownMenuItem onSelect={() => handlePrintAction(selectedSlipData)} disabled={isPending}>
                                    <Icon name="Printer" className="ml-2 h-4 w-4" />
                                    طباعة المحدد (PDF)
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onSelect={handleExport}>
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
                                <TableHead className="border-l text-center whitespace-nowrap">التاجر</TableHead>
                                <TableHead className="border-l text-center whitespace-nowrap">تاريخ الإنشاء</TableHead>
                                <TableHead className="border-l text-center whitespace-nowrap">عدد الشحنات</TableHead>
                                <TableHead className="border-l text-center whitespace-nowrap">الحالة</TableHead>
                                <TableHead className="text-center whitespace-nowrap">إجراءات</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredSlips.length === 0 ? (
                                <TableRow><TableCell colSpan={7} className="h-24 text-center">لا توجد كشوفات تطابق الفلترة.</TableCell></TableRow>
                            ) : (
                                filteredSlips.map(slip => (
                                <TableRow key={slip.id} data-state={selectedSlips.includes(slip.id) ? "selected" : "unselected"}>
                                     <TableCell className="border-l text-center"><Checkbox checked={selectedSlips.includes(slip.id)} onCheckedChange={(checked) => setSelectedSlips(p => checked ? [...p, slip.id] : p.filter(id => id !== slip.id))} /></TableCell>
                                    <TableCell className="font-mono border-l text-center whitespace-nowrap"><Link href={`/dashboard/returns/slips/${slip.id}`} className="text-primary hover:underline">{slip.id}</Link></TableCell>
                                    <TableCell className="border-l text-center whitespace-nowrap">{slip.merchant}</TableCell>
                                    <TableCell className="border-l text-center whitespace-nowrap">{slip.date}</TableCell>
                                    <TableCell className="border-l text-center whitespace-nowrap">{slip.items}</TableCell>
                                    <TableCell className="border-l text-center whitespace-nowrap">
                                        <Badge variant={slip.status === 'تم التسليم' ? 'default' : 'outline'} className={slip.status === 'تم التسليم' ? 'bg-green-100 text-green-800' : ''}>
                                            {slip.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-left flex gap-2 justify-center whitespace-nowrap">
                                        <Button variant="outline" size="sm" onClick={() => handleShowDetails(slip)}><Icon name="Eye" className="ml-2 h-4 w-4" /> عرض</Button>
                                        {slip.status === 'جاهز للتسليم' && (
                                            <Button size="sm" onClick={() => confirmSlipDelivery(slip.id)}><Icon name="Check" className="ml-2 h-4 w-4" /> تأكيد التسليم</Button>
                                        )}
                                        <Button variant="ghost" size="icon" onClick={() => handlePrintAction([slip])} disabled={isPending}><Icon name="Printer" className="h-4 w-4" /></Button>
                                    </TableCell>
                                </TableRow>
                            ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>تفاصيل كشف الإرجاع {currentSlip?.id}</DialogTitle>
                    </DialogHeader>
                    <div className="max-h-[60vh] overflow-y-auto">
                        <Table>
                             <TableHeader>
                                <TableRow>
                                    <TableHead>رقم الطلب</TableHead>
                                    <TableHead>سبب الإرجاع</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentSlip?.orders.map(o => (
                                    <TableRow key={o.id}>
                                        <TableCell>{o.id}</TableCell>
                                        <TableCell><Badge variant="secondary">{o.previousStatus || o.status}</Badge></TableCell>
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
```
</change>
<change>
<file>/package.json</file>
<content><![CDATA[
{
  "name": "nextn",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "generate-vfs": "ts-node scripts/generate-vfs.ts"
  },
  "dependencies": {
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/modifiers": "^7.0.0",
    "@dnd-kit/sortable": "^8.0.0",
    "@fortawesome/fontawesome-svg-core": "^6.5.2",
    "@fortawesome/free-solid-svg-icons": "^6.5.2",
    "@fortawesome/react-fontawesome": "^0.2.2",
    "@genkit-ai/googleai": "^1.14.1",
    "@genkit-ai/next": "^1.14.1",
    "@hookform/resolvers": "^4.1.3",
    "@radix-ui/react-accordion": "^1.2.3",
    "@radix-ui/react-alert-dialog": "^1.1.6",
    "@radix-ui/react-avatar": "^1.1.3",
    "@radix-ui/react-checkbox": "^1.1.4",
    "@radix-ui/react-collapsible": "^1.1.11",
    "@radix-ui/react-dialog": "^1.1.6",
    "@radix-ui/react-dropdown-menu": "^2.1.6",
    "@radix-ui/react-label": "^2.1.2",
    "@radix-ui/react-menubar": "^1.1.6",
    "@radix-ui/react-popover": "^1.1.6",
    "@radix-ui/react-progress": "^1.1.2",
    "@radix-ui/react-radio-group": "^1.2.3",
    "@radix-ui/react-scroll-area": "^1.2.3",
    "@radix-ui/react-select": "^2.1.6",
    "@radix-ui/react-separator": "^1.1.2",
    "@radix-ui/react-slider": "^1.2.3",
    "@radix-ui/react-slot": "^1.2.3",
    "@radix-ui/react-switch": "^1.1.3",
    "@radix-ui/react-tabs": "^1.1.3",
    "@radix-ui/react-toast": "^1.2.6",
    "@radix-ui/react-tooltip": "^1.1.8",
    "bwip-js": "^4.3.2",
    "chroma-js": "^2.4.2",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.0.0",
    "date-fns": "^3.6.0",
    "dotenv": "^16.5.0",
    "embla-carousel-react": "^8.6.0",
    "firebase": "^11.9.1",
    "fs-extra": "^11.2.0",
    "genkit": "^1.14.1",
    "html-to-text": "^9.0.5",
    "html2canvas": "^1.4.1",
    "immer": "^10.1.1",
    "jspdf": "^2.5.1",
    "leaflet": "^1.9.4",
    "leaflet-routing-machine": "^3.2.12",
    "leaflet.markercluster": "^1.5.3",
    "lucide-react": "^0.475.0",
    "nanoid": "^5.0.7",
    "next": "^15.5.2",
    "next-themes": "^0.3.0",
    "papaparse": "^5.3.14",
    "patch-package": "^8.0.0",
    "pdfmake": "^0.2.10",
    "react": "^18.3.1",
    "react-barcode": "^1.5.1",
    "react-csv": "^2.2.2",
    "react-day-picker": "^8.10.1",
    "react-dom": "^18.3.1",
    "react-feather": "^2.0.10",
    "react-hook-form": "^7.54.2",
    "react-leaflet": "^4.2.1",
    "react-rnd": "^10.4.1",
    "recharts": "^2.15.1",
    "tailwind-merge": "^3.0.1",
    "tailwindcss-animate": "^1.0.7",
    "ws": "^8.18.0",
    "zod": "^3.24.2",
    "zustand": "^4.5.2"
  },
  "devDependencies": {
    "@types/chroma-js": "^2.4.4",
    "@types/fs-extra": "^11.0.4",
    "@types/html-to-text": "^9.0.4",
    "@types/leaflet": "^1.9.12",
    "@types/leaflet-routing-machine": "^3.2.8",
    "@types/leaflet.markercluster": "^1.5.4",
    "@types/nanoid": "^3.0.0",
    "@types/node": "^20",
    "@types/papaparse": "^5.3.14",
    "@types/pdfmake": "^0.2.9",
    "@types/react": "^18",
    "@types/react-csv": "^1.1.10",
    "@types/react-dom": "^18",
    "@types/react-leaflet": "^3.0.0",
    "@types/react-rnd": "^8.0.0",
    "@types/ws": "^8.5.11",
    "genkit-cli": "^1.14.1",
    "postcss": "^8",
    "sass": "^1.77.8",
    "tailwindcss": "^3.4.1",
    "typescript": "^5",
    "ts-node": "^10.9.2"
  },
  "packageManager": "yarn@1.22.22+sha512.a6b2f7906b721bba3d67d4aff083df04dad64c399707841b7acf00f6b133b7ac24255f2652fa22ae3534329dc6180534e98d17432037ff6fd140556e2bb3137e"
}
```
</change>
<change>
<file>/src/app/dashboard/returns/page.tsx</file>
<content><![CDATA[

'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import Icon from '@/components/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReceiveFromDrivers } from '@/components/returns/receive-from-drivers';
import { DriverSlips } from '@/components/returns/driver-slips';
import { PrepareForMerchants } from '@/components/returns/prepare-for-merchants';
import { MerchantSlips } from '@/components/returns/merchant-slips';
import { useReturnsStore } from '@/store/returns-store';
import { useUsersStore } from '@/store/user-store';
import { useSettings } from '@/contexts/SettingsContext';

export default function ReturnsPage() {
  const { driverSlips, merchantSlips } = useReturnsStore();
  const { users } = useUsersStore();
  const { settings } = useSettings();
  const reportsLogo = settings.login.reportsLogo || settings.login.headerLogo;
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold">
            <Icon name="Undo2" />
            إدارة المرتجعات
          </CardTitle>
          <CardDescription>
            استلام الشحنات الراجعة من السائقين وتجهيزها في كشوفات لإعادتها إلى التجار.
          </CardDescription>
        </CardHeader>
      </Card>
      
      <Tabs defaultValue="receive-from-drivers" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
           <TabsTrigger value="merchant-slips">
            <Icon name="ClipboardList" className="ml-2 h-4 w-4" />
            كشوفات إرجاع التجار
          </TabsTrigger>
           <TabsTrigger value="prepare-for-merchants">
            <Icon name="Package" className="ml-2 h-4 w-4" />
            تجهيز مرتجعات التجار
          </TabsTrigger>
          <TabsTrigger value="driver-slips">
            <Icon name="History" className="ml-2 h-4 w-4" />
            كشوفات استلام السائقين
          </TabsTrigger>
          <TabsTrigger value="receive-from-drivers">
            <Icon name="Truck" className="ml-2 h-4 w-4" />
            استلام من السائقين
          </TabsTrigger>
        </TabsList>
        <TabsContent value="receive-from-drivers" className="mt-6">
          <ReceiveFromDrivers />
        </TabsContent>
        <TabsContent value="driver-slips" className="mt-6">
          <DriverSlips />
        </TabsContent>
        <TabsContent value="prepare-for-merchants" className="mt-6">
          <PrepareForMerchants />
        </TabsContent>
        <TabsContent value="merchant-slips" className="mt-6">
          <MerchantSlips />
        </TabsContent>
      </Tabs>
    </div>
  );
}
