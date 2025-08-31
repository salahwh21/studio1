
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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

const integrationsList = [
    { id: 'shopify', name: 'Shopify', iconName: 'ShoppingCart' as const, description: 'استيراد الطلبات تلقائياً من متجرك على منصة Shopify.', category: 'e-commerce', requiresApiKey: true, requiresWebhook: false },
    { id: 'woocommerce', name: 'WooCommerce', iconName: 'ShoppingCart' as const, description: 'ربط متجرك المبني على WooCommerce.', category: 'e-commerce', requiresApiKey: true, requiresWebhook: false },
    { id: 'salla', name: 'Salla (سلة)', iconName: 'ShoppingCart' as const, description: 'ربط متجرك على منصة سلة.', category: 'e-commerce', requiresApiKey: true, requiresWebhook: false },
    { id: 'zid', name: 'Zid (زد)', iconName: 'ShoppingCart' as const, description: 'ربط متجرك على منصة زد.', category: 'e-commerce', requiresApiKey: true, requiresWebhook: false },
    { id: 'aramex', name: 'Aramex', iconName: 'Truck' as const, description: 'ربط حسابك مع شركة أرامكس لتتبع الشحنات وإنشاء البوالص.', category: 'shipping', requiresApiKey: true, requiresWebhook: false },
    { id: 'dhl', name: 'DHL', iconName: 'Globe' as const, description: 'إدارة شحناتك الدولية والمحلية عبر DHL.', category: 'shipping', requiresApiKey: true, requiresWebhook: false },
    { id: 'smsa-express', name: 'SMSA Express', iconName: 'Truck' as const, description: 'مزامنة الشحنات مباشرة مع نظام شركة سمسا للشحن.', category: 'shipping', requiresApiKey: true, requiresWebhook: false },
    { id: 'fedex', name: 'FedEx', iconName: 'Globe' as const, description: 'ربط وتتبع الشحنات مع شركة فيديكس.', category: 'shipping', requiresApiKey: true, requiresWebhook: false },
    { id: 'twilio', name: 'Twilio', iconName: 'MessageSquare' as const, description: 'إرسال رسائل SMS للعملاء بحالة الطلب.', category: 'communication', requiresApiKey: true, requiresWebhook: false },
    { id: 'zapier', name: 'Zapier', iconName: 'Zap' as const, description: 'ربط النظام بآلاف التطبيقات الأخرى لأتمتة المهام.', category: 'automation', requiresApiKey: false, requiresWebhook: true },
    { id: 'generic-webhook', name: 'Generic Webhook', iconName: 'Webhook' as const, description: 'ربط أي منصة تدعم الويب هوك لاستقبال الطلبات.', category: 'custom', requiresApiKey: false, requiresWebhook: true },
    { id: 'custom-api', name: 'Custom API', iconName: 'Code' as const, description: 'للمطورين: ربط النظام مع أي واجهة برمجية مخصصة.', category: 'custom', requiresApiKey: true, requiresWebhook: false }
];

const categories = [
    { id: 'all', name: 'الكل' },
    { id: 'e-commerce', name: 'تجارة إلكترونية' },
    { id: 'shipping', name: 'شركات شحن' },
    { id: 'communication', name: 'تواصل' },
    { id: 'automation', name: 'أتمتة' },
    { id: 'custom', name: 'مخصص' },
];

const ConnectionDialog = ({ open, onOpenChange, integration, onSave }: { open: boolean, onOpenChange: (open: boolean) => void, integration: any | null, onSave: (apiKey: string) => void }) => {
    const [apiKey, setApiKey] = useState('');
    const { toast } = useToast();

    if (!integration) return null;

    const handleSave = () => {
        if (integration.requiresApiKey && !apiKey) {
            toast({ variant: 'destructive', title: 'خطأ', description: 'الرجاء إدخال مفتاح الربط (API Key).' });
            return;
        }
        onSave(apiKey);
        setApiKey('');
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>ربط مع {integration.name}</DialogTitle>
                    <DialogDescription>
                        {integration.requiresApiKey 
                         ? `الرجاء إدخال مفتاح الربط (API Key) الخاص بـ ${integration.name} لإتمام عملية الربط.`
                         : `أنت على وشك تفعيل الربط مع ${integration.name}.`}
                    </DialogDescription>
                </DialogHeader>
                {integration.requiresApiKey && (
                    <div className="py-4">
                        <Label htmlFor="api-key">مفتاح الربط (API Key)</Label>
                        <Input id="api-key" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
                    </div>
                )}
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
    const [connected, setConnected] = useState<Record<string, { apiKey: string | null }>>({});
    const [dialogState, setDialogState] = useState<{ open: boolean, integration: any | null }>({ open: false, integration: null });

    useEffect(() => {
        try {
            const saved = localStorage.getItem('connected-integrations');
            if(saved) {
                setConnected(JSON.parse(saved));
            }
        } catch (e) {
            console.error("Failed to parse integrations from localStorage", e);
        }
    }, []);

    const saveConnections = (newConnections: any) => {
        setConnected(newConnections);
        localStorage.setItem('connected-integrations', JSON.stringify(newConnections));
    };

    const handleConnectClick = (integration: any) => {
        setDialogState({ open: true, integration });
    };

    const handleSaveIntegration = (apiKey: string) => {
        if (dialogState.integration) {
            const newConnections = { ...connected, [dialogState.integration.id]: { apiKey } };
            saveConnections(newConnections);
            toast({ title: 'تم الربط بنجاح', description: `تم تفعيل التكامل مع ${dialogState.integration.name}.` });
        }
        setDialogState({ open: false, integration: null });
    };

    const handleDisconnect = (integrationId: string) => {
        const { [integrationId]: _, ...remaining } = connected;
        saveConnections(remaining);
        const integrationName = integrationsList.find(i => i.id === integrationId)?.name;
        toast({ title: 'تم قطع الاتصال', description: `تم إلغاء التكامل مع ${integrationName}.`, variant: 'destructive' });
    };

    const IntegrationCard = ({ integration }: { integration: typeof integrationsList[0] }) => {
        const isConnected = !!connected[integration.id];
        const [logoError, setLogoError] = useState(false);
        const logoUrl = `https://logo.clearbit.com/${integration.id.split('-')[0]}.com`;

        return (
            <Card className="hover:border-primary hover:shadow-lg transition-all duration-300 ease-in-out flex flex-col">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                            <div className="bg-primary/10 text-primary p-3 rounded-lg h-12 w-12 flex items-center justify-center">
                               {logoError ? (
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
                        <Badge variant={isConnected ? 'default' : 'secondary'} className={isConnected ? 'bg-green-100 text-green-700' : ''}>{isConnected ? 'متصل' : 'غير متصل'}</Badge>
                    </div>
                </CardHeader>
                <CardContent className="mt-auto">
                    <Separator className="my-2" />
                    <div className="flex justify-end gap-2 pt-2">
                        {isConnected ? (
                            <>
                                <Button variant="destructive" size="sm" onClick={() => handleDisconnect(integration.id)}>قطع الاتصال</Button>
                                <Button variant="secondary" size="sm" onClick={() => router.push(`/dashboard/settings/integrations/${integration.id}`)}>إدارة</Button>
                            </>
                        ) : (
                            <Button size="sm" onClick={() => handleConnectClick(integration)}>اتصال</Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    };

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

            <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                    {categories.map(cat => <TabsTrigger key={cat.id} value={cat.id}>{cat.name}</TabsTrigger>)}
                </TabsList>
                
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
        </div>
    );
}
