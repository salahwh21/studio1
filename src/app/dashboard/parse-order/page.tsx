
'use client';

import { useEffect, useState } from 'react';
import { useActionState } from 'react';
import { z } from 'zod';
import { Bot, Image as ImageIcon, Loader2, Clipboard, FileText, Trash2, Send, Wand2 } from 'lucide-react';
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
  const [requestText, setRequestText] = useState('');
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formState, formAction] = useActionState(parseOrderFromRequest, initialState);

  useEffect(() => {
    setIsSubmitting(false);
    if (formState.error) {
      toast({
        variant: 'destructive',
        title: 'فشل التحليل!',
        description: formState.error,
      });
    }
    if (formState.data && formState.data.customerName) {
      const newOrder: OrderReviewItem = {
        id: Date.now(),
        ...formState.data,
      };
      setReviewList(prev => [newOrder, ...prev]);
      setRequestText('');
      setImageDataUri(null);
      
      const fileInput = document.getElementById('image-upload') as HTMLInputElement;
      if(fileInput) fileInput.value = '';

      toast({
        title: 'نجح التحليل!',
        description: 'تمت إضافة الطلب إلى جدول المراجعة.',
      });
    }
  }, [formState, toast]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = formSchema.safeParse({ request: requestText || imageDataUri });
    if (!validation.success) {
        toast({
            variant: 'destructive',
            title: 'خطأ في الإدخال',
            description: validation.error.flatten().fieldErrors.request?.join(', ') || 'الرجاء إدخال نص الطلب أو تحميل صورة.',
        });
        return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('request', requestText || imageDataUri!);
    formAction(formData);
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setRequestText(text);
      setImageDataUri(null);
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
        setImageDataUri(dataUri);
        setRequestText(''); // Clear text when image is selected
        toast({
          title: 'تم تحميل الصورة',
          description: 'الصورة جاهزة للتحليل.',
        })
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmOrders = () => {
    setReviewList([]);
    toast({
      title: 'تم تأكيد الطلبات بنجاح!',
      description: 'تم إرسال الطلبات إلى النظام.',
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="flex flex-col gap-6">
        <form onSubmit={handleSubmit}>
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
                    <Label htmlFor="request">نص الطلب أو الصورة</Label>
                    <Textarea
                      id="request"
                      placeholder="مثال: إرسال ٢ بيتزا حجم كبير إلى علي في ١٢٣ شارع الملك، الرياض. واحدة بيبروني وواحدة خضار."
                      className={`min-h-[150px] transition-colors ${formState.error ? 'border-red-500' : ''}`}
                      value={requestText}
                      onChange={(e) => {
                          setRequestText(e.target.value);
                          if(e.target.value) setImageDataUri(null);
                      }}
                    />
                    {imageDataUri && (
                        <div className="relative mt-2 w-40 h-40">
                            <img src={imageDataUri} alt="Preview" className="rounded-md object-cover w-full h-full"/>
                             <Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={() => {
                                setImageDataUri(null);
                                const fileInput = document.getElementById('image-upload') as HTMLInputElement;
                                if(fileInput) fileInput.value = '';
                             }}>
                                <Trash2 className="h-4 w-4"/>
                             </Button>
                        </div>
                    )}
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
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
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
           {isSubmitting && reviewList.length === 0 && (
             <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground min-h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p>يقوم الذكاء الاصطناعي بمعالجة أول طلب...</p>
             </div>
          )}
          {!isSubmitting && reviewList.length === 0 && (
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
                                            <Badge key={index} variant="secondary">{item} (x{order.quantity[index] || 1})</Badge>
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
            <Button disabled={reviewList.length === 0 || isSubmitting} onClick={handleConfirmOrders}>
                <Send className="mr-2 h-4 w-4"/> تأكيد كل الطلبات 
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
