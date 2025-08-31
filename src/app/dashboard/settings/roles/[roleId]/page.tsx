
'use client';

import { useState, useEffect } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import Icon from '@/components/icon';
import { useRolesStore, allPermissionGroups, type Role } from '@/store/roles-store';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

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
    const isAllGroupSelected = groupPermissionIds.every(id => currentPermissions.includes(id)) || isAllSelected;

    const handleGroupPermissionChange = (checked: boolean) => {
        group.permissions.forEach(p => {
            const isCurrentlyChecked = currentPermissions.includes(p.id) || isAllSelected;
            if (isCurrentlyChecked !== checked) {
                 onPermissionChange(p.id, checked);
            }
        });
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between p-4 bg-muted/50">
                <CardTitle className="text-base">{group.label}</CardTitle>
                 <div className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox
                        id={`group-${group.id}`}
                        checked={isAllGroupSelected}
                        onCheckedChange={(checked) => handleGroupPermissionChange(!!checked)}
                        disabled={isAllSelected}
                    />
                    <Label htmlFor={`group-${group.id}`}>تحديد الكل</Label>
                </div>
            </CardHeader>
            <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {group.permissions.map(permission => (
                    <div key={permission.id} className="flex items-center space-x-2 space-x-reverse p-3 rounded-md bg-muted/50">
                        <Checkbox
                            id={permission.id}
                            checked={isAllSelected || currentPermissions.includes(permission.id)}
                            onCheckedChange={(checked) => onPermissionChange(permission.id, !!checked)}
                            disabled={isAllSelected}
                        />
                        <Label htmlFor={permission.id} className="font-normal text-muted-foreground">
                            {permission.label}
                        </Label>
                    </div>
                ))}
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
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-6 w-24" />
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <Skeleton className="h-12 rounded-md" />
                    <Skeleton className="h-12 rounded-md" />
                    <Skeleton className="h-12 rounded-md" />
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-6 w-24" />
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <Skeleton className="h-12 rounded-md" />
                    <Skeleton className="h-12 rounded-md" />
                </CardContent>
            </Card>
             <div className="flex justify-end pt-4">
                <Skeleton className="h-10 w-32" />
             </div>
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

    useEffect(() => {
        if (role) {
            setPermissions(role.permissions);
            setIsLoading(false);
        } else if (roles.length > 0) {
            // Role not found, maybe redirect
            toast({
                variant: 'destructive',
                title: 'خطأ',
                description: 'الدور المطلوب غير موجود.'
            });
            router.push('/dashboard/settings/roles');
        }
    }, [role, roles, router, toast]);

    const handlePermissionChange = (permissionId: string, checked: boolean) => {
        setPermissions(prev => {
            const isCurrentlyAll = prev.includes('all');
            const allPermissionIds = allPermissionGroups.flatMap(g => g.permissions.map(p => p.id));
            let currentPermissions = isCurrentlyAll ? allPermissionIds : prev;

            if (checked) {
                // Add permission if it doesn't exist
                return [...new Set([...currentPermissions, permissionId])];
            } else {
                // Remove permission, and also 'all' if it exists
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
        router.push('/dashboard/settings/roles');
    };

    if (isLoading) {
        return <RoleEditPageSkeleton />;
    }

    if (!role) {
        // This will be shown briefly before the redirect effect kicks in
        return null; 
    }

    const isAllSelected = permissions.includes('all');

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-2xl font-bold flex items-center gap-3">
                                <Icon name="Edit" />
                                تعديل صلاحيات: {role.name}
                            </CardTitle>
                            <CardDescription className="mt-2">{role.description}</CardDescription>
                        </div>
                         <Button variant="outline" size="icon" asChild>
                            <Link href="/dashboard/settings/roles">
                                <Icon name="ArrowLeft" className="h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="flex items-center space-x-2 space-x-reverse border-t pt-6">
                     <Checkbox
                        id="select-all"
                        checked={isAllSelected}
                        onCheckedChange={(checked) => setPermissions(checked ? ['all'] : [])}
                     />
                    <Label htmlFor="select-all" className="text-base font-semibold cursor-pointer">
                        منح صلاحيات كاملة للنظام (Full Access)
                    </Label>
                </CardContent>
            </Card>

            <div className="space-y-4">
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

            <div className="flex justify-end pt-4">
                <Button size="lg" onClick={handleSave}>
                    <Icon name="Save" className="ml-2 h-4 w-4" />
                    حفظ التغييرات
                </Button>
            </div>
        </div>
    );
}
