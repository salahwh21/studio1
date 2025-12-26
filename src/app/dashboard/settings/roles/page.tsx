'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
    CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/icon';
import { SettingsHeader } from '@/components/settings-header';
import { useRolesStore, type Role, allPermissionGroups } from '@/store/roles-store';
import { useUsersStore } from '@/store/user-store';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Shield, Users, Settings, Lock, Unlock, MoreVertical, PlusCircle, Search } from 'lucide-react';

// Role color mapping
const roleColors: Record<string, { bg: string; border: string; icon: string }> = {
    admin: { bg: 'bg-red-50 dark:bg-red-950', border: 'border-r-red-500', icon: 'text-red-600' },
    supervisor: { bg: 'bg-purple-50 dark:bg-purple-950', border: 'border-r-purple-500', icon: 'text-purple-600' },
    customer_service: { bg: 'bg-blue-50 dark:bg-blue-950', border: 'border-r-blue-500', icon: 'text-blue-600' },
    driver: { bg: 'bg-emerald-50 dark:bg-emerald-950', border: 'border-r-emerald-500', icon: 'text-emerald-600' },
    merchant: { bg: 'bg-orange-50 dark:bg-orange-950', border: 'border-r-orange-500', icon: 'text-orange-600' },
};

const getDefaultColor = () => ({ bg: 'bg-slate-50 dark:bg-slate-950', border: 'border-r-slate-500', icon: 'text-slate-600' });

