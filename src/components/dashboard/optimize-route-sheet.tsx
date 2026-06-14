'use client';

import { useState, useTransition, useCallback, useMemo, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Wand2, MapPin, Clock, Route, TrendingDown, Loader2, Download,
  Share2, Navigation, CheckCircle2, ArrowRight, Trash2, PlusCircle,
  Zap, Package, Users
} from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';

import { useToast } from '@/hooks/use-toast';
import { optimizeRouteAction } from '@/app/actions/optimize-route';
import { useUsersStore } from '@/store/user-store';
import { useOrdersStore } from '@/store/orders-store';

const routeOptimizationSchema = z.object({
  driverId: z.string().min(1, 'الرجاء اختيار سائق.'),
  startLocation: z.string().min(3, 'الرجاء إدخال موقع بداية صحيح.'),
  addresses: z.array(z.object({ value: z.string().min(3, 'العنوان قصير جدًا.') })).min(2, 'يجب إدخال عنوانين على الأقل.'),
});

type RouteOptimizationForm = z.infer<typeof routeOptimizationSchema>;

interface OptimizationStats {
  totalDistance: number;
  estimatedTime: number;
  stops: number;
  savings: number;
}

interface OptimizeRouteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  driverId?: string | null;
}

export function OptimizeRouteDialog({ open, onOpenChange, driverId }: OptimizeRouteDialogProps) {
    const { toast } = useToast();
    const { users } = useUsersStore();
    const { orders } = useOrdersStore();
    const drivers = users.filter(u => u.roleId === 'driver');
    
    const [isPending, startTransition] = useTransition();
    const [optimizationResult, setOptimizationResult] = useState<string[]>([]);
    
    const form = useForm<RouteOptimizationForm>({
        resolver: zodResolver(routeOptimizationSchema),
        defaultValues: {
            driverId: driverId || '',
            startLocation: 'عمان، الأردن',
            addresses: [{ value: '' }, { value: '' }],
        },
    });

    const { fields, append, remove, replace } = useFieldArray({
        control: form.control,
        name: "addresses",
    });

    useEffect(() => {
        if (driverId) {
            form.setValue('driverId', driverId);
        }
    }, [driverId, form]);

    // Calculate stats
    const stats = useMemo<OptimizationStats>(() => {
        if (optimizationResult.length === 0) {
            return { totalDistance: 0, estimatedTime: 0, stops: 0, savings: 0 };
        }
        
        const stops = optimizationResult.length;
        const estimatedDistance = stops * 3.5; 
        const estimatedTime = stops * 15; 
        const savings = Math.floor(stops * 0.15 * 100); 
        
        return { totalDistance: estimatedDistance, estimatedTime, stops, savings };
    }, [optimizationResult]);

    const selectedDriver = useMemo(() => {
        const currentDriverId = form.watch('driverId');
        return drivers.find(d => d.id === currentDriverId);
    }, [form.watch('driverId'), drivers]);

    const driverOrders = useMemo(() => {
        if (!selectedDriver) return [];
        return orders.filter(
            o => o.driver === selectedDriver.name && 
            (o.status === 'جاري التوصيل' || o.status === 'بالانتظار' || o.status === 'STS_002')
        );
    }, [selectedDriver, orders]);

    const handleFetchDriverOrders = useCallback(() => {
        if (!selectedDriver) return;

        if (driverOrders.length < 2) {
            toast({
                variant: 'destructive',
                title: 'لا توجد طلبات كافية',
                description: 'يجب أن يكون لدى السائق طلبان على الأقل بحالة "جاري التوصيل".',
            });
            replace([{ value: '' }, { value: '' }]);
            return;
        }

        const orderAddresses = driverOrders.map(o => ({ value: o.address }));
        replace(orderAddresses);
        toast({
            title: 'تم جلب الطلبات',
            description: `تم جلب ${driverOrders.length} طلبات للسائق ${selectedDriver.name}.`,
        });
    }, [driverOrders, replace, toast, selectedDriver]);

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

    const handleExportRoute = () => {
        if (optimizationResult.length === 0) return;
        const routeText = optimizationResult.map((addr, i) => `${i + 1}. ${addr}`).join('\n');
        const blob = new Blob([routeText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `route-${selectedDriver?.name || 'optimized'}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-5xl max-h-[90vh] p-0 gap-0 overflow-hidden flex flex-col">
                <DialogHeader className="px-6 pt-5 pb-3 border-b bg-muted/30">
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                            <Route className="h-5 w-5 text-white" />
                        </div>
                        تحسين مسار {selectedDriver?.name || 'السائق'}
                    </DialogTitle>
                    <DialogDescription className="mt-1">
                        استخدم الذكاء الاصطناعي لترتيب محطات التوصيل بأسرع طريقة
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 max-h-[78vh]">
                    <div className="p-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            
                            {/* Quick Load Alert */}
                            {selectedDriver && driverOrders.length > 0 && (
                                <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-900/50 shadow-sm">
                                    <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    <AlertDescription className="flex items-center justify-between text-blue-900 dark:text-blue-200">
                                        <span className="text-sm font-medium">
                                            الطلبات قيد التوصيل: <strong className="mx-1">{driverOrders.length}</strong>
                                        </span>
                                        <Button 
                                            type="button" 
                                            size="sm" 
                                            variant="secondary"
                                            onClick={handleFetchDriverOrders}
                                            className="bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900 dark:text-blue-100 dark:hover:bg-blue-800"
                                        >
                                            <Zap className="h-3.5 w-3.5 ml-1.5" />
                                            جلب العناوين
                                        </Button>
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Start Location */}
                            <FormField
                                control={form.control}
                                name="startLocation"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2 font-medium">
                                            <Navigation className="h-4 w-4 text-muted-foreground" />
                                            موقع الانطلاق
                                        </FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="مثال: المستودع الرئيسي" className="bg-muted/50 focus:bg-background transition-colors" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-4">
                                <Label className="flex items-center justify-between font-medium">
                                    <span className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        عناوين التوصيل
                                    </span>
                                    <Badge variant="secondary" className="px-2 py-0.5">{fields.length}</Badge>
                                </Label>
                                
                                <div className="space-y-3">
                                    {fields.map((field, index) => (
                                        <FormField
                                            key={field.id}
                                            control={form.control}
                                            name={`addresses.${index}.value`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex items-center gap-2 group">
                                                        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex-shrink-0 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                                            {index + 1}
                                                        </div>
                                                        <FormControl>
                                                            <Input 
                                                                {...field} 
                                                                placeholder={`عنوان التوقف #${index + 1}`}
                                                                className="bg-muted/30 focus:bg-background transition-colors"
                                                            />
                                                        </FormControl>
                                                        {fields.length > 2 && (
                                                            <Button 
                                                                type="button" 
                                                                variant="ghost" 
                                                                size="icon"
                                                                onClick={() => remove(index)}
                                                                className="flex-shrink-0 opacity-50 hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />
                                    ))}
                                </div>
                                
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => append({ value: '' })} 
                                    className="w-full gap-2 border-dashed border-2 hover:border-primary hover:bg-primary/5 transition-colors"
                                >
                                    <PlusCircle className="h-4 w-4" />
                                    إضافة عنوان آخر
                                </Button>
                            </div>
                        </form>
                    </Form>

                    {/* Results Section */}
                    {optimizationResult.length > 0 && (
                        <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <Separator />
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                    المسار المحسن
                                </h3>
                                <Button variant="outline" size="sm" onClick={handleExportRoute} className="h-8 gap-1 text-xs">
                                    <Download className="h-3 w-3" /> حفظ
                                </Button>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2">
                                <div className="bg-muted/50 p-2 rounded-lg text-center border">
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">المسافة</p>
                                    <p className="font-semibold text-sm">{stats.totalDistance.toFixed(1)} كم</p>
                                </div>
                                <div className="bg-muted/50 p-2 rounded-lg text-center border">
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">الوقت</p>
                                    <p className="font-semibold text-sm">{stats.estimatedTime} دقيقة</p>
                                </div>
                                <div className="bg-purple-50 dark:bg-purple-950/30 p-2 rounded-lg text-center border border-purple-100 dark:border-purple-800">
                                    <p className="text-[10px] text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">التحسين</p>
                                    <p className="font-semibold text-sm text-purple-700 dark:text-purple-300">%{stats.savings}</p>
                                </div>
                            </div>

                            <Card className="border shadow-sm bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900">
                                <CardContent className="p-0">
                                    <div className="p-4 border-b bg-muted/20">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5">
                                                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-blue-500/20" />
                                                <div className="w-0.5 h-full bg-border mx-auto my-1 min-h-6" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground font-medium mb-1">نقطة الانطلاق</p>
                                                <p className="text-sm font-semibold">{form.getValues('startLocation')}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-2">
                                        {optimizationResult.map((address, index) => (
                                            <div key={index} className="flex items-start gap-3 p-3 rounded-md hover:bg-muted/50 transition-colors">
                                                <div className="flex flex-col items-center mt-0.5">
                                                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-[11px] ring-2 ring-background z-10">
                                                        {index + 1}
                                                    </div>
                                                    {index < optimizationResult.length - 1 && (
                                                        <div className="w-0.5 h-full bg-border min-h-8 my-1" />
                                                    )}
                                                </div>
                                                <div className="flex-1 pt-0.5">
                                                    <p className="text-sm font-medium">{address}</p>
                                                    <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                                                        <ArrowRight className="h-3 w-3" />
                                                        المحطة رقم {index + 1}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                    </div>
                </ScrollArea>

                <div className="p-4 border-t bg-background shrink-0 mt-auto">
                    <Button 
                        onClick={form.handleSubmit(onSubmit)}
                        disabled={isPending} 
                        className="w-full h-12 text-base font-medium shadow-md transition-all hover:shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                                جاري التحليل...
                            </>
                        ) : (
                            <>
                                <Wand2 className="ml-2 h-5 w-5" />
                                بدء تحسين المسار
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
