
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useSettings, type MenuVisibilitySettings } from '@/contexts/SettingsContext';
import { useRolesStore, type Role } from '@/store/roles-store';
import Icon from '@/components/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { SettingsHeader } from '@/components/settings-header';

const allNavItems = [
    { href: '/dashboard', iconName: 'LayoutDashboard', label: 'لوحة التحكم', permissionId: 'dashboard:view' },
    { href: '/dashboard/orders', iconName: 'ShoppingCart', label: 'عرض الطلبات', permissionId: 'orders:view' },
    { href: '/dashboard/add-order', iconName: 'PackagePlus', label: 'إضافة طلبات', permissionId: 'orders:create' },
    { href: '/dashboard/optimize', iconName: 'Wand2', label: 'تحسين المسار', permissionId: 'optimize:use' },
    { href: '/dashboard/drivers-map', iconName: 'Map', label: 'خريطة السائقين', permissionId: 'drivers-map:view' },
    { href: '/dashboard/returns', iconName: 'Undo2', label: 'إدارة المرتجعات', permissionId: 'returns:view' },
    { href: '/dashboard/financials', iconName: 'Calculator', label: 'المحاسبة', permissionId: 'financials:view' },
    { href: '/dashboard/settings', iconName: 'Settings', label: 'الإعدادات', permissionId: 'settings:view' },
    // Specific app views
    { href: '/dashboard/driver-app', iconName: 'Smartphone', label: 'تطبيق السائق', permissionId: 'driver-app:use' },
    { href: '/merchant', iconName: 'Store', label: 'بوابة التاجر', permissionId: 'merchant-portal:use' },
];


const RoleMenuSettings = ({ role, settings, onToggle }: {
    role: Role,
    settings: string[],
    onToggle: (roleId: string, permissionId: string, checked: boolean) => void
}) => (
    <Card>
        <CardHeader>
            <CardTitle>صلاحيات قائمة "{role.name}"</CardTitle>
            <CardDescription>اختر العناصر التي ستظهر في القائمة الجانبية لهذا الدور.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allNavItems.map(item => (
                <div key={item.permissionId} className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                    <Label htmlFor={`${role.id}-${item.permissionId}`} className="flex items-center gap-2 font-normal cursor-pointer">
                        <Icon name={item.iconName as any} className="h-4 w-4 text-muted-foreground" />
                        {item.label}
                    </Label>
                    <Switch
                        id={`${role.id}-${item.permissionId}`}
                        checked={settings.includes(item.permissionId)}
                        onCheckedChange={(checked) => onToggle(role.id, item.permissionId, checked)}
                    />
                </div>
            ))}
        </CardContent>
    </Card>
);

export default function MenuVisibilityPage() {
    const { toast } = useToast();
    const context = useSettings();
    const { roles } = useRolesStore();

    if (!context || !context.isHydrated) {
        return (
            <div className="space-y-6">
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
        // The settings are already saved in the context, this is for user feedback
        toast({
            title: "تم الحفظ بنجاح!",
            description: "تم تحديث إعدادات ظهور القائمة.",
        });
    };

    const rolesToDisplay = roles.filter(r => ['driver', 'merchant'].includes(r.id));

    return (
        <div className="space-y-6">
            <SettingsHeader
                icon="List"
                title="إعدادات ظهور القائمة"
                description="التحكم في عناصر القائمة التي تظهر لأدوار المستخدمين المختلفة"
                color="purple"
            />

            <div className="space-y-8">
                {rolesToDisplay.map(role => (
                    <RoleMenuSettings
                        key={role.id}
                        role={role}
                        settings={settings.menuVisibility[role.id] || []}
                        onToggle={handleToggle}
                    />
                ))}
            </div>

            <div className="flex justify-start pt-6 mt-6 border-t">
                <Button size="lg" onClick={handleSaveChanges}>
                    <Icon name="Save" className="ml-2 h-4 w-4" />
                    حفظ كل التغييرات
                </Button>
            </div>
        </div>
    );
}

