
'use client';

import { useState, useTransition } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Wand2, Loader2, MapPin, ListPlus, PlusCircle, Trash2, Bot } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { optimizeRouteAction } from '@/app/actions/optimize-route';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';

const routeOptimizationSchema = z.object({
  driverId: z.string().min(1, 'الرجاء اختيار سائق.'),
  startLocation: z.string().min(3, 'الرجاء إدخال موقع بداية صحيح.'),
  addresses: z.array(z.object({ value: z.string().min(3, 'العنوان قصير جدًا.') })).min(2, 'يجب إدخال عنوانين على الأقل.'),
});

type RouteOptimizationForm = z.infer<typeof routeOptimizationSchema>;

const drivers = [
    { id: "1", name: "علي الأحمد" },
    { id: "2", name: "محمد الخالد" },
    { id: "3", name: "فاطمة الزهراء" },
];

export default function OptimizeRoutePage() {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const [optimizationResult, setOptimizationResult] = useState<string[]>([]);
    
    const form = useForm<RouteOptimizationForm>({
        resolver: zodResolver(routeOptimizationSchema),
        defaultValues: {
            driverId: '',
            startLocation: 'عمان، الأردن',
            addresses: [{ value: '' }, { value: '' }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "addresses",
    });

    const onSubmit = (data: RouteOptimizationForm) => {
        setOptimizationResult([]);
        startTransition(async () => {
            const result = await optimizeRouteAction(data);
            if (result.success && result.data) {
                setOptimizationResult(result.data.optimizedRoute);
                toast({
                    title: 'تم تحسين المسار بنجاح!',
                    description: 'تم ترتيب العناوين لإيجاد أسرع مسار.',
                });
            } else {
                toast({
                    variant: 'destructive',
                    title: 'فشل تحسين المسار',
                    description: result.error || 'حدث خطأ غير متوقع.',
                });
            }
        });
    };

    return (
        <div className="grid gap-8 lg:grid-cols-2">
            <Card className="lg:col-span-1">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Wand2 /> تحسين مسار التوصيل
                    </CardTitle>
                    <CardDescription>
                        استخدم الذكاء الاصطناعي لإيجاد أسرع مسار لسائقيك.
                    </CardDescription>
                </CardHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <CardContent className="space-y-6">
                             <FormField
                                control={form.control}
                                name="driverId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>اختر السائق</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="اختر سائقًا من القائمة" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {drivers.map(driver => (
                                                    <SelectItem key={driver.id} value={driver.id}>{driver.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            
                            <Button type="button" variant="outline" className="w-full">
                                <ListPlus className="mr-2 h-4 w-4" />
                                جلب الطلبات وتحسينها تلقائيًا (قريبًا)
                            </Button>

                            <FormField
                                control={form.control}
                                name="startLocation"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>الموقع الحالي للسائق</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="مثال: عمان، الدوار السابع"/>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-4">
                                <Label>عناوين التوصيل (يدوي)</Label>
                                {fields.map((field, index) => (
                                    <FormField
                                        key={field.id}
                                        control={form.control}
                                        name={`addresses.${index}.value`}
                                        render={({ field }) => (
                                             <FormItem>
                                                <div className="flex items-center gap-2">
                                                    <FormControl>
                                                        <Input {...field} placeholder={`عنوان #${index + 1}`} />
                                                    </FormControl>
                                                    {fields.length > 2 && (
                                                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    )}
                                                </div>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                ))}
                                 <Button type="button" variant="outline" size="sm" onClick={() => append({ value: '' })} className="gap-1">
                                    <PlusCircle className="h-4 w-4" />
                                    إضافة عنوان
                                </Button>
                            </div>

                        </CardContent>
                        <CardFooter>
                            <Button type="submit" disabled={isPending} className="w-full">
                                {isPending ? (
                                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Wand2 className="mr-2 h-4 w-4" />
                                )}
                                تحسين المسار الآن
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
            </Card>

             <Card className="lg:col-span-1">
                <CardHeader>
                    <CardTitle>نتائج التحسين</CardTitle>
                    <CardDescription>
                        هذا هو المسار المقترح بناءً على تحليل الذكاء الاصطناعي.
                    </CardDescription>
                </CardHeader>
                <CardContent className="min-h-[300px]">
                    {isPending ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p>جاري تحليل أفضل مسار...</p>
                        </div>
                    ) : optimizationResult.length > 0 ? (
                        <ol className="space-y-4">
                           {optimizationResult.map((address, index) => (
                                <li key={index} className="flex items-start gap-4">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">
                                        {index + 1}
                                    </span>
                                    <div className="pt-1">
                                        <p className="font-medium">{address}</p>
                                        {index === 0 && <Badge variant="secondary" className="mt-1">نقطة التوقف التالية</Badge>}
                                    </div>
                                </li>
                           ))}
                        </ol>
                    ) : (
                         <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground text-center">
                            <Bot className="h-10 w-10" />
                            <p className="font-medium">نتائج التحسين ستظهر هنا</p>
                            <p className="text-sm">أدخل تفاصيل التوصيل في النموذج لبدء عملية التحسين.</p>
                         </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
