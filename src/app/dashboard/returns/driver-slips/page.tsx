'use client';
import { useState, useMemo, useTransition } from 'react';
import { useReturnsStore, type DriverSlip } from '@/store/returns-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/icon';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { parseISO, isWithinInterval, format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/contexts/SettingsContext';
import { PDFDocument } from 'pdf-lib';
import Link from 'next/link';
import { generateSlipPdfAction } from '@/app/actions/generate-slip-pdf';

export default function DriverSlipsPage() {
    const { toast } = useToast();
    const { settings } = useSettings();
    const { driverSlips } = useReturnsStore();
    const [isPending, startTransition] = useTransition();

    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const [currentSlip, setCurrentSlip] = useState<DriverSlip | null>(null);
    
    const [filterDriver, setFilterDriver] = useState<string | null>(null);
    const [filterStartDate, setFilterStartDate] = useState<Date | null>(null);
    const [filterEndDate, setFilterEndDate] = useState<Date | null>(null);

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
    
    const handleShowDetails = (slip: DriverSlip) => {
        setCurrentSlip(slip);
        setShowDetailsDialog(true);
    };
    
    const handlePrintAction = (slip: DriverSlip) => {
        startTransition(async () => {
            toast({ title: "جاري تجهيز ملف PDF...", description: `سيتم طباعة كشف السائق ${slip.driverName}.` });

            try {
                const reportsLogo = settings.login.reportsLogo || settings.login.headerLogo;
                const slipData = {
                    id: slip.id,
                    partyName: slip.driverName,
                    partyLabel: 'اسم السائق',
                    date: slip.date,
                    branch: 'الفرع الرئيسي',
                    orders: slip.orders.map(o => ({
                        id: o.id, recipient: o.recipient, phone: o.phone, city: o.city, address: o.address,
                        previousStatus: o.previousStatus || o.status || 'غير محدد',
                        itemPrice: o.itemPrice || 0,
                    })),
                    total: slip.orders.reduce((sum, o) => sum + (o.itemPrice || 0), 0),
                };

                const result = await generateSlipPdfAction({ slipData, reportsLogo, isDriver: true });
                
                if (result.success && result.data) {
                    if (typeof window !== 'undefined') {
                        const blob = new Blob([Buffer.from(result.data, 'base64')], { type: 'application/pdf' });
                        const url = URL.createObjectURL(blob);
                        window.open(url, '_blank');
                    }
                } else {
                    throw new Error(result.error || `فشل إنشاء PDF للكشف ${slip.id}`);
                }
            } catch (e: any) {
                console.error("PDF generation error:", e);
                toast({ variant: 'destructive', title: 'فشل إنشاء PDF', description: e.message || 'حدث خطأ أثناء تجهيز الملف.' });
            }
        });
    };

    return (
        <div className="space-y-6">
            <Card>
                 <CardHeader>
                    <CardTitle>كشوفات استلام المرتجعات من السائقين</CardTitle>
                    <CardDescription>عرض وطباعة كشوفات استلام المرتجعات السابقة.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader><TableRow><TableHead>رقم الكشف</TableHead><TableHead>اسم السائق</TableHead><TableHead>تاريخ الإنشاء</TableHead><TableHead>عدد الشحنات</TableHead><TableHead>إجراءات</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {filteredSlips.map(slip => (
                                <TableRow key={slip.id}>
                                    <TableCell><Link href={`/dashboard/returns/slips/${slip.id}`} className="text-primary hover:underline">{slip.id}</Link></TableCell>
                                    <TableCell>{slip.driverName}</TableCell>
                                    <TableCell>{slip.date}</TableCell>
                                    <TableCell>{slip.itemCount}</TableCell>
                                    <TableCell className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => handleShowDetails(slip)}>عرض</Button>
                                        <Button size="sm" onClick={() => handlePrintAction(slip)} disabled={isPending}>طباعة</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
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
