'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/contexts/SettingsContext';
import { useRolesStore, type Role } from '@/store/roles-store';
import { useUsersStore } from '@/store/user-store';
import Icon from '@/components/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { SettingsHeader } from '@/components/settings-header';
import { 
    LayoutDashboard, 
    ShoppingCart, 
    PackagePlus, 
    Wand2, 
    Map, 
    Undo2, 
    Calculator, 
    Settings,
    Users,
    Shield,
    Eye,
    EyeOff,
    Info
} from 'lucide-react';

// عناصر القائمة الجانبية للوحة الإدارة فقط
const adminNavItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'لوحة التحكم', permissionId: 'dashboard:view', description: 'الصفحة الرئيسية والإحصائيات' },
    { href: '/dashboard/orders', icon: ShoppingCart, label: 'عرض الطلبات', permissionId: 'orders:view', description: 'عرض وإدارة جميع الطلبات' },
    { href: '/dashboard/add-order', icon: PackagePlus, label: 'إضافة طلبات', permissionId: 'orders:create', description: 'إنشاء طلبات جديدة' },
    { href: '/dashboard/optimize', icon: Wand2, label: 'تحسين المسار', permissionId: 'optimize:use', description: 'تحسين مسارات التوصيل' },
    { href: '/dashboard/drivers-map', icon: Map, label: 'خريطة السائقين', permissionId: 'drivers-map:view', description: 'تتبع السائقين على الخريطة' },
    { href: '/dashboard/returns', icon: Undo2, label: 'إدارة المرتجعات', permissionId: 'returns:view', description: 'إدارة الطلبات المرتجعة' },
    { href: '/dashboard/financials', icon: Calculator, label: 'المحاسبة', permissionId: 'financials:view', description: 'التقارير المالية والمحاسبة' },
    { href: '/dashboard/settings', icon: Settings, label: 'الإعدادات', permissionId: 'settings:view', description: 'إعدادات النظام' },
];

const RoleMenuSettings = ({ 
    role, 
    settings, 
    onToggle,
    userCount 
}: {
    role: Role,
    settings: string[],
    onToggle: (roleId: string, permissionId: string, checked: boolean) => void,
    userCount: number
}) => {
    const enabledCount = settings.length;
    const totalCount = adminNavItems.length;

    return (
        <Card className="border-r-4 border-r-purple-500">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg dark:bg-purple-950">
                            <Shield className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">{role.name}</CardTitle>
                            <CardDescription>{role.description}</CardDescription>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="gap-1">
                            <Users className="h-3 w-3" />
                            {userCount} مستخدم
                        </Badge>
                        <Badge variant={enabledCount === totalCount ? "default" : "outline"}>
                            {enabledCount}/{totalCount} مفعل
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {adminNavItems.map(item => {
                        const isEnabled = settings.includes(item.permissionId);
                        const ItemIcon = item.icon;
                        
                        return (
                            <div 
                                key={item.permissionId} 
                                className={`flex items-center justify-between rounded-lg border p-3 transition-all cursor-pointer hover:border-primary/50 ${
                                    isEnabled ? 'bg-primary/5 border-primary/30' : 'bg-muted/30'
                                }`}
                                onClick={() => onToggle(role.id, item.permissionId, !isEnabled)}
                            >
                                <div className="flex items-center gap-2">
                                    <div className={`p-1.5 rounded ${isEnabled ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                        <ItemIcon className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <Label className="font-medium text-sm cursor-pointer">
                                            {item.label}
                                        </Label>
                                    </div>
                                </div>
                                <Switch
                                    checked={isEnabled}
                                    onCheckedChange={(checked) => onToggle(role.id, item.permissionId, checked)}
                                    className="pointer-events-none"
                                />
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
};

export default function MenuVisibilityPage() {
    const { toast } = useToast();
    const context = useSettings();
    const { roles } = useRolesStore();
    const { users, getUserCountByRole } = useUsersStore();

    if (!context || !context.isHydrated) {
        return (
            <div className="space-y-6" dir="rtl">
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    const { settings, updateMenuVisibility } = context;

    const handleToggle = (roleId: string, permissionId: string, checked: boolean) => {
        updateMenuVisibility(roleId, permissionId, checked);
    };

    const handleSaveChanges = () => {
        toast({
            title: "تم الحفظ بنجاح!",
            description: "تم تحديث إعدادات ظهور القائمة.",
        });
    };

    // فقط أدوار موظفي الإدارة (ليس التجار والسائقين)
    const adminRoles = roles.filter(r => !['driver', 'merchant'].includes(r.id));

    return (
        <div className="space-y-6" dir="rtl">
            <SettingsHeader
                icon="List"
                title="رؤية القوائم للموظفين"
                description="التحكم في عناصر القائمة الجانبية التي تظهر لكل دور من أدوار موظفي الإدارة"
                color="purple"
            />

            {/* ملاحظة توضيحية */}
            <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                            <p className="font-medium text-blue-900 dark:text-blue-100">ملاحظة هامة</p>
                            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                هذه الإعدادات تتحكم في القائمة الجانبية للوحة الإدارة فقط. 
                                التجار والسائقين لديهم تطبيقات مستقلة بقوائم خاصة بهم.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* إحصائيات سريعة */}
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                <Card className="border-r-4 border-r-purple-500">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">أدوار الإدارة</p>
                                <p className="text-2xl font-bold mt-1">{adminRoles.length}</p>
                            </div>
                            <div className="p-2 bg-purple-100 rounded-lg dark:bg-purple-950">
                                <Shield className="h-5 w-5 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-r-4 border-r-blue-500">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">موظفي الإدارة</p>
                                <p className="text-2xl font-bold mt-1">
                                    {users.filter(u => !['driver', 'merchant'].includes(u.roleId)).length}
                                </p>
                            </div>
                            <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-950">
                                <Users className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-r-4 border-r-green-500">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">عناصر القائمة</p>
                                <p className="text-2xl font-bold mt-1">{adminNavItems.length}</p>
                            </div>
                            <div className="p-2 bg-green-100 rounded-lg dark:bg-green-950">
                                <LayoutDashboard className="h-5 w-5 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-r-4 border-r-orange-500">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">التجار + السائقين</p>
                                <p className="text-2xl font-bold mt-1">
                                    {users.filter(u => ['driver', 'merchant'].includes(u.roleId)).length}
                                </p>
                            </div>
                            <div className="p-2 bg-orange-100 rounded-lg dark:bg-orange-950">
                                <Eye className="h-5 w-5 text-orange-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* إعدادات كل دور */}
            <div className="space-y-6">
                {adminRoles.map(role => (
                    <RoleMenuSettings
                        key={role.id}
                        role={role}
                        settings={settings.menuVisibility[role.id] || []}
                        onToggle={handleToggle}
                        userCount={getUserCountByRole(role.id)}
                    />
                ))}
            </div>

            {adminRoles.length === 0 && (
                <Card>
                    <CardContent className="p-12 text-center">
                        <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">لا توجد أدوار إدارية. قم بإضافة أدوار من صفحة الأدوار والصلاحيات.</p>
                        <Button asChild className="mt-4">
                            <a href="/dashboard/settings/roles">
                                <Icon name="Plus" className="ml-2 h-4 w-4" />
                                إضافة دور جديد
                            </a>
                        </Button>
                    </CardContent>
                </Card>
            )}

            <div className="flex justify-start pt-6 mt-6 border-t">
                <Button size="lg" onClick={handleSaveChanges}>
                    <Icon name="Save" className="ml-2 h-4 w-4" />
                    حفظ كل التغييرات
                </Button>
            </div>
        </div>
    );
}
