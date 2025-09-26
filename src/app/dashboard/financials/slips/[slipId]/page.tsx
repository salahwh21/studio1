
'use client';

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useFinancialsStore, type DriverPaymentSlip, type MerchantPaymentSlip } from '@/store/financials-store';
import { useSettings } from '@/contexts/SettingsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Icon from '@/components/icon';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useOrdersStore, type Order } from '@/store/orders-store';
import { Input } from '@/components/ui/input';


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
    
    const { 
        driverPaymentSlips, removeOrderFromDriverPaymentSlip, updateOrderInDriverPaymentSlip,
        merchantPaymentSlips, removeOrderFromMerchantPaymentSlip, updateOrderInMerchantPaymentSlip
    } = useFinancialsStore();
    const { updateOrderField } = useOrdersStore();
    const { formatCurrency, settings } = useSettings();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const [slip, setSlip] = useState<DriverPaymentSlip | MerchantPaymentSlip | null>(null);
    const [slipType, setSlipType] = useState<'driver' | 'merchant' | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [adjustments, setAdjustments] = useState<Record<string, number>>({});

    useEffect(() => {
        let foundSlip: DriverPaymentSlip | MerchantPaymentSlip | undefined = driverPaymentSlips.find(s => s.id === slipId);
        let type: 'driver' | 'merchant' | null = null;

        if (foundSlip) {
            type = 'driver';
        } else {
            foundSlip = merchantPaymentSlips.find(s => s.id === slipId);
            if (foundSlip) {
                type = 'merchant';
            }
        }
        
        setSlip(foundSlip || null);
        setSlipType(type);
        setIsLoading(false);
    }, [slipId, driverPaymentSlips, merchantPaymentSlips]);

    const handlePrint = async () => {
        if (!slip) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            toast({ variant: 'destructive', title: 'فشل الطباعة', description: 'يرجى السماح بفتح النوافذ المنبثقة.' });
            return;
        }

        const isDriverSlip = slipType === 'driver';
        const title = isDriverSlip 
            ? `كشف تحصيل من السائق: ${(slip as DriverPaymentSlip).driverName}`
            : `كشف دفع للتاجر: ${(slip as MerchantPaymentSlip).merchantName}`;

        let tableHeader = '';
        if (isDriverSlip) {
            tableHeader = `
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
        } else {
            tableHeader = `
                <thead>
                    <tr>
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">#</th>
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">رقم الطلب</th>
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">المستلم</th>
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">قيمة التحصيل</th>
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">أجور التوصيل</th>
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">المستحق للتاجر</th>
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">تعديلات</th>
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">الصافي المستحق</th>
                    </tr>
                </thead>
            `;
        }

        const tableRows = slip.orders.map((order, index) => {
            if (isDriverSlip) {
                return `
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;">${index + 1}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${order.id}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${order.recipient}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${formatCurrency(order.cod)}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${formatCurrency(order.driverFee)}</td>
                    </tr>
                `;
            } else {
                const adjustment = adjustments[order.id] || 0;
                const netAmount = (order.itemPrice || 0) + adjustment;
                return `
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;">${index + 1}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${order.id}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${order.recipient}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${formatCurrency(order.cod)}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${formatCurrency(order.deliveryFee)}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${formatCurrency(order.itemPrice)}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${formatCurrency(adjustment)}</td>
                        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${formatCurrency(netAmount)}</td>
                    </tr>
                `;
            }
        }).join('');

        let tableFooter = '';
        if (isDriverSlip) {
            const totalCOD = slip.orders.reduce((acc, order) => acc + (order.cod || 0), 0);
            const totalDriverFare = slip.orders.reduce((acc, order) => acc + (order.driverFee || 0), 0);
            const netTotal = totalCOD - totalDriverFare;
             tableFooter = `
                <tfoot style="background-color: #f9f9f9; font-weight: bold;">
                    <tr>
                        <td colspan="3" style="padding: 8px; border: 1px solid #ddd; text-align: right;">الإجمالي</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${formatCurrency(totalCOD)}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${formatCurrency(totalDriverFare)}</td>
                    </tr>
                    <tr>
                        <td colspan="3" style="padding: 8px; border: 1px solid #ddd; text-align: right; font-size: 1.1em;">الصافي المطلوب من السائق</td>
                        <td colspan="2" style="padding: 8px; border: 1px solid #ddd; font-size: 1.1em;">${formatCurrency(netTotal)}</td>
                    </tr>
                </tfoot>
            `;
        } else {
             const totalItemPrice = slip.orders.reduce((sum, o) => sum + (o.itemPrice || 0), 0);
             const totalCod = slip.orders.reduce((sum, o) => sum + (o.cod || 0), 0);
             const totalDelivery = slip.orders.reduce((sum, o) => sum + (o.deliveryFee || 0), 0);
             const totalAdjustments = Object.values(adjustments).reduce((sum, adj) => sum + adj, 0);
             const totalNet = totalItemPrice + totalAdjustments;

             tableFooter = `
                <tfoot style="background-color: #f9f9f9; font-weight: bold;">
                    <tr>
                        <td colspan="3" style="padding: 8px; border: 1px solid #ddd; text-align: right;">الإجمالي</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${formatCurrency(totalCod)}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${formatCurrency(totalDelivery)}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${formatCurrency(totalItemPrice)}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${formatCurrency(totalAdjustments)}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${formatCurrency(totalNet)}</td>
                    </tr>
                </tfoot>
            `;
        }

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
                    <table>${tableHeader}<tbody>${tableRows}</tbody>${tableFooter}</table>
                    <div class="signatures">
                        <div class="signature">توقيع المستلم (المحاسب/التاجر)</div>
                        <div class="signature">توقيع السائق/الموظف</div>
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
        
        if (slipType === 'driver') {
            removeOrderFromDriverPaymentSlip(slip.id, orderId);
            updateOrderField(orderId, 'status', 'تم التوصيل'); 
            const updatedSlip = useFinancialsStore.getState().driverPaymentSlips.find(s => s.id === slipId);
            setSlip(updatedSlip || null);
            toast({ title: "تم", description: "تمت إعادة الطلب إلى قائمة التحصيلات."});
        } else {
            removeOrderFromMerchantPaymentSlip(slip.id, orderId);
            updateOrderField(orderId, 'status', 'تم استلام المال في الفرع'); 
            const updatedSlip = useFinancialsStore.getState().merchantPaymentSlips.find(s => s.id === slipId);
            setSlip(updatedSlip || null);
            toast({ title: "تم", description: "تمت إعادة الطلب إلى قائمة تجهيز الدفعات."});
        }
    };
    
    const handleFieldUpdate = (orderId: string, field: keyof Order, value: any) => {
        if (!slip) return;
        const updatedOrder = slip.orders.find(o => o.id === orderId);
        if (!updatedOrder) return;
        
        const newOrderData = { ...updatedOrder, [field]: value };
        
        const cod = field === 'cod' ? parseFloat(value) : (newOrderData.cod || 0);
        const deliveryFee = field === 'deliveryFee' ? parseFloat(value) : (newOrderData.deliveryFee || 0);
        const additionalCost = field === 'additionalCost' ? parseFloat(value) : (newOrderData.additionalCost || 0);
        newOrderData.itemPrice = cod - (deliveryFee + additionalCost);
        
        if (slipType === 'driver') {
            updateOrderInDriverPaymentSlip(slip.id, orderId, newOrderData);
        } else {
            updateOrderInMerchantPaymentSlip(slip.id, orderId, newOrderData);
        }

        setSlip(prev => {
            if (!prev) return null;
            return {
                ...prev,
                orders: prev.orders.map(o => o.id === orderId ? newOrderData : o)
            }
        });
    };

    const handleAdjustmentChange = (orderId: string, value: string) => {
        const numericValue = parseFloat(value) || 0;
        setAdjustments(prev => ({
            ...prev,
            [orderId]: numericValue,
        }));
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
    
    const isDriverSlip = slipType === 'driver';
    const slipTitle = isDriverSlip ? 'تفاصيل كشف تحصيل مالي' : 'تفاصيل كشف دفع للتاجر';
    const partyName = isDriverSlip ? (slip as DriverPaymentSlip).driverName : (slip as MerchantPaymentSlip).merchantName;
    const partyTypeLabel = isDriverSlip ? 'السائق' : 'التاجر';

    // Calculate totals
    const totalCOD = slip.orders.reduce((acc, order) => acc + (order.cod || 0), 0);
    const totalDriverFare = slip.orders.reduce((acc, order) => acc + (order.driverFee || 0), 0);
    const netTotalDriver = totalCOD - totalDriverFare;
    const totalItemPrice = slip.orders.reduce((acc, order) => acc + (order.itemPrice || 0), 0);
    const totalDeliveryFee = slip.orders.reduce((acc, order) => acc + (order.deliveryFee || 0), 0);
    const totalAdjustments = slip.orders.reduce((sum, o) => sum + (adjustments[o.id] || 0), 0);
    const totalNetMerchant = totalItemPrice + totalAdjustments;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-2xl font-bold flex items-center gap-3">
                            <Icon name="FileText" />
                            {slipTitle}
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
                            <p className="text-muted-foreground">{partyTypeLabel}</p>
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
                        {isDriverSlip && (
                             <div className="p-3 bg-muted rounded-md space-y-1">
                                <p className="text-muted-foreground">إجمالي قيمة التحصيل</p>
                                <p className="font-semibold">{formatCurrency(totalCOD)}</p>
                            </div>
                        )}
                        {!isDriverSlip && (
                              <div className="p-3 bg-muted rounded-md space-y-1">
                                <p className="text-muted-foreground">إجمالي المستحق للتاجر</p>
                                <p className="font-semibold">{formatCurrency(totalItemPrice)}</p>
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
                                <TableHead className="border-l">#</TableHead>
                                <TableHead className="border-l">رقم الطلب</TableHead>
                                <TableHead className="border-l">المستلم</TableHead>
                                {isDriverSlip ? (
                                    <>
                                        <TableHead className="border-l">قيمة التحصيل</TableHead>
                                        <TableHead className="border-l">أجرة السائق</TableHead>
                                    </>
                                ) : (
                                    <>
                                        <TableHead className="border-l">قيمة التحصيل</TableHead>
                                        <TableHead className="border-l">أجور التوصيل</TableHead>
                                        <TableHead className="border-l">المستحق للتاجر</TableHead>
                                        <TableHead className="border-l">تعديلات</TableHead>
                                        <TableHead className="border-l">الصافي</TableHead>
                                    </>
                                )}
                                <TableHead className="border-l">الحالة</TableHead>
                                <TableHead className="text-center">إجراء</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {slip.orders.map((order, index) => {
                                const adjustment = adjustments[order.id] || 0;
                                const netAmount = (order.itemPrice || 0) + adjustment;
                                return (
                                <TableRow key={order.id}>
                                    <TableCell className="border-l">{index + 1}</TableCell>
                                    <TableCell className="border-l">
                                        <Link href={`/dashboard/orders/${order.id}`} className="font-mono text-primary hover:underline">{order.id}</Link>
                                    </TableCell>
                                    <TableCell className="border-l">
                                        <Input defaultValue={order.recipient} onBlur={(e) => handleFieldUpdate(order.id, 'recipient', e.target.value)} className="h-8 border-0 bg-transparent focus-visible:ring-1"/>
                                    </TableCell>
                                    {isDriverSlip ? (
                                        <>
                                            <TableCell className="border-l"><Input type="number" defaultValue={order.cod} onBlur={(e) => handleFieldUpdate(order.id, 'cod', parseFloat(e.target.value))} className="h-8 border-0 bg-transparent focus-visible:ring-1"/></TableCell>
                                            <TableCell className="border-l"><Input type="number" defaultValue={order.driverFee} onBlur={(e) => handleFieldUpdate(order.id, 'driverFee', parseFloat(e.target.value))} className="h-8 border-0 bg-transparent focus-visible:ring-1"/></TableCell>
                                        </>
                                    ) : (
                                        <>
                                            <TableCell className="border-l"><Input type="number" readOnly defaultValue={order.cod} className="h-8 border-0 bg-transparent focus-visible:ring-0" /></TableCell>
                                            <TableCell className="border-l"><Input type="number" readOnly defaultValue={order.deliveryFee} className="h-8 border-0 bg-transparent focus-visible:ring-0" /></TableCell>
                                            <TableCell className="border-l"><Input type="number" readOnly defaultValue={order.itemPrice} className="h-8 border-0 bg-transparent focus-visible:ring-0" /></TableCell>
                                            <TableCell className="border-l"><Input type="number" defaultValue={adjustment} onChange={(e) => handleAdjustmentChange(order.id, e.target.value)} className="h-8 border-0 bg-transparent focus-visible:ring-1" /></TableCell>
                                            <TableCell className="border-l font-semibold">{formatCurrency(netAmount)}</TableCell>
                                        </>
                                    )}
                                    <TableCell className="border-l"><Badge variant="secondary">{order.status}</Badge></TableCell>
                                    <TableCell className="text-center">
                                        <Button variant="ghost" size="icon" onClick={() => handleRemoveOrder(order.id)}>
                                            <Icon name="Trash2" className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )})}
                        </TableBody>
                         <TableFooter>
                            {isDriverSlip ? (
                                <TableRow className="bg-muted/50 font-bold">
                                    <TableCell colSpan={3} className="border-l">الإجمالي</TableCell>
                                    <TableCell className="border-l">{formatCurrency(totalCOD)}</TableCell>
                                    <TableCell className="border-l">{formatCurrency(totalDriverFare)}</TableCell>
                                    <TableCell colSpan={2} className="text-lg text-primary">{formatCurrency(netTotalDriver)}</TableCell>
                                </TableRow>
                            ) : (
                                <TableRow className="bg-muted/50 font-bold">
                                    <TableCell colSpan={3} className="border-l">الإجمالي</TableCell>
                                    <TableCell className="border-l">{formatCurrency(totalCOD)}</TableCell>
                                    <TableCell className="border-l">{formatCurrency(totalDeliveryFee)}</TableCell>
                                    <TableCell className="border-l">{formatCurrency(totalItemPrice)}</TableCell>
                                    <TableCell className="border-l">{formatCurrency(totalAdjustments)}</TableCell>
                                    <TableCell className="border-l text-lg text-primary">{formatCurrency(totalNetMerchant)}</TableCell>
                                    <TableCell colSpan={2}></TableCell>
                                </TableRow>
                            )}
                        </TableFooter>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )

}
