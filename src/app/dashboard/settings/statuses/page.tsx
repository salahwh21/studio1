
'use client';

import React, { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/icon';
import { SettingsHeader } from '@/components/settings-header';
import { useStatusesStore, type Status } from '@/store/statuses-store';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import chroma from 'chroma-js';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';


const iconNames = [
    'Clock', 'Truck', 'PackageCheck', 'CalendarClock', 'Undo2', 'XCircle',
    'HandCoins', 'CheckCheck', 'Repeat', 'ThumbsDown', 'Ban', 'Building',
    'Archive', 'PhoneOff'
];

const StatusDialog = ({
    open,
    onOpenChange,
    onSave,
    status,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (data: Omit<Status, 'id'>) => void;
    status: Partial<Status> | null;
}) => {
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [color, setColor] = useState('#607D8B');
    const [icon, setIcon] = useState('Clock');

    React.useEffect(() => {
        if (status) {
            setName(status.name || '');
            setCode(status.code || '');
            setColor(status.color || '#607D8B');
            setIcon(status.icon || 'Clock');
        } else {
            setName('');
            setCode('');
            setColor('#607D8B');
            setIcon('Clock');
        }
    }, [status, open]);

    const handleSave = () => {
        // A new status needs some default values.
        const newStatusData: Omit<Status, 'id'> = {
            name,
            code,
            color,
            icon,
            isActive: status?.isActive ?? true,
            reasonCodes: status?.reasonCodes ?? [],
            setByRoles: status?.setByRoles ?? ['admin'],
            visibleTo: status?.visibleTo ?? { admin: true, driver: true, merchant: true },
            permissions: status?.permissions ?? {
                driver: { canSet: true, requireProof: false, allowCODCollection: false },
                merchant: { showInPortal: true, showInReports: true },
                admin: { lockPriceEdit: false, lockAddressEdit: false }
            },
            flow: status?.flow ?? { isEntry: false, isFinal: false, nextCodes: [], blockedFrom: [] },
            triggers: status?.triggers ?? { requiresReason: false, createsReturnTask: false, sendsCustomerMessage: false, updatesDriverAccount: false },
        };
        onSave(newStatusData);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{status ? 'تعديل الحالة' : 'إضافة حالة جديدة'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">اسم الحالة</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="code">الكود (انجليزي بدون مسافات)</Label>
                        <Input id="code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s+/g, '_'))} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="color">اللون</Label>
                        <Input id="color" type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 p-1" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="icon">الأيقونة</Label>
                        <div className="grid grid-cols-6 gap-2 border p-2 rounded-md">
                            {iconNames.map(iconName => (
                                <Button
                                    key={iconName}
                                    variant={icon === iconName ? 'secondary' : 'ghost'}
                                    size="icon"
                                    onClick={() => setIcon(iconName)}
                                >
                                    <Icon name={iconName as any} />
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">إلغاء</Button></DialogClose>
                    <Button onClick={handleSave}>حفظ</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};


const StatusCard = ({ status }: { status: Status; onDelete: (id: string) => void; }) => {
    const gradientStyle = {
        background: `linear-gradient(to bottom right, ${status.color}, ${chroma(status.color).darken(0.6).hex()})`,
    };

    return (
        <Card
            className="hover:shadow-lg transition-all duration-300 ease-in-out flex flex-col text-white overflow-hidden"
            style={gradientStyle}
        >
            <CardHeader className="flex-grow flex items-center justify-center p-4">
                <Link href={`/dashboard/settings/statuses/${status.id}`} className="space-y-2 flex-1 cursor-pointer w-full text-center">
                    <div className="inline-flex flex-col items-center gap-2">
                        <Icon name={status.icon as any} className="h-8 w-8" />
                        <span className="text-lg font-bold">{status.name}</span>
                    </div>
                </Link>
            </CardHeader>
            <CardContent className="mt-auto p-3 bg-black/20">
                <div className="flex items-center justify-between rounded-md p-2">
                    <Label htmlFor={`status-active-${status.id}`} className="text-sm flex items-center gap-2 cursor-default text-white/80">
                        <Checkbox
                            id={`status-active-${status.id}`}
                            checked={status.isActive}
                            disabled={true}
                            className="border-white/50 data-[state=checked]:bg-white data-[state=checked]:text-black"
                        />
                        الحالة
                    </Label>
                    <Badge variant={status.isActive ? 'default' : 'secondary'} className={status.isActive ? 'bg-white/90 text-black' : 'bg-white/20 text-white/80'}>
                        {status.isActive ? 'مفعلة' : 'غير مفعلة'}
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
};

export default function StatusesPage() {
    const { toast } = useToast();
    const { statuses, setStatuses, addStatus, deleteStatus } = useStatusesStore();
    const [statusToDelete, setStatusToDelete] = useState<Status | null>(null);
    const importInputRef = useRef<HTMLInputElement>(null);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<Partial<Status> | null>(null);

    const handleDeleteRequest = (id: string) => {
        const status = statuses.find(s => s.id === id);
        if (status) {
            setStatusToDelete(status);
        }
    }

    const confirmDelete = () => {
        if (statusToDelete) {
            deleteStatus(statusToDelete.id);
            toast({ title: 'تم الحذف', description: `تم حذف حالة "${statusToDelete.name}".` });
            setStatusToDelete(null);
        }
    }

    const handleAddNew = () => {
        setSelectedStatus(null);
        setIsDialogOpen(true);
    }

    const handleSave = (data: Omit<Status, 'id'>) => {
        if (selectedStatus && 'id' in selectedStatus) {
            // This is an edit, which we don't have a button for yet, but the logic is here
        } else {
            addStatus(data);
            toast({ title: 'تمت الإضافة', description: `تمت إضافة حالة "${data.name}" بنجاح.` });
        }
        setIsDialogOpen(false);
    }

    const handleExport = useCallback(() => {
        const dataStr = JSON.stringify(statuses, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const exportFileDefaultName = 'statuses_export.json';

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        toast({ title: 'تم التصدير بنجاح' });
    }, [statuses, toast]);

    const handleImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') throw new Error("لا يمكن قراءة الملف");

                const importedStatuses = JSON.parse(text);

                if (Array.isArray(importedStatuses)) {
                    setStatuses(importedStatuses);
                    toast({ title: 'تم الاستيراد بنجاح', description: `تم استيراد ${importedStatuses.length} حالات.` });
                } else {
                    throw new Error("تنسيق الملف غير صالح.");
                }
            } catch (error: any) {
                toast({ variant: 'destructive', title: 'فشل الاستيراد', description: error.message || 'ملف JSON غير صالح.' });
            }
        };
        reader.readAsText(file);
        event.target.value = ''; // Reset file input
    }, [setStatuses, toast]);


    return (
        <>
            <div className="space-y-6">
                <SettingsHeader
                    icon="ListChecks"
                    title="إدارة حالات التوصيل"
                    description="تحكم في دورة حياة الطلب عبر إضافة وتخصيص الحالات المختلفة"
                    color="emerald"
                />

                <Card className="shadow-sm">
                    <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-xl font-bold tracking-tight">
                                جميع الحالات
                            </CardTitle>
                            <CardDescription className="mt-1">
                                حالات الطلبات المتاحة في النظام
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" onClick={() => importInputRef.current?.click()}><Icon name="Upload" className="mr-2 h-4 w-4" /> استيراد</Button>
                            <input type="file" ref={importInputRef} className="hidden" accept=".json" onChange={handleImport} />
                            <Button variant="outline" onClick={handleExport}><Icon name="Download" className="mr-2 h-4 w-4" /> تصدير</Button>
                            <Button onClick={handleAddNew}><Icon name="PlusCircle" className="mr-2 h-4 w-4" /> إضافة حالة جديدة</Button>
                        </div>
                    </CardHeader>
                </Card>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {statuses.map(status => (
                        <StatusCard key={status.id} status={status} onDelete={handleDeleteRequest} />
                    ))}
                </div>
            </div>

            <StatusDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onSave={handleSave}
                status={selectedStatus}
            />

            <AlertDialog open={!!statusToDelete} onOpenChange={() => setStatusToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                        <AlertDialogDescription>
                            هل أنت متأكد من حذف حالة "{statusToDelete?.name}"؟ لا يمكن التراجع عن هذا الإجراء.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">حذف</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
