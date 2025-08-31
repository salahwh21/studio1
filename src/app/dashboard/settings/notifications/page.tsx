
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import Link from 'next/link';
import { nanoid } from 'nanoid';
import { Bot, PlusCircle, Trash2, ArrowLeft, MessageSquare, Smartphone, Wand2 } from 'lucide-react';

import { useStatusesStore, type Status } from '@/store/statuses-store';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/icon';
import { cn } from '@/lib/utils';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';


type Recipient = 'customer' | 'merchant' | 'driver' | 'admin';

const recipientOptions: { value: Recipient; label: string }[] = [
    { value: 'customer', label: 'الزبون' },
    { value: 'merchant', label: 'التاجر' },
    { value: 'driver', label: 'السائق' },
    { value: 'admin', label: 'الإدارة' },
];

type Template = {
  id: string;
  statusId: string;
  recipients: Recipient[];
  whatsApp: string;
  sms: string;
};

type FormValues = {
  useAI: boolean;
  aiTone: 'friendly' | 'formal' | 'concise';
  templates: Template[];
};

const SortableTemplateCard = ({ template, index, control, remove, statuses }: { template: Template, index: number, control: any, remove: (index: number) => void, statuses: Status[] }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: template.id });
    const style = { transform: CSS.Transform.toString(transform), transition };
    const { fields } = useFieldArray({ control, name: `templates.${index}.recipients` });

    const selectedStatus = statuses.find(s => s.code === template.statusId);

    return (
        <Card ref={setNodeRef} style={style} className="bg-card shadow-md relative overflow-hidden border-l-4" data-status-color={selectedStatus?.color || '#cccccc'}>
            <style jsx>{`
                .relative[data-status-color] {
                    border-left-color: var(--status-color);
                }
            `}</style>
            <div style={{'--status-color': selectedStatus?.color } as React.CSSProperties}>
                 <CardHeader className="flex flex-row items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                        <div {...attributes} {...listeners} className="cursor-grab p-2 text-muted-foreground">
                            <Icon name="GripVertical" />
                        </div>
                        <Controller
                            name={`templates.${index}.statusId`}
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger className="w-[250px] bg-background">
                                        <SelectValue placeholder="اختر حالة الطلب..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statuses.map(s => (
                                            <SelectItem key={s.code} value={s.code}>
                                                <div className="flex items-center gap-2">
                                                    <Icon name={s.icon as any} style={{ color: s.color }} className="h-4 w-4" />
                                                    {s.name}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => remove(index)} className="text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Controller
                            name={`templates.${index}.whatsApp`}
                            control={control}
                            render={({ field }) => (
                                <div className="space-y-2">
                                    <Label htmlFor={`wa-${template.id}`} className="flex items-center gap-2"><MessageSquare /> قالب WhatsApp</Label>
                                    <Textarea id={`wa-${template.id}`} {...field} rows={4} placeholder="مرحباً {{customerName}}، حالة طلبك {{orderId}} هي..." />
                                </div>
                            )}
                        />
                        <Controller
                            name={`templates.${index}.sms`}
                            control={control}
                            render={({ field }) => (
                                <div className="space-y-2">
                                     <Label htmlFor={`sms-${template.id}`} className="flex items-center gap-2"><Smartphone /> قالب SMS</Label>
                                    <Textarea id={`sms-${template.id}`} {...field} rows={4} placeholder="مرحباً {{customerName}}، حالة طلبك..." />
                                </div>
                            )}
                        />
                    </div>
                    <div className="space-y-2 pt-2 border-t">
                        <Label>إرسال إلى:</Label>
                         <div className="flex items-center gap-x-6 gap-y-2 flex-wrap">
                            {recipientOptions.map(option => (
                                 <Controller
                                    key={option.value}
                                    name={`templates.${index}.recipients`}
                                    control={control}
                                    render={({ field }) => (
                                        <div className="flex items-center space-x-2 space-x-reverse">
                                            <Checkbox
                                                id={`${template.id}-${option.value}`}
                                                checked={field.value?.includes(option.value)}
                                                onCheckedChange={(checked) => {
                                                    return checked
                                                        ? field.onChange([...(field.value || []), option.value])
                                                        : field.onChange((field.value || []).filter((value: Recipient) => value !== option.value))
                                                }}
                                            />
                                            <Label htmlFor={`${template.id}-${option.value}`} className="font-normal">{option.label}</Label>
                                        </div>
                                    )}
                                />
                            ))}
                        </div>
                    </div>
                </CardContent>
            </div>
        </Card>
    )
}


