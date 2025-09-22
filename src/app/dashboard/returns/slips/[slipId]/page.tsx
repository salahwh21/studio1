'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

import { useReturnsStore, type DriverSlip, type MerchantSlip } from '@/store/returns-store';
import { useOrdersStore, type Order } from '@/store/orders-store';
import { useSettings } from '@/contexts/SettingsContext';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Icon from '@/components/icon';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

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
    const { formatCurrency } = useSettings();

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
                        <Link href="/dashboard/returns/merchant-slips">العودة إلى كشوفات التجار</Link>
                    </Button>
                </CardContent>
            </Card>
        )
    }

    const title = slipType === 'driver' ? `تفاصيل كشف استلام من السائق` : `تفاصيل كشف إرجاع للتاجر`;
    const partyName = slipType === 'driver' ? (slip as DriverSlip).driverName : (slip as MerchantSlip).merchant;
    const partyType = slipType === 'driver' ? 'السائق' : 'التاجر';

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row justify-between items-start">
                    <div>
                        <CardTitle className="text-2xl font-bold flex items-center gap-3">
                            <Icon name="FileText" />
                            {title}
                        </CardTitle>
                        <CardDescription className="mt-2 font-mono text-base">{slip.id}</CardDescription>
                    </div>
                     <Button variant="outline" size="icon" asChild>
                        <Link href={slipType === 'driver' ? "/dashboard/returns/driver-slips" : "/dashboard/returns/merchant-slips"}>
                            <Icon name="ArrowLeft" className="h-4 w-4" />
                        </Link>
                    </Button>
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
