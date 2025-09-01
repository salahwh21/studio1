
'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';

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

const mockConversation = [
    { from: 'ai', text: "مرحبًا! أنا هنا لمساعدتك في ربط متجرك على Shopify. للبدء، أحتاج منك إنشاء تطبيق مخصص (Custom App) داخل لوحة تحكم Shopify الخاصة بك. هل تريدني أن أرشدك للوصول إلى تلك الصفحة؟" },
    { from: 'user', text: "نعم، أرشدني." },
    { from: 'ai', text: "ممتاز. افتح لوحة تحكم Shopify، ثم اذهب إلى `Apps and sales channels` > `Develop apps` > `Create an app`. عندما تصل إلى هناك، أخبرني." },
    { from: 'user', text: "لقد وصلت إلى الصفحة." },
    { from: 'ai', text: "رائع. الآن، عند إعداد صلاحيات التطبيق، تأكد من منح الأذونات التالية: `read_orders`, `write_orders`, و `read_products`. هذه الصلاحيات ضرورية لجلب الطلبات وتحديث حالتها. بعد حفظ الأذونات، ستمنحك Shopify مفتاح وصول (API Access Token). يرجى لصق المفتاح هنا." },
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
                <CardContent className="flex-1 space-y-6 overflow-y-auto p-4">
                   {mockConversation.map((msg, index) => (
                       <div key={index} className={`flex items-start gap-3 ${msg.from === 'user' ? 'justify-end' : ''}`}>
                            {msg.from === 'ai' && (
                                 <Avatar className="h-8 w-8 border-2 border-primary">
                                    <AvatarFallback><Icon name="Bot" className="h-4 w-4"/></AvatarFallback>
                                </Avatar>
                            )}
                             <div className={`max-w-md rounded-lg p-3 ${msg.from === 'ai' ? 'bg-muted' : 'bg-primary text-primary-foreground'}`}>
                                <p className="text-sm" style={{whiteSpace: 'pre-wrap'}}>{msg.text}</p>
                            </div>
                             {msg.from === 'user' && (
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>أ</AvatarFallback>
                                </Avatar>
                            )}
                       </div>
                   ))}
                </CardContent>
                <CardFooter className="p-4 border-t">
                    <div className="relative w-full">
                        <Textarea placeholder="اكتب ردك أو الصق مفتاح الربط هنا..." className="pr-20"/>
                        <div className="absolute left-2 top-1/2 -translate-y-1/2 flex gap-2">
                            <Button size="sm"><Icon name="Send" className="h-4 w-4"/></Button>
                             <Button size="sm" variant="outline"><Icon name="Paperclip" className="h-4 w-4"/></Button>
                        </div>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
