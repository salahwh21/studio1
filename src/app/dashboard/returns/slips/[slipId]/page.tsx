'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { useReturnsStore, type DriverSlip, type MerchantSlip } from '@/store/returns-store';
import { useSettings } from '@/contexts/SettingsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Icon from '@/components/icon';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { amiriFont } from '@/lib/amiri-font';

declare module 'jspdf' {
    interface jsPDF {
        autoTable: (options: any) => jsPDF;
    }
}


const SlipDetailPageSkeleton = () => (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-48 mt-2" />
            </CardHeader>
        </Card>
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </CardContent>
        </Card>
    </div>
);


export default function SlipDetailPage() {
    const router = useRouter();
    const params = useParams();
    const { slipId } = params;
    
    const { driverSlips, merchantSlips } = useReturnsStore();
    const { formatCurrency, settings } = useSettings();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const [slip, setSlip] = useState<DriverSlip | MerchantSlip | null>(null);
    const [slipType, setSlipType] = useState<'driver' | 'merchant' | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let foundSlip: DriverSlip | MerchantSlip | null = null;
        let type: 'driver' | 'merchant' | null = null;

        foundSlip = driverSlips.find(s => s.id === slipId) as DriverSlip;
        if (foundSlip) {
            type = 'driver';
        } else {
            foundSlip = merchantSlips.find(s => s.id === slipId) as MerchantSlip;
            if (foundSlip) {
                type = 'merchant';
            }
        }
        
        setSlip(foundSlip);
        setSlipType(type);
        setIsLoading(false);

    }, [slipId, driverSlips, merchantSlips]);

    const handlePrint = async () => {
        if (!slip) return;
        startTransition(() => {
            toast({ title: 'جاري تحضير الكشف للطباعة...' });

            try {
                const doc = new jsPDF();
            
                doc.addFileToVFS('Amiri-Regular.ttf', amiriFont);
                doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
                doc.setFont('Amiri');
                
                doc.setRTL(true);

                const title = slipType === 'driver' ? `كشف استلام من السائق` : `كشف إرجاع للتاجر`;
                const partyName = slipType === 'driver' ? (slip as DriverSlip).driverName : (slip as MerchantSlip).merchant;
                const partyType = slipType === 'driver' ? 'السائق' : 'التاجر';
                
                const reportsLogo = settings.login.reportsLogo || settings.login.headerLogo;
                if (reportsLogo) {
                    try {
                        doc.addImage(reportsLogo, 'PNG', 15, 10, 30, 10);
                    } catch (e) {
                        console.error("Error adding logo to PDF:", e);
                    }
                }

                doc.setFontSize(18);
                doc.text(title, doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
                
                doc.setFontSize(12);
                doc.text(`${partyType}: ${partyName}`, doc.internal.pageSize.getWidth() - 15, 30, { align: 'right' });
                doc.text(`التاريخ: ${new Date(slip.date).toLocaleDateString('ar-EG')}`, doc.internal.pageSize.getWidth() - 15, 40, { align: 'right' });
                doc.text(`رقم الكشف: ${slip.id}`, 15, 30, { align: 'left' });
            
                const tableColumn = ["#", "رقم الطلب", "المستلم", "الهاتف", "سبب الإرجاع", "المبلغ"].reverse();
                const tableRows = slip.orders.map((order, index) => [
                    index + 1,
                    order.id,
                    order.recipient,
                    order.phone,
                    order.previousStatus || order.status,
                    formatCurrency(order.cod),
                ].reverse());

                (doc as any).autoTable({
                    head: [tableColumn],
                    body: tableRows,
                    startY: 50,
                    theme: 'grid',
                    styles: { font: 'Amiri', halign: 'right' },
                    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
                });

                const finalY = (doc as any).autoTable.previous.finalY;
                doc.setFontSize(10);
                doc.text('توقيع المستلم: .........................', doc.internal.pageSize.getWidth() - 15, finalY + 20, { align: 'right' });
                doc.text('توقيع مندوب الوميض: .........................', 15, finalY + 20, { align: 'left' });

                doc.save(`${slip.id}.pdf`);
                 toast({ title: 'تم تجهيز الملف', description: 'بدأ تحميل ملف الـ PDF.' });
            } catch (error: any) {
                console.error("PDF generation error:", error);
                toast({
                    variant: 'destructive',
                    title: 'فشل في إنشاء PDF',
                    description: error.message || 'حدث خطأ غير متوقع أثناء إنشاء الملف.'
                });
            }
        });
    };

    if (isLoading) {
        return <SlipDetailPageSkeleton />;
    }

    if (!slip) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>الكشف غير موجود</CardTitle>
                    <CardDescription>لم نتمكن من العثور على الكشف المطلوب. قد يكون قد تم حذفه.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <Link href="/dashboard/returns">العودة للمرتجعات</Link>
                    </Button>
                </CardContent>
            </Card>
        )
    }

    const title = slipType === 'driver' ? `تفاصيل كشف استلام من السائق` : `تفاصيل كشف إرجاع للتاجر`;
    const partyName = slipType === 'driver' ? (slip as DriverSlip).driverName : (slip as MerchantSlip).merchant;
    const partyType = slipType === 'driver' ? 'السائق' : 'التاجر';
    const totalCOD = slip.orders.reduce((acc, order) => acc + (order.cod || 0), 0);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-2xl font-bold flex items-center gap-3">
                            <Icon name="FileText" />
                            {title}
                        </CardTitle>
                        <CardDescription className="mt-2 font-mono text-base">{slip.id}</CardDescription>
                    </div>
                     <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={handlePrint} disabled={isPending}>
                            <Icon name={isPending ? "Loader2" : "Printer"} className={cn("ml-2 h-4 w-4", { "animate-spin": isPending })} />
                            طباعة
                        </Button>
                        <Button variant="outline" size="icon" asChild>
                            <Link href="/dashboard/returns">
                                <Icon name="ArrowLeft" className="h-4 w-4" />
                            </Link>
                        </Button>
                     </div>
                </CardHeader>
                <CardContent>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="p-3 bg-muted rounded-md space-y-1">
                            <p className="text-muted-foreground">{partyType}</p>
                            <p className="font-semibold">{partyName}</p>
                        </div>
                        <div className="p-3 bg-muted rounded-md space-y-1">
                            <p className="text-muted-foreground">تاريخ الإنشاء</p>
                            <p className="font-semibold">{new Date(slip.date).toLocaleDateString('ar-EG')}</p>
                        </div>
                        <div className="p-3 bg-muted rounded-md space-y-1">
                            <p className="text-muted-foreground">عدد الطلبات</p>
                            <p className="font-semibold">{slip.orders.length}</p>
                        </div>
                        <div className="p-3 bg-muted rounded-md space-y-1">
                            <p className="text-muted-foreground">إجمالي قيمة المرتجعات</p>
                            <p className="font-semibold">{formatCurrency(totalCOD)}</p>
                        </div>
                         {slipType === 'merchant' && (
                             <div className="p-3 bg-muted rounded-md space-y-1">
                                <p className="text-muted-foreground">الحالة</p>
                                <p className="font-semibold">
                                    <Badge variant={(slip as MerchantSlip).status === 'تم التسليم' ? 'default' : 'outline'} className={(slip as MerchantSlip).status === 'تم التسليم' ? 'bg-green-100 text-green-800' : ''}>
                                        {(slip as MerchantSlip).status}
                                    </Badge>
                                </p>
                            </div>
                         )}
                     </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>الطلبات المدرجة في الكشف</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead>رقم الطلب</TableHead>
                                <TableHead>المستلم</TableHead>
                                <TableHead>الهاتف</TableHead>
                                <TableHead>قيمة التحصيل</TableHead>
                                <TableHead>سبب الإرجاع</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {slip.orders.map((order, index) => (
                                <TableRow key={order.id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>
                                        <Link href={`/dashboard/orders/${order.id}`} className="font-mono text-primary hover:underline">{order.id}</Link>
                                    </TableCell>
                                    <TableCell>{order.recipient}</TableCell>
                                    <TableCell>{order.phone}</TableCell>
                                    <TableCell>{formatCurrency(order.cod)}</TableCell>
                                    <TableCell><Badge variant="secondary">{order.previousStatus || order.status}</Badge></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )

}