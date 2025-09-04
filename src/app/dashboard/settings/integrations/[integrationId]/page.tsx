
'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
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
import { Tabs, TabsTrigger, TabsList, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';


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

const mockSyncData = [
    { ourId: 'ORD-101', externalId: '#1101', ourStatus: 'تم التوصيل', externalStatus: 'fulfilled', hasConflict: false },
    { ourId: 'ORD-102', externalId: '#1102', ourStatus: 'جاري التوصيل', externalStatus: 'unfulfilled', hasConflict: true },
    { ourId: 'ORD-103', externalId: '#1103', ourStatus: 'مرتجع', externalStatus: 'cancelled', hasConflict: false },
    { ourId: 'ORD-104', externalId: '#1104', ourStatus: 'تم التوصيل', externalStatus: 'partially_fulfilled', hasConflict: true },
    { ourId: 'ORD-105', externalId: '#1105', ourStatus: 'فشل المزامنة', externalStatus: 'unfulfilled', hasConflict: true, syncFailed: true },
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

const initialRules = [
    { id: 1, conditionField: 'city', conditionOperator: 'equals', conditionValue: 'إربد', action: 'assign_driver', actionValue: 'فريق المحافظات', enabled: true },
    { id: 2, conditionField: 'tags', conditionOperator: 'contains', conditionValue: 'VIP', action: 'set_price_list', actionValue: 'أسعار VIP', enabled: true },
];

const AgentMessage = ({ sender, children }: { sender: 'user' | 'agent', children: React.ReactNode }) => {
    const isUser = sender === 'user';
    return (
      <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : ''}`}>
        {!isUser && (
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg?text=AI" alt="AI Agent" />
            <AvatarFallback>AI</AvatarFallback>
          </Avatar>
        )}
        <div
          className={`max-w-xs rounded-2xl p-3 ${isUser
              ? 'rounded-br-none bg-primary text-primary-foreground'
              : 'rounded-bl-none bg-muted'
            }`}
        >
          {children}
        </div>
        {isUser && (
           <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg?text=You" alt="User" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        )}
      </div>
    );
};

const IntegrationAgent = ({ integrationName }: { integrationName: string }) => {
    const { toast } = useToast();
    const handleSend = () => {
        toast({ title: "تم الإرسال (تجريبي)", description: "في التطبيق الفعلي، سيتم التحقق من المفتاح." });
    }
    const handleFileUpload = () => {
        toast({ title: "تم الإرفاق (تجريبي)" });
    }
    return (
        <Card className="bg-muted/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Icon name="Wand2" /> مساعد الإعداد (Agent)</CardTitle>
                <CardDescription>
                    استخدم هذا المساعد التفاعلي لإرشادك خلال عملية الربط مع {integrationName}.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex h-[400px] flex-col rounded-lg border bg-background p-4">
                    <ScrollArea className="flex-1 space-y-4 pr-4">
                        <AgentMessage sender="agent">
                            <p className="text-sm">
                                أهلاً بك! أنا هنا لمساعدتك في الربط مع {integrationName}. للحصول على مفتاح الربط (API Token)، يرجى اتباع الخطوات التالية في لوحة تحكم {integrationName}:
                                <br />
                                1. اذهب إلى قسم التطبيقات (Apps).
                                <br />
                                2. اختر "تطوير التطبيقات" (Develop apps).
                                <br />
                                3. أنشئ تطبيقاً جديداً وامنحه صلاحيات القراءة والكتابة للطلبات (read/write orders).
                                <br />
                                4. انسخ مفتاح الوصول (API access token) والصقه هنا.
                            </p>
                        </AgentMessage>
                         <AgentMessage sender="agent">
                            <p className="text-sm">
                                يمكنك أيضاً إرفاق ملف CSV أو JSON يحتوي على بيانات الربط إذا كان لديك.
                            </p>
                        </AgentMessage>
                    </ScrollArea>
                    <div className="mt-4 flex items-center gap-2 border-t pt-4">
                        <Input
                            placeholder="الصق مفتاح الربط هنا..."
                            className="flex-1"
                        />
                        <Button onClick={handleSend}>إرسال</Button>
                        <Button variant="outline" size="icon" onClick={handleFileUpload}>
                            <Icon name="Paperclip" className="h-4 w-4" />
                            <span className="sr-only">إرفاق ملف</span>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default function IntegrationDetailPage() {
    const params = useParams();
    const { integrationId } = params;
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [connection, setConnection] = useState<any | null>(null);
    const [integrationInfo, setIntegrationInfo] = useState<any | null>(null);
    const [rules, setRules] = useState(initialRules);

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

    const handleAddRule = () => {
        const newRule = { id: rules.length + 1, conditionField: '', conditionOperator: 'equals', conditionValue: '', action: '', actionValue: '', enabled: true };
        setRules([...rules, newRule]);
    };

    const handleRemoveRule = (id: number) => {
        setRules(rules.filter(rule => rule.id !== id));
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
            
            <IntegrationAgent integrationName={integrationInfo.name} />

            <Tabs defaultValue="main-settings">
                 <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="main-settings"><Icon name="Settings" className="ml-2"/>الإعدادات اليدوية</TabsTrigger>
                    <TabsTrigger value="sync-center"><Icon name="RefreshCw" className="ml-2"/>مركز المزامنة</TabsTrigger>
                </TabsList>
                
                <TabsContent value="main-settings" className="space-y-6 mt-4">
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
                          <Table>
                              <TableHeader>
                                  <TableRow>
                                      <TableHead className="w-1/4">إذا كان الحقل</TableHead>
                                      <TableHead className="w-1/4">والشرط</TableHead>
                                      <TableHead className="w-1/4">والقيمة</TableHead>
                                      <TableHead className="w-1/4">إذن نفذ الإجراء</TableHead>
                                      <TableHead>الحالة</TableHead>
                                      <TableHead>حذف</TableHead>
                                  </TableRow>
                              </TableHeader>
                              <TableBody>
                                  {rules.map(rule => (
                                      <TableRow key={rule.id}>
                                          <TableCell>
                                              <Select defaultValue={rule.conditionField}>
                                                  <SelectTrigger><SelectValue placeholder="اختر حقل..."/></SelectTrigger>
                                                  <SelectContent>
                                                      <SelectItem value="city">المدينة</SelectItem>
                                                      <SelectItem value="tags">العلامات (Tags)</SelectItem>
                                                      <SelectItem value="total">المجموع</SelectItem>
                                                  </SelectContent>
                                              </Select>
                                          </TableCell>
                                           <TableCell>
                                              <Select defaultValue={rule.conditionOperator}>
                                                  <SelectTrigger><SelectValue placeholder="اختر شرط..."/></SelectTrigger>
                                                  <SelectContent>
                                                      <SelectItem value="equals">يساوي</SelectItem>
                                                      <SelectItem value="contains">يحتوي على</SelectItem>
                                                      <SelectItem value="greater_than">أكبر من</SelectItem>
                                                  </SelectContent>
                                              </Select>
                                          </TableCell>
                                          <TableCell><Input placeholder="أدخل القيمة" defaultValue={rule.conditionValue}/></TableCell>
                                          <TableCell>
                                               <Select defaultValue={rule.action}>
                                                  <SelectTrigger><SelectValue placeholder="اختر إجراء..."/></SelectTrigger>
                                                  <SelectContent>
                                                      <SelectItem value="assign_driver">تعيين سائق</SelectItem>
                                                      <SelectItem value="set_price_list">تطبيق قائمة أسعار</SelectItem>
                                                      <SelectItem value="do_not_import">لا تستورد الطلب</SelectItem>
                                                  </SelectContent>
                                              </Select>
                                          </TableCell>
                                          <TableCell><Switch checked={rule.enabled}/></TableCell>
                                          <TableCell>
                                              <Button variant="ghost" size="icon" onClick={() => handleRemoveRule(rule.id)}>
                                                  <Icon name="Trash2" className="h-4 w-4 text-destructive"/>
                                              </Button>
                                          </TableCell>
                                      </TableRow>
                                  ))}
                              </TableBody>
                          </Table>
                          <Button variant="outline" className="mt-4 w-full" onClick={handleAddRule}>
                            <Icon name="PlusCircle" className="mr-2 h-4 w-4"/>
                            إضافة قاعدة جديدة
                          </Button>
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
                </TabsContent>

                <TabsContent value="sync-center" className="space-y-6 mt-4">
                     <Card>
                        <CardHeader>
                            <CardTitle>مركز مزامنة البيانات</CardTitle>
                            <CardDescription>مراقبة ومقارنة البيانات بين نظامنا و{integrationInfo.name} لحل أي تعارضات.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>رقم الطلب</TableHead>
                                        <TableHead>حالتنا</TableHead>
                                        <TableHead>حالة {integrationInfo.name}</TableHead>
                                        <TableHead className="text-center">الإجراءات</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {mockSyncData.map(item => (
                                        <TableRow key={item.ourId} className={item.hasConflict ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''}>
                                            <TableCell className="font-mono">{item.ourId} / {item.externalId}</TableCell>
                                            <TableCell><Badge variant="outline">{item.ourStatus}</Badge></TableCell>
                                            <TableCell><Badge variant="secondary">{item.externalStatus}</Badge></TableCell>
                                            <TableCell className="text-center">
                                                {item.syncFailed ? (
                                                    <Button variant="destructive" size="sm"><Icon name="RefreshCw" className="ml-2"/>إعادة المحاولة</Button>
                                                ) : item.hasConflict ? (
                                                    <div className="flex gap-2 justify-center">
                                                        <Button variant="outline" size="sm" title={`فرض حالتنا (${item.ourStatus}) على النظام الخارجي`}>
                                                           <Icon name="UploadCloud" className="ml-2"/> مزامنة
                                                        </Button>
                                                        <Button variant="outline" size="sm" title={`سحب الحالة (${item.externalStatus}) من النظام الخارجي`}>
                                                           <Icon name="DownloadCloud" className="ml-2"/> سحب
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <span className="text-green-600 flex items-center justify-center gap-2">
                                                        <Icon name="CheckCircle" /> متطابق
                                                    </span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
