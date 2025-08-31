
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useStatusesStore, type Status } from '@/store/statuses-store';
import { useToast } from '@/hooks/use-toast';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import Icon from '@/components/icon';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from '@/components/ui/alert-dialog';


const SwitchControl = ({ id, label, checked, onCheckedChange }: { id: string, label: string, checked: boolean, onCheckedChange: (checked: boolean) => void }) => (
    <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
        <Label htmlFor={id} className="font-medium cursor-pointer">{label}</Label>
        <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
);

const PageSkeleton = () => (
    <div className="space-y-6">
        <Card>
            <CardHeader className="flex flex-row justify-between items-center">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-6 w-32" />
                </div>
                <Skeleton className="h-8 w-20" />
            </CardHeader>
        </Card>
        <div className="grid grid-cols-1 gap-6">
            <Card>
                <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                </CardContent>
            </Card>
             <Card>
                <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </CardContent>
            </Card>
        </div>
    </div>
);

export default function StatusEditPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const { statusId } = params;

    const { statuses, updateStatus, deleteStatus } = useStatusesStore();
    const [status, setStatus] = useState<Status | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        const foundStatus = statuses.find(s => s.id === statusId);
        if (foundStatus) {
            setStatus(foundStatus);
        } else if (statuses.length > 0) { // Avoid redirect on initial load
             toast({
                variant: 'destructive',
                title: 'خطأ',
                description: 'الحالة المطلوبة غير موجودة.'
            });
            router.push('/dashboard/settings/statuses');
        }
        setIsLoading(false);
    }, [statusId, statuses, router, toast]);

    const handleUpdate = <K extends keyof Status>(key: K, value: Status[K]) => {
        setStatus(prev => prev ? { ...prev, [key]: value } : null);
    };

    const handlePermissionUpdate = (
        category: 'visibleTo' | 'permissions', 
        role: keyof Status['visibleTo'] | keyof Status['permissions']['driver'],
        value: any
    ) => {
        setStatus(prev => {
            if (!prev) return null;
            const newState = JSON.parse(JSON.stringify(prev)); // Deep copy
            if(category === 'visibleTo') {
                 (newState.visibleTo as any)[role] = value;
            } else if (category === 'permissions') {
                (newState.permissions.driver as any)[role] = value;
            }
            return newState;
        });
    }

    const handleSave = () => {
        if (status) {
            updateStatus(status.id, status);
            toast({
                title: "تم الحفظ بنجاح",
                description: `تم تحديث حالة "${status.name}".`
            });
            router.push('/dashboard/settings/statuses');
        }
    };
    
    const handleDelete = () => {
        if(status) {
            deleteStatus(status.id);
            toast({
                title: "تم الحذف",
                description: `تم حذف حالة "${status.name}".`
            });
            router.push('/dashboard/settings/statuses');
        }
    }

    if (isLoading || !status) {
        return <PageSkeleton />;
    }

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-xl font-bold">
                            <Icon name={status.icon as any} style={{ color: status.color }} />
                            <span>تعديل حالة: {status.name}</span>
                        </div>
                        <div className="flex items-center space-x-2 space-x-reverse">
                            <Switch
                                id="status-active"
                                checked={status.isActive}
                                onCheckedChange={(val) => handleUpdate('isActive', val)}
                            />
                            <Label htmlFor="status-active">مفعلة</Label>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                         <Button variant="outline" size="icon" onClick={() => setShowDeleteConfirm(true)}>
                            <Icon name="Trash2" className="h-4 w-4 text-destructive" />
                        </Button>
                         <Button variant="outline" size="icon" asChild>
                            <Link href="/dashboard/settings/statuses">
                                <Icon name="ArrowUp" className="h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </CardHeader>
            </Card>

            {/* Basic Info */}
            <Card>
                <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="space-y-2">
                        <Label htmlFor="status-name">اسم الحالة</Label>
                        <Input id="status-name" value={status.name} onChange={(e) => handleUpdate('name', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="status-code">الكود البرمجي</Label>
                        <Input id="status-code" value={status.code} onChange={(e) => handleUpdate('code', e.target.value.toUpperCase())} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="status-color">اللون</Label>
                        <Input id="status-color" type="color" value={status.color} onChange={(e) => handleUpdate('color', e.target.value)} className="h-10 p-1" />
                    </div>
                </CardContent>
            </Card>
            
            {/* Permissions */}
             <Card>
                <CardHeader>
                    <CardTitle>الأذونات</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h4 className="font-semibold mb-3">من يمكنه رؤية الحالة؟</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <SwitchControl id="visible-admin" label="المدير" checked={status.visibleTo.admin} onCheckedChange={(val) => handlePermissionUpdate('visibleTo', 'admin', val)} />
                            <SwitchControl id="visible-driver" label="السائق" checked={status.visibleTo.driver} onCheckedChange={(val) => handlePermissionUpdate('visibleTo', 'driver', val)} />
                            <SwitchControl id="visible-merchant" label="التاجر" checked={status.visibleTo.merchant} onCheckedChange={(val) => handlePermissionUpdate('visibleTo', 'merchant', val)} />
                        </div>
                    </div>
                     <Separator />
                    <div>
                        <h4 className="font-semibold mb-3">صلاحيات السائق</h4>
                         <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                           <SwitchControl id="driver-can-set" label="يمكنه تعيينها" checked={status.permissions.driver.canSet} onCheckedChange={(val) => handlePermissionUpdate('permissions', 'canSet', val)} />
                           <SwitchControl id="driver-cod" label="يسمح بتحصيل المبلغ" checked={status.permissions.driver.allowCODCollection} onCheckedChange={(val) => handlePermissionUpdate('permissions', 'allowCODCollection', val)} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Automatic Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>الإجراءات التلقائية</CardTitle>
                </CardHeader>
                 <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <SwitchControl id="trigger-reason" label="تتطلب تحديد سبب" checked={status.triggers.requiresReason} onCheckedChange={(val) => handleUpdate('triggers', {...status.triggers, requiresReason: val})} />
                    <SwitchControl id="trigger-return" label="تنشئ مهمة مرتجع" checked={status.triggers.createsReturnTask} onCheckedChange={(val) => handleUpdate('triggers', {...status.triggers, createsReturnTask: val})} />
                    <SwitchControl id="trigger-message" label="ترسل رسالة للعميل" checked={status.triggers.sendsCustomerMessage} onCheckedChange={(val) => handleUpdate('triggers', {...status.triggers, sendsCustomerMessage: val})} />
                </CardContent>
            </Card>
            
            <div className="flex justify-end">
                <Button size="lg" onClick={handleSave}>
                    <Icon name="Save" className="ml-2 h-4 w-4" />
                    حفظ التغييرات
                </Button>
            </div>
            
            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                        <AlertDialogDescription>
                            هل أنت متأكد من حذف حالة "{status.name}"؟ لا يمكن التراجع عن هذا الإجراء.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">حذف</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
