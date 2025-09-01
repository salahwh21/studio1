
'use client';

import { useState, useMemo, useEffect } from 'react';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/icon';

const orderSchema = z.object({
  recipientName: z.string().min(3, "الاسم قصير جدًا."),
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

  const [selectedMerchantId, setSelectedMerchantId] = useState<string>('');
  const [addedOrders, setAddedOrders] = useState<Order[]>([]);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [aiText, setAiText] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: { recipientName: '', phone: '', city: '', region: '', itemPrice: 0, deliveryFee: 3, notes: '', referenceNumber: '' },
  });

  const { watch, setValue } = form;
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
    setAddedOrders(prev => [newOrder, ...prev]);
    toast({ title: 'تمت الإضافة', description: `تمت إضافة طلب "${data.recipientName}" إلى الجدول.` });
    form.reset({ ...form.getValues(), recipientName: '', phone: '', itemPrice: 0, notes: '', referenceNumber: '' });
  };
  
  const handleSelectAll = (checked: boolean) => {
    setSelectedRows(checked ? addedOrders.map(o => o.id) : []);
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    setSelectedRows(prev => checked ? [...prev, id] : prev.filter(rowId => rowId !== id));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Icon name="PackagePlus" /> إضافة طلبات جديدة</CardTitle>
          <CardDescription>اختر المتجر ثم ابدأ بإضافة الطلبات بشكل يدوي أو باستخدام المساعد الذكي.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-md">
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
      
      <Card className="bg-primary/5">
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Icon name="Wand2" /> الإدخال السريع بالذكاء الاصطناعي</CardTitle>
            <CardDescription>الصق نص الطلب (مثلاً من واتساب) وسيقوم النظام بتحليل وتعبئة الحقول تلقائياً.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Textarea
                    placeholder="مثال: مرحبا بدي اوردر باسم احمد علي، تلفون 0791234567، العنوان ماركا الشمالية، والسعر الكلي 15 دينار شامل توصيل"
                    value={aiText}
                    onChange={(e) => setAiText(e.target.value)}
                    className="md:col-span-2 min-h-[100px]"
                />
                 <Button className="h-full text-base md:col-span-1" disabled={isParsing || !aiText || !selectedMerchantId}>
                    {isParsing ? <Icon name="Loader2" className="animate-spin" /> : <Icon name="Bot" />}
                    {isParsing ? 'جاري التحليل...' : 'تحليل وتعبئة الحقول'}
                </Button>
            </div>
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleAddOrder)} className="space-y-6">
          <Card>
             <CardHeader><CardTitle>الإدخال اليدوي</CardTitle></CardHeader>
             <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField control={form.control} name="itemPrice" render={({ field }) => ( <FormItem><FormLabel>المستحق للتاجر (د.أ)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="deliveryFee" render={({ field }) => ( <FormItem><FormLabel>أجور التوصيل (د.أ)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormItem><FormLabel>قيمة التحصيل (COD)</FormLabel><Input value={totalCod.toFixed(2)} readOnly className="font-bold text-lg bg-muted" /></FormItem>
                </div>
                 <Separator />
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField control={form.control} name="phone" render={({ field }) => ( <FormItem><FormLabel>رقم الهاتف</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="recipientName" render={({ field }) => ( <FormItem><FormLabel>اسم المستلم</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="referenceNumber" render={({ field }) => ( <FormItem><FormLabel>رقم مرجعي (اختياري)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <FormField control={form.control} name="city" render={({ field }) => ( <FormItem><FormLabel>المدينة</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="اختر مدينة" /></SelectTrigger></FormControl><SelectContent>{cities.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )} />
                     <FormField control={form.control} name="region" render={({ field }) => ( <FormItem><FormLabel>المنطقة</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled={!selectedCity}><FormControl><SelectTrigger><SelectValue placeholder={selectedCity ? "اختر منطقة" : "اختر مدينة أولاً"} /></SelectTrigger></FormControl><SelectContent>{regionOptions.map(r => <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )} />
                </div>
                 <FormField control={form.control} name="notes" render={({ field }) => ( <FormItem><FormLabel>ملاحظات (اختياري)</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )} />
             </CardContent>
             <CardFooter><Button type="submit" size="lg" disabled={!selectedMerchantId}> <Icon name="PlusCircle" className="mr-2" /> إضافة الطلب إلى الجدول</Button></CardFooter>
          </Card>
        </form>
      </Form>

       {addedOrders.length > 0 && (
        <Card>
            <CardHeader>
                <CardTitle>الطلبات المضافة للمراجعة</CardTitle>
                 <div className="flex items-center gap-2 mt-2">
                     <Button variant="outline" size="sm" disabled={selectedRows.length === 0}><Icon name="Download" /> تصدير ({selectedRows.length})</Button>
                     <Button variant="destructive" size="sm" disabled={selectedRows.length === 0}><Icon name="Trash2" /> حذف ({selectedRows.length})</Button>
                 </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]"><Checkbox onCheckedChange={handleSelectAll} checked={selectedRows.length === addedOrders.length && addedOrders.length > 0} /></TableHead>
                            <TableHead>الاسم</TableHead>
                            <TableHead>الهاتف</TableHead>
                            <TableHead>العنوان</TableHead>
                            <TableHead>COD</TableHead>
                            <TableHead>الحالة</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                    {addedOrders.map(order => (
                        <TableRow key={order.id}>
                            <TableCell><Checkbox checked={selectedRows.includes(order.id)} onCheckedChange={(checked) => handleSelectRow(order.id, !!checked)} /></TableCell>
                            <TableCell>{order.recipient}</TableCell>
                            <TableCell>{order.phone}</TableCell>
                            <TableCell>{order.address}</TableCell>
                            <TableCell>{order.cod.toFixed(2)}</TableCell>
                            <TableCell><Badge variant="secondary">{order.status}</Badge></TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><Icon name="MoreVertical" /></Button></DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem><Icon name="Printer" className="ml-2" /> طباعة بوليصة</DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive"><Icon name="Trash2" className="ml-2" /> حذف</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </div>
            </CardContent>
             <CardFooter className="justify-between pt-4">
                <p className="text-sm text-muted-foreground">تمت إضافة {addedOrders.length} طلبات.</p>
                <Button size="lg"><Icon name="CheckCheck" className="mr-2" /> تأكيد وإرسال كل الطلبات</Button>
             </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default AddOrderPage;
