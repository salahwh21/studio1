
'use client';

import { useState, useContext } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/icon';
import { useStatusesStore } from '@/store/statuses-store';
import { useSettings } from '@/contexts/SettingsContext';
import { Skeleton } from '@/components/ui/skeleton';

const SettingInput = ({ id, label, description, children }: { id: string, label: string, description: string, children: React.ReactNode }) => (
    <div className="space-y-2">
        <Label htmlFor={id}>{label}</Label>
        {children}
        <p className="text-xs text-muted-foreground">{description}</p>
    </div>
);


export default function OrderSettingsPage() {
    const { toast } = useToast();
    const { statuses } = useStatusesStore();
    const context = useSettings();

    const handleSave = () => {
        // The context saves to localStorage automatically on change,
        // so this button is mostly for user feedback confirmation.
        toast({
            title: "تم الحفظ بنجاح!",
            description: "تم تحديث إعدادات الطلبات والأرشفة.",
        });
    };

    if (!context || !context.isHydrated) {
        return (
             <div className="space-y-6">
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }
    
    const { settings, updateOrderSetting } = context;

    return (
        <div className="space-y-6">
            <Card className="shadow-sm">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-2xl font-bold tracking-tight">إعدادات الطلبات والأرشفة</CardTitle>
                        <CardDescription className="mt-1">التحكم في دورة حياة الطلبات وقواعد الأرشفة التلقائية.</CardDescription>
                    </div>
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/dashboard/settings/general">
                            <Icon name="ArrowLeft" className="h-4 w-4" />
                        </Link>
                    </Button>
                </CardHeader>
            </Card>

            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <SettingInput id="order-prefix" label="بادئة رقم الطلب (Prefix)" description="مثال: ORD- أو -INV">
                            <Input
                                id="order-prefix"
                                value={settings.orders.orderPrefix}
                                onChange={(e) => updateOrderSetting('orderPrefix', e.target.value)}
                            />
                        </SettingInput>

                        <SettingInput id="default-status" label="الحالة الافتراضية للطلب الجديد" description="">
                             <Select
                                value={settings.orders.defaultStatus}
                                onValueChange={(value) => updateOrderSetting('defaultStatus', value)}
                            >
                                <SelectTrigger id="default-status">
                                    <SelectValue placeholder="اختر حالة..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {statuses.filter(s => s.isActive).map(status => (
                                        <SelectItem key={status.code} value={status.code}>{status.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </SettingInput>

                        <SettingInput id="ref-prefix" label="بادئة الرقم المرجعي التلقائي" description="مثال: -REF أو اسم المتجر">
                            <Input
                                id="ref-prefix"
                                value={settings.orders.refPrefix}
                                onChange={(e) => updateOrderSetting('refPrefix', e.target.value)}
                            />
                        </SettingInput>
                        
                         <div></div>


                        <SettingInput id="archive-status" label="حالة بدء الأرشفة" description="أرشفة الطلبات بعد وصولها للحالة النهائية.">
                             <Select
                                value={settings.orders.archiveStartStatus}
                                onValueChange={(value) => updateOrderSetting('archiveStartStatus', value)}
                            >
                                <SelectTrigger id="archive-status">
                                    <SelectValue placeholder="اختر حالة..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {statuses.filter(s => s.flow.isFinal).map(status => (
                                        <SelectItem key={status.code} value={status.code}>{status.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </SettingInput>

                        <SettingInput id="archive-after" label="أرشفة الطلبات بعد (يوم)" description="">
                            <Input
                                id="archive-after"
                                type="number"
                                value={settings.orders.archiveAfterDays}
                                onChange={(e) => updateOrderSetting('archiveAfterDays', parseInt(e.target.value, 10))}
                            />
                        </SettingInput>

                        <SettingInput id="archive-warning" label="التنبيه قبل الأرشفة بـ (أيام)" description="تنبيه للمراجعة قبل نقل الطلب للأرشيف.">
                             <Input
                                id="archive-warning"
                                type="number"
                                value={settings.orders.archiveWarningDays}
                                onChange={(e) => updateOrderSetting('archiveWarningDays', parseInt(e.target.value, 10))}
                            />
                        </SettingInput>
                    </div>

                    <div className="flex justify-start mt-8 pt-6 border-t">
                        <Button onClick={handleSave}>
                           <Icon name="Save" className="ml-2 h-4 w-4" /> حفظ التغييرات
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
