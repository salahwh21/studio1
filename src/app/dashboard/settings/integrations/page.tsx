
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { nanoid } from 'nanoid';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/icon';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';


const integrationsList = [
    { id: 'shopify', name: 'Shopify', iconName: 'ShoppingCart' as const, description: 'استيراد الطلبات تلقائياً من متجرك على منصة Shopify.', category: 'e-commerce', type: 'standard' },
    { id: 'woocommerce', name: 'WooCommerce', iconName: 'ShoppingCart' as const, description: 'ربط متجرك المبني على WooCommerce.', category: 'e-commerce', type: 'standard' },
    { id: 'salla', name: 'Salla (سلة)', iconName: 'ShoppingCart' as const, description: 'ربط متجرك على منصة سلة.', category: 'e-commerce', type: 'standard' },
    { id: 'zid', name: 'Zid (زد)', iconName: 'ShoppingCart' as const, description: 'ربط متجرك على منصة زد.', category: 'e-commerce', type: 'standard' },
    { id: 'aramex', name: 'Aramex', iconName: 'Truck' as const, description: 'ربط حسابك مع شركة أرامكس لتتبع الشحنات وإنشاء البوالص.', category: 'shipping', type: 'standard' },
    { id: 'dhl', name: 'DHL', iconName: 'Globe' as const, description: 'إدارة شحناتك الدولية والمحلية عبر DHL.', category: 'shipping', type: 'standard' },
    { id: 'smsa-express', name: 'SMSA Express', iconName: 'Truck' as const, description: 'مزامنة الشحنات مباشرة مع نظام شركة سمسا للشحن.', category: 'shipping', type: 'standard' },
    { id: 'fedex', name: 'FedEx', iconName: 'Globe' as const, description: 'ربط وتتبع الشحنات مع شركة فيديكس.', category: 'shipping', type: 'standard' },
    { id: 'odoo', name: 'Odoo', iconName: 'Briefcase' as const, description: 'مزامنة الطلبات والفواتير مع نظام Odoo ERP الخاص بك.', category: 'erp', type: 'standard' },
    { id: 'quickbooks', name: 'QuickBooks', iconName: 'Briefcase' as const, description: 'مزامنة الفواتير والمصروفات تلقائيًا مع QuickBooks.', category: 'erp', type: 'standard' },
    { id: 'zoho-books', name: 'Zoho Books', iconName: 'Briefcase' as const, description: 'ربط النظام مع Zoho Books لإدارة محاسبية متكاملة.', category: 'erp', type: 'standard' },
    { id: 'twilio', name: 'Twilio', iconName: 'MessageSquare' as const, description: 'إرسال رسائل SMS للعملاء بحالة الطلب.', category: 'communication', type: 'standard' },
    { id: 'ycloud', name: 'YCloud', iconName: 'MessageSquare' as const, description: 'إرسال رسائل WhatsApp للعملاء عبر YCloud.', category: 'communication', type: 'standard' },
    { id: 'whatsapp', name: 'WhatsApp', iconName: 'MessageSquare' as const, description: 'ربط النظام لإرسال إشعارات عبر WhatsApp.', category: 'communication', type: 'standard' },
    { id: 'stripe', name: 'Stripe', iconName: 'CreditCard' as const, description: 'تفعيل الدفع الإلكتروني عبر بطاقات الائتمان.', category: 'payment', type: 'standard' },
    { id: 'paypal', name: 'PayPal', iconName: 'CreditCard' as const, description: 'قبول المدفوعات العالمية عبر PayPal.', category: 'payment', type: 'standard' },
    { id: 'paytabs', name: 'PayTabs', iconName: 'CreditCard' as const, description: 'ربط بوابة الدفع PayTabs لمنطقة الشرق الأوسط.', category: 'payment', type: 'standard' },
    { id: 'zapier', name: 'Zapier', iconName: 'Zap' as const, description: 'ربط النظام بآلاف التطبيقات الأخرى لأتمتة المهام.', category: 'automation', type: 'factory' },
    { id: 'generic-webhook', name: 'Generic Webhook', iconName: 'Webhook' as const, description: 'ربط أي منصة تدعم الويب هوك لاستقبال الطلبات.', category: 'factory', type: 'factory' },
    { id: 'custom-api', name: 'Custom API', iconName: 'Code' as const, description: 'للمطورين: ربط النظام مع أي واجهة برمجية مخصصة.', category: 'factory', type: 'factory' }
];

const categories = [
    { id: 'all', name: 'الكل' },
    { id: 'e-commerce', name: 'تجارة إلكترونية' },
    { id: 'shipping', name: 'شركات شحن' },
    { id: 'payment', name: 'دفع إلكتروني' },
    { id: 'erp', name: 'أنظمة ERP' },
    { id: 'communication', name: 'تواصل' },
    { id: 'automation', name: 'أتمتة' },
    { id: 'factory', name: 'مصنع التكاملات' },
];

