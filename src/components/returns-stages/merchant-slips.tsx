
      'use client';
import React, { useState, useMemo, useTransition } from 'react';
import { useReturnsStore, type MerchantSlip } from '@/store/returns-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/icon';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { parseISO, isWithinInterval, format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/contexts/SettingsContext';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import Papa from 'papaparse';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useUsersStore } from '@/store/user-store';
import { generatePdf } from '@/lib/pdf-utils';

export const MerchantSlips = () => {
    const { toast } = useToast();
    const { settings } = useSettings();
    const { users } = useUsersStore();
    const { merchantSlips, updateMerchantSlipStatus } = useReturnsStore();
    const [isPending, startTransition] = useTransition();

    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const [currentSlip, setCurrentSlip] = useState<MerchantSlip | null>(null);
    const [selectedSlips, setSelectedSlips] = useState<string[]>([]);
    
    const [filterMerchant, setFilterMerchant] = useState<string | null>(null);
    const [filterDate, setFilterDate] = useState<Date | undefined>(undefined);
    const [filterStatus, setFilterStatus] = useState<string | null>(null);

    const merchants = useMemo(() => Array.from(new Set(merchantSlips.map(s => s.merchant))), [merchantSlips]);
    const statuses = useMemo(() => Array.from(new Set(merchantSlips.map(s => s.status))), [merchantSlips]);

    const filteredSlips = useMemo(() => merchantSlips.filter(slip => {
        let matchesMerchant = filterMerchant ? slip.merchant === filterMerchant : true;
        let matchesDate = true;
        if (filterDate) {
            try {
                const slipDate = parseISO(slip.date);
                const filterDateStart = new Date(filterDate.setHours(0, 0, 0, 0));
                const filterDateEnd = new Date(filterDate.setHours(23, 59, 59, 999));
                matchesDate = isWithinInterval(slipDate, { start: filterDateStart, end: filterDateEnd });
            } catch(e) { matchesDate = false; }
        }
        let matchesStatus = filterStatus ? slip.status === filterStatus : true;
        return matchesMerchant && matchesDate && matchesStatus;
    }), [merchantSlips, filterMerchant, filterDate, filterStatus]);
    
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

    const handlePrintAction = (slipsToPrint: MerchantSlip[]) => {
        startTransition(async () => {
            if (slipsToPrint.length === 0) return;
            toast({ title: "جاري تجهيز ملف PDF...", description: `سيتم طباعة ${slipsToPrint.length} كشف.` });
            
            const content = slipsToPrint.map((slip, index) => {
                const slipContent = [
                    { text: `كشف إرجاع بضاعة: ${slip.merchant}`, style: 'header', alignment: 'center' },
                    { text: `تاريخ: ${new Date(slip.date).toLocaleDateString('ar-EG')}`, style: 'subheader', alignment: 'center' },
                    { text: `رقم الكشف: ${slip.id}`, style: 'subheader', alignment: 'center' },
                    { text: '\n' },
                    {
                        style: 'table',
                        table: {
                            headerRows: 1,
                            widths: ['*', 'auto', 'auto', 'auto'],
                            body: [
                                ['سبب الإرجاع', 'الهاتف', 'المستلم', 'رقم الطلب'].reverse(),
                                ...slip.orders.map(order => [
                                    order.previousStatus || order.status,
                                    order.phone,
                                    order.recipient,
                                    order.id,
                                ].reverse()),
                            ]
                        }
                    },
                    { text: `\n\n\n` },
                    { text: 'توقيع المستلم: .........................', style: 'signature' }
                ];
                if (index < slipsToPrint.length - 1) {
                    // @ts-ignore
                    slipContent.push({ text: '', pageBreak: 'after' });
                }
                return slipContent;
            }).flat();

            const logo = settings.login.reportsLogo || settings.login.headerLogo;

            try {
                await generatePdf(content, logo);
            } catch (e: any) {
                console.error("PDF generation error:", e);
                toast({ variant: 'destructive', title: 'فشل إنشاء PDF', description: e.message || 'حدث خطأ أثناء تجهيز الملف.' });
            }
        });
    };

    const handleSendWhatsApp = () => {
        if (selectedSlipData.length === 0) return;
        selectedSlipData.forEach(slip => {
            const user = users.find(u => u.storeName === slip.merchant);
            if(user?.whatsapp) {
                const message = `مرحباً ${slip.merchant}, تم تجهيز كشف المرتجعات الخاص بكم رقم ${slip.id} وهو جاهز للاستلام.`;
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
    
    const handleShowDetails = (slip: MerchantSlip) => {
        setCurrentSlip(slip);
        setShowDetailsDialog(true);
    };

    return (
        <div className="space-y-6">
            <Card>
                 <CardHeader>
                    <CardTitle>كشوفات إرجاع الشحنات للتجار</CardTitle>
                    <CardDescription>عرض وتأكيد تسليم الكشوفات النهائية للتجار.</CardDescription>
                    <div className="flex flex-col sm:flex-row items-center gap-2 pt-4">
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="gap-1.5 w-full sm:w-auto" disabled={selectedSlips.length === 0}>
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
                        <TableHeader><TableRow><TableHead className="w-12 border-l text-center"><Checkbox onCheckedChange={handleSelectAll} checked={areAllSelected}/></TableHead><TableHead className="border-l text-center whitespace-nowrap">رقم الكشف</TableHead><TableHead className="border-l text-center whitespace-nowrap">التاجر</TableHead><TableHead className="border-l text-center whitespace-nowrap">تاريخ الإنشاء</TableHead><TableHead className="border-l text-center whitespace-nowrap">عدد الشحنات</TableHead><TableHead className="border-l text-center whitespace-nowrap">الحالة</TableHead><TableHead className="text-center whitespace-nowrap">إجراءات</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {filteredSlips.length === 0 ? (
                                <TableRow><TableCell colSpan={7} className="h-24 text-center">لا توجد كشوفات.</TableCell></TableRow>
                            ) : (
                                filteredSlips.map(slip => (
                                <TableRow key={slip.id} data-state={selectedSlips.includes(slip.id) ? "selected" : "unselected"}>
                                    <TableCell className="border-l text-center"><Checkbox checked={selectedSlips.includes(slip.id)} onCheckedChange={(checked) => setSelectedSlips(p => checked ? [...p, slip.id] : p.filter(id => id !== slip.id))} /></TableCell>
                                    <TableCell className="font-mono border-l text-center whitespace-nowrap">
                                        <Link href={`/dashboard/returns/slips/${slip.id}`} className="text-primary hover:underline">{slip.id}</Link>
                                    </TableCell>
                                    <TableCell className="border-l text-center whitespace-nowrap">{slip.merchant}</TableCell>
                                    <TableCell className="border-l text-center whitespace-nowrap">{new Date(slip.date).toLocaleDateString('ar-EG')}</TableCell>
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
                                        <Button variant="ghost" size="icon" onClick={() => handlePrintAction([slip])} disabled={isPending}><Icon name={isPending ? "Loader2" : "Printer"} className={cn("h-4 w-4", {"animate-spin": isPending})} /></Button>
                                    </TableCell>
                                </TableRow>
                            ))
                            )}
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

    