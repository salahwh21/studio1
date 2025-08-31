
'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';


// This list can be expanded and moved to a shared file later
const integrationsList = [
    { id: 'shopify', name: 'Shopify', iconName: 'ShoppingCart' as const, category: 'e-commerce' },
    { id: 'woocommerce', name: 'WooCommerce', iconName: 'ShoppingCart' as const, category: 'e-commerce' },
    { id: 'salla', name: 'Salla (سلة)', iconName: 'ShoppingCart' as const, category: 'e-commerce' },
    { id: 'zid', name: 'Zid (زد)', iconName: 'ShoppingCart' as const, category: 'e-commerce' },
    { id: 'aramex', name: 'Aramex', iconName: 'Truck' as const, category: 'shipping' },
    { id: 'dhl', name: 'DHL', iconName: 'Globe' as const, category: 'shipping' },
    { id: 'fedex', name: 'FedEx', iconName: 'Globe' as const, category: 'shipping' },
    { id: 'smsa-express', name: 'SMSA Express', iconName: 'Truck' as const, category: 'shipping' },
    { id: 'odoo', name: 'Odoo', iconName: 'Briefcase' as const, category: 'erp' },
    { id: 'quickbooks', name: 'QuickBooks', iconName: 'Briefcase' as const, category: 'erp' },
    { id: 'zoho-books', name: 'Zoho Books', iconName: 'Briefcase' as const, category: 'erp' },
    { id: 'twilio', name: 'Twilio', iconName: 'MessageSquare' as const, category: 'communication' },
    { id: 'ycloud', name: 'YCloud', iconName: 'MessageSquare' as const, category: 'communication' },
    { id: 'whatsapp', name: 'WhatsApp', iconName: 'MessageSquare' as const, category: 'communication' },
    { id: 'stripe', name: 'Stripe', iconName: 'CreditCard' as const, category: 'payment' },
    { id: 'paypal', name: 'PayPal', iconName: 'CreditCard' as const, category: 'payment' },
    { id: 'paytabs', name: 'PayTabs', iconName: 'CreditCard' as const, category: 'payment' },
    { id: 'zapier', name: 'Zapier', iconName: 'Zap' as const, category: 'automation' },
    { id: 'generic-webhook', name: 'Generic Webhook', iconName: 'Webhook' as const, category: 'custom' },
    { id: 'custom-api', name: 'Custom API', iconName: 'Code' as const, category: 'custom' }
];

const mockSyncHistory = [
    { id: 1, description: "تم استيراد 15 طلبًا جديدًا بنجاح.", status: 'success', timestamp: "2023-08-31 10:45 ص" },
    { id: 2, description: "فشل تحديث حالة الطلب #SH-1024.", status: 'failure', timestamp: "2023-08-31 10:30 ص" },
    { id: 3, description: "تم تحديث حالة 50 طلبًا إلى 'جاري التوصيل'.", status: 'success', timestamp: "2023-08-31 09:00 ص" },
    { id: 4, description: "تم بدء المزامنة اليدوية.", status: 'success', timestamp: "2023-08-31 08:55 ص" },
];


