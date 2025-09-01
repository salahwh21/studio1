
'use client';

import { useState, useMemo, useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUsersStore, User } from '@/store/user-store';
import { useOrdersStore, Order } from '@/store/orders-store';
import { useAreasStore, City, Area } from '@/store/areas-store';
import { useToast } from '@/hooks/use-toast';
import { nanoid } from 'nanoid';
import { Check, ChevronsUpDown } from 'lucide-react';

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
import { cn } from '@/lib/utils';


const orderSchema = z.object({
  recipientName: z.string().min(1, "الاسم مطلوب"),
  phone: z.string().regex(/^07[789]\d{7}$/, "رقم الهاتف غير صالح."),
  region: z.string({ required_error: "الرجاء اختيار المنطقة." }),
  city: z.string({ required_error: "الرجاء اختيار مدينة." }),
  cod: z.coerce.number().min(0, "المبلغ يجب أن يكون موجبًا."),
  notes: z.string().optional(),
  referenceNumber: z.string().optional(),
});

type OrderFormValues = z.infer<typeof orderSchema>;

const AddOrderPage = () => {
  const { toast } = useToast();
  const { users } = useUsersStore();
  const { addOrder } = useOrdersStore();
  const { cities } = useAreasStore();
  const [isPending, startTransition] = useTransition();

  const [selectedMerchantId, setSelectedMerchantId] = useState<string>('');
  const [aiText, setAiText] = useState('');
  
  const [merchantPopoverOpen, setMerchantPopoverOpen] = useState(false);
  const [regionPopoverOpen, setRegionPopoverOpen] = useState(false);

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: { recipientName: '', phone: '', city: '', region: '', cod: 0, notes: '', referenceNumber: '' },
  });

  const { watch, setValue, getValues, reset, trigger } = form;
  const selectedRegionValue = watch('region');
  const codValue = watch('cod');
  const selectedCity = watch('city');

  const merchantOptions = useMemo(() => users.filter(u => u.roleId === 'merchant'), [users]);
  const allRegions = useMemo(() => cities.flatMap(c => c.areas.map(a => ({ ...a, cityName: c.name }))).sort((a,b) => a.name.localeCompare(b.name)), [cities]);
  
  // Auto-select city when region changes
  useEffect(() => {
    if (selectedRegionValue) {
        const [regionName, cityName] = selectedRegionValue.split('_');
        const regionData = allRegions.find(r => r.name === regionName && r.cityName === cityName);
        if (regionData) {
            setValue('city', regionData.cityName, { shouldValidate: true });
        }
    }
  }, [selectedRegionValue, allRegions, setValue]);


  // Mock pricing logic - in a real app this would be more complex
  const calculatedFees = useMemo(() => {
    if (!selectedCity || codValue <= 0) {
      return { deliveryFee: 0, itemPrice: 0 };
    }
    // Simple mock logic: fee is 2.5 for Amman, 3.5 for others
    const deliveryFee = selectedCity === 'عمان' ? 2.5 : 3.5;
    const itemPrice = codValue - deliveryFee;
    return { deliveryFee, itemPrice };
  }, [codValue, selectedCity]);
  
  const handleAddOrder = (data: OrderFormValues) => {
    const merchant = users.find(u => u.id === selectedMerchantId);
    if (!merchant) {
      toast({ variant: 'destructive', title: 'خطأ', description: 'الرجاء اختيار متجر أولاً.' });
      return;
    }
    
    const [regionName] = data.region.split('_');
    
    const newOrder: Order = {
      id: nanoid(10),
      source: 'Manual',
      referenceNumber: data.referenceNumber || '',
      recipient: data.recipientName,
      phone: data.phone,
      address: `${regionName}, ${data.city}`,
      city: data.city,
      region: regionName,
      status: 'بالانتظار',
      driver: 'غير معين',
      merchant: merchant.name,
      cod: data.cod,
      itemPrice: calculatedFees.itemPrice,
      deliveryFee: calculatedFees.deliveryFee,
      date: new Date().toISOString().split('T')[0],
      notes: data.notes || '',
    };
    
    addOrder(newOrder);
    toast({ title: 'تمت الإضافة', description: `تمت إضافة طلب "${data.recipientName}" بنجاح.` });
    reset({ ...getValues(), recipientName: '', phone: '', cod: 0, notes: '', referenceNumber: '' });
  };
  
  const handleParseWithAI = () => {
      // AI parsing logic will be added in a future step.
      // For now, it just shows a loading state.
      startTransition(() => {
          setTimeout(() => {
            toast({ title: 'جاري التحليل...', description: 'سيقوم الذكاء الاصطناعي بتعبئة الحقول قريبًا.'});
          }, 1000);
      });
  };

  return (
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
      
        <div className="rounded-lg border bg-amber-50 p-4 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
            <h3 className="font-bold flex items-center gap-2 mb-1"><Icon name="Wand2" /> الإدخال السريع بالذكاء الاصطناعي</h3>
            <p className="text-sm text-muted-foreground mb-4">الصق النص الكامل للطلب هنا (مثلاً من رسالة واتساب) وسيقوم النظام بتحليله وتعبئة الحقول تلقائيًا.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Textarea
                    placeholder="مثال: مرحبا بدي اوردر باسم احمد علي، تلفون 0791234567، العنوان ماركا الشمالية، والسعر الكلي 15 دينار شامل توصيل"
                    value={aiText}
                    onChange={(e) => setAiText(e.target.value)}
                    className="md:col-span-2 min-h-[100px] bg-background"
                />
                <Button className="h-full text-base md:col-span-1" onClick={handleParseWithAI} disabled={isPending || !aiText || !selectedMerchantId}>
                    {isPending ? <Icon name="Loader2" className="animate-spin" /> : <Icon name="Bot" />}
                    {isPending ? 'جاري التحليل...' : 'تحليل وتعبئة الحقول'}
                </Button>
            </div>
        </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleAddOrder)} className="space-y-6">
          <Card>
             <CardHeader><CardTitle>الإدخال اليدوي</CardTitle></CardHeader>
             <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField control={form.control} name="recipientName" render={({ field }) => ( <FormItem><FormLabel>اسم المستلم</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="phone" render={({ field }) => ( <FormItem><FormLabel>الهاتف</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="referenceNumber" render={({ field }) => ( <FormItem><FormLabel>رقم مرجعي</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                                        value={r.name}
                                                        key={`${r.id}-${r.cityName}`}
                                                        onSelect={() => {
                                                            field.onChange(`${r.name}_${r.cityName}`);
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
    </div>
  );
};

export default AddOrderPage;

