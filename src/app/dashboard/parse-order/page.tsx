'use client';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFormState as useReactHookFormState } from 'react-hook-form';
import { useFormState } from 'react-dom';
import { z } from 'zod';
import { Bot, Image as ImageIcon, Loader2, Clipboard, FileText, User, Home, ShoppingBasket, Hash, Trash2, Send, Wand2 } from 'lucide-react';
import { parseOrderFromRequest } from '@/app/actions/parse-order';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { ParseOrderDetailsOutput } from '@/ai/flows/parse-order-details';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';


const formSchema = z.object({
  request: z.string().min(1, {
    message: 'الرجاء إدخال نص الطلب.',
  }),
});

type OrderReviewItem = ParseOrderDetailsOutput & { id: number };

const initialState = {
  data: null,
  error: null,
  message: '',
};

export default function AIOrderParsingPage() {
  const { toast } = useToast();
  const [reviewList, setReviewList] = useState<OrderReviewItem[]>([]);
  
  const [formState, formAction] = useFormState(parseOrderFromRequest, initialState);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      request: '',
    },
  });
  
  const { isPending } = useReactHookFormState({ control: form.control });

  useEffect(() => {
    if (formState.error) {
      toast({
        variant: 'destructive',
        title: 'فشل التحليل!',
        description: formState.error,
      });
    }
    if (formState.data) {
      const newOrder: OrderReviewItem = {
        id: Date.now(),
        ...formState.data,
      };
      setReviewList(prev => [newOrder, ...prev]);
      form.reset();
       toast({
        title: 'نجح التحليل!',
        description: 'تمت إضافة الطلب إلى جدول المراجعة.',
      });
    }
  }, [formState, toast, form]);


  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      form.setValue('request', text);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'فشل اللصق',
        description: 'لم نتمكن من القراءة من الحافظة. يرجى اللصق يدويًا.',
      });
    }
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        form.setValue('request', dataUri);
      };
      reader.readAsDataURL(file);
    }
  };


  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="flex flex-col gap-6">
        <form action={formAction}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 /> إدخال الطلب
                </CardTitle>
                <CardDescription>
                  الصق نص الطلب من واتساب أو أي مصدر آخر، أو قم بتحميل صورة. سيقوم الذكاء الاصطناعي بالباقي.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="request">نص الطلب</Label>
                    <Textarea
                      id="request"
                      name="request"
                      placeholder="مثال: إرسال ٢ بيتزا حجم كبير إلى علي في ١٢٣ شارع الملك، الرياض. واحدة بيبروني وواحدة خضار."
                      className={`min-h-[150px] transition-colors ${formState.error ? 'border-red-500' : formState.data ? 'border-green-500' : ''}`}
                      {...form.register('request')}
                    />
                    {form.formState.errors.request && <p className="text-sm text-red-600">{form.formState.errors.request.message}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={handlePasteFromClipboard} className="gap-2">
                        <Clipboard className="h-4 w-4" /> لصق
                    </Button>
                     <Button type="button" variant="outline" size="sm" asChild className="gap-2">
                        <Label htmlFor="image-upload" className="cursor-pointer">
                            <ImageIcon className="h-4 w-4" /> تحميل صورة
                            <input id="image-upload" type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
                        </Label>
                    </Button>
                  </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      جاري التحليل...
                    </>
                  ) : (
                    <>
                      <Bot className="mr-2 h-4 w-4" />
                      تحليل وإضافة للمراجعة
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
        </form>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText/> طلبات قيد المراجعة</CardTitle>
          <CardDescription>
            تحقق من الطلبات التي تم تحليلها. يمكنك تعديلها أو حذفها قبل تأكيدها بشكل نهائي.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           {isPending && reviewList.length === 0 && (
             <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground min-h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p>يقوم الذكاء الاصطناعي بمعالجة أول طلب...</p>
             </div>
          )}
          {!isPending && reviewList.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground min-h-[300px]">
                <Bot className="h-8 w-8" />
                <p>في انتظار إضافة طلبات للمراجعة.</p>
             </div>
          )}
          {reviewList.length > 0 && (
             <div className="overflow-x-auto">
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>العميل</TableHead>
                            <TableHead>العنوان</TableHead>
                            <TableHead>المنتجات</TableHead>
                            <TableHead className="text-right">إجراء</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reviewList.map(order => (
                           <TableRow key={order.id} className="bg-blue-50 dark:bg-blue-900/20">
                                <TableCell className="font-medium">{order.customerName}</TableCell>
                                <TableCell>{order.address}</TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-2">
                                        {order.items.map((item, index) => (
                                            <Badge key={index} variant="secondary">{item} (x{order.quantity[index]})</Badge>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => setReviewList(prev => prev.filter(o => o.id !== order.id))}>
                                        <Trash2 className="h-4 w-4 text-destructive"/>
                                    </Button>
                                </TableCell>
                           </TableRow>
                        ))}
                    </TableBody>
                 </Table>
             </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end">
            <Button disabled={reviewList.length === 0 || isPending}>
                <Send className="mr-2 h-4 w-4"/> تأكيد كل الطلبات 
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
