'use client';

import { useEffect, useState } from 'react';
import { useFormState } from 'react-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Bot, Image as ImageIcon, Loader2, Clipboard, FileText, User, Home, ShoppingBasket, Hash } from 'lucide-react';
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

const formSchema = z.object({
  request: z.string().min(10, {
    message: 'يجب أن يكون الطلب ١٠ أحرف على الأقل.',
  }),
});

export default function AIOrderParsingPage() {
  const { toast } = useToast();
  const [initialState, setInitialState] = useState({
    data: null,
    error: null,
    message: '',
  });

  const [formState, formAction] = useFormState(parseOrderFromRequest, initialState);
  const [isPending, setIsPending] = useState(false);
  const [parsedData, setParsedData] = useState<ParseOrderDetailsOutput | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      request: '',
    },
  });

  useEffect(() => {
    if (formState.error) {
      toast({
        variant: 'destructive',
        title: 'حدث خطأ ما!',
        description: formState.error,
      });
    }
    if (formState.data) {
        setParsedData(formState.data);
    }
    setIsPending(false);
  }, [formState, toast]);

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

  const handleFormSubmit = async (formData: FormData) => {
    setIsPending(true);
    setParsedData(null);
    formAction(formData);
  };
  
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

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form action={handleFormSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot /> محلل الطلبات الذكي
            </CardTitle>
            <CardDescription>
              أدخل طلبًا جديدًا باستخدام نص أو قم بتحميل صورة للطلب. سيقوم الذكاء الاصطناعي بتحليل التفاصيل لك.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="space-y-2">
                <Label htmlFor="request">تفاصيل الطلب</Label>
                <Textarea
                  id="request"
                  name="request"
                  placeholder="مثال: إرسال ٢ بيتزا حجم كبير إلى علي في ١٢٣ شارع الملك، الرياض. واحدة بيبروني وواحدة خضار."
                  className="min-h-[150px]"
                  value={form.watch('request')}
                  onChange={(e) => form.setValue('request', e.target.value)}
                />
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
                'تحليل الطلب'
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText/> تأكيد الطلب المستخرج</CardTitle>
          <CardDescription>
            تحقق من التفاصيل التي استخرجها الذكاء الاصطناعي أدناه وقم بتأكيد الطلب.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 min-h-[300px] flex flex-col justify-center">
          {isPending && !parsedData && (
             <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p>يقوم الذكاء الاصطناعي بمعالجة الطلب...</p>
             </div>
          )}
          {!isPending && !parsedData && (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
                <Bot className="h-8 w-8" />
                <p>في انتظار تفاصيل الطلب لتحليلها.</p>
             </div>
          )}
          {parsedData && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customerName" className="flex items-center gap-2"><User className="h-4 w-4"/> اسم العميل</Label>
                <Input id="customerName" defaultValue={parsedData.customerName || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2"><Home className="h-4 w-4"/> عنوان التوصيل</Label>
                <Input id="address" defaultValue={parsedData.address || ''} />
              </div>
              <div>
                 <Label className="flex items-center gap-2 mb-2"><ShoppingBasket className="h-4 w-4"/> المنتجات</Label>
                 <div className="space-y-2 rounded-md border p-4">
                     {parsedData.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center">
                            <span className="flex items-center gap-2"><Hash className="h-3 w-3 text-muted-foreground"/>{item}</span>
                            <Badge variant="secondary">الكمية: {parsedData.quantity[index]}</Badge>
                        </div>
                     ))}
                 </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
            <Button disabled={!parsedData || isPending}>تأكيد وإنشاء الطلب</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
