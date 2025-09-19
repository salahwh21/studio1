

'use client';

import { useState, useMemo, useEffect, useRef }from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUsersStore } from '@/store/user-store';
import { useOrdersStore, Order } from '@/store/orders-store';
import { useAreasStore } from '@/store/areas-store';
import { useToast } from '@/hooks/use-toast';
import { Check, ChevronsUpDown, Printer, Trash2, Package, Clock, MessageSquareWarning, MapPin } from 'lucide-react';
import { useActionState } from 'react';
import { parseOrderFromRequest } from '@/app/actions/parse-order';
import dynamic from 'next/dynamic';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/icon';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStatusesStore } from '@/store/statuses-store';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useSettings, SavedTemplate, readyTemplates } from '@/contexts/SettingsContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PrintablePolicy } from '@/components/printable-policy';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

const LocationPickerMap = dynamic(() => import('@/components/location-picker-map'), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-lg" />,
});


const orderSchema = z.object({
  recipientName: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  region: z.string({ required_error: "الرجاء اختيار المنطقة." }).min(1, "الرجاء اختيار المنطقة."),
  city: z.string().optional(),
  address: z.string().optional(),
  cod: z.coerce.number(),
  notes: z.string().optional(),
  referenceNumber: z.string().optional(),
  parcelCount: z.coerce.number().min(1, "يجب أن يكون طرد واحد على الأقل."),
  deliveryTimeType: z.enum(['any', 'fixed', 'before', 'after']).optional(),
  deliveryTime: z.string().optional(),
  lat: z.number().optional().nullable(),
  lng: z.number().optional().nullable(),
});

type OrderFormValues = z.infer<typeof orderSchema>;

const predefinedNotes = [
    { text: 'قابل للكسر', icon: 'GlassWater' as const },
    { text: 'يرجى التواصل باكرًا', icon: 'Sunrise' as const },
    { text: 'توصيل في الفترة المسائية', icon: 'Sunset' as const },
    { text: 'هدية، يرجى عدم إظهار السعر', icon: 'Gift' as const },
];

