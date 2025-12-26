'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SettingsHeader } from '@/components/settings-header';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/icon';
import { useRolesStore, allPermissionGroups, type Role } from '@/store/roles-store';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { 
    Shield, 
    Save, 
    CheckCircle2, 
    Lock, 
    Unlock,
    LayoutDashboard,
    Package,
    Bot,
    Route,
    Map,
    RotateCcw,
    DollarSign,
    Settings,
    Truck,
    Store,
    Eye,
    Plus,
    Edit,
    Trash2
} from 'lucide-react';

// Icon mapping for permission groups
const groupIcons: Record<string, React.ReactNode> = {
    dashboard: <LayoutDashboard className="h-5 w-5" />,
    orders: <Package className="h-5 w-5" />,
    'parse-order': <Bot className="h-5 w-5" />,
    optimize: <Route className="h-5 w-5" />,
    'drivers-map': <Map className="h-5 w-5" />,
    returns: <RotateCcw className="h-5 w-5" />,
    financials: <DollarSign className="h-5 w-5" />,
    settings: <Settings className="h-5 w-5" />,
    'driver-app': <Truck className="h-5 w-5" />,
    'merchant-portal': <Store className="h-5 w-5" />,
};

// Permission action icons
const getPermissionIcon = (permissionId: string) => {
    if (permissionId.includes(':view')) return <Eye className="h-3.5 w-3.5" />;
    if (permissionId.includes(':create')) return <Plus className="h-3.5 w-3.5" />;
    if (permissionId.includes(':edit')) return <Edit className="h-3.5 w-3.5" />;
    if (permissionId.includes(':delete')) return <Trash2 className="h-3.5 w-3.5" />;
    if (permissionId.includes(':manage')) return <Settings className="h-3.5 w-3.5" />;
    if (permissionId.includes(':use')) return <CheckCircle2 className="h-3.5 w-3.5" />;
    return <CheckCircle2 className="h-3.5 w-3.5" />;
};

