
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/icon';
import { useStatusesStore, type Status } from '@/store/statuses-store';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const StatusCard = ({ status, onUpdate, onDelete }: { status: Status; onUpdate: (id: string, newStatus: Partial<Status>) => void; onDelete: (id: string) => void; }) => {
  return (
    <AccordionItem value={status.id} className="border-b-0">
      <Card className="overflow-hidden">
        <div className="flex items-center p-3 gap-4">
           <AccordionTrigger className="p-0 flex-1 justify-start gap-4">
              <Icon name="ChevronDown" className="h-5 w-5 shrink-0 transition-transform duration-200" />
              <div className="flex items-center gap-2">
                  <Badge style={{ backgroundColor: status.color, color: '#fff' }} className="border-none">
                      <Icon name={status.icon as any} className="h-4 w-4 mr-1" />
                      {status.name}
                  </Badge>
              </div>
            </AccordionTrigger>
          <div className="flex items-center gap-4 ml-auto">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Switch
                id={`status-active-${status.id}`}
                checked={status.isActive}
                onCheckedChange={(checked) => onUpdate(status.id, { isActive: checked })}
              />
              <Label htmlFor={`status-active-${status.id}`} className="text-sm">مفعلة</Label>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onDelete(status.id)}>
              <Icon name="Trash2" className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
         <AccordionContent>
            <div className="p-4 border-t bg-muted/50">
                <p className="text-center text-muted-foreground">سيتم عرض إعدادات الحالة التفصيلية هنا لاحقًا.</p>
            </div>
        </AccordionContent>
      </Card>
    </AccordionItem>
  );
};

export default function StatusesPage() {
  const { toast } = useToast();
  const { statuses, updateStatus, deleteStatus } = useStatusesStore();
  
  const handleUpdate = (id: string, newStatus: Partial<Status>) => {
      updateStatus(id, newStatus);
      toast({ title: 'تم التحديث', description: 'تم تحديث حالة الطلب.' });
  }
  
  const handleDelete = (id: string) => {
      // Add confirmation dialog later
      deleteStatus(id);
      toast({ title: 'تم الحذف', description: 'تم حذف حالة الطلب.' });
  }
  
  const handleSaveChanges = () => {
    // Logic to persist all changes, e.g., to a backend
    toast({ title: 'تم الحفظ', description: 'تم حفظ جميع التغييرات بنجاح.' });
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

       <Accordion type="multiple" className="w-full space-y-3">
        {statuses.map(status => (
          <StatusCard key={status.id} status={status} onUpdate={handleUpdate} onDelete={handleDelete} />
        ))}
      </Accordion>

      <CardFooter className="p-0 pt-6">
         <Button size="lg" onClick={handleSaveChanges}>
            <Icon name="Save" className="mr-2 h-4 w-4" />
            حفظ التغييرات
          </Button>
      </CardFooter>
    </div>
  );
}
