'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/icon';
import { useStatusesStore } from '@/store/statuses-store';

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

    // Mock state for settings, in a real app this would come from a context or store
    const [settings, setSettings] = useState({
        orderPrefix: '-ORD',
        defaultStatus: 'PENDING',
        refPrefix: '-REF',
        archiveStartStatus: 'COMPLETED',
        archiveAfterDays: 90,
        archiveWarningDays: 7,
    });

    const handleSave = () => {
        // Here you would typically save the settings to your backend or a state management store
        console.log("Saving settings:", settings);
        toast({
            title: "تم الحفظ بنجاح!",
            description: "تم تحديث إعدادات الطلبات والأرشفة.",
        });
    };

    const handleSettingChange = (key: keyof typeof settings, value: string | number) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

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
                                value={settings.orderPrefix}
                                onChange={(e) => handleSettingChange('orderPrefix', e.target.value)}
                            />
                        </SettingInput>

                        <SettingInput id="default-status" label="الحالة الافتراضية للطلب الجديد" description="">
                             <Select
                                value={settings.defaultStatus}
                                onValueChange={(value) => handleSettingChange('defaultStatus', value)}
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
                                value={settings.refPrefix}
                                onChange={(e) => handleSettingChange('refPrefix', e.target.value)}
                            />
                        </SettingInput>
                        
                         <div></div>


                        <SettingInput id="archive-status" label="حالة بدء الأرشفة" description="أرشفة الطلبات بعد وصولها للحالة النهائية.">
                             <Select
                                value={settings.archiveStartStatus}
                                onValueChange={(value) => handleSettingChange('archiveStartStatus', value)}
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
                                value={settings.archiveAfterDays}
                                onChange={(e) => handleSettingChange('archiveAfterDays', parseInt(e.target.value, 10))}
                            />
                        </SettingInput>

                        <SettingInput id="archive-warning" label="التنبيه قبل الأرشفة بـ (أيام)" description="تنبيه للمراجعة قبل نقل الطلب للأرشيف.">
                             <Input
                                id="archive-warning"
                                type="number"
                                value={settings.archiveWarningDays}
                                onChange={(e) => handleSettingChange('archiveWarningDays', parseInt(e.target.value, 10))}
                            />
                        </SettingInput>
                    </div>

                    <div className="flex justify-start mt-8 pt-6 border-t">
                        <Button onClick={handleSave} className="bg-amber-500 hover:bg-amber-600 text-white font-bold">
                            حفظ التغييرات
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
