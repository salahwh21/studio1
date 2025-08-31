
'use client';

import React, { useState } from 'react';
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
import { useStatusesStore, type Status } from '@/store/statuses-store';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';


const StatusCard = ({ status, onDelete }: { status: Status; onDelete: (id: string) => void; }) => {
  return (
    <Card className="hover:border-primary hover:shadow-lg transition-all duration-200 flex flex-col">
        <CardHeader>
             <div className="flex items-start justify-between">
                <Link href={`/dashboard/settings/statuses/${status.id}`} className="space-y-2 flex-1 cursor-pointer">
                    <Badge style={{ backgroundColor: status.color, color: '#fff' }} className="border-none text-xs">
                        {status.name}
                    </Badge>
                    <CardTitle className="text-lg font-bold flex items-center gap-2 pt-2">
                        <Icon name={status.icon as any} className="h-5 w-5" />
                        <span>{status.name}</span>
                    </CardTitle>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => onDelete(status.id)} aria-label={`حذف حالة ${status.name}`}>
                    <Icon name="Trash2" className="h-4 w-4 text-destructive" />
                </Button>
            </div>
        </CardHeader>
        <CardContent className="mt-auto">
             <div className="flex items-center justify-between rounded-md border p-2">
                <Label htmlFor={`status-active-${status.id}`} className="text-sm flex items-center gap-2 cursor-default">
                    <Checkbox 
                        id={`status-active-${status.id}`}
                        checked={status.isActive}
                        disabled={true}
                    />
                    الحالة
                </Label>
                 <Badge variant={status.isActive ? 'default' : 'secondary'} className={status.isActive ? 'bg-green-100 text-green-800' : ''}>
                    {status.isActive ? 'مفعلة' : 'غير مفعلة'}
                </Badge>
            </div>
        </CardContent>
    </Card>
  );
};

export default function StatusesPage() {
  const { toast } = useToast();
  const { statuses, deleteStatus } = useStatusesStore();
  const [statusToDelete, setStatusToDelete] = useState<Status | null>(null);
  
  const handleDeleteRequest = (id: string) => {
      const status = statuses.find(s => s.id === id);
      if (status) {
          setStatusToDelete(status);
      }
  }

  const confirmDelete = () => {
      if (statusToDelete) {
          deleteStatus(statusToDelete.id);
          toast({ title: 'تم الحذف', description: `تم حذف حالة "${statusToDelete.name}".`});
          setStatusToDelete(null);
      }
  }
  
  const handleSaveChanges = () => {
    // Logic to persist all changes, e.g., to a backend
    toast({ title: 'تم الحفظ', description: 'تم حفظ جميع التغييرات بنجاح.' });
  };

  return (
    <>
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Icon name="ListChecks" /> إدارة حالات التوصيل
            </CardTitle>
            <CardDescription className="mt-1">
              تحكم في دورة حياة الطلب عبر إضافة وتخصيص الحالات المختلفة.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline"><Icon name="Download" className="mr-2 h-4 w-4" /> تصدير</Button>
            <Button><Icon name="PlusCircle" className="mr-2 h-4 w-4" /> إضافة حالة جديدة</Button>
            <Button variant="outline" size="icon" asChild>
                <Link href="/dashboard/settings"><Icon name="ArrowLeft" className="h-4 w-4" /></Link>
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {statuses.map(status => (
          <StatusCard key={status.id} status={status} onDelete={handleDeleteRequest} />
        ))}
      </div>

       <div className="flex justify-start pt-6 mt-6 border-t">
         <Button size="lg" onClick={handleSaveChanges}>
            <Icon name="Save" className="mr-2 h-4 w-4" />
            حفظ كل التغييرات
          </Button>
      </div>
    </div>

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
