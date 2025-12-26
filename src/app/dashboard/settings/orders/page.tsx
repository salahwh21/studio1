'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useStatusesStore } from '@/store/statuses-store';
import { useSettings } from '@/contexts/SettingsContext';
import { Skeleton } from '@/components/ui/skeleton';
import { SettingsHeader } from '@/components/settings-header';
import {
    Save,
    Package,
    Archive,
    Hash,
    Clock,
    AlertTriangle,
    Settings2,
    FileText,
    CheckCircle2,
    Info,
    Layers,
    Timer,
    Bell,
    Trash2,
    RotateCcw,
    ShoppingCart,
    Tag,
    Calendar
} from 'lucide-react';

export default function OrderSettingsPage() {
    const { toast } = useToast();
    const { statuses } = useStatusesStore();
    const context = useSettings();

    const handleSave = () => {
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

    // Stats cards
    const statsCards = [
        {
            icon: Hash,
            label: 'بادئة الطلب',
            value: settings.orders.orderPrefix || 'ORD-',
            color: 'bg-blue-500/10 text-blue-600'
        },
        {
            icon: Package,
            label: 'الحالة الافتراضية',
            value: settings.orders.defaultStatus || 'بالانتظار',
            color: 'bg-green-500/10 text-green-600'
        },
        {
            icon: Archive,
            label: 'الأرشفة بعد',
            value: `${settings.orders.archiveAfterDays || 30} يوم`,
            color: 'bg-purple-500/10 text-purple-600'
        },
        {
            icon: Bell,
            label: 'التنبيه قبل',
            value: `${settings.orders.archiveWarningDays || 3} أيام`,
            color: 'bg-amber-500/10 text-amber-600'
        },
    ];

    return (
        <div className="space-y-6">
            <SettingsHeader
                icon="ShoppingCart"
                title="إعدادات الطلبات"
                description="التحكم في دورة حياة الطلبات وقواعد الترقيم والأرشفة التلقائية"
                color="emerald"
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statsCards.map((stat, index) => (
                    <Card key={index} className="border-r-4 border-r-primary/50">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${stat.color}`}>
                                    <stat.icon className="h-4 w-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                                    <p className="font-semibold text-sm truncate">{stat.value}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Tabs defaultValue="numbering" className="space-y-6" dir="rtl">
                <TabsList className="grid w-full grid-cols-3 h-auto p-1">
                    <TabsTrigger value="numbering" className="gap-2 py-2.5">
                        <Hash className="h-4 w-4" />
                        <span className="hidden sm:inline">الترقيم والبادئات</span>
                        <span className="sm:hidden">الترقيم</span>
                    </TabsTrigger>
                    <TabsTrigger value="defaults" className="gap-2 py-2.5">
                        <Settings2 className="h-4 w-4" />
                        <span className="hidden sm:inline">الإعدادات الافتراضية</span>
                        <span className="sm:hidden">الافتراضي</span>
                    </TabsTrigger>
                    <TabsTrigger value="archive" className="gap-2 py-2.5">
                        <Archive className="h-4 w-4" />
                        <span className="hidden sm:inline">الأرشفة التلقائية</span>
                        <span className="sm:hidden">الأرشفة</span>
                    </TabsTrigger>
                </TabsList>

                {/* Numbering Tab */}
                <TabsContent value="numbering" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-500/10">
                                    <Hash className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">بادئات الأرقام</CardTitle>
                                    <CardDescription>تخصيص بادئات أرقام الطلبات والمراجع</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Order Prefix */}
                                <div className="space-y-3">
                                    <Label htmlFor="order-prefix" className="flex items-center gap-2">
                                        <Tag className="h-4 w-4 text-primary" />
                                        بادئة رقم الطلب
                                    </Label>
                                    <Input
                                        id="order-prefix"
                                        value={settings.orders.orderPrefix}
                                        onChange={(e) => updateOrderSetting('orderPrefix', e.target.value)}
                                        placeholder="ORD-"
                                        className="h-11"
                                    />
                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                                        <Info className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">
                                            مثال: <Badge variant="secondary">{settings.orders.orderPrefix || 'ORD-'}1001</Badge>
                                        </span>
                                    </div>
                                </div>

                                {/* Reference Prefix */}
                                <div className="space-y-3">
                                    <Label htmlFor="ref-prefix" className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-primary" />
                                        بادئة الرقم المرجعي
                                    </Label>
                                    <Input
                                        id="ref-prefix"
                                        value={settings.orders.refPrefix}
                                        onChange={(e) => updateOrderSetting('refPrefix', e.target.value)}
                                        placeholder="REF-"
                                        className="h-11"
                                    />
                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                                        <Info className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">
                                            مثال: <Badge variant="secondary">{settings.orders.refPrefix || 'REF-'}2024001</Badge>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Info Note */}
                            <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                                <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">نصيحة</p>
                                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                        استخدم بادئات قصيرة ومميزة لتسهيل التعرف على الطلبات. يمكنك استخدام اسم متجرك أو اختصاره.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Defaults Tab */}
                <TabsContent value="defaults" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-green-500/10">
                                    <Settings2 className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">الإعدادات الافتراضية</CardTitle>
                                    <CardDescription>القيم الافتراضية للطلبات الجديدة</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Default Status */}
                            <div className="space-y-3">
                                <Label htmlFor="default-status" className="flex items-center gap-2">
                                    <Layers className="h-4 w-4 text-primary" />
                                    الحالة الافتراضية للطلب الجديد
                                </Label>
                                <Select
                                    value={settings.orders.defaultStatus}
                                    onValueChange={(value) => updateOrderSetting('defaultStatus', value)}
                                >
                                    <SelectTrigger id="default-status" className="h-11">
                                        <SelectValue placeholder="اختر حالة..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statuses.filter(s => s.isActive).map(status => (
                                            <SelectItem key={status.code} value={status.name}>
                                                <div className="flex items-center gap-2">
                                                    <div 
                                                        className="w-3 h-3 rounded-full" 
                                                        style={{ backgroundColor: status.color }}
                                                    />
                                                    {status.name}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    هذه الحالة ستُعيَّن تلقائياً لجميع الطلبات الجديدة
                                </p>
                            </div>

                            <Separator />

                            {/* Additional Default Settings */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-medium flex items-center gap-2">
                                    <ShoppingCart className="h-4 w-4" />
                                    خيارات إضافية
                                </h4>
                                
                                <div className="flex items-center justify-between rounded-xl border p-4 hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-muted">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <Label className="font-medium cursor-pointer">
                                                تعيين تاريخ اليوم تلقائياً
                                            </Label>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                تعيين تاريخ الطلب لتاريخ اليوم عند الإنشاء
                                            </p>
                                        </div>
                                    </div>
                                    <Switch defaultChecked />
                                </div>

                                <div className="flex items-center justify-between rounded-xl border p-4 hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-muted">
                                            <Hash className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <Label className="font-medium cursor-pointer">
                                                توليد رقم مرجعي تلقائي
                                            </Label>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                إنشاء رقم مرجعي فريد لكل طلب جديد
                                            </p>
                                        </div>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Archive Tab */}
                <TabsContent value="archive" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-purple-500/10">
                                    <Archive className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">قواعد الأرشفة</CardTitle>
                                    <CardDescription>تحديد متى وكيف يتم أرشفة الطلبات المكتملة</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Archive Start Status */}
                            <div className="space-y-3">
                                <Label htmlFor="archive-status" className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-primary" />
                                    حالة بدء الأرشفة
                                </Label>
                                <Select
                                    value={settings.orders.archiveStartStatus}
                                    onValueChange={(value) => updateOrderSetting('archiveStartStatus', value)}
                                >
                                    <SelectTrigger id="archive-status" className="h-11">
                                        <SelectValue placeholder="اختر حالة..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statuses.filter(s => s.flow.isFinal).map(status => (
                                            <SelectItem key={status.code} value={status.name}>
                                                <div className="flex items-center gap-2">
                                                    <div 
                                                        className="w-3 h-3 rounded-full" 
                                                        style={{ backgroundColor: status.color }}
                                                    />
                                                    {status.name}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    الطلبات التي تصل لهذه الحالة ستبدأ عملية الأرشفة
                                </p>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Archive After Days */}
                                <div className="space-y-3">
                                    <Label htmlFor="archive-after" className="flex items-center gap-2">
                                        <Timer className="h-4 w-4 text-primary" />
                                        أرشفة الطلبات بعد (يوم)
                                    </Label>
                                    <Input
                                        id="archive-after"
                                        type="number"
                                        min="1"
                                        value={settings.orders.archiveAfterDays}
                                        onChange={(e) => updateOrderSetting('archiveAfterDays', parseInt(e.target.value, 10))}
                                        className="h-11"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        المدة بالأيام قبل نقل الطلب للأرشيف
                                    </p>
                                </div>

                                {/* Warning Days */}
                                <div className="space-y-3">
                                    <Label htmlFor="archive-warning" className="flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                                        التنبيه قبل الأرشفة بـ (أيام)
                                    </Label>
                                    <Input
                                        id="archive-warning"
                                        type="number"
                                        min="1"
                                        value={settings.orders.archiveWarningDays}
                                        onChange={(e) => updateOrderSetting('archiveWarningDays', parseInt(e.target.value, 10))}
                                        className="h-11"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        تنبيه للمراجعة قبل نقل الطلب للأرشيف
                                    </p>
                                </div>
                            </div>

                            {/* Archive Info */}
                            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-amber-900 dark:text-amber-100">تنبيه مهم</p>
                                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                                        الطلبات المؤرشفة لن تظهر في القوائم الرئيسية ولكن يمكن الوصول إليها من قسم الأرشيف. 
                                        تأكد من مراجعة الطلبات قبل أرشفتها.
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            {/* Archive Actions */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-medium flex items-center gap-2">
                                    <Trash2 className="h-4 w-4" />
                                    إجراءات الأرشيف
                                </h4>
                                
                                <div className="flex items-center justify-between rounded-xl border p-4 hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-muted">
                                            <RotateCcw className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <Label className="font-medium cursor-pointer">
                                                السماح باستعادة الطلبات المؤرشفة
                                            </Label>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                إمكانية إرجاع الطلبات من الأرشيف للقائمة الرئيسية
                                            </p>
                                        </div>
                                    </div>
                                    <Switch defaultChecked />
                                </div>

                                <div className="flex items-center justify-between rounded-xl border p-4 hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-muted">
                                            <Bell className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <Label className="font-medium cursor-pointer">
                                                إرسال تنبيه قبل الأرشفة
                                            </Label>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                إشعار المستخدم قبل أرشفة الطلبات تلقائياً
                                            </p>
                                        </div>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Save Button */}
            <div className="flex items-center justify-between pt-6 border-t">
                <p className="text-sm text-muted-foreground">
                    التغييرات تُحفظ تلقائياً
                </p>
                <Button size="lg" onClick={handleSave} className="gap-2">
                    <Save className="h-4 w-4" />
                    حفظ التغييرات
                </Button>
            </div>
        </div>
    );
}
