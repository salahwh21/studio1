
'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';

const integrationsList = [
    { id: 'shopify', name: 'Shopify', iconName: 'ShoppingCart' as const },
    { id: 'woocommerce', name: 'WooCommerce', iconName: 'ShoppingCart' as const },
    { id: 'salla', name: 'Salla (سلة)', iconName: 'ShoppingCart' as const },
    { id: 'zid', name: 'Zid (زد)', iconName: 'ShoppingCart' as const },
    { id: 'aramex', name: 'Aramex', iconName: 'Truck' as const },
    { id: 'dhl', name: 'DHL', iconName: 'Globe' as const },
    { id: 'fedex', name: 'FedEx', iconName: 'Globe' as const },
    { id: 'smsa-express', name: 'SMSA Express', iconName: 'Truck' as const },
    { id: 'odoo', name: 'Odoo', iconName: 'Briefcase' as const },
    { id: 'quickbooks', name: 'QuickBooks', iconName: 'Briefcase' as const },
    { id: 'zoho-books', name: 'Zoho Books', iconName: 'Briefcase' as const },
    { id: 'twilio', name: 'Twilio', iconName: 'MessageSquare' as const },
    { id: 'ycloud', name: 'YCloud', iconName: 'MessageSquare' as const },
    { id: 'whatsapp', name: 'WhatsApp', iconName: 'MessageSquare' as const },
    { id: 'stripe', name: 'Stripe', iconName: 'CreditCard' as const },
    { id: 'paypal', name: 'PayPal', iconName: 'CreditCard' as const },
    { id: 'paytabs', name: 'PayTabs', iconName: 'CreditCard' as const },
    { id: 'zapier', name: 'Zapier', iconName: 'Zap' as const },
    { id: 'generic-webhook', name: 'Generic Webhook', iconName: 'Webhook' as const },
    { id: 'custom-api', name: 'Custom API', iconName: 'Code' as const }
];

export default function ConnectIntegrationPage() {
    const params = useParams();
    const router = useRouter();
    const { integrationId } = params;
    const [integrationInfo, setIntegrationInfo] = useState<{ id: string; name: string; iconName: any; } | null>(null);

    useEffect(() => {
        const foundIntegration = integrationsList.find(i => i.id === integrationId);
        if (foundIntegration) {
            setIntegrationInfo(foundIntegration);
        } else {
            router.push('/dashboard/settings/integrations');
        }
    }, [integrationId, router]);

    if (!integrationInfo) {
        return <Skeleton className="h-screen w-full" />;
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="bg-primary/10 text-primary p-3 rounded-lg">
                            <Icon name={integrationInfo.iconName} className="h-6 w-6" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-bold tracking-tight">إعداد تكامل: {integrationInfo.name}</CardTitle>
                            <CardDescription className="mt-1">
                                اتبع إرشادات وكيل الذكاء الاصطناعي لإكمال عملية الربط بسهولة.
                            </CardDescription>
                        </div>
                    </div>
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/dashboard/settings/integrations">
                            <Icon name="ArrowLeft" className="h-4 w-4" />
                        </Link>
                    </Button>
                </CardHeader>
            </Card>

            <Card className="min-h-[60vh] flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Icon name="Bot" className="text-primary"/>
                        وكيل إعداد التكاملات
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center text-center">
                    <div className="space-y-4">
                        <Icon name="Wand2" className="h-16 w-16 text-muted-foreground mx-auto animate-pulse" />
                        <h3 className="text-xl font-semibold">واجهة المحادثة قيد الإنشاء</h3>
                        <p className="text-muted-foreground">
                            قريباً، ستتمكن من التحدث مع وكيل الذكاء الاصطناعي لإعداد تكاملاتك خطوة بخطوة.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