function PermissionGroupCard({
    group,
    currentPermissions,
    onPermissionChange,
    isAllSelected,
}: {
    group: typeof allPermissionGroups[0],
    currentPermissions: string[],
    onPermissionChange: (permissionId: string, checked: boolean) => void,
    isAllSelected: boolean,
}) {
    const groupPermissionIds = group.permissions.map(p => p.id);
    const selectedCount = groupPermissionIds.filter(id => currentPermissions.includes(id) || isAllSelected).length;
    const isAllGroupSelected = selectedCount === groupPermissionIds.length;
    const isPartiallySelected = selectedCount > 0 && selectedCount < groupPermissionIds.length;

    const handleGroupPermissionChange = (checked: boolean) => {
        group.permissions.forEach(p => {
            const isCurrentlyChecked = currentPermissions.includes(p.id) || isAllSelected;
            if (isCurrentlyChecked !== checked) {
                onPermissionChange(p.id, checked);
            }
        });
    }

    return (
        <Card className={`transition-all ${isAllGroupSelected ? 'border-primary/50 bg-primary/5' : ''}`}>
            <CardHeader className="p-4 pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isAllGroupSelected ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                            {groupIcons[group.id] || <Shield className="h-5 w-5" />}
                        </div>
                        <div>
                            <CardTitle className="text-base font-semibold">{group.label}</CardTitle>
                            <CardDescription className="text-xs mt-0.5">
                                {selectedCount} من {groupPermissionIds.length} صلاحيات مفعلة
                            </CardDescription>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge variant={isAllGroupSelected ? "default" : isPartiallySelected ? "secondary" : "outline"} className="text-xs">
                            {isAllGroupSelected ? 'مفعل بالكامل' : isPartiallySelected ? 'جزئي' : 'معطل'}
                        </Badge>
                        <Switch
                            checked={isAllGroupSelected}
                            onCheckedChange={handleGroupPermissionChange}
                            disabled={isAllSelected}
                        />
                    </div>
                </div>
            </CardHeader>
            <Separator />
            <CardContent className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {group.permissions.map(permission => {
                        const isChecked = isAllSelected || currentPermissions.includes(permission.id);
                        return (
                            <div 
                                key={permission.id} 
                                className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer hover:border-primary/50 ${isChecked ? 'bg-primary/5 border-primary/30' : 'bg-muted/30 border-transparent'}`}
                                onClick={() => !isAllSelected && onPermissionChange(permission.id, !isChecked)}
                            >
                                <Checkbox
                                    id={permission.id}
                                    checked={isChecked}
                                    onCheckedChange={(checked) => onPermissionChange(permission.id, !!checked)}
                                    disabled={isAllSelected}
                                    className="pointer-events-none"
                                />
                                <div className={`p-1.5 rounded ${isChecked ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                    {getPermissionIcon(permission.id)}
                                </div>
                                <Label htmlFor={permission.id} className="font-normal text-sm cursor-pointer flex-1">
                                    {permission.label}
                                </Label>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    )
}

function RoleEditPageSkeleton() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-72 mt-2" />
                </CardHeader>
            </Card>
            {[1, 2, 3].map(i => (
                <Card key={i}>
                    <CardHeader className="flex flex-row items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-lg" />
                            <div>
                                <Skeleton className="h-5 w-32" />
                                <Skeleton className="h-3 w-24 mt-1" />
                            </div>
                        </div>
                        <Skeleton className="h-6 w-20" />
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-3 p-4">
                        <Skeleton className="h-12 rounded-lg" />
                        <Skeleton className="h-12 rounded-lg" />
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

export default function RoleEditPage() {
    const { toast } = useToast();
    const router = useRouter();
    const params = useParams();
    const roleId = params.roleId as Role['id'];

    const { roles, updateRolePermissions } = useRolesStore();
    const role = roles.find(r => r.id === roleId);

    const [permissions, setPermissions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        if (role) {
            setPermissions(role.permissions);
            setIsLoading(false);
        } else if (roles.length > 0) {
            toast({
                variant: 'destructive',
                title: 'خطأ',
                description: 'الدور المطلوب غير موجود.'
            });
            router.push('/dashboard/settings/roles');
        }
    }, [role, roles, router, toast]);

    // Track changes
    useEffect(() => {
        if (role) {
            const originalPermissions = role.permissions;
            const hasChanged = JSON.stringify([...permissions].sort()) !== JSON.stringify([...originalPermissions].sort());
            setHasChanges(hasChanged);
        }
    }, [permissions, role]);

    const handlePermissionChange = (permissionId: string, checked: boolean) => {
        setPermissions(prev => {
            const isCurrentlyAll = prev.includes('all');
            const allPermissionIds = allPermissionGroups.flatMap(g => g.permissions.map(p => p.id));
            let currentPermissions = isCurrentlyAll ? allPermissionIds : prev;

            if (checked) {
                return [...new Set([...currentPermissions, permissionId])];
            } else {
                return currentPermissions.filter(p => p !== permissionId && p !== 'all');
            }
        });
    };

    const handleSave = () => {
        if (!role) return;
        updateRolePermissions(role.id, permissions);
        toast({
            title: 'تم الحفظ بنجاح!',
            description: `تم تحديث صلاحيات دور "${role.name}".`,
        });
        setHasChanges(false);
    };

    // Stats
    const stats = useMemo(() => {
        const totalPermissions = allPermissionGroups.flatMap(g => g.permissions).length;
        const hasAllPermissions = permissions.includes('all');
        const permissionCount = hasAllPermissions ? totalPermissions : permissions.length;
        const percentage = Math.round((permissionCount / totalPermissions) * 100);
        return { totalPermissions, permissionCount, percentage, hasAllPermissions };
    }, [permissions]);

    if (isLoading) {
        return <RoleEditPageSkeleton />;
    }

    if (!role) {
        return null;
    }

    const isAllSelected = permissions.includes('all');

    return (
        <div className="space-y-6" dir="rtl">
            <SettingsHeader
                icon="Shield"
                title={`تعديل صلاحيات: ${role.name}`}
                description={role.description}
                backHref="/dashboard/settings/roles"
                breadcrumbs={[
                    { label: 'إدارة الأدوار', href: '/dashboard/settings/roles' }
                ]}
                color="purple"
            />

            {/* Stats & Full Access Card */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="md:col-span-2">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${isAllSelected ? 'bg-primary/10' : 'bg-muted'}`}>
                                    {isAllSelected ? (
                                        <Unlock className="h-6 w-6 text-primary" />
                                    ) : (
                                        <Lock className="h-6 w-6 text-muted-foreground" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">صلاحيات كاملة للنظام</h3>
                                    <p className="text-sm text-muted-foreground">
                                        منح جميع الصلاحيات المتاحة في النظام
                                    </p>
                                </div>
                            </div>
                            <Switch
                                checked={isAllSelected}
                                onCheckedChange={(checked) => setPermissions(checked ? ['all'] : [])}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">الصلاحيات المفعلة</span>
                                <Badge variant={stats.percentage === 100 ? "default" : "secondary"}>
                                    {stats.permissionCount} / {stats.totalPermissions}
                                </Badge>
                            </div>
                            <Progress value={stats.percentage} className="h-2" />
                            <p className="text-xs text-muted-foreground text-center">
                                {stats.percentage}% من إجمالي الصلاحيات
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Permission Groups */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    مجموعات الصلاحيات
                </h2>
                {allPermissionGroups.map(group => (
                    <PermissionGroupCard
                        key={group.id}
                        group={group}
                        currentPermissions={permissions}
                        onPermissionChange={handlePermissionChange}
                        isAllSelected={isAllSelected}
                    />
                ))}
            </div>

            {/* Save Button - Sticky */}
            <div className="sticky bottom-4 flex justify-end">
                <Button 
                    size="lg" 
                    onClick={handleSave}
                    disabled={!hasChanges}
                    className={`shadow-lg transition-all ${hasChanges ? 'animate-pulse' : ''}`}
                >
                    <Save className="ml-2 h-4 w-4" />
                    {hasChanges ? 'حفظ التغييرات' : 'لا توجد تغييرات'}
                </Button>
            </div>
        </div>
    );
}
