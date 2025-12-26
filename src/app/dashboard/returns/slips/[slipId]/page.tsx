
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { useReturnsStore, type DriverReturnSlip, type MerchantSlip } from '@/store/returns-store';
import { useSettings } from '@/contexts/SettingsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Icon from '@/components/icon';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useOrdersStore } from '@/store/orders-store';
import { generatePdfViaBrowserPrint } from '@/services/pdf-service';


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

    const { driverReturnSlips, merchantSlips, removeOrderFromDriverReturnSlip, removeOrderFromMerchantSlip } = useReturnsStore();
    const { updateOrderField } = useOrdersStore();
    const { formatCurrency, formatDate, settings } = useSettings();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const [slip, setSlip] = useState<DriverReturnSlip | MerchantSlip | null>(null);
    const [slipType, setSlipType] = useState<'driver' | 'merchant' | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let foundSlip: DriverReturnSlip | MerchantSlip | undefined = driverReturnSlips.find(s => s.id === slipId);
        let type: 'driver' | 'merchant' | null = null;

        if (foundSlip) {
            type = 'driver';
        } else {
            foundSlip = merchantSlips.find(s => s.id === slipId);
            if (foundSlip) {
                type = 'merchant';
            }
        }

        setSlip(foundSlip || null);
        setSlipType(type);
        setIsLoading(false);

    }, [slipId, driverReturnSlips, merchantSlips]);

    const handlePrint = async () => {
        if (!slip) return;

        const title = slipType === 'driver' ? `كشف استلام من السائق: ${(slip as DriverReturnSlip).driverName}` : `كشف إرجاع للتاجر: ${(slip as MerchantSlip).merchant}`;
        const partyType = slipType === 'driver' ? 'السائق' : 'التاجر';

        const tableHeader = `
            <thead>
                <tr>
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">#</th>
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">رقم الطلب</th>
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">المستلم</th>
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">الهاتف</th>
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">سبب الإرجاع</th>
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">المبلغ</th>
                </tr>
            </thead>
        `;
        const tableRows = slip.orders.map((order, index) => `
            <tr>
                <td style="padding: 8px; border: 1px solid #ddd;">${index + 1}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${order.id}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${order.recipient}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${order.phone}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${order.previousStatus || order.status}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${formatCurrency(order.cod)}</td>
            </tr>
        `).join('');

        const logoUrl = settings.login.reportsLogo || settings.login.headerLogo;

        const html = `
            <!DOCTYPE html>
            <html dir="rtl" lang="ar">
                <head>
                    <meta charset="UTF-8">
                    <title>${title}</title>
                    <style>
                        body { direction: rtl; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; }
                        table { width: 100%; border-collapse: collapse; }
                        th, td { padding: 8px; border: 1px solid #ddd; text-align: right; }
                        th { background-color: #f2f2f2; }
                        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                        .signatures { margin-top: 40px; display: flex; justify-content: space-between; }
                        .signature { border-top: 1px solid #000; padding-top: 5px; width: 200px; text-align: center; }
                    </style>
                </head>
                <body>
                     <div class="header">
                        ${logoUrl ? `<img src="${logoUrl}" alt="Logo" style="height: 50px;">` : `<h1>${settings.login.companyName || 'الشركة'}</h1>`}
                        <div>
                            <h2>${title}</h2>
                            <p>التاريخ: ${formatDate(slip.date, { longFormat: true })}</p>
                            <p>رقم الكشف: ${slip.id}</p>
                        </div>
                    </div>
                    <table>${tableHeader}<tbody>${tableRows}</tbody></table>
                    <div class="signatures">
                        <div class="signature">توقيع المستلم (${partyType})</div>
                        <div class="signature">توقيع مندوب الوميض</div>
                    </div>
                </body>
            </html>
        `;

        try {
            await generatePdfViaBrowserPrint(html, { filename: `slip-${slip.id}.pdf` });
            // لا حاجة لتحميل الملف لأن generatePdfViaBrowserPrint يتولى الطباعة مباشرة
            toast({ title: "تم التصدير", description: `تم تصدير كشف ${slip.id} بنجاح` });
        } catch (error) {
            console.error('PDF generation error:', error);
            toast({ variant: 'destructive', title: 'فشل التصدير', description: 'حدث خطأ أثناء إنشاء ملف PDF' });
        }
    };

    const handleRemoveOrder = (orderId: string) => {
        if (!slip) return;

        if (slipType === 'driver') {
            removeOrderFromDriverReturnSlip(slip.id, orderId);
            updateOrderField(orderId, 'status', 'مرتجع');
            // This is a trick to force re-render with updated data from the store
            const updatedSlip = useReturnsStore.getState().driverReturnSlips.find(s => s.id === slipId);
            setSlip(updatedSlip || null);
            toast({ title: "تم", description: "تمت إعادة الطلب إلى قائمة مرتجعات السائق." });
        } else if (slipType === 'merchant') {
            removeOrderFromMerchantSlip(slip.id, orderId);
            updateOrderField(orderId, 'status', 'مرجع للفرع');
            const updatedSlip = useReturnsStore.getState().merchantSlips.find(s => s.id === slipId);
            setSlip(updatedSlip || null);
            toast({ title: "تم", description: "تمت إعادة الطلب إلى قائمة المرتجعات بالفرع." });
        }
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
    const partyName = slipType === 'driver' ? (slip as DriverReturnSlip).driverName : (slip as MerchantSlip).merchant;
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
                            <Link href="/dashboard/settings/roles">
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
                            <p className="font-semibold">{formatDate(slip.date)}</p>
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
                                <TableHead className="text-center">إجراء</TableHead>
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
                                    <TableCell className="text-center">
                                        <Button variant="ghost" size="icon" onClick={() => handleRemoveOrder(order.id)}>
                                            <Icon name="Trash2" className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )

}
