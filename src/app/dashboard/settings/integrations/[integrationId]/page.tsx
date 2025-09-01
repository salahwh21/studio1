
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
    { id: 'zapier', name: 'Zapier', iconName: 'Zap' as const, category: 'factory', type: 'factory' },
    { id: 'generic-webhook', name: 'Generic Webhook', iconName: 'Webhook' as const, category: 'factory', type: 'factory' },
    { id: 'custom-api', name: 'Custom API', iconName: 'Code' as const, category: 'factory', type: 'factory' }
];

const mockImportableOrders = [
    { shopifyId: '#1102', customer: 'خالد الفايد', total: '150.00 SAR', shopifyStatus: 'paid' },
    { shopifyId: '#1103', customer: 'مريم العتيبي', total: '275.50 SAR', shopifyStatus: 'paid' },
    { shopifyId: '#1104', customer: 'يوسف الأحمد', total: '99.00 SAR', shopifyStatus: 'fulfilled' },
];

const ourStatuses = [
    { code: "PENDING", name: "بالانتظار" },
    { code: "OUT_FOR_DELIVERY", name: "جاري التوصيل" },
    { code: "DELIVERED", name: "تم التوصيل" },
    { code: "RETURNED", name: "مرتجع" },
    { code: "CANCELLED", name: "ملغي" },
];

const shopifyStatuses = [
    { code: "unfulfilled", name: "Unfulfilled" },
    { code: "fulfilled", name: "Fulfilled" },
    { code: "partially_fulfilled", name: "Partially Fulfilled" },
    { code: "cancelled", name: "Cancelled" },
];


export default function IntegrationDetailPage() {
    const params = useParams();
    const { integrationId } = params;
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [connection, setConnection] = useState<any | null>(null);
    const [integrationInfo, setIntegrationInfo] = useState<any | null>(null);

    useEffect(() => {
        // In a real app, you'd fetch the connection details from your backend using the integrationId
        const savedConnections = JSON.parse(localStorage.getItem('user-integrations') || '[]');
        const foundConnection = savedConnections.find((c: any) => c.id === integrationId);
        
        if (foundConnection) {
            const foundIntegrationInfo = integrationsList.find(i => i.id === foundConnection.integrationId);
            setConnection(foundConnection);
            setIntegrationInfo(foundIntegrationInfo);
        }
        setIsLoading(false);
    }, [integrationId]);

    const handleSaveChanges = () => {
        toast({ title: 'تم الحفظ', description: `تم حفظ إعدادات ${connection?.name} بنجاح.` });
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
    
    const isWebhookBased = ['generic-webhook', 'zapier'].includes(integrationInfo.id);
    const isShopifyLike = ['shopify', 'woocommerce', 'salla', 'zid'].includes(integrationInfo.id);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                         <div className="bg-primary/10 text-primary p-3 rounded-lg">
                             <Icon name={integrationInfo.iconName} className="h-6 w-6" />
                         </div>
                        <div>
                            <CardTitle className="text-2xl font-bold tracking-tight">إعدادات التكامل: {connection.name}</CardTitle>
                            <CardDescription className="mt-1">إدارة وتخصيص إعدادات الربط مع {integrationInfo.name}.</CardDescription>
                        </div>
                    </div>
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/dashboard/settings/integrations"><Icon name="ArrowLeft" className="h-4 w-4" /></Link>
                    </Button>
                </CardHeader>
            </Card>
            
            <Card>
                <CardHeader><CardTitle>بيانات الربط</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    {isWebhookBased ? (
                        <div className="space-y-2">
                             <Label htmlFor="webhook-url">رابط الويب هوك (Webhook URL)</Label>
                            <div className="flex items-center gap-2">
                                <Input id="webhook-url" type="text" readOnly defaultValue={`https://api.alwameed.co/webhooks/${connection.id}`} className="font-mono text-sm" />
                                <Button variant="outline" size="icon" onClick={() => navigator.clipboard.writeText(`https://api.alwameed.co/webhooks/${connection.id}`)}>
                                    <Icon name="Copy" className="h-4 w-4" />
                                </Button>
                            </div>
                            <CardDescription>استخدم هذا الرابط في نظامك الخارجي لإرسال البيانات إلينا.</CardDescription>
                        </div>
                    ) : (
                         <div className="space-y-2">
                            <Label htmlFor="api-key">مفتاح الربط (API Key)</Label>
                            <Input id="api-key" type="password" defaultValue={connection.apiKey || '************'} />
                        </div>
                    )}
                    {integrationInfo.id === 'shopify' && (
                         <div className="space-y-2">
                            <Label htmlFor="store-url">رابط المتجر</Label>
                            <Input id="store-url" placeholder="https://your-store.myshopify.com" />
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Icon name="Wand2"/> محرك قواعد التكامل</CardTitle>
                <CardDescription>
                  أتمتة العمليات عن طريق إنشاء قواعد "إذا حدث ... إذن افعل ...".
                </CardDescription>
              </CardHeader>
              <CardContent>
                  <div className="border rounded-lg p-8 text-center space-y-4 bg-muted/50">
                    <Icon name="Bot" className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="font-semibold">قريبًا: واجهة بناء القواعد الذكية</h3>
                    <p className="text-sm text-muted-foreground">
                      ستتمكن هنا من بناء قواعد مخصصة لتوجيه الطلبات وتغيير الأسعار وإرسال إشعارات مشروطة والمزيد.
                    </p>
                    <Button variant="secondary" disabled>إضافة قاعدة جديدة</Button>
                  </div>
              </CardContent>
            </Card>
            
             {isWebhookBased && (
                <Card>
                    <CardHeader>
                        <CardTitle>إعدادات متقدمة للويب هوك</CardTitle>
                        <CardDescription>
                            قم بإدارة كيفية قراءة البيانات الواردة وتتبع سجل الاستلام.
                        </CardDescription>
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
            
            {isShopifyLike && (
                 <>
                    <Card>
                        <CardHeader>
                            <CardTitle>مواءمة حالات الطلب</CardTitle>
                            <CardDescription>اربط حالات الطلب في نظامنا مع الحالات في {integrationInfo.name} لضمان تحديث الحالات بشكل صحيح.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {ourStatuses.map(status => (
                                <div key={status.code} className="space-y-2">
                                    <Label>{status.name}</Label>
                                    <Select>
                                        <SelectTrigger><SelectValue placeholder={`اختر حالة ${integrationInfo.name}...`} /></SelectTrigger>
                                        <SelectContent>
                                            {shopifyStatuses.map(s => <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>الطلبات الجاهزة للاستيراد</CardTitle>
                            <CardDescription>هذه الطلبات حالتها `Paid` أو `Fulfilled` في {integrationInfo.name} وجاهزة للسحب.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>رقم الطلب ({integrationInfo.name})</TableHead>
                                        <TableHead>العميل</TableHead>
                                        <TableHead>المبلغ</TableHead>
                                        <TableHead>الحالة</TableHead>
                                        <TableHead>إجراء</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {mockImportableOrders.map(order => (
                                        <TableRow key={order.shopifyId}>
                                            <TableCell className="font-mono">{order.shopifyId}</TableCell>
                                            <TableCell>{order.customer}</TableCell>
                                            <TableCell>{order.total}</TableCell>
                                            <TableCell><Badge variant="secondary">{order.shopifyStatus}</Badge></TableCell>
                                            <TableCell><Button variant="outline" size="sm">استيراد</Button></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </>
            )}

            <div className="flex justify-end">
                <Button onClick={handleSaveChanges}><Icon name="Save" className="ml-2" /> حفظ كل التغييرات</Button>
            </div>
        </div>
    );
}
