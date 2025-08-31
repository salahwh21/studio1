
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import Icon from '@/components/icon';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

// Mock data for statuses - in a real app this would come from a store or API
const initialStatuses = [
    { id: 'new', name: 'طلب جديد', color: '#3b82f6', icon: 'PackagePlus', type: 'neutral', isSystem: true },
    { id: 'in_progress', name: 'قيد التوصيل', color: '#2563eb', icon: 'Truck', type: 'neutral', isSystem: true },
    { id: 'delivered', name: 'تم التسليم', color: '#16a34a', icon: 'PackageCheck', type: 'positive', isSystem: true },
    { id: 'returned', name: 'مرتجع', color: '#dc2626', icon: 'Undo2', type: 'negative', isSystem: true },
    { id: 'postponed', name: 'مؤجل', color: '#f97316', icon: 'Clock', type: 'neutral', isSystem: false },
];

type Status = typeof initialStatuses[0];

const StatusDialog = ({
    open,
    onOpenChange,
    onSave,
    status
}: {
    open: boolean,
    onOpenChange: (open: boolean) => void,
    onSave: (data: Omit<Status, 'id' | 'isSystem'>) => void,
    status: Status | null
}) => {
    const [name, setName] = useState('');
    const [color, setColor] = useState('#cccccc');

    useState(() => {
        if(status) {
            setName(status.name);
            setColor(status.color);
        } else {
            setName('');
            setColor('#cccccc');
        }
    }, [status, open]);

    const handleSave = () => {
        if (!name) return;
        // In a real app, icon and type would be selectable
        onSave({ name, color, icon: 'Package', type: 'neutral' });
    }

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
                        <Label htmlFor="color">اللون</Label>
                        <Input id="color" type="color" value={color} onChange={(e) => setColor(e.target.value)} />
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


export default function StatusesPage() {
    const { toast } = useToast();
    const [statuses, setStatuses] = useState(initialStatuses);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<Status | null>(null);

    const handleAddNew = () => {
        setSelectedStatus(null);
        setDialogOpen(true);
    };

    const handleEdit = (status: Status) => {
        setSelectedStatus(status);
        setDialogOpen(true);
    };

    const handleDelete = (statusId: string) => {
        setStatuses(prev => prev.filter(s => s.id !== statusId));
        toast({ title: 'تم الحذف', description: 'تم حذف الحالة بنجاح.' });
    };

    const handleSave = (data: Omit<Status, 'id' | 'isSystem'>) => {
        if (selectedStatus) {
            setStatuses(prev => prev.map(s => s.id === selectedStatus.id ? { ...s, ...data } : s));
            toast({ title: 'تم التعديل', description: 'تم تحديث الحالة بنجاح.' });
        } else {
            setStatuses(prev => [...prev, { ...data, id: data.name.toLowerCase().replace(' ', '-'), isSystem: false }]);
            toast({ title: 'تمت الإضافة', description: 'تمت إضافة الحالة بنجاح.' });
        }
        setDialogOpen(false);
    };

    return (
        <div className="space-y-6">
            <Card className="shadow-sm">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <Icon name="ListChecks" /> إدارة حالات التوصيل
                        </CardTitle>
                        <CardDescription className="mt-1">
                            تخصيص مراحل وحالات دورة حياة الطلب لتناسب عمليات شركتك.
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="icon" asChild>
                            <Link href="/dashboard/settings"><Icon name="ArrowLeft" className="h-4 w-4" /></Link>
                        </Button>
                        <Button onClick={handleAddNew}><PlusCircle className="mr-2 h-4 w-4" /> إضافة حالة جديدة</Button>
                    </div>
                </CardHeader>
            </Card>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>الحالة</TableHead>
                                <TableHead>النوع</TableHead>
                                <TableHead>حالة نظام</TableHead>
                                <TableHead><span className="sr-only">إجراءات</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {statuses.map(status => (
                                <TableRow key={status.id}>
                                    <TableCell>
                                        <Badge style={{ backgroundColor: status.color, color: '#fff' }} className="gap-2">
                                            <Icon name={status.icon as any} className="h-4 w-4" />
                                            {status.name}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={status.type === 'positive' ? 'default' : status.type === 'negative' ? 'destructive' : 'secondary'}>
                                            {status.type === 'positive' ? 'إيجابي' : status.type === 'negative' ? 'سلبي' : 'محايد'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{status.isSystem ? 'نعم' : 'لا'}</TableCell>
                                    <TableCell className="text-left">
                                        {!status.isSystem && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onSelect={() => handleEdit(status)}>تعديل</DropdownMenuItem>
                                                    <DropdownMenuItem onSelect={() => handleDelete(status.id)} className="text-destructive">حذف</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <StatusDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSave={handleSave}
                status={selectedStatus}
            />
        </div>
    );
}

