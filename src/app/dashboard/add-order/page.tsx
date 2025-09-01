
'use client';

import { useState, useMemo, useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUsersStore, User } from '@/store/user-store';
import { useOrdersStore, Order } from '@/store/orders-store';
import { useAreasStore, City } from '@/store/areas-store';
import { useToast } from '@/hooks/use-toast';
import { nanoid } from 'nanoid';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/icon';

const orderSchema = z.object({
  recipientName: z.string().min(1, "الاسم مطلوب"),
  phone: z.string().regex(/^07[789]\d{7}$/, "رقم الهاتف غير صالح."),
  city: z.string({ required_error: "الرجاء اختيار المدينة." }),
  region: z.string({ required_error: "الرجاء اختيار المنطقة." }),
  itemPrice: z.coerce.number().min(0, "المبلغ يجب أن يكون موجبًا."),
  deliveryFee: z.coerce.number().min(0, "الأجور يجب أن تكون موجبة."),
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

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: { recipientName: '', phone: '', city: '', region: '', itemPrice: 0, deliveryFee: 0, notes: '', referenceNumber: '' },
  });

  const { watch, setValue, getValues, reset } = form;
  const selectedCity = watch('city');
  const itemPrice = watch('itemPrice');
  const deliveryFee = watch('deliveryFee');

  const merchantOptions = useMemo(() => users.filter(u => u.roleId === 'merchant'), [users]);
  const regionOptions = useMemo(() => cities.find(c => c.name === selectedCity)?.areas || [], [cities, selectedCity]);

  const totalCod = useMemo(() => (Number(itemPrice) || 0) + (Number(deliveryFee) || 0), [itemPrice, deliveryFee]);
  
  const handleAddOrder = (data: OrderFormValues) => {
    const merchant = users.find(u => u.id === selectedMerchantId);
    if (!merchant) {
      toast({ variant: 'destructive', title: 'خطأ', description: 'الرجاء اختيار متجر أولاً.' });
      return;
    }
    
    const newOrder: Order = {
      id: nanoid(10),
      source: 'Manual',
      referenceNumber: data.referenceNumber || '',
      recipient: data.recipientName,
      phone: data.phone,
      address: `${data.region}, ${data.city}`,
      city: data.city,
      region: data.region,
      status: 'بالانتظار',
      driver: 'غير معين',
      merchant: merchant.name,
      cod: data.itemPrice + data.deliveryFee,
      itemPrice: data.itemPrice,
      deliveryFee: data.deliveryFee,
      date: new Date().toISOString().split('T')[0],
      notes: data.notes || '',
    };
    
    addOrder(newOrder);
    toast({ title: 'تمت الإضافة', description: `تمت إضافة طلب "${data.recipientName}" بنجاح.` });
    reset({ ...getValues(), recipientName: '', phone: '', itemPrice: 0, notes: '', referenceNumber: '' });
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
              <Select value={selectedMerchantId} onValueChange={setSelectedMerchantId}>
                <SelectTrigger id="merchant-select"><SelectValue placeholder="اختر متجرًا من القائمة..." /></SelectTrigger>
                <SelectContent>
                  {merchantOptions.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                </SelectContent>
              </Select>
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
                    <FormField control={form.control} name="itemPrice" render={({ field }) => ( <FormItem><FormLabel>المستحق للتاجر</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="deliveryFee" render={({ field }) => ( <FormItem><FormLabel>أجور التوصيل</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormItem><FormLabel>قيمة التحصيل</FormLabel><Input value={totalCod.toFixed(2)} readOnly className="font-bold text-lg bg-muted" /></FormItem>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField control={form.control} name="phone" render={({ field }) => ( <FormItem><FormLabel>الهاتف</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="recipientName" render={({ field }) => ( <FormItem><FormLabel>الاسم</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="referenceNumber" render={({ field }) => ( <FormItem><FormLabel>رقم مرجعي</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <FormField control={form.control} name="city" render={({ field }) => ( <FormItem><FormLabel>المدينة</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="اختر مدينة" /></SelectTrigger></FormControl><SelectContent>{cities.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )} />
                     <FormField control={form.control} name="region" render={({ field }) => ( <FormItem><FormLabel>المنطقة</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled={!selectedCity}><FormControl><SelectTrigger><SelectValue placeholder={selectedCity ? "اختر منطقة" : "اختر مدينة أولاً"} /></SelectTrigger></FormControl><SelectContent>{regionOptions.map(r => <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )} />
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

    