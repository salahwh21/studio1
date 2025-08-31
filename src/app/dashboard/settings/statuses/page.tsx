
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
import { cn } from '@/lib/utils';
import chroma from 'chroma-js';


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
