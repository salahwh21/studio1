
'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';

// Mock data, in a real app this would come from a store or API
const integrationsList = [
    { id: 'shopify', name: 'Shopify', iconName: 'ShoppingCart' as const },
    { id: 'woocommerce', name: 'WooCommerce', iconName: 'ShoppingCart' as const },
    { id: 'salla', name: 'Salla (سلة)', iconName: 'ShoppingCart' as const },
    { id: 'zid', name: 'Zid (زد)', iconName: 'ShoppingCart' as const },
    { id: 'aramex', name: 'Aramex', iconName: 'Truck' as const },
    { id: 'dhl', name: 'DHL', iconName: 'Globe' as const },
    { id: 'twilio', name: 'Twilio', iconName: 'MessageSquare' as const },
    { id: 'zapier', name: 'Zapier', iconName: 'Zap' as const },
    { id: 'generic-webhook', name: 'Generic Webhook', iconName: 'Webhook' as const },
    { id: 'custom-api', name: 'Custom API', iconName: 'Code' as const }
];

export default function IntegrationDetailPage() {
    const params = useParams();
    const { integrationId } = params;
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [webhookUrl, setWebhookUrl] = useState('');
    
    const integration = integrationsList.find(i => i.id === integrationId);

    useEffect(() => {
        if (integration) {
            setIsLoading(false);
            if(integration.id === 'generic-webhook' || integration.id === 'zapier') {
                setWebhookUrl(`${window.location.origin}/api/v1/webhooks/orders/W_ACCT_12345_${integration.id.toUpperCase()}`);
            }
        }
    }, [integration]);

    const handleSaveChanges = () => {
        toast({ title: 'تم الحفظ', description: `تم حفظ إعدادات ${integration?.name} بنجاح.` });
    };

    const handleCopyWebhook = () => {
        navigator.clipboard.writeText(webhookUrl);
        toast({ title: 'تم النسخ', description: 'تم نسخ رابط الويب هوك إلى الحافظة.' });
    };


    if (isLoading) {
        return <Skeleton className="w-full h-96" />;
    }

    if (!integration) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>التكامل غير موجود</CardTitle>
                    <CardDescription>لم نتمكن من العثور على إعدادات هذا التكامل.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <Link href="/dashboard/settings/integrations">العودة إلى قائمة التكاملات</Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }
    
    const requiresApiKey = !['generic-webhook', 'zapier'].includes(integration.id);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                         <div className="bg-primary/10 text-primary p-3 rounded-lg">
                             <Icon name={integration.iconName} className="h-6 w-6" />
                         </div>
                        <div>
                            <CardTitle className="text-2xl font-bold tracking-tight">إعدادات {integration.name}</CardTitle>
                            <CardDescription className="mt-1">إدارة وتخصيص إعدادات الربط مع {integration.name}.</CardDescription>
                        </div>
                    </div>
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/dashboard/settings/integrations"><Icon name="ArrowLeft" className="h-4 w-4" /></Link>
                    </Button>
                </CardHeader>
            </Card>
            
            {requiresApiKey && (
                <Card>
                    <CardHeader><CardTitle>بيانات الربط</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="api-key">مفتاح الربط (API Key)</Label>
                            <Input id="api-key" type="password" defaultValue="************" />
                        </div>
                        {integration.id === 'shopify' && (
                            <div className="space-y-2">
                                <Label htmlFor="store-url">رابط المتجر</Label>
                                <Input id="store-url" placeholder="https://your-store.myshopify.com" />
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {(integration.id === 'generic-webhook' || integration.id === 'zapier') && (
                 <Card>
                    <CardHeader><CardTitle>رابط الويب هوك</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            استخدم هذا الرابط في {integration.name} لإرسال البيانات إلى نظامنا.
                        </p>
                        <div className="flex items-center gap-2">
                            <Input readOnly value={webhookUrl} className="font-mono"/>
                            <Button onClick={handleCopyWebhook} variant="outline" size="icon"><Icon name="Copy" className="h-4 w-4" /></Button>
                        </div>
                    </CardContent>
                </Card>
            )}
            
            <Card>
                <CardHeader><CardTitle>إعدادات المزامنة</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-3">
                        <Label htmlFor="sync-orders">مزامنة الطلبات تلقائيًا</Label>
                        <Switch id="sync-orders" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-3">
                        <Label htmlFor="update-status">تحديث حالة الطلب تلقائيًا</Label>
                        <Switch id="update-status" defaultChecked />
                    </div>
                     <div className="space-y-2 pt-2">
                        <Label htmlFor="default-status">الحالة الافتراضية للطلبات الجديدة</Label>
                         <Select defaultValue="pending">
                            <SelectTrigger id="default-status">
                                <SelectValue placeholder="اختر حالة..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pending">بالانتظار</SelectItem>
                                <SelectItem value="processing">قيد المعالجة</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button onClick={handleSaveChanges}><Icon name="Save" className="ml-2" /> حفظ التغييرات</Button>
            </div>
        </div>
    );
}