type Connection = {
    id: string; // Unique instance ID
    integrationId: string; // ID from the integrationsList
    name: string; // User-defined name for this instance
    apiKey?: string;
    enabled: boolean;
};

const ConnectionDialog = ({ open, onOpenChange, integration, onSave }: { open: boolean, onOpenChange: (open: boolean) => void, integration: any | null, onSave: (name: string, apiKey: string) => void }) => {
    const [name, setName] = useState('');
    const [apiKey, setApiKey] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        if (open && integration) {
            setName(integration.name);
            setApiKey('');
        }
    }, [open, integration]);

    if (!integration) return null;

    const handleSave = () => {
        if (!name) {
            toast({ variant: 'destructive', title: 'خطأ', description: 'الرجاء إدخال اسم لهذا التكامل.' });
            return;
        }
        onSave(name, apiKey);
        setName('');
        setApiKey('');
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>إضافة تكامل: {integration.name}</DialogTitle>
                    <DialogDescription>
                       الرجاء إدخال تفاصيل هذا التكامل الجديد.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="integration-name">الاسم المعروض</Label>
                        <Input id="integration-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: ويب هوك متجر الأطفال"/>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="api-key">مفتاح الربط (API Key) أو الرابط</Label>
                        <Input id="api-key" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="أدخل المفتاح أو الرابط هنا"/>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>إلغاء</Button>
                    <Button onClick={handleSave}>حفظ واتصال</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function IntegrationsPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [connections, setConnections] = useState<Connection[]>([]);
    const [dialogState, setDialogState] = useState<{ open: boolean, integration: any | null }>({ open: false, integration: null });
    const [integrationToDelete, setIntegrationToDelete] = useState<Connection | null>(null);

    useEffect(() => {
        try {
            const saved = localStorage.getItem('user-integrations');
            let userConnections: Connection[] = saved ? JSON.parse(saved) : [];

            const shopifyExists = userConnections.some(c => c.integrationId === 'shopify');

            if (!shopifyExists) {
                userConnections.push({
                    id: nanoid(),
                    integrationId: 'shopify',
                    name: 'متجري على شوبيفاي',
                    apiKey: 'shpat_dummy_api_key_for_demo',
                    enabled: true,
                });
            }
            
            setConnections(userConnections);

        } catch (e) {
            console.error("Failed to parse integrations from localStorage", e);
        }
    }, []);

    const saveConnections = (newConnections: Connection[]) => {
        setConnections(newConnections);
        localStorage.setItem('user-integrations', JSON.stringify(newConnections));
    };

    const handleActionClick = (integration: any) => {
        setDialogState({ open: true, integration });
    };
    
     const handleToggleConnection = (connectionId: string, enabled: boolean) => {
        const newConnections = connections.map(c => 
            c.id === connectionId ? { ...c, enabled } : c
        );
        saveConnections(newConnections);
        toast({
            title: enabled ? 'تم تفعيل التكامل' : 'تم إلغاء تفعيل التكامل',
        });
    };

    const handleSaveIntegration = (name: string, apiKey: string) => {
        if (dialogState.integration) {
            const newConnection: Connection = {
                id: nanoid(),
                integrationId: dialogState.integration.id,
                name: name,
                apiKey: apiKey,
                enabled: true,
            };
            const newConnections = [...connections, newConnection];
            saveConnections(newConnections);
            toast({ title: 'تم الربط بنجاح', description: `تم تفعيل التكامل ${name}.` });
        }
        setDialogState({ open: false, integration: null });
    };

    const handleDisconnect = (connectionId: string) => {
        const connectionToDisconnect = connections.find(c => c.id === connectionId);
        if (connectionToDisconnect) {
            setIntegrationToDelete(connectionToDisconnect);
        }
    };
    
    const confirmDelete = () => {
        if(integrationToDelete) {
            const newConnections = connections.filter(c => c.id !== integrationToDelete.id);
            saveConnections(newConnections);
            toast({ title: 'تم قطع الاتصال', description: `تم إلغاء التكامل مع ${integrationToDelete.name}.`, variant: 'destructive' });
            setIntegrationToDelete(null);
        }
    }

    const IntegrationCard = ({ integration }: { integration: typeof integrationsList[0] }) => {
        const isFactory = integration.type === 'factory';
        const [logoError, setLogoError] = useState(false);
        
        const isCustomIntegration = integration.category === 'factory';
        const logoUrl = !isCustomIntegration ? `https://logo.clearbit.com/${integration.id.split('-')[0]}.com` : '';


        return (
            <Card className="hover:border-primary hover:shadow-lg transition-all duration-300 ease-in-out flex flex-col">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                            <div className="bg-primary/10 text-primary p-3 rounded-lg h-12 w-12 flex items-center justify-center">
                               {logoError || !logoUrl ? (
                                    <Icon name={integration.iconName} className="h-6 w-6" />
                               ) : (
                                    <Image 
                                        src={logoUrl} 
                                        alt={`${integration.name} logo`} 
                                        width={24}
                                        height={24}
                                        className="object-contain h-6 w-6"
                                        onError={() => setLogoError(true)}
                                    />
                               )}
                            </div>
                            <div>
                                <CardTitle className="text-base">{integration.name}</CardTitle>
                                <CardDescription className="text-xs leading-relaxed mt-1">{integration.description}</CardDescription>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="mt-auto">
                    <Separator className="my-2" />
                    <div className="flex justify-end gap-2 pt-2">
                         <Button size="sm" onClick={() => handleActionClick(integration)}>
                            <Icon name="PlusCircle" className="ml-2" />
                            {isFactory ? 'إضافة' : 'اتصال'}
                         </Button>
                    </div>
                </CardContent>
            </Card>
        );
    };
    
     const ConnectedIntegrationCard = ({ connection }: { connection: Connection }) => {
        const integrationInfo = integrationsList.find(i => i.id === connection.integrationId)!;
         return (
             <Card className="bg-muted/50">
                 <CardHeader className="p-3">
                     <div className="flex justify-between items-start">
                         <div className="flex items-center gap-3">
                            <div className="bg-primary/10 text-primary p-2 rounded-md h-10 w-10 flex items-center justify-center">
                                <Icon name={integrationInfo.iconName} className="h-5 w-5" />
                            </div>
                            <div>
                               <CardTitle className="text-sm font-semibold">{connection.name}</CardTitle>
                               <CardDescription className="text-xs">{integrationInfo.name}</CardDescription>
                            </div>
                         </div>
                         <Badge variant={connection.enabled ? 'default' : 'secondary'} className={connection.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}>
                          {connection.enabled ? 'مفعل' : 'معطل'}
                        </Badge>
                     </div>
                 </CardHeader>
                 <CardContent className="p-3 pt-0">
                     <Separator className="mb-3" />
                     <div className="flex items-center justify-between gap-2">
                         <Switch 
                            checked={connection.enabled}
                            onCheckedChange={(checked) => handleToggleConnection(connection.id, checked)}
                            aria-label={`تفعيل أو تعطيل ${connection.name}`}
                        />
                        <div className="flex gap-2">
                            <Button variant="destructive" size="sm" onClick={() => handleDisconnect(connection.id)}>قطع الاتصال</Button>
                            <Button variant="secondary" size="sm" onClick={() => router.push(`/dashboard/settings/integrations/${connection.id}`)}>إدارة</Button>
                        </div>
                     </div>
                 </CardContent>
             </Card>
         );
     }


    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-2xl font-bold tracking-tight flex items-center gap-2"><Icon name="Share2" /> التكاملات والربط البرمجي</CardTitle>
                        <CardDescription className="mt-1">ربط خدمات وتطبيقات خارجية لتوسيع إمكانيات النظام.</CardDescription>
                    </div>
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/dashboard/settings"><Icon name="ArrowLeft" className="h-4 w-4" /></Link>
                    </Button>
                </CardHeader>
            </Card>

            {connections.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>التكاملات المفعلة</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {connections.map(conn => <ConnectedIntegrationCard key={conn.id} connection={conn} />)}
                    </CardContent>
                </Card>
            )}

            <Tabs defaultValue="all" className="w-full">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">إضافة تكامل جديد</h3>
                    <TabsList className="grid" style={{ gridTemplateColumns: `repeat(${categories.length}, minmax(0, 1fr))` }}>
                        {categories.map(cat => <TabsTrigger key={cat.id} value={cat.id}>{cat.name}</TabsTrigger>)}
                    </TabsList>
                </div>
                
                {categories.map(cat => (
                    <TabsContent key={cat.id} value={cat.id}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                            {(cat.id === 'all' ? integrationsList : integrationsList.filter(i => i.category === cat.id)).map(integration => (
                                <IntegrationCard key={integration.id} integration={integration} />
                            ))}
                        </div>
                    </TabsContent>
                ))}
            </Tabs>
            
            <ConnectionDialog 
                open={dialogState.open}
                onOpenChange={(open) => setDialogState({open, integration: open ? dialogState.integration : null})}
                integration={dialogState.integration}
                onSave={handleSaveIntegration}
            />
            
            <AlertDialog open={!!integrationToDelete} onOpenChange={() => setIntegrationToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>تأكيد قطع الاتصال</AlertDialogTitle>
                         <AlertDialogDescription>
                           هل أنت متأكد من إلغاء التكامل مع "{integrationToDelete?.name}"؟
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">تأكيد</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

    
