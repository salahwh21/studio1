
'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/icon';
import { useOrdersStore, type Order } from '@/store/orders-store';
import { useToast } from '@/hooks/use-toast';
import { generateCsResponseAction } from '@/app/actions/generate-cs-response';
import { Skeleton } from '@/components/ui/skeleton';
import { useSettings } from '@/contexts/SettingsContext';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function AiAgentPage() {
    const { orders } = useOrdersStore();
    const { toast } = useToast();
    const context = useSettings();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [customerQuery, setCustomerQuery] = useState('أين طلبي؟');
    const [generatedResponse, setGeneratedResponse] = useState('');
    const [isPending, startTransition] = useTransition();

    if (!context || !context.isHydrated) {
        return (
             <div className="space-y-6">
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        )
    }

    const { settings, updateAiAgentSetting } = context;
    const isAgentEnabled = settings.aiAgent.enabled;

    const handleSearch = () => {
        const foundOrder = orders.find(o => o.id === searchQuery || o.phone === searchQuery);
        setSelectedOrder(foundOrder || null);
        if (!foundOrder) {
            toast({ variant: 'destructive', title: 'لم يتم العثور على الطلب' });
        }
    };

    const handleGenerateResponse = () => {
        if (!selectedOrder) {
            toast({ variant: 'destructive', title: 'الرجاء اختيار طلب أولاً' });
            return;
        }

        setGeneratedResponse('');
        startTransition(async () => {
            const result = await generateCsResponseAction({
                orderDetails: {
                    orderId: selectedOrder.id,
                    customerName: selectedOrder.recipient,
                    status: selectedOrder.status,
                    driverName: selectedOrder.driver,
                    expectedDeliveryDate: selectedOrder.date,
                },
                query: customerQuery,
            });

            if (result.success && result.data) {
                setGeneratedResponse(result.data.response);
                toast({ title: 'تم توليد الرد بنجاح' });
            } else {
                toast({ variant: 'destructive', title: 'فشل توليد الرد', description: result.error });
            }
        });
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedResponse);
        toast({ title: 'تم نسخ الرد' });
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <Icon name="Bot" />
                            وكيل خدمة العملاء الذكي
                        </CardTitle>
                        <CardDescription>
                            ابحث عن طلب وقم بتوليد رد احترافي لاستفسارات العملاء بنقرة زر.
                        </CardDescription>
                    </div>
                     <div className="flex items-center space-x-2 space-x-reverse">
                        <Switch
                            id="enable-agent"
                            checked={isAgentEnabled}
                            onCheckedChange={(checked) => updateAiAgentSetting('enabled', checked)}
                        />
                        <Label htmlFor="enable-agent" className="font-semibold">
                            {isAgentEnabled ? 'الخدمة مفعلة' : 'الخدمة معطلة'}
                        </Label>
                    </div>
                </CardHeader>
            </Card>

            {!isAgentEnabled && (
                 <Alert variant="destructive">
                    <Icon name="AlertCircle" className="h-4 w-4" />
                    <AlertTitle>الخدمة معطلة</AlertTitle>
                    <AlertDescription>
                        وكيل خدمة العملاء الذكي معطل حاليًا. يرجى تفعيل الخدمة من المفتاح أعلاه لاستخدام هذه الميزة.
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start" style={{ opacity: isAgentEnabled ? 1 : 0.5, pointerEvents: isAgentEnabled ? 'auto' : 'none' }}>
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>1. البحث عن الطلب</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="search">رقم الطلب أو هاتف العميل</Label>
                            <div className="flex gap-2">
                                <Input 
                                    id="search"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                                <Button onClick={handleSearch}>بحث</Button>
                            </div>
                        </div>

                        {selectedOrder && (
                             <Card className="bg-muted/50">
                                <CardHeader className="p-4">
                                    <CardTitle className="text-base">تفاصيل الطلب</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 pt-0 text-sm space-y-2">
                                    <p><strong>العميل:</strong> {selectedOrder.recipient}</p>
                                    <p><strong>الهاتف:</strong> {selectedOrder.phone}</p>
                                    <p><strong>الحالة:</strong> <Badge>{selectedOrder.status}</Badge></p>
                                    <p><strong>السائق:</strong> {selectedOrder.driver}</p>
                                    <p><strong>المبلغ:</strong> {selectedOrder.cod} د.أ</p>
                                </CardContent>
                            </Card>
                        )}
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>2. توليد الرد</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="customerQuery">استفسار العميل (مثال)</Label>
                            <Input id="customerQuery" value={customerQuery} onChange={(e) => setCustomerQuery(e.target.value)} />
                        </div>
                        <Button onClick={handleGenerateResponse} disabled={!selectedOrder || isPending} className="w-full">
                            {isPending ? <Icon name="Loader2" className="animate-spin ml-2" /> : <Icon name="Wand2" className="ml-2" />}
                            {isPending ? 'جاري التوليد...' : 'توليد الرد بالذكاء الاصطناعي'}
                        </Button>

                         <div className="space-y-2 pt-4">
                            <Label htmlFor="generatedResponse">الرد المقترح</Label>
                            {isPending ? (
                                <Skeleton className="h-24 w-full" />
                            ) : (
                                <div className="relative">
                                    <Textarea
                                        id="generatedResponse"
                                        value={generatedResponse}
                                        readOnly
                                        rows={4}
                                        className="bg-muted"
                                        placeholder="سيظهر الرد المقترح هنا..."
                                    />
                                    {generatedResponse && (
                                        <Button variant="ghost" size="icon" className="absolute top-2 left-2" onClick={handleCopy}>
                                            <Icon name="Copy" />
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
