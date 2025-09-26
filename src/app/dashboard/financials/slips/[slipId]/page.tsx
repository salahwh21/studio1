
'use client';

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useFinancialsStore, type DriverPaymentSlip } from '@/store/financials-store';
import { useSettings } from '@/contexts/SettingsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Icon from '@/components/icon';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useOrdersStore } from '@/store/orders-store';


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


export default function FinancialSlipDetailPage() {
    const router = useRouter();
    const params = useParams();
    const { slipId } = params;
    
    const { driverPaymentSlips, removeOrderFromDriverPaymentSlip } = useFinancialsStore();
    const { updateOrderField } = useOrdersStore();
    const { formatCurrency, settings } = useSettings();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const [slip, setSlip] = useState<DriverPaymentSlip | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const foundSlip = driverPaymentSlips.find(s => s.id === slipId);
        setSlip(foundSlip || null);
        setIsLoading(false);
    }, [slipId, driverPaymentSlips]);

    const handlePrint = async () => {
        if (!slip) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            toast({ variant: 'destructive', title: 'فشل الطباعة', description: 'يرجى السماح بفتح النوافذ المنبثقة.' });
            return;
        }

        const title = `كشف تحصيل من السائق: ${slip.driverName}`;
        
        const tableHeader = `
            <thead>
                <tr>
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">#</th>
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">رقم الطلب</th>
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">المستلم</th>
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">قيمة التحصيل</th>
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">أجرة السائق</th>
                </tr>
            </thead>
        `;
        const tableRows = slip.orders.map((order, index) => `
            <tr>
                <td style="padding: 8px; border: 1px solid #ddd;">${index + 1}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${order.id}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${order.recipient}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${formatCurrency(order.cod)}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${formatCurrency(order.driverFee)}</td>
            </tr>
        `).join('');

        const logoUrl = settings.login.reportsLogo || settings.login.headerLogo;

        const content = `
            <html>
                <head>
                    <title>${title}</title>
                    <style>
                        body { direction: rtl; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
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
                            <p>التاريخ: ${new Date(slip.date).toLocaleDateString('ar-EG')}</p>
                            <p>رقم الكشف: ${slip.id}</p>
                        </div>
                    </div>
                    <table>${tableHeader}<tbody>${tableRows}</tbody></table>
                    <div class="signatures">
                        <div class="signature">توقيع المستلم (المحاسب)</div>
                        <div class="signature">توقيع السائق</div>
                    </div>
                </body>
            </html>
        `;

        printWindow.document.write(content);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    };

    const handleRemoveOrder = (orderId: string) => {
        if (!slip) return;
        
        removeOrderFromDriverPaymentSlip(slip.id, orderId);
        // This status should be whatever status indicates it's ready for collection again.
        updateOrderField(orderId, 'status', 'تم التوصيل'); 
        
        const updatedSlip = useFinancialsStore.getState().driverPaymentSlips.find(s => s.id === slipId);
        setSlip(updatedSlip || null);
        toast({ title: "تم", description: "تمت إعادة الطلب إلى قائمة التحصيلات."});
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
                        <Link href="/dashboard/financials">العودة للسجل المالي</Link>
                    </Button>
                </CardContent>
            </Card>
        )
    }

    const totalCOD = slip.orders.reduce((acc, order) => acc + (order.cod || 0), 0);
    const totalDriverFare = slip.orders.reduce((acc, order) => acc + (order.driverFee || 0), 0);
    const netTotal = totalCOD - totalDriverFare;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-2xl font-bold flex items-center gap-3">
                            <Icon name="FileText" />
                            تفاصيل كشف تحصيل مالي
                        </CardTitle>
                        <CardDescription className="mt-2 font-mono text-base">{slip.id}</CardDescription>
                    </div>
                     <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={handlePrint} disabled={isPending}>
                            <Icon name={isPending ? "Loader2" : "Printer"} className={cn("ml-2 h-4 w-4", { "animate-spin": isPending })} />
                            طباعة
                        </Button>
                        <Button variant="outline" size="icon" asChild>
                            <Link href="/dashboard/financials">
                                <Icon name="ArrowLeft" className="h-4 w-4" />
                            </Link>
                        </Button>
                     </div>
                </CardHeader>
                <CardContent>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="p-3 bg-muted rounded-md space-y-1">
                            <p className="text-muted-foreground">السائق</p>
                            <p className="font-semibold">{slip.driverName}</p>
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
                            <p className="text-muted-foreground">إجمالي قيمة التحصيل</p>
                            <p className="font-semibold">{formatCurrency(totalCOD)}</p>
                        </div>
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
                                <TableHead className="border-l">#</TableHead>
                                <TableHead className="border-l">رقم الطلب</TableHead>
                                <TableHead className="border-l">المستلم</TableHead>
                                <TableHead className="border-l">قيمة التحصيل</TableHead>
                                <TableHead className="border-l">أجرة السائق</TableHead>
                                <TableHead className="border-l">الحالة</TableHead>
                                <TableHead className="text-center">إجراء</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {slip.orders.map((order, index) => (
                                <TableRow key={order.id}>
                                    <TableCell className="border-l">{index + 1}</TableCell>
                                    <TableCell className="border-l">
                                        <Link href={`/dashboard/orders/${order.id}`} className="font-mono text-primary hover:underline">{order.id}</Link>
                                    </TableCell>
                                    <TableCell className="border-l">{order.recipient}</TableCell>
                                    <TableCell className="border-l">{formatCurrency(order.cod)}</TableCell>
                                    <TableCell className="border-l">{formatCurrency(order.driverFee)}</TableCell>
                                    <TableCell className="border-l"><Badge variant="secondary">{order.status}</Badge></TableCell>
                                    <TableCell className="text-center">
                                        <Button variant="ghost" size="icon" onClick={() => handleRemoveOrder(order.id)}>
                                            <Icon name="Trash2" className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        <TableFooter>
                            <TableRow className="bg-muted/50 font-bold">
                                <TableCell colSpan={3} className="border-l">الإجمالي</TableCell>
                                <TableCell className="border-l">{formatCurrency(totalCOD)}</TableCell>
                                <TableCell className="border-l">{formatCurrency(totalDriverFare)}</TableCell>
                                <TableCell colSpan={2} className="text-lg text-primary">{formatCurrency(netTotal)}</TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )

}
