
'use client';

import { useEffect, useState, useTransition } from 'react';
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
import Icon from '@/components/icon';

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
  
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState(initialState);

  useEffect(() => {
    if (state.error) {
      toast({
        variant: 'destructive',
        title: 'فشل التحليل!',
        description: state.error,
      });
    }
    if (state.data && state.data.customerName) {
      const newOrder: OrderReviewItem = {
        id: Date.now(),
        ...state.data,
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
  }, [state, toast]);

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!requestText && !imageDataUri) {
        toast({
            variant: 'destructive',
            title: 'خطأ في الإدخال',
            description: 'الرجاء إدخال نص الطلب أو تحميل صورة.',
        });
        return;
    }
    
    startTransition(async () => {
        const formData = new FormData();
        formData.append('request', requestText || imageDataUri || '');
        const result = await parseOrderFromRequest(initialState, formData);
        setState(result);
    });
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setRequestText(text);
        setImageDataUri(null);
      }
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
    // In a real app, this would likely send the confirmed orders to a database.
    setReviewList([]);
    toast({
      title: 'تم تأكيد الطلبات بنجاح!',
      description: 'تم إرسال الطلبات إلى النظام.',
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="flex flex-col gap-6">
        <form onSubmit={handleFormSubmit}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Wand2" /> إدخال الطلب
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
                      name="request"
                      placeholder="مثال: إرسال ٢ بيتزا حجم كبير إلى علي في ١٢٣ شارع الملك، الرياض. واحدة بيبروني وواحدة خضار."
                      className={`min-h-[150px] transition-colors ${state.error ? 'border-red-500' : ''}`}
                      value={requestText}
                      onChange={(e) => {
                          setRequestText(e.target.value);
                          if(e.target.value) setImageDataUri(null);
                      }}
                      disabled={!!imageDataUri}
                    />

                    {imageDataUri && (
                        <div className="relative mt-2 w-40 h-40">
                            <img src={imageDataUri} alt="Preview" className="rounded-md object-cover w-full h-full"/>
                             <Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={() => {
                                setImageDataUri(null);
                                const fileInput = document.getElementById('image-upload') as HTMLInputElement;
                                if(fileInput) fileInput.value = '';
                             }}>
                                <Icon name="Trash2" className="h-4 w-4"/>
                             </Button>
                        </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={handlePasteFromClipboard} className="gap-2">
                        <Icon name="Clipboard" className="h-4 w-4" /> لصق
                    </Button>
                     <Button type="button" variant="outline" size="sm" asChild className="gap-2">
                        <Label htmlFor="image-upload" className="cursor-pointer">
                            <Icon name="Image" className="h-4 w-4" /> تحميل صورة
                            <input id="image-upload" type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
                        </Label>
                    </Button>
                  </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isPending || (!requestText && !imageDataUri)}>
                  {isPending ? (
                    <>
                      <Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
                      جاري التحليل...
                    </>
                  ) : (
                    <>
                      <Icon name="Bot" className="mr-2 h-4 w-4" />
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
          <CardTitle className="flex items-center gap-2"><Icon name="FileText"/> طلبات قيد المراجعة</CardTitle>
          <CardDescription>
            تحقق من الطلبات التي تم تحليلها. يمكنك تعديلها أو حذفها قبل تأكيدها بشكل نهائي.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           {isPending && reviewList.length === 0 && (
             <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground min-h-[300px]">
                <Icon name="Loader2" className="h-8 w-8 animate-spin text-primary" />
                <p>يقوم الذكاء الاصطناعي بمعالجة أول طلب...</p>
             </div>
          )}
          {!isPending && reviewList.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground min-h-[300px]">
                <Icon name="Bot" className="h-8 w-8" />
                <p>في انتظار إضافة طلبات للمراجعة.</p>
             </div>
          )}
          {reviewList.length > 0 && (
             <div className="overflow-x-auto">
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-center whitespace-nowrap">العميل</TableHead>
                            <TableHead className="text-center whitespace-nowrap">العنوان</TableHead>
                            <TableHead className="text-center whitespace-nowrap">المنتجات</TableHead>
                            <TableHead className="text-center whitespace-nowrap">إجراء</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reviewList.map(order => (
                           <TableRow key={order.id} className="bg-blue-50 dark:bg-blue-900/20">
                                <TableCell className="font-medium text-center whitespace-nowrap">{order.customerName}</TableCell>
                                <TableCell className="text-center whitespace-nowrap">{order.address}</TableCell>
                                <TableCell className="text-center whitespace-nowrap">
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {order.items.map((item, index) => (
                                            <Badge key={index} variant="secondary">{item} (x{order.quantity[index] || 1})</Badge>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell className="text-center whitespace-nowrap">
                                    <Button variant="ghost" size="icon" onClick={() => setReviewList(prev => prev.filter(o => o.id !== order.id))}>
                                        <Icon name="Trash2" className="h-4 w-4 text-destructive"/>
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
            <Button disabled={reviewList.length === 0 || isPending} onClick={handleConfirmOrders}>
                <Icon name="Send" className="mr-2 h-4 w-4"/> تأكيد كل الطلبات 
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
