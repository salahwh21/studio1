
'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUsersStore } from '@/store/user-store';
import { useOrdersStore, Order } from '@/store/orders-store';
import { useAreasStore } from '@/store/areas-store';
import { useToast } from '@/hooks/use-toast';
import { Check, ChevronsUpDown, Printer, Trash2 } from 'lucide-react';
import { useActionState } from 'react';
import { parseOrderFromRequest } from '@/app/actions/parse-order';
import { PrintablePolicy } from '@/components/printable-policy';

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
import { useSettings } from '@/contexts/SettingsContext';
import html2canvas from 'html2canvas';


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
});

type OrderFormValues = z.infer<typeof orderSchema>;

const AddOrderPage = () => {
  const { toast } = useToast();
  const { users } = useUsersStore();
  const { addOrder, deleteOrders, updateOrderField } = useOrdersStore();
  const { cities } = useAreasStore();
  const { statuses } = useStatusesStore();
  const { settings: orderSettings, isHydrated: settingsHydrated } = useSettings();

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
  
  const componentToPrintRef = useRef<HTMLDivElement>(null);
  
  const handlePrint = async () => {
    const input = componentToPrintRef.current;
    if (!input) {
        toast({
            variant: 'destructive',
            title: 'خطأ في الطباعة',
            description: 'لا يمكن العثور على المحتوى للطباعة.'
        });
        return;
    }

    const policyElements = input.querySelectorAll('.policy-sheet');
    if (policyElements.length === 0) {
        toast({
            variant: 'destructive',
            title: 'لا طلبات محددة',
            description: 'الرجاء تحديد طلب واحد على الأقل لطباعة البوليصة.'
        });
        return;
    }

    const jsPDF = (await import('jspdf')).default;
    const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
    });

    const promises = Array.from(policyElements).map((element, index) => 
        html2canvas(element as HTMLElement, { 
            scale: 2, 
            allowTaint: true, 
            useCORS: true 
        }).then(canvas => {
            if (index > 0) {
                pdf.addPage();
            }
            const imgData = canvas.toDataURL('image/png');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / canvasHeight;
            const width = pdfWidth;
            const height = width / ratio;

            pdf.addImage(imgData, 'PNG', 0, 0, width, height > pdfHeight ? pdfHeight : height);
        })
    );
    
    Promise.all(promises).then(() => {
        pdf.autoPrint();
        window.open(pdf.output('bloburl'), '_blank');
    });
  }

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: { recipientName: '', phone: '', whatsapp: '', city: '', region: '', address: '', cod: 0, notes: '', referenceNumber: '' },
  });

  const { watch, setValue, getValues, reset } = form;
  const selectedRegionValue = watch('region');
  const codValue = watch('cod');
  const selectedCity = watch('city');

  const merchantOptions = useMemo(() => users.filter(u => u.roleId === 'merchant'), [users]);
  const allRegions = useMemo(() => cities.flatMap(c => c.areas.map(a => ({ ...a, cityName: c.name }))).sort((a,b) => a.name.localeCompare(b.name)), [cities]);
  
  useEffect(() => {
    if (selectedRegionValue) {
        const [regionName, cityName] = selectedRegionValue.split('_');
        const regionData = allRegions.find(r => r.name === regionName && r.cityName === cityName);
        if (regionData) {
            setValue('city', regionData.cityName, { shouldValidate: true });
        }
    }
  }, [selectedRegionValue, allRegions, setValue]);


  const calculatedFees = useMemo(() => {
    if (!selectedCity || codValue === undefined) {
      return { deliveryFee: 0, itemPrice: 0 };
    }
    const deliveryFee = selectedCity === 'عمان' ? 2.5 : 3.5;
    const itemPrice = codValue - deliveryFee;
    return { deliveryFee, itemPrice };
  }, [codValue, selectedCity]);

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

    const newOrder: Omit<Order, 'id' | 'orderNumber'> = {
      source: 'Manual',
      referenceNumber: data.referenceNumber || '',
      recipient: data.recipientName || 'زبون غير مسمى',
      phone: data.phone || '',
      whatsapp: data.whatsapp || '',
      address: `${data.address ? `${data.address}, ` : ''}${regionName}, ${data.city}`,
      city: data.city || '',
      region: regionName,
      status: orderSettings.orders.defaultStatus,
      driver: 'غير معين',
      merchant: merchant.name,
      cod: data.cod,
      itemPrice: calculatedFees.itemPrice,
      deliveryFee: calculatedFees.deliveryFee,
      date: new Date().toISOString().split('T')[0],
      notes: data.notes || '',
    };
    
    const addedOrder = addOrder(newOrder);
    setRecentlyAdded(prev => [addedOrder, ...prev]);
    toast({ title: 'تمت الإضافة', description: `تمت إضافة طلب "${data.recipientName}" بنجاح.` });
    reset({ ...getValues(), recipientName: '', phone: '', whatsapp: '', cod: 0, notes: '', referenceNumber: '', address: '' });
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
  
  const ordersToPrint = useMemo(() => {
    return recentlyAdded.filter(o => selectedRecent.includes(o.id));
  }, [recentlyAdded, selectedRecent]);

  return (
    <div className="space-y-6">
       <div className="hidden">
            <PrintablePolicy ref={componentToPrintRef} orders={ordersToPrint} />
       </div>

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
                          {selectedMerchantId ? merchantOptions.find(m => m.id === selectedMerchantId)?.name : "اختر متجرًا..."}
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
                                        value={m.name}
                                        onSelect={() => {
                                            setSelectedMerchantId(m.id);
                                            setRecentlyAdded([]);
                                            setSelectedRecent([]);
                                            setMerchantPopoverOpen(false);
                                        }}
                                    >
                                        <Check className={cn("mr-2 h-4 w-4", selectedMerchantId === m.id ? "opacity-100" : "opacity-0")} />
                                        {m.name}
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
                     <FormField control={form.control} name="address" render={({ field }) => ( <FormItem><FormLabel>العنوان (اختياري)</FormLabel><FormControl><Input {...field} placeholder="اسم الشارع، رقم البناية..."/></FormControl><FormMessage /></FormItem> )} />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <FormField control={form.control} name="cod" render={({ field }) => ( <FormItem className="md:col-span-1"><FormLabel>قيمة التحصيل (COD)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <div className="md:col-span-2 grid grid-cols-2 gap-4 rounded-lg border p-3 bg-muted h-fit">
                        <div>
                            <p className="text-xs text-muted-foreground">المستحق للتاجر</p>
                            <p className="font-bold text-primary">{calculatedFees.itemPrice.toFixed(2)} د.أ</p>
                        </div>
                        <Separator orientation="vertical" className="h-auto"/>
                        <div>
                            <p className="text-xs text-muted-foreground">أجور التوصيل</p>
                            <p className="font-bold text-primary">{calculatedFees.deliveryFee.toFixed(2)} د.أ</p>
                        </div>
                    </div>
                </div>
                 <FormField control={form.control} name="notes" render={({ field }) => ( <FormItem><FormLabel>ملاحظات</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )} />
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
                         <Button variant="outline" size="sm" disabled={selectedRecent.length === 0} onClick={handlePrint}><Printer className="h-4 w-4 ml-2"/>طباعة بوليصة</Button>
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
                                                  value={m.name}
                                                  onSelect={() => {
                                                    handleUpdateRecentlyAdded(order.id, 'merchant', m.name);
                                                    togglePopover(`merchant-${order.id}`);
                                                  }}
                                                >
                                                  <Check className={cn("mr-2 h-4 w-4", order.merchant === m.name ? "opacity-100" : "opacity-0")} />
                                                  {m.name}
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
  );
};

export default AddOrderPage;