const AddOrderPage = () => {
  const { toast } = useToast();
  const { users } = useUsersStore();
  const { addOrder, deleteOrders, updateOrderField } = useOrdersStore();
  const { cities } = useAreasStore();
  const { statuses } = useStatusesStore();
  const context = useSettings();
  const { settings, formatCurrency, isHydrated: settingsHydrated } = context;

  const [selectedMerchantId, setSelectedMerchantId] = useState<string>('');
  
  const [merchantPopoverOpen, setMerchantPopoverOpen] = useState(false);
  const [regionPopoverOpen, setRegionPopoverOpen] = useState(false);
  const [popoverStates, setPopoverStates] = useState<Record<string, boolean>>({});

  const togglePopover = (id: string) => {
    setPopoverStates(prev => ({ ...prev, [id]: !prev[id] }));
  };
  
  const [recentlyAdded, setRecentlyAdded] = useState<Order[]>([]);
  const [selectedRecent, setSelectedRecent] = useState<string[]>([]);
  
  const [aiState, formAction, isAiPending] = useActionState(parseOrderFromRequest, {
      data: null, error: null, message: ''
  });

  const [isPrepaid, setIsPrepaid] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: { recipientName: '', phone: '', whatsapp: '', city: '', region: '', address: '', cod: 0, notes: '', referenceNumber: '', parcelCount: 1, deliveryTimeType: 'any', lat: null, lng: null },
  });

  const { watch, setValue, getValues, reset } = form;
  const selectedRegionValue = watch('region');
  const codValue = watch('cod');
  const selectedCity = watch('city');
  const deliveryTimeType = watch('deliveryTimeType');
  const lat = watch('lat');
  const lng = watch('lng');

  const merchantOptions = useMemo(() => users.filter(u => u.roleId === 'merchant'), [users]);
  const allRegions = useMemo(() => cities.flatMap(c => c.areas.map(a => ({ ...a, cityName: c.name }))).sort((a,b) => a.name.localeCompare(b.name)), [cities]);
  
  
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [availableTemplates, setAvailableTemplates] = useState<SavedTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<SavedTemplate | null>(null);
  const printablePolicyRef = useRef<{ handleExport: () => void; handleDirectPrint: (order: any, type: 'zpl' | 'escpos') => Promise<void> }>(null);

  useEffect(() => {
    try {
        const savedTemplatesJson = localStorage.getItem('policyTemplates');
        const userTemplates = savedTemplatesJson ? JSON.parse(savedTemplatesJson) : [];
        const uniqueTemplates = [...readyTemplates];
        const readyIds = new Set(readyTemplates.map(t => t.id));
        userTemplates.forEach((t: SavedTemplate) => {
            if (!readyIds.has(t.id)) {
                uniqueTemplates.push(t);
            }
        });
        setAvailableTemplates(uniqueTemplates);
    } catch (e) {
        setAvailableTemplates(readyTemplates);
    }
  }, []);
  
  useEffect(() => {
    if (selectedRegionValue) {
        const [regionName, cityName] = selectedRegionValue.split('_');
        const regionData = allRegions.find(r => r.name === regionName && r.cityName === cityName);
        if (regionData) {
            setValue('city', regionData.cityName, { shouldValidate: true });
        }
    }
  }, [selectedRegionValue, allRegions, setValue]);

  useEffect(() => {
    if (isPrepaid) {
        setValue('cod', 0);
    }
  }, [isPrepaid, setValue]);


  const calculatedFees = useMemo(() => {
    const safeCodValue = codValue || 0;
    if (!selectedCity) {
      return { deliveryFee: 0, itemPrice: 0 };
    }
    const deliveryFee = selectedCity === 'عمان' ? 2.5 : 3.5;
    const itemPrice = isPrepaid ? 0 : (safeCodValue - deliveryFee);
    return { deliveryFee, itemPrice };
  }, [codValue, selectedCity, isPrepaid]);

  // --- AI Logic ---
  useEffect(() => {
      if(aiState.data) {
          const { customerName, phone, city, region, addressDetails, cod } = aiState.data;
          
          form.reset({
            ...form.getValues(),
            recipientName: customerName || '',
            phone: phone || '',
            address: addressDetails || '',
            cod: cod || 0,
          });

           if (region) {
              const bestMatch = allRegions.find(r => r.name.includes(region) || region.includes(r.name));
               if (bestMatch) {
                   setValue('region', `${bestMatch.name}_${bestMatch.cityName}`, { shouldValidate: true });
                   setValue('city', bestMatch.cityName, { shouldValidate: true });
               }
           } else if(city) {
              const cityMatch = cities.find(c => c.name.includes(city));
              if(cityMatch && cityMatch.areas.length > 0) {
                  setValue('region', `${cityMatch.areas[0].name}_${cityMatch.name}`, { shouldValidate: true });
                  setValue('city', cityMatch.name, { shouldValidate: true });
              }
          }
          
          toast({ title: 'تم تحليل الطلب', description: 'تم ملء الحقول بنجاح. يرجى المراجعة والإضافة.'});
      }
       if (aiState.error) {
            toast({
                variant: 'destructive',
                title: 'خطأ في التحليل',
                description: aiState.error,
            });
        }
  }, [aiState, allRegions, cities, form, setValue, toast])


  const handleUpdateRecentlyAdded = (orderId: string, field: keyof Order, value: any) => {
    if (field === 'region') {
        const [regionName, cityName] = value.split('_');
        updateOrderField(orderId, 'region', regionName);
        updateOrderField(orderId, 'city', cityName);
        setRecentlyAdded(prev => prev.map(o => o.id === orderId ? {...o, region: regionName, city: cityName} : o));
    } else {
        updateOrderField(orderId, field, value);
        setRecentlyAdded(prev => prev.map(o => o.id === orderId ? {...o, [field]: value} : o));
    }
  };

  const handleAddPredefinedNote = (note: string) => {
      const currentNotes = getValues('notes');
      setValue('notes', currentNotes ? `${currentNotes}\n- ${note}` : `- ${note}`);
  };

    const handleLocationSelect = ({ lat, lng }: { lat: number; lng: number }) => {
        setValue('lat', lat);
        setValue('lng', lng);
        setValue('address', `[GEO] ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        setIsMapOpen(false);
        toast({ title: 'تم تحديد الموقع', description: 'تم حفظ الإحداثيات.' });
    };
  
  const handleAddOrder = (data: OrderFormValues) => {
    const merchant = users.find(u => u.id === selectedMerchantId);
    if (!merchant) {
      toast({ variant: 'destructive', title: 'خطأ', description: 'الرجاء اختيار متجر أولاً.' });
      return;
    }
    
    const [regionName] = data.region.split('_');
    
    if (!settingsHydrated) {
        toast({ variant: 'destructive', title: 'خطأ', description: 'الإعدادات لم تحمل بعد، يرجى المحاولة بعد لحظات.' });
        return;
    }

    let finalNotes = data.notes || '';
    if(isPrepaid) {
        finalNotes = `الطلب مدفوع مسبقًا.\n${finalNotes}`.trim();
    }
    if (data.deliveryTimeType && data.deliveryTimeType !== 'any' && data.deliveryTime) {
        let timeNote = '';
        try {
            const timeString = new Date(`1970-01-01T${data.deliveryTime}`).toLocaleTimeString('ar-JO', { hour: 'numeric', minute: 'numeric', hour12: true });
            if (data.deliveryTimeType === 'fixed') timeNote = `التوصيل الساعة ${timeString} تمامًا.`;
            if (data.deliveryTimeType === 'before') timeNote = `التوصيل قبل الساعة ${timeString}.`;
            if (data.deliveryTimeType === 'after') timeNote = `التوصيل بعد الساعة ${timeString}.`;
        } catch(e) { /* ignore invalid time */ }
        finalNotes = `${timeNote}\n${finalNotes}`.trim();
    }
    finalNotes = `${finalNotes}\n(عدد الطرود: ${data.parcelCount})`.trim();

    const newOrder: Omit<Order, 'id' | 'orderNumber'> = {
      source: 'Manual',
      referenceNumber: data.referenceNumber || '',
      recipient: data.recipientName || 'زبون غير مسمى',
      phone: data.phone || '',
      whatsapp: data.whatsapp || '',
      address: `${data.address ? `${data.address}, ` : ''}${regionName}, ${data.city}`,
      city: data.city || '',
      region: regionName,
      status: settings.orders.defaultStatus,
      driver: 'غير معين',
      merchant: merchant.storeName || merchant.name,
      cod: isPrepaid ? 0 : data.cod,
      itemPrice: calculatedFees.itemPrice,
      deliveryFee: calculatedFees.deliveryFee,
      date: new Date().toISOString().split('T')[0],
      notes: finalNotes,
      // @ts-ignore
      parcelCount: data.parcelCount,
      lat: data.lat,
      lng: data.lng,
    };
    
    const addedOrder = addOrder(newOrder);
    setRecentlyAdded(prev => [addedOrder, ...prev]);
    toast({ title: 'تمت الإضافة', description: `تمت إضافة طلب "${data.recipientName}" بنجاح.` });
    reset({ ...getValues(), recipientName: '', phone: '', whatsapp: '', cod: 0, notes: '', referenceNumber: '', address: '', parcelCount: 1, deliveryTimeType: 'any', deliveryTime: '', lat: null, lng: null });
    setIsPrepaid(false);
  };

  const handleSelectRecent = (id: string) => {
    setSelectedRecent(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };
  
  const handleSelectAllRecent = (checked: boolean) => {
    setSelectedRecent(checked ? recentlyAdded.map(o => o.id) : []);
  };
  
  const handleDeleteSelected = () => {
    deleteOrders(selectedRecent);
    setRecentlyAdded(prev => prev.filter(o => !selectedRecent.includes(o.id)));
    toast({ title: "تم الحذف", description: `تم حذف ${selectedRecent.length} طلبات.` });
    setSelectedRecent([]);
  }

  const handlePrintClick = () => {
    if (selectedRecent.length === 0) {
        toast({
            variant: "destructive",
            title: "لم يتم تحديد طلبات",
            description: "الرجاء تحديد طلب واحد على الأقل للطباعة."
        });
        return;
    }
    setSelectedTemplate(availableTemplates.length > 0 ? availableTemplates[0] : null);
    setIsPrintDialogOpen(true);
  };
  
  return (
    <>
    <Dialog open={isPrintDialogOpen} onOpenChange={setIsPrintDialogOpen}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
            <DialogHeader>
            <DialogTitle>طباعة البوالص</DialogTitle>
            <DialogDescription>اختر القالب وقم بمعاينة البوالص قبل الطباعة النهائية.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1 min-h-0">
                <div className="md:col-span-1 flex flex-col gap-4">
                    <Card>
                        <CardHeader className='p-4'><CardTitle className='text-base'>1. اختر القالب</CardTitle></CardHeader>
                        <CardContent className='p-4'>
                            <RadioGroup
                                value={selectedTemplate?.id}
                                onValueChange={(id) => setSelectedTemplate(availableTemplates.find(t => t.id === id) || null)}
                            >
                                {availableTemplates.map(template => (
                                    <div key={template.id} className="flex items-center space-x-2 space-x-reverse">
                                        <RadioGroupItem value={template.id} id={template.id} />
                                        <Label htmlFor={template.id}>{template.name}</Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className='p-4'><CardTitle className='text-base'>2. إجراء الطباعة</CardTitle></CardHeader>
                        <CardContent className='p-4 flex flex-col gap-2'>
                             <Button onClick={() => printablePolicyRef.current?.handleExport()} className="w-full">
                                <Icon name="Save" className="ml-2 h-4 w-4 inline" /> طباعة PDF
                            </Button>
                            <Button variant="secondary" onClick={() => printablePolicyRef.current?.handleDirectPrint(recentlyAdded.find(o => o.id === selectedRecent[0]), 'zpl')}>
                                <Icon name="Printer" className="ml-2 h-4 w-4 inline" /> طباعة ZPL (أول طلب)
                            </Button>
                             <Button variant="secondary" onClick={() => printablePolicyRef.current?.handleDirectPrint(recentlyAdded.find(o => o.id === selectedRecent[0]), 'escpos')}>
                                <Icon name="Printer" className="ml-2 h-4 w-4 inline" /> طباعة ESC/POS (أول طلب)
                            </Button>
                        </CardContent>
                    </Card>
                </div>
                 <div className="md:col-span-3 bg-muted rounded-md flex items-center justify-center overflow-hidden">
                    <ScrollArea className="h-full w-full">
                        <div className="p-4 flex items-center justify-center">
                            {selectedTemplate && (
                                <PrintablePolicy ref={printablePolicyRef} orders={recentlyAdded.filter(o => selectedRecent.includes(o.id))} template={selectedTemplate} />
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </DialogContent>
    </Dialog>

    <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
        <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-2">
            <DialogHeader className="p-4 pb-0">
              <DialogTitle>تحديد الموقع على الخريطة</DialogTitle>
              <DialogDescription>انقر على الخريطة لتحديد الموقع الدقيق للعنوان.</DialogDescription>
            </DialogHeader>
            <LocationPickerMap onLocationSelect={handleLocationSelect} />
        </DialogContent>
    </Dialog>

    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>إضافة طلبات جديدة</CardTitle>
          <CardDescription>اختر المتجر ثم ابدأ بإضافة الطلبات بشكل سريع.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-sm">
             <Label htmlFor="merchant-select">اختر المتجر</Label>
              <Popover open={merchantPopoverOpen} onOpenChange={setMerchantPopoverOpen}>
                  <PopoverTrigger asChild>
                      <Button
                          id="merchant-select"
                          variant="outline"
                          role="combobox"
                          aria-expanded={merchantPopoverOpen}
                          className="w-full justify-between"
                      >
                          {selectedMerchantId ? (merchantOptions.find(m => m.id === selectedMerchantId)?.storeName || merchantOptions.find(m => m.id === selectedMerchantId)?.name) : "اختر متجرًا..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                          <CommandInput placeholder="بحث عن متجر..." />
                          <CommandList>
                            <CommandEmpty>لم يتم العثور على متجر.</CommandEmpty>
                            <CommandGroup>
                                {merchantOptions.map(m => (
                                    <CommandItem
                                        key={m.id}
                                        value={m.storeName || m.name}
                                        onSelect={() => {
                                            setSelectedMerchantId(m.id);
                                            setRecentlyAdded([]);
                                            setSelectedRecent([]);
                                            setMerchantPopoverOpen(false);
                                        }}
                                    >
                                        <Check className={cn("mr-2 h-4 w-4", selectedMerchantId === m.id ? "opacity-100" : "opacity-0")} />
                                        {m.storeName || m.name}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                          </CommandList>
                      </Command>
                  </PopoverContent>
              </Popover>
          </div>
        </CardContent>
      </Card>
      
        <Card className="rounded-lg border bg-amber-50 p-4 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
            <CardHeader className='p-0 pb-4'>
                <CardTitle className="font-bold flex items-center gap-2"><Icon name="Wand2" /> الإدخال السريع بالذكاء الاصطناعي</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">الصق النص الكامل للطلب هنا (مثلاً من رسالة واتساب) وسيقوم النظام بتحليله وتعبئة الحقول تلقائيًا.</CardDescription>
            </CardHeader>
            <CardContent className='p-0'>
                <form action={formAction} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Textarea
                        name="request"
                        placeholder="مثال: مرحبا بدي اوردر باسم احمد علي، تلفون 0791234567، العنوان ماركا الشمالية، والسعر الكلي 15 دينار شامل توصيل"
                        className="md:col-span-2 min-h-[100px] bg-background"
                    />
                    <Button type="submit" className="h-full text-base md:col-span-1" disabled={isAiPending || !selectedMerchantId}>
                        {isAiPending ? <Icon name="Loader2" className="animate-spin" /> : <Icon name="Bot" />}
                        {isAiPending ? 'جاري التحليل...' : 'تحليل وتعبئة الحقول'}
                    </Button>
                </form>
                 {aiState.error && (
                    <Alert variant="destructive" className="mt-4">
                        <Icon name="AlertCircle" className="h-4 w-4" />
                        <AlertTitle>خطأ في التحليل</AlertTitle>
                        <AlertDescription>{aiState.error}</AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleAddOrder)} className="space-y-6">
          <Card>
             <CardHeader><CardTitle>الإدخال اليدوي</CardTitle></CardHeader>
             <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField control={form.control} name="recipientName" render={({ field }) => ( <FormItem><FormLabel>المستلم</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="phone" render={({ field }) => ( <FormItem><FormLabel>الهاتف</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="whatsapp" render={({ field }) => ( <FormItem><FormLabel>رقم واتساب (اختياري)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField control={form.control} name="referenceNumber" render={({ field }) => ( <FormItem><FormLabel>رقم مرجعي (اختياري)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="parcelCount" render={({ field }) => ( <FormItem><FormLabel className='flex items-center gap-1'><Package className='h-4 w-4' /> عدد الطرود</FormLabel><FormControl><Input type="number" {...field} min={1}/></FormControl><FormMessage /></FormItem> )} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <FormField control={form.control} name="region" render={({ field }) => ( 
                        <FormItem className="flex flex-col">
                            <FormLabel>المنطقة</FormLabel>
                            <Popover open={regionPopoverOpen} onOpenChange={setRegionPopoverOpen}>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                                        >
                                            {field.value
                                                ? allRegions.find(r => `${r.name}_${r.cityName}` === field.value)?.name
                                                : "اختر منطقة..."}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                    <Command>
                                        <CommandInput placeholder="بحث عن منطقة..." />
                                        <CommandList>
                                            <CommandEmpty>لم يتم العثور على المنطقة.</CommandEmpty>
                                            <CommandGroup>
                                                {allRegions.map(r => (
                                                    <CommandItem
                                                        value={`${r.name} ${r.cityName}`}
                                                        key={`${r.id}-${r.cityName}`}
                                                        onSelect={() => {
                                                            form.setValue("region", `${r.name}_${r.cityName}`);
                                                            setRegionPopoverOpen(false);
                                                        }}
                                                    >
                                                        <Check className={cn("mr-2 h-4 w-4", `${r.name}_${r.cityName}` === field.value ? "opacity-100" : "opacity-0")}/>
                                                        {r.name} ({r.cityName})
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem> 
                    )} />
                     <FormField control={form.control} name="city" render={({ field }) => ( <FormItem><FormLabel>المدينة</FormLabel><FormControl><Input {...field} readOnly className="bg-muted" placeholder="سيتم تحديدها تلقائياً" /></FormControl><FormMessage /></FormItem> )} />
                     <FormField control={form.control} name="address" render={({ field }) => (
                         <FormItem>
                             <FormLabel>العنوان (اختياري)</FormLabel>
                             <div className="flex items-center gap-2">
                                <FormControl>
                                    <Input {...field} placeholder={lat && lng ? `تم تحديد الموقع على الخريطة` : "اسم الشارع، رقم البناية..."} />
                                </FormControl>
                                 <Button type="button" variant="outline" size="icon" onClick={() => setIsMapOpen(true)} className={cn(lat && lng && 'bg-green-100 border-green-400 text-green-700')}>
                                    <MapPin className="h-4 w-4"/>
                                 </Button>
                             </div>
                             <FormMessage />
                         </FormItem> 
                     )} />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <FormField control={form.control} name="cod" render={({ field }) => ( <FormItem className="md:col-span-1"><FormLabel>قيمة التحصيل (COD)</FormLabel><FormControl><Input type="number" {...field} disabled={isPrepaid} /></FormControl><FormMessage /></FormItem> )} />
                    <div className="md:col-span-2 grid grid-cols-2 gap-4 rounded-lg border p-3 bg-muted h-fit">
                        <div>
                            <p className="text-xs text-muted-foreground">المستحق للتاجر</p>
                            <p className="font-bold text-primary">{formatCurrency(calculatedFees.itemPrice)}</p>
                        </div>
                        <Separator orientation="vertical" className="h-auto"/>
                        <div>
                            <p className="text-xs text-muted-foreground">أجور التوصيل</p>
                            <p className="font-bold text-primary">{formatCurrency(calculatedFees.deliveryFee)}</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox id="isPrepaid" checked={isPrepaid} onCheckedChange={(checked) => setIsPrepaid(!!checked)} />
                    <Label htmlFor="isPrepaid" className="font-medium cursor-pointer">
                        الطلب مدفوع مسبقًا (أجور التوصيل تم دفعها من قبل التاجر)
                    </Label>
                </div>


                {/* Delivery Time Scheduling */}
                <div className="space-y-4 rounded-lg border p-4">
                    <Label className="flex items-center gap-2 font-semibold"><Clock className="h-5 w-5" /> تفضيلات وقت التوصيل</Label>
                    <FormField
                        control={form.control}
                        name="deliveryTimeType"
                        render={({ field }) => (
                            <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2"
                            >
                                <FormItem className="flex items-center space-x-2 space-x-reverse"><FormControl><RadioGroupItem value="any" /></FormControl><FormLabel className="font-normal">أي وقت</FormLabel></FormItem>
                                <FormItem className="flex items-center space-x-2 space-x-reverse"><FormControl><RadioGroupItem value="fixed" /></FormControl><FormLabel className="font-normal">وقت محدد</FormLabel></FormItem>
                                <FormItem className="flex items-center space-x-2 space-x-reverse"><FormControl><RadioGroupItem value="before" /></FormControl><FormLabel className="font-normal">قبل الساعة</FormLabel></FormItem>
                                <FormItem className="flex items-center space-x-2 space-x-reverse"><FormControl><RadioGroupItem value="after" /></FormControl><FormLabel className="font-normal">بعد الساعة</FormLabel></FormItem>
                            </RadioGroup>
                        )}
                    />
                    {deliveryTimeType !== 'any' && (
                        <FormField
                            control={form.control}
                            name="deliveryTime"
                            render={({ field }) => (
                                <FormItem className="animate-in fade-in">
                                    <FormControl><Input type="time" {...field} className="max-w-xs" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                </div>

                 {/* Notes */}
                <div className="space-y-4">
                    <Label className="flex items-center gap-2 font-semibold"><MessageSquareWarning className="h-5 w-5" /> ملاحظات الطلب</Label>
                    <div className="flex flex-wrap gap-2">
                        {predefinedNotes.map(note => (
                            <Button key={note.text} type="button" variant="outline" size="sm" className="gap-2" onClick={() => handleAddPredefinedNote(note.text)}>
                                <Icon name={note.icon} className="h-4 w-4" />
                                {note.text}
                            </Button>
                        ))}
                    </div>
                     <FormField control={form.control} name="notes" render={({ field }) => ( <FormItem><FormControl><Textarea {...field} placeholder="أضف ملاحظات إضافية هنا..." /></FormControl><FormMessage /></FormItem> )} />
                </div>
             </CardContent>
             <CardFooter>
                <Button type="submit" size="lg" disabled={!selectedMerchantId} className="w-full"> 
                    <Icon name="PlusCircle" className="mr-2" /> 
                    {selectedMerchantId ? 'إضافة الطلب إلى الجدول' : 'الرجاء اختيار متجر أولاً'}
                </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>

      {recentlyAdded.length > 0 && (
         <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>طلبات مضافة حديثاً ({recentlyAdded.length})</CardTitle>
                    <div className="flex items-center gap-2">
                         <Button variant="outline" size="sm" onClick={handlePrintClick} disabled={selectedRecent.length === 0}><Printer className="h-4 w-4 ml-2"/>طباعة بوليصة</Button>
                         <Button variant="destructive" size="sm" disabled={selectedRecent.length === 0} onClick={handleDeleteSelected}><Trash2 className="h-4 w-4 ml-2"/>حذف المحدد</Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12 text-center border-l"><Checkbox onCheckedChange={(checked) => handleSelectAllRecent(!!checked)} /></TableHead>
                            <TableHead className="text-center border-l">#</TableHead>
                            <TableHead className="text-center border-l">رقم الطلب</TableHead>
                            <TableHead className="text-center border-l w-48">المتجر</TableHead>
                            <TableHead className="text-center border-l w-48">المستلم</TableHead>
                            <TableHead className="text-center border-l w-40">الهاتف</TableHead>
                            <TableHead className="text-center border-l w-40">المنطقة</TableHead>
                            <TableHead className="text-center border-l w-32">المدينة</TableHead>
                            <TableHead className="text-center border-l w-32">قيمة التحصيل</TableHead>
                            <TableHead className="text-center w-40">الحالة</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {recentlyAdded.map((order, index) => (
                             <TableRow key={order.id}>
                                <TableCell className="text-center border-l"><Checkbox checked={selectedRecent.includes(order.id)} onCheckedChange={() => handleSelectRecent(order.id)} /></TableCell>
                                <TableCell className="text-center border-l">{index+1}</TableCell>
                                <TableCell className="text-center border-l font-mono text-xs">{order.id}</TableCell>
                                <TableCell className="text-center border-l">
                                    <Popover open={popoverStates[`merchant-${order.id}`]} onOpenChange={() => togglePopover(`merchant-${order.id}`)}>
                                      <PopoverTrigger asChild>
                                        <Button variant="ghost" className="w-full h-8 justify-between hover:bg-muted font-normal border">
                                          {order.merchant}
                                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-[200px] p-0">
                                        <Command>
                                          <CommandInput placeholder="بحث..." />
                                          <CommandList>
                                            <CommandEmpty>لم يوجد.</CommandEmpty>
                                            <CommandGroup>
                                              {merchantOptions.map(m => (
                                                <CommandItem
                                                  key={m.id}
                                                  value={m.storeName || m.name}
                                                  onSelect={() => {
                                                    handleUpdateRecentlyAdded(order.id, 'merchant', m.storeName || m.name);
                                                    togglePopover(`merchant-${order.id}`);
                                                  }}
                                                >
                                                  <Check className={cn("mr-2 h-4 w-4", order.merchant === (m.storeName || m.name) ? "opacity-100" : "opacity-0")} />
                                                  {m.storeName || m.name}
                                                </CommandItem>
                                              ))}
                                            </CommandGroup>
                                          </CommandList>
                                        </Command>
                                      </PopoverContent>
                                    </Popover>
                                </TableCell>
                                <TableCell className="text-center border-l">
                                    <Input
                                        value={order.recipient}
                                        onChange={(e) => handleUpdateRecentlyAdded(order.id, 'recipient', e.target.value)}
                                        className="h-8 text-center border-0 focus-visible:ring-offset-0 focus-visible:ring-0 bg-transparent hover:bg-muted"
                                    />
                                </TableCell>
                                <TableCell className="text-center border-l">
                                     <Input
                                        value={order.phone}
                                        onChange={(e) => handleUpdateRecentlyAdded(order.id, 'phone', e.target.value)}
                                        className="h-8 text-center border-0 focus-visible:ring-offset-0 focus-visible:ring-0 bg-transparent hover:bg-muted"
                                    />
                                </TableCell>
                                <TableCell className="text-center border-l">
                                    <Popover open={popoverStates[`region-${order.id}`]} onOpenChange={() => togglePopover(`region-${order.id}`)}>
                                      <PopoverTrigger asChild>
                                        <Button variant="ghost" className="w-full h-8 justify-between hover:bg-muted font-normal border">
                                          {order.region}
                                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-[200px] p-0">
                                        <Command>
                                          <CommandInput placeholder="بحث..." />
                                          <CommandList>
                                            <CommandEmpty>لم يوجد.</CommandEmpty>
                                            <CommandGroup>
                                              {allRegions.map(r => (
                                                <CommandItem
                                                  key={`${r.id}-${r.cityName}`}
                                                  value={`${r.name} ${r.cityName}`}
                                                  onSelect={() => {
                                                    handleUpdateRecentlyAdded(order.id, 'region', `${r.name}_${r.cityName}`);
                                                    togglePopover(`region-${order.id}`);
                                                  }}
                                                >
                                                  <Check className={cn("mr-2 h-4 w-4", `${order.region}_${order.city}` === `${r.name}_${r.cityName}` ? "opacity-100" : "opacity-0")} />
                                                  {r.name} ({r.cityName})
                                                </CommandItem>
                                              ))}
                                            </CommandGroup>
                                          </CommandList>
                                        </Command>
                                      </PopoverContent>
                                    </Popover>
                                </TableCell>
                                <TableCell className="text-center border-l">{order.city}</TableCell>
                                <TableCell className="text-center border-l">
                                    <Input
                                        type="number"
                                        value={order.cod}
                                        onChange={(e) => handleUpdateRecentlyAdded(order.id, 'cod', parseFloat(e.target.value) || 0)}
                                        className="h-8 text-center border-0 focus-visible:ring-offset-0 focus-visible:ring-0 bg-transparent hover:bg-muted"
                                    />
                                </TableCell>
                                <TableCell className="text-center">
                                      <Select
                                        value={order.status}
                                        onValueChange={(value) => handleUpdateRecentlyAdded(order.id, 'status', value)}
                                    >
                                        <SelectTrigger className="h-8 text-center border-0 focus:ring-0 bg-transparent hover:bg-muted">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {statuses.filter(s => s.isActive).map(s => (
                                                <SelectItem key={s.id} value={s.name}>
                                                     <div className="flex items-center gap-2">
                                                        <Icon name={s.icon as any} style={{ color: s.color }} className="h-4 w-4" />
                                                        {s.name}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                             </TableRow>
                        ))}
                    </TableBody>
                 </Table>
            </CardContent>
         </Card>
      )}
    </div>
    </>
  );
};

export default AddOrderPage;

    