export default function NotificationsSettingsPage() {
    const { toast } = useToast();
    const { statuses } = useStatusesStore();
    const [isMounted, setIsMounted] = useState(false);

    const { control, handleSubmit, watch, setValue, getValues } = useForm<FormValues>({
        defaultValues: {
            useAI: false,
            aiTone: 'friendly',
            templates: [
                { id: nanoid(), statusId: 'OUT_FOR_DELIVERY', recipients: ['customer'], whatsApp: '', sms: '' },
                { id: nanoid(), statusId: 'DELIVERED', recipients: ['customer', 'merchant'], whatsApp: '', sms: '' },
            ]
        }
    });

    const { fields, append, remove, move } = useFieldArray({ control, name: "templates" });
    const useAI = watch('useAI');
    const sensors = useSensors(useSensor(PointerSensor));


    useEffect(() => {
        // Load settings from localStorage
        const savedSettings = localStorage.getItem('notificationSettings');
        if (savedSettings) {
            const parsed = JSON.parse(savedSettings);
            setValue('useAI', parsed.useAI);
            setValue('aiTone', parsed.aiTone);
            // Ensure loaded templates have unique IDs if they don't already
            setValue('templates', parsed.templates.map((t: any) => ({...t, id: t.id || nanoid()})));
        }
        setIsMounted(true);
    }, [setValue]);

    const handleSave = (data: FormValues) => {
        localStorage.setItem('notificationSettings', JSON.stringify(data));
        toast({
            title: "تم الحفظ بنجاح!",
            description: "تم حفظ إعدادات الإشعارات.",
        });
    };

    const handleAddTemplate = () => {
        append({
            id: nanoid(),
            statusId: '',
            recipients: ['customer'],
            whatsApp: '',
            sms: '',
        });
    };
    
     const onDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = fields.findIndex((item) => item.id === active.id);
            const newIndex = fields.findIndex((item) => item.id === over.id);
            move(oldIndex, newIndex);
        }
    };
    
    if (!isMounted) {
        return null; // or a skeleton loader
    }


    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                        <CardTitle className="text-2xl font-bold tracking-tight flex items-center gap-2"><Icon name="Bell" /> إعدادات الإشعارات</CardTitle>
                        <CardDescription className="mt-1">تحكم في الرسائل التلقائية التي تصل للعملاء عند تغير حالة الطلب.</CardDescription>
                    </div>
                     <Button variant="outline" size="icon" asChild>
                        <Link href="/dashboard/settings">
                            <Icon name="ArrowLeft" className="h-4 w-4" />
                        </Link>
                    </Button>
                </CardHeader>
            </Card>

            <form onSubmit={handleSubmit(handleSave)} className="space-y-6">
                <Card className="bg-gradient-to-br from-primary/10 to-transparent">
                     <CardContent className="p-6">
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/20 rounded-full text-primary"><Wand2 className="h-6 w-6" /></div>
                                <div>
                                    <Label htmlFor="useAI" className="text-base font-bold cursor-pointer">استخدام الذكاء الاصطناعي لتوليد الرسائل</Label>
                                    <p className="text-xs text-muted-foreground">دع النظام يكتب رسائل احترافية بدلاً من القوالب اليدوية.</p>
                                </div>
                            </div>
                             <Controller name="useAI" control={control} render={({ field }) => (
                                <Switch id="useAI" checked={field.value} onCheckedChange={field.onChange} />
                             )}/>
                        </div>

                         {useAI && (
                            <div className="mt-4 pl-14 animate-in fade-in duration-300">
                                <Separator className="my-4"/>
                                <div className="max-w-xs space-y-2">
                                    <Label>نبرة الرسالة</Label>
                                    <Controller name="aiTone" control={control} render={({ field }) => (
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="friendly">ودية</SelectItem>
                                                <SelectItem value="formal">رسمية</SelectItem>
                                                <SelectItem value="concise">مختصرة</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}/>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className={cn("space-y-4 transition-opacity duration-500", useAI && "opacity-40 pointer-events-none")}>
                     <h2 className="text-xl font-semibold tracking-tight">إدارة قوالب الرسائل اليدوية</h2>
                     <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                        <SortableContext items={fields} strategy={verticalListSortingStrategy}>
                            <div className="space-y-4">
                                {fields.map((template, index) => (
                                    <SortableTemplateCard 
                                        key={template.id}
                                        template={template as Template}
                                        index={index}
                                        control={control}
                                        remove={remove}
                                        statuses={statuses}
                                    />
                                ))}
                             </div>
                        </SortableContext>
                     </DndContext>

                    <Button variant="outline" onClick={handleAddTemplate} className="gap-2">
                        <PlusCircle /> إضافة قالب جديد
                    </Button>
                </div>

                <div className="flex justify-start pt-6 mt-6 border-t">
                    <Button size="lg" type="submit"><Icon name="Save" className="ml-2 h-4 w-4" /> حفظ كل التغييرات</Button>
                </div>
            </form>
        </div>
    );
}