export default function IntegrationDetailPage() {
    const params = useParams();
    const { integrationId } = params; // This will be the unique ID of the connection instance
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [connection, setConnection] = useState<any | null>(null);
    const [integrationInfo, setIntegrationInfo] = useState<any | null>(null);
    const [webhookUrl, setWebhookUrl] = useState('');

    useEffect(() => {
        // In a real app, you'd fetch the connection details from your backend using the integrationId
        const savedConnections = JSON.parse(localStorage.getItem('user-integrations') || '[]');
        const foundConnection = savedConnections.find((c: any) => c.id === integrationId);
        
        if (foundConnection) {
            const foundIntegrationInfo = integrationsList.find(i => i.id === foundConnection.integrationId);
            setConnection(foundConnection);
            setIntegrationInfo(foundIntegrationInfo);

            if (foundIntegrationInfo?.category === 'custom' || foundIntegrationInfo?.id === 'zapier') {
                 setWebhookUrl(`${window.location.origin}/api/v1/webhooks/orders/${foundConnection.id}`);
            }
        }
        setIsLoading(false);
    }, [integrationId]);

    const handleSaveChanges = () => {
        toast({ title: 'تم الحفظ', description: `تم حفظ إعدادات ${connection?.name} بنجاح.` });
    };
    
    const handleCopyWebhook = () => {
        navigator.clipboard.writeText(webhookUrl);
        toast({ title: 'تم النسخ', description: 'تم نسخ رابط الويب هوك إلى الحافظة.' });
    };

    if (isLoading) {
        return <Skeleton className="w-full h-96" />;
    }

    if (!connection || !integrationInfo) {
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
    
    const requiresApiKey = integrationInfo.category !== 'custom' && integrationInfo.id !== 'zapier';
    const isWebhookBased = integrationInfo.category === 'custom' || integrationInfo.id === 'zapier';


    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                         <div className="bg-primary/10 text-primary p-3 rounded-lg">
                             <Icon name={integrationInfo.iconName} className="h-6 w-6" />
                         </div>
                        <div>
                            <CardTitle className="text-2xl font-bold tracking-tight">إعدادات: {connection.name}</CardTitle>
                            <CardDescription className="mt-1">إدارة وتخصيص إعدادات الربط مع {integrationInfo.name}.</CardDescription>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button><Icon name="RefreshCw" className="ml-2" /> مزامنة الآن</Button>
                        <Button variant="outline" size="icon" asChild>
                            <Link href="/dashboard/settings/integrations"><Icon name="ArrowLeft" className="h-4 w-4" /></Link>
                        </Button>
                    </div>
                </CardHeader>
            </Card>
            
            {requiresApiKey && (
                <Card>
                    <CardHeader><CardTitle>بيانات الربط</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="api-key">مفتاح الربط (API Key)</Label>
                            <Input id="api-key" type="password" defaultValue={connection.apiKey || '************'} />
                        </div>
                        {integrationInfo.id === 'shopify' && (
                            <div className="space-y-2">
                                <Label htmlFor="store-url">رابط المتجر</Label>
                                <Input id="store-url" placeholder="https://your-store.myshopify.com" />
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {isWebhookBased && (
                 <Card>
                    <CardHeader><CardTitle>رابط الويب هوك</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            استخدم هذا الرابط في {integrationInfo.name} لإرسال البيانات إلى نظامنا. هذا الرابط خاص بهذا التكامل فقط.
                        </p>
                        <div className="flex items-center gap-2">
                            <Input readOnly value={webhookUrl} className="font-mono"/>
                            <Button onClick={handleCopyWebhook} variant="outline" size="icon"><Icon name="Copy" className="h-4 w-4" /></Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {isWebhookBased && (
                <Card>
                    <CardHeader>
                        <CardTitle>إعدادات متقدمة للويب هوك</CardTitle>
                        <CardDescription>إدارة ربط الحقول وسجل البيانات المستلمة.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Button asChild>
                            <Link href={`/dashboard/settings/integrations/${integrationId}/mapping`}>
                                <Icon name="Settings2" className="ml-2"/>
                                إدارة ربط الحقول وسجل البيانات
                            </Link>
                         </Button>
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

            <Card>
                <CardHeader className="flex items-center justify-between">
                    <CardTitle>سجل المزامنة</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => toast({ title: 'جاري التحديث...', description: 'تم طلب سجلات المزامنة الجديدة.' })}>
                        <Icon name="RefreshCw" className="ml-2" />
                        تحديث
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>الحدث</TableHead>
                                <TableHead>الحالة</TableHead>
                                <TableHead>التاريخ والوقت</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockSyncHistory.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.description}</TableCell>
                                    <TableCell>
                                        <Badge variant={item.status === 'success' ? 'default' : 'destructive'} className={item.status === 'success' ? 'bg-green-100 text-green-800' : ''}>
                                            {item.status === 'success' ? 
                                                <Icon name="CheckCircle2" className="ml-1 text-green-600" /> : 
                                                <Icon name="XCircle" className="ml-1" />
                                            }
                                            {item.status === 'success' ? 'نجاح' : 'فشل'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{item.timestamp}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button onClick={handleSaveChanges}><Icon name="Save" className="ml-2" /> حفظ كل التغييرات</Button>
            </div>
        </div>
    );
}
