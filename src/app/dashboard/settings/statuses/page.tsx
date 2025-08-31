
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

// Status color mapping similar to orders-table
const statusColorMap: { [key: string]: { color: string; bgColor: string } } = {
    '#2E7D32': { color: 'text-green-800', bgColor: 'bg-green-100' }, // Delivered
    '#1976D2': { color: 'text-blue-800', bgColor: 'bg-blue-100' },   // Out for Delivery
    '#F9A825': { color: 'text-yellow-800', bgColor: 'bg-yellow-100' },// Postponed
    '#D32F2F': { color: 'text-red-800', bgColor: 'bg-red-100' },      // Cancelled
    '#8E24AA': { color: 'text-purple-800', bgColor: 'bg-purple-100' },// Returned
    '#607D8B': { color: 'text-slate-800', bgColor: 'bg-slate-100' },  // Pending
    '#004D40': { color: 'text-teal-800', bgColor: 'bg-teal-100' },    // Money Received
    '#1B5E20': { color: 'text-emerald-800', bgColor: 'bg-emerald-100' }, // Completed
    '#fb923c': { color: 'text-orange-800', bgColor: 'bg-orange-100' },// Exchange
    '#ef4444': { color: 'text-red-800', bgColor: 'bg-red-100' },      // Refused Paid
    '#b91c1c': { color: 'text-red-900', bgColor: 'bg-red-200' },      // Refused Unpaid
    '#7e22ce': { color: 'text-fuchsia-800', bgColor: 'bg-fuchsia-100' },// Branch Returned
    '#581c87': { color: 'text-violet-800', bgColor: 'bg-violet-100' },// Merchant Returned
    '#4b5563': { color: 'text-gray-800', bgColor: 'bg-gray-100' },    // Archived
    '#f59e0b': { color: 'text-amber-800', bgColor: 'bg-amber-100' },  // No Answer
    'default': { color: 'text-gray-800', bgColor: 'bg-gray-100' },
};


const StatusCard = ({ status }: { status: Status; onDelete: (id: string) => void; }) => {
  const { color, bgColor } = statusColorMap[status.color] || statusColorMap.default;
  return (
    <Card className="hover:border-primary hover:shadow-lg transition-all duration-200 flex flex-col">
        <CardHeader className="flex-grow flex items-center justify-center">
            <Link href={`/dashboard/settings/statuses/${status.id}`} className="space-y-2 flex-1 cursor-pointer w-full text-center">
                <Badge className={cn("text-sm inline-flex items-center gap-2 rounded-md border-transparent", bgColor, color)}>
                    <Icon name={status.icon as any} className="h-4 w-4" />
                    <span>{status.name}</span>
                </Badge>
            </Link>
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
