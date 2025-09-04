
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';

import { useOrdersStore, type Order } from '@/store/orders-store';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/contexts/SettingsContext';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Icon from '@/components/icon';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const statusOptions: {value: Order['status'], label: string}[] = [
    { value: 'تم التسليم', label: 'تم التسليم'},
    { value: 'تم استلام المال في الفرع', label: 'تم استلام المال في الفرع'},
    { value: 'جاري التوصيل', label: 'جاري التوصيل'},
    { value: 'بالانتظار', label: 'بالانتظار'},
    { value: 'راجع', label: 'راجع'},
    { value: 'مؤجل', label: 'مؤجل'},
];

const mockHistory = [
    { timestamp: '2023-09-05 10:00:15', event: 'تم إنشاء الطلب بواسطة المدير', user: 'أحمد مشرف' },
    { timestamp: '2023-09-05 10:05:22', event: 'تم تعيين الطلب للسائق: علي الأحمد', user: 'النظام' },
    { timestamp: '2023-09-05 11:30:45', event: 'تغيير الحالة إلى: جاري التوصيل', user: 'علي الأحمد' },
    { timestamp: '2023-09-05 14:15:02', event: 'إضافة ملاحظة: "العميل يطلب التسليم بعد العصر"', user: 'علي الأحمد' },
    { timestamp: '2023-09-05 16:45:11', event: 'تغيير الحالة إلى: تم التوصيل', user: 'علي الأحمد' },
];

function OrderDetailPageSkeleton() {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 space-y-6">
                <Card><CardContent className="p-6"><Skeleton className="h-48 w-full" /></CardContent></Card>
                <Card><CardContent className="p-6"><Skeleton className="h-32 w-full" /></CardContent></Card>
            </div>
            <div className="lg:col-span-1 space-y-6">
                 <Card><CardContent className="p-6"><Skeleton className="h-56 w-full" /></CardContent></Card>
            </div>
        </div>
      </div>
    );
}

export default function OrderDetailPage() {
    const router = useRouter();
    const params = useParams();
    const { orderId } = params;
    const { orders, updateOrderField } = useOrdersStore();
    const { toast } = useToast();
    const { formatCurrency } = useSettings();

    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const foundOrder = orders.find(o => o.id === orderId);
        if (foundOrder) {
            setOrder(foundOrder);
        } else if (orders.length > 0) { // Avoid redirect on initial load
            toast({ variant: 'destructive', title: 'خطأ', description: 'الطلب غير موجود.' });
            router.push('/dashboard/orders');
        }
        setIsLoading(false);
    }, [orderId, orders, router, toast]);

    const handleFieldChange = (field: keyof Order, value: any) => {
        if (!order) return;
        
        let newOrderState = { ...order, [field]: value };

        // Auto-calculate financial fields if COD changes
        if (field === 'cod') {
            const codValue = parseFloat(value) || 0;
            const deliveryFee = newOrderState.city === 'عمان' ? 2.5 : 3.5;
            newOrderState = {
                ...newOrderState,
                cod: codValue,
                deliveryFee: deliveryFee,
                itemPrice: codValue - deliveryFee,
                driverFee: newOrderState.city === 'عمان' ? 1.0 : 1.5,
            };
        }

        setOrder(newOrderState);
    };

    const handleSave = () => {
        if (!order) return;
        // Batch update all fields that could have changed
        Object.keys(order).forEach(key => {
            updateOrderField(order.id, key as keyof Order, order[key as keyof Order]);
        });
        toast({ title: "تم الحفظ بنجاح", description: "تم تحديث تفاصيل الطلب." });
    }

    if (isLoading || !order) {
        return <OrderDetailPageSkeleton />;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    تفاصيل الطلب: <span className="font-mono text-primary">{order.id}</span>
                </h1>
                <div className="flex items-center gap-2">
                    <Button onClick={handleSave}><Icon name="Save" className="ml-2" /> حفظ التعديلات</Button>
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/dashboard/orders"><Icon name="ArrowLeft" className="h-4 w-4" /></Link>
                    </Button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Icon name="User" /> معلومات المستلم والتاجر</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1 p-3 bg-muted/50 rounded-md">
                                    <Label className="text-xs">التاجر</Label>
                                    <p className="font-semibold">{order.merchant}</p>
                                </div>
                                <div className="space-y-1 p-3 bg-muted/50 rounded-md">
                                    <Label className="text-xs">الرقم المرجعي</Label>
                                    <p className="font-semibold font-mono">{order.referenceNumber || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="recipient">اسم المستلم</Label>
                                    <Input id="recipient" value={order.recipient} onChange={(e) => handleFieldChange('recipient', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">رقم الهاتف</Label>
                                    <Input id="phone" value={order.phone} onChange={(e) => handleFieldChange('phone', e.target.value)} />
                                </div>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="address">العنوان الكامل</Label>
                                <Input id="address" value={order.address} onChange={(e) => handleFieldChange('address', e.target.value)} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="notes">ملاحظات</Label>
                                <Textarea id="notes" value={order.notes} onChange={(e) => handleFieldChange('notes', e.target.value)} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Icon name="History" /> سجل الطلب</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-4">
                                {mockHistory.map((item, index) => (
                                    <li key={index} className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="w-4 h-4 rounded-full bg-primary mt-1"></div>
                                            {index < mockHistory.length -1 && <div className="w-0.5 flex-1 bg-border"></div>}
                                        </div>
                                        <div className="pb-4">
                                            <p className="font-semibold">{item.event}</p>
                                            <p className="text-xs text-muted-foreground">{item.timestamp} بواسطة {item.user}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Icon name="ClipboardList" /> حالة الطلب</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="space-y-2">
                                <Label htmlFor="status">الحالة الحالية</Label>
                                <Select value={order.status} onValueChange={(val) => handleFieldChange('status', val)}>
                                    <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {statusOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1 p-3 bg-muted/50 rounded-md">
                                <Label className="text-xs">السائق المعين</Label>
                                <p className="font-semibold">{order.driver}</p>
                            </div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Icon name="DollarSign" /> التفاصيل المالية</CardTitle>
                        </CardHeader>
                         <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="cod">إجمالي التحصيل (COD)</Label>
                                <Input type="number" id="cod" value={order.cod} onChange={(e) => handleFieldChange('cod', e.target.value)} />
                            </div>
                            <Separator />
                            <div className="space-y-2">
                               <Label htmlFor="itemPrice">المستحق للتاجر</Label>
                                <Input type="number" id="itemPrice" value={order.itemPrice} onChange={(e) => handleFieldChange('itemPrice', parseFloat(e.target.value) || 0)} />
                            </div>
                             <div className="space-y-2">
                               <Label htmlFor="deliveryFee">أجور التوصيل</Label>
                               <Input type="number" id="deliveryFee" value={order.deliveryFee} onChange={(e) => handleFieldChange('deliveryFee', parseFloat(e.target.value) || 0)} />
                            </div>
                             <div className="space-y-2">
                               <Label htmlFor="driverFee">أجور السائق</Label>
                               <Input type="number" id="driverFee" value={order.driverFee} onChange={(e) => handleFieldChange('driverFee', parseFloat(e.target.value) || 0)} />
                            </div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Icon name="Wand" /> إجراءات سريعة</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2">
                           <Button variant="outline"><Icon name="Printer" className="ml-2" /> طباعة البوليصة</Button>
                           <Button variant="outline"><Icon name="MessageSquare" className="ml-2" /> إرسال واتساب</Button>
                           <Button variant="destructive"><Icon name="Undo2" className="ml-2" /> إنشاء مرتجع</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
