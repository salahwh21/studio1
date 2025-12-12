'use client';

import { useState, useTransition, useCallback, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dynamic from 'next/dynamic';
import { 
  Wand2, 
  MapPin, 
  Clock, 
  Route, 
  TrendingDown, 
  Loader2, 
  Download,
  Share2,
  Navigation,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  GripVertical,
  Trash2,
  PlusCircle,
  RefreshCw,
  Users,
  Package,
  Timer,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { optimizeRouteAction } from '@/app/actions/optimize-route';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useUsersStore } from '@/store/user-store';
import { useOrdersStore } from '@/store/orders-store';
import { cn } from '@/lib/utils';

// Dynamic import for map to avoid SSR issues
const DriversMapComponent = dynamic(() => import('@/components/drivers-map-component'), { ssr: false });

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

export default function OptimizeRoutePageV2() {
    const { toast } = useToast();
    const { users } = useUsersStore();
    const { orders } = useOrdersStore();
    const drivers = users.filter(u => u.roleId === 'driver');
    
    const [isPending, startTransition] = useTransition();
    const [optimizationResult, setOptimizationResult] = useState<string[]>([]);
    const [showMap, setShowMap] = useState(false);
    
    const form = useForm<RouteOptimizationForm>({
        resolver: zodResolver(routeOptimizationSchema),
        defaultValues: {
            driverId: '',
            startLocation: 'عمان، الأردن',
            addresses: [{ value: '' }, { value: '' }],
        },
    });

    const { fields, append, remove, replace } = useFieldArray({
        control: form.control,
        name: "addresses",
    });

    // Calculate stats
    const stats = useMemo<OptimizationStats>(() => {
        if (optimizationResult.length === 0) {
            return { totalDistance: 0, estimatedTime: 0, stops: 0, savings: 0 };
        }
        
        const stops = optimizationResult.length;
        const estimatedDistance = stops * 3.5; // Average 3.5 km per stop
        const estimatedTime = stops * 15; // Average 15 min per stop
        const savings = Math.floor(stops * 0.15 * 100); // 15% improvement
        
        return {
            totalDistance: estimatedDistance,
            estimatedTime,
            stops,
            savings
        };
    }, [optimizationResult]);

    const selectedDriver = useMemo(() => {
        const driverId = form.watch('driverId');
        return drivers.find(d => d.id === driverId);
    }, [form.watch('driverId'), drivers]);

    const driverOrders = useMemo(() => {
        if (!selectedDriver) return [];
        return orders.filter(
            o => o.driver === selectedDriver.name && 
            (o.status === 'جاري التوصيل' || o.status === 'بالانتظار')
        );
    }, [selectedDriver, orders]);

    const handleFetchDriverOrders = useCallback(() => {
        const driverId = form.getValues('driverId');
        if (!driverId) {
            toast({ variant: 'destructive', title: 'خطأ', description: 'الرجاء اختيار سائق أولاً.' });
            return;
        }

        if (driverOrders.length < 2) {
            toast({
                variant: 'destructive',
                title: 'لا توجد طلبات كافية',
                description: 'يجب أن يكون لدى السائق طلبان على الأقل بحالة "جاري التوصيل" أو "بالانتظار".',
            });
            replace([{ value: '' }, { value: '' }]);
            return;
        }

        const orderAddresses = driverOrders.map(o => ({ value: o.address }));
        replace(orderAddresses);
        toast({
            title: 'تم جلب الطلبات',
            description: `تم جلب ${driverOrders.length} طلبات للسائق ${selectedDriver?.name}.`,
        });
    }, [form, driverOrders, replace, toast, selectedDriver]);

    const onSubmit = (data: RouteOptimizationForm) => {
        setOptimizationResult([]);
        startTransition(async () => {
            const result = await optimizeRouteAction(data);
            if (result.success && result.data) {
                setOptimizationResult(result.data.optimizedRoute);
                setShowMap(true);
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
        
        toast({ title: 'تم التصدير', description: 'تم تصدير المسار بنجاح' });
    };

    const handleShareRoute = () => {
        if (optimizationResult.length === 0) return;
        
        const routeText = optimizationResult.map((addr, i) => `${i + 1}. ${addr}`).join('\n');
        
        if (navigator.share) {
            navigator.share({
                title: 'مسار التوصيل المحسّن',
                text: routeText,
            });
        } else {
            navigator.clipboard.writeText(routeText);
            toast({ title: 'تم النسخ', description: 'تم نسخ المسار إلى الحافظة' });
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                            <Route className="h-6 w-6 text-white" />
                        </div>
                        تحسين مسارات التوصيل
                    </h1>
                    <p className="text-muted-foreground mt-2">استخدم الذكاء الاصطناعي لإيجاد أسرع وأقصر مسار للتوصيل</p>
                </div>
                {optimizationResult.length > 0 && (
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleExportRoute}>
                            <Download className="h-4 w-4 ml-2" />
                            تصدير
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleShareRoute}>
                            <Share2 className="h-4 w-4 ml-2" />
                            مشاركة
                        </Button>
                    </div>
                )}
            </div>

            {/* Stats Cards */}
            {optimizationResult.length > 0 && (
                <div className="grid gap-4 md:grid-cols-4">
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">عدد التوقفات</p>
                                    <p className="text-3xl font-bold" dir="ltr">{stats.stops}</p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-full">
                                    <MapPin className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">المسافة المقدرة</p>
                                    <p className="text-3xl font-bold" dir="ltr">{stats.totalDistance.toFixed(1)} <span className="text-lg">كم</span></p>
                                </div>
                                <div className="p-3 bg-green-100 rounded-full">
                                    <Navigation className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-orange-500">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">الوقت المتوقع</p>
                                    <p className="text-3xl font-bold" dir="ltr">{stats.estimatedTime} <span className="text-lg">دقيقة</span></p>
                                </div>
                                <div className="p-3 bg-orange-100 rounded-full">
                                    <Clock className="h-6 w-6 text-orange-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-purple-500">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">التحسين</p>
                                    <p className="text-3xl font-bold text-purple-600" dir="ltr">%{stats.savings}</p>
                                </div>
                                <div className="p-3 bg-purple-100 rounded-full">
                                    <TrendingDown className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Input Form */}
                <Card className="lg:col-span-1">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
                        <CardTitle className="flex items-center gap-2">
                            <Wand2 className="h-5 w-5 text-blue-600" />
                            إعدادات التحسين
                        </CardTitle>
                        <CardDescription>
                            اختر السائق والعناوين لبدء عملية التحسين
                        </CardDescription>
                    </CardHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <CardContent className="space-y-6 pt-6">
                                {/* Driver Selection */}
                                <FormField
                                    control={form.control}
                                    name="driverId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Users className="h-4 w-4" />
                                                اختر السائق
                                            </FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="اختر سائقًا من القائمة" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {drivers.map(driver => (
                                                        <SelectItem key={driver.id} value={driver.id}>
                                                            <div className="flex items-center gap-2">
                                                                <span>{driver.name}</span>
                                                                {driverOrders.length > 0 && driver.id === field.value && (
                                                                    <Badge variant="secondary" className="text-xs">
                                                                        {driverOrders.length} طلبات
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Quick Load Button */}
                                {selectedDriver && driverOrders.length >= 2 && (
                                    <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
                                        <Package className="h-4 w-4 text-blue-600" />
                                        <AlertDescription className="flex items-center justify-between">
                                            <span className="text-sm">
                                                لدى {selectedDriver.name} <strong>{driverOrders.length}</strong> طلبات نشطة
                                            </span>
                                            <Button 
                                                type="button" 
                                                size="sm" 
                                                variant="default"
                                                onClick={handleFetchDriverOrders}
                                                className="bg-blue-600 hover:bg-blue-700"
                                            >
                                                <Zap className="h-4 w-4 ml-2" />
                                                جلب وتحسين
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
                                            <FormLabel className="flex items-center gap-2">
                                                <Navigation className="h-4 w-4" />
                                                الموقع الحالي للسائق
                                            </FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="مثال: عمان، الدوار السابع" className="text-base"/>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Separator />

                                {/* Addresses */}
                                <div className="space-y-4">
                                    <Label className="flex items-center gap-2 text-base">
                                        <MapPin className="h-4 w-4" />
                                        عناوين التوصيل
                                        <Badge variant="outline">{fields.length}</Badge>
                                    </Label>
                                    
                                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                        {fields.map((field, index) => (
                                            <FormField
                                                key={field.id}
                                                control={form.control}
                                                name={`addresses.${index}.value`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm flex-shrink-0">
                                                                {index + 1}
                                                            </div>
                                                            <FormControl>
                                                                <Input 
                                                                    {...field} 
                                                                    placeholder={`عنوان التوقف #${index + 1}`}
                                                                    className="text-base"
                                                                />
                                                            </FormControl>
                                                            {fields.length > 2 && (
                                                                <Button 
                                                                    type="button" 
                                                                    variant="ghost" 
                                                                    size="icon"
                                                                    onClick={() => remove(index)}
                                                                    className="flex-shrink-0"
                                                                >
                                                                    <Trash2 className="h-4 w-4 text-destructive" />
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
                                        className="w-full gap-2"
                                    >
                                        <PlusCircle className="h-4 w-4" />
                                        إضافة عنوان جديد
                                    </Button>
                                </div>
                            </CardContent>
                            
                            <CardFooter className="bg-muted/50">
                                <Button 
                                    type="submit" 
                                    disabled={isPending} 
                                    className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                >
                                    {isPending ? (
                                        <>
                                            <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                                            جاري التحسين...
                                        </>
                                    ) : (
                                        <>
                                            <Wand2 className="ml-2 h-5 w-5" />
                                            تحسين المسار بالذكاء الاصطناعي
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </form>
                    </Form>
                </Card>

                {/* Results */}
                <Card className="lg:col-span-1">
                    <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
                        <CardTitle className="flex items-center gap-2">
                            <Route className="h-5 w-5 text-green-600" />
                            المسار المحسّن
                        </CardTitle>
                        <CardDescription>
                            الترتيب الأمثل للتوقفات بناءً على تحليل الذكاء الاصطناعي
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="min-h-[500px] pt-6">
                        {isPending ? (
                            <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
                                    <Loader2 className="relative h-16 w-16 animate-spin text-primary" />
                                </div>
                                <p className="text-lg font-medium">جاري تحليل أفضل مسار...</p>
                                <p className="text-sm">قد يستغرق هذا بضع ثوانٍ</p>
                            </div>
                        ) : optimizationResult.length > 0 ? (
                            <div className="space-y-4">
                                {optimizationResult.map((address, index) => (
                                    <div 
                                        key={index} 
                                        className={cn(
                                            "flex items-start gap-4 p-4 rounded-lg border-2 transition-all",
                                            index === 0 
                                                ? "bg-green-50 border-green-500 dark:bg-green-950" 
                                                : "bg-card border-border hover:border-primary/50"
                                        )}
                                    >
                                        <div className={cn(
                                            "flex h-10 w-10 items-center justify-center rounded-full font-bold text-lg flex-shrink-0",
                                            index === 0 
                                                ? "bg-green-500 text-white" 
                                                : "bg-primary text-primary-foreground"
                                        )}>
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 pt-1">
                                            <p className="font-medium text-base leading-relaxed">{address}</p>
                                            {index === 0 && (
                                                <Badge className="mt-2 bg-green-600">
                                                    <CheckCircle2 className="h-3 w-3 ml-1" />
                                                    التوقف التالي
                                                </Badge>
                                            )}
                                            {index < optimizationResult.length - 1 && (
                                                <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                                                    <ArrowRight className="h-4 w-4" />
                                                    <span>ثم التوجه إلى التوقف التالي</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                
                                <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800 mt-6">
                                    <Timer className="h-4 w-4 text-blue-600" />
                                    <AlertDescription>
                                        <strong>نصيحة:</strong> اتبع هذا الترتيب لتوفير الوقت والوقود
                                    </AlertDescription>
                                </Alert>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground text-center">
                                <div className="p-6 bg-muted rounded-full">
                                    <Route className="h-12 w-12" />
                                </div>
                                <p className="font-medium text-lg">نتائج التحسين ستظهر هنا</p>
                                <p className="text-sm max-w-md">
                                    أدخل تفاصيل السائق والعناوين في النموذج، ثم اضغط على زر التحسين لبدء عملية التحليل
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