const RoleCard = ({ role, userCount, onEdit, onDelete }: { role: Role; userCount: number; onEdit: (role: Role) => void; onDelete: (role: Role) => void; }) => {
    const colors = roleColors[role.id] || getDefaultColor();
    const isSystemRole = ['admin', 'driver', 'merchant'].includes(role.id);
    
    // Calculate permissions percentage
    const totalPermissions = allPermissionGroups.flatMap(g => g.permissions).length;
    const hasAllPermissions = role.permissions.includes('all');
    const permissionCount = hasAllPermissions ? totalPermissions : role.permissions.length;
    const permissionPercentage = Math.round((permissionCount / totalPermissions) * 100);

    return (
        <Card className={`hover:shadow-lg transition-all duration-300 border-r-4 ${colors.border} group`}>
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <Link href={`/dashboard/settings/roles/${role.id}`} className="flex-1">
                        <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-lg ${colors.bg}`}>
                                <Shield className={`h-5 w-5 ${colors.icon}`} />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">
                                    {role.name}
                                </CardTitle>
                                <CardDescription className="mt-1 line-clamp-2">
                                    {role.description}
                                </CardDescription>
                            </div>
                        </div>
                    </Link>
                    {!isSystemRole && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onSelect={() => onEdit(role)}>
                                    <Icon name="Edit" className="ml-2 h-4 w-4" />
                                    تعديل
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onSelect={() => onDelete(role)} className="text-destructive">
                                    <Icon name="Trash2" className="ml-2 h-4 w-4" />
                                    حذف
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Stats Row */}
                <div className="flex items-center justify-between gap-4">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center gap-2 text-sm">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-semibold">{userCount}</span>
                                    <span className="text-muted-foreground">مستخدم</span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>عدد المستخدمين بهذا الدور</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    
                    <Badge variant={hasAllPermissions ? "default" : "secondary"} className="gap-1">
                        {hasAllPermissions ? (
                            <>
                                <Unlock className="h-3 w-3" />
                                صلاحيات كاملة
                            </>
                        ) : (
                            <>
                                <Lock className="h-3 w-3" />
                                {permissionCount} صلاحية
                            </>
                        )}
                    </Badge>
                </div>

                {/* Permissions Progress */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">مستوى الصلاحيات</span>
                        <span className="font-medium">{permissionPercentage}%</span>
                    </div>
                    <Progress value={permissionPercentage} className="h-1.5" />
                </div>

                {/* Action Button */}
                <Button asChild className="w-full" variant="outline">
                    <Link href={`/dashboard/settings/roles/${role.id}`}>
                        <Settings className="ml-2 h-4 w-4" />
                        إدارة الصلاحيات
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
};

const RoleDialog = ({ open, onOpenChange, onSave, role }: { open: boolean, onOpenChange: (open: boolean) => void, onSave: (role: Omit<Role, 'id' | 'permissions' | 'userCount'>) => void, role: Role | null }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    React.useEffect(() => {
        if (role) {
            setName(role.name);
            setDescription(role.description);
        } else {
            setName('');
            setDescription('');
        }
    }, [role, open]);

    const handleSave = () => {
        if (!name.trim()) return;
        onSave({ name, description });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        {role ? 'تعديل الدور' : 'إضافة دور جديد'}
                    </DialogTitle>
                    <DialogDescription>
                        {role ? 'قم بتعديل اسم ووصف الدور.' : 'أدخل اسمًا ووصفًا للدور الجديد. يمكنك تعيين الصلاحيات لاحقًا.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">اسم الدور</Label>
                        <Input 
                            id="name" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            placeholder="مثال: محاسب، مدير مخزن..."
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">الوصف</Label>
                        <Input 
                            id="description" 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)} 
                            placeholder="وصف مختصر لمهام هذا الدور..."
                        />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">إلغاء</Button>
                    </DialogClose>
                    <Button onClick={handleSave} disabled={!name.trim()}>
                        <Icon name="Save" className="ml-2 h-4 w-4" />
                        حفظ
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function RolesListPage() {
    const { toast } = useToast();
    const { roles, addRole, updateRole, deleteRole } = useRolesStore();
    const { users, getUserCountByRole, syncRoleUserCounts } = useUsersStore();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // مزامنة عدد المستخدمين عند تحميل الصفحة
    useEffect(() => {
        syncRoleUserCounts();
    }, [users, syncRoleUserCounts]);

    const filteredRoles = useMemo(() => {
        if (!searchQuery) return roles;
        return roles.filter(role => 
            role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            role.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [roles, searchQuery]);

    // Stats - حساب من المستخدمين الفعليين
    const stats = useMemo(() => ({
        totalRoles: roles.length,
        totalUsers: users.length,
        systemRoles: roles.filter(r => ['admin', 'driver', 'merchant'].includes(r.id)).length,
        customRoles: roles.filter(r => !['admin', 'driver', 'merchant'].includes(r.id)).length,
    }), [roles, users]);

    const handleAddNew = () => {
        setSelectedRole(null);
        setDialogOpen(true);
    }

    const handleEdit = (role: Role) => {
        setSelectedRole(role);
        setDialogOpen(true);
    }

    const handleDelete = (role: Role) => {
        setRoleToDelete(role);
    }

    const confirmDelete = () => {
        if (roleToDelete) {
            deleteRole(roleToDelete.id);
            toast({ title: "تم الحذف", description: `تم حذف دور "${roleToDelete.name}" بنجاح.` });
            setRoleToDelete(null);
        }
    }

    const handleSave = (data: Omit<Role, 'id' | 'permissions' | 'userCount'>) => {
        if (selectedRole) {
            updateRole(selectedRole.id, data);
            toast({ title: "تم التعديل", description: `تم تعديل دور "${data.name}" بنجاح.` });
        } else {
            addRole(data);
            toast({ title: "تمت الإضافة", description: `تم إضافة دور "${data.name}" بنجاح. يمكنك الآن تعيين الصلاحيات.` });
        }
        setDialogOpen(false);
    }

    return (
        <div className="space-y-6" dir="rtl">
            <SettingsHeader
                icon="Shield"
                title="الأدوار والصلاحيات"
                description="إدارة الأدوار الوظيفية وتحكم في صلاحيات الوصول لكل دور في النظام"
                color="purple"
            />

            {/* Stats Cards */}
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                <Card className="border-r-4 border-r-purple-500">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">إجمالي الأدوار</p>
                                <p className="text-2xl font-bold mt-1">{stats.totalRoles}</p>
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
                                <p className="text-sm text-muted-foreground">إجمالي المستخدمين</p>
                                <p className="text-2xl font-bold mt-1">{stats.totalUsers}</p>
                            </div>
                            <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-950">
                                <Users className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-r-4 border-r-emerald-500">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">أدوار النظام</p>
                                <p className="text-2xl font-bold mt-1">{stats.systemRoles}</p>
                            </div>
                            <div className="p-2 bg-emerald-100 rounded-lg dark:bg-emerald-950">
                                <Lock className="h-5 w-5 text-emerald-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-r-4 border-r-orange-500">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">أدوار مخصصة</p>
                                <p className="text-2xl font-bold mt-1">{stats.customRoles}</p>
                            </div>
                            <div className="p-2 bg-orange-100 rounded-lg dark:bg-orange-950">
                                <Settings className="h-5 w-5 text-orange-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Actions Bar */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="relative w-full sm:max-w-xs">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="بحث عن دور..." 
                                className="pr-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button onClick={handleAddNew}>
                            <PlusCircle className="ml-2 h-4 w-4" />
                            إضافة دور جديد
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Roles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredRoles.map(role => (
                    <RoleCard
                        key={role.id}
                        role={role}
                        userCount={getUserCountByRole(role.id)}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                ))}
            </div>

            {filteredRoles.length === 0 && (
                <div className="text-center py-12">
                    <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">لا توجد أدوار مطابقة للبحث</p>
                </div>
            )}

            <RoleDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSave={handleSave}
                role={selectedRole}
            />

            <AlertDialog open={!!roleToDelete} onOpenChange={() => setRoleToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                        <AlertDialogDescription>
                            هل أنت متأكد من حذف دور "{roleToDelete?.name}"؟ 
                            {roleToDelete && roleToDelete.userCount > 0 && (
                                <span className="block mt-2 text-destructive font-medium">
                                    تحذير: يوجد {roleToDelete.userCount} مستخدمين بهذا الدور!
                                </span>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
                            حذف
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
