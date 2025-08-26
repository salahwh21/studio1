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

const formSchema = z.object({
  request: z.string().min(10, {
    message: 'Request must be at least 10 characters.',
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
        title: 'Uh oh! Something went wrong.',
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
    formAction(formData);
  };
  
  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      form.setValue('request', text);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to paste',
        description: 'Could not read from clipboard. Please paste manually.',
      });
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form action={handleFormSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot /> AI Order Parser
            </CardTitle>
            <CardDescription>
              Enter a new order using text or upload an image of the order. Our AI will parse the details for you.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="space-y-2">
                <Label htmlFor="request">Order Details</Label>
                <Textarea
                  id="request"
                  name="request"
                  placeholder="e.g., Send 2 large pizzas to Ali at 123 Main St, Riyadh. One pepperoni, one veggie."
                  className="min-h-[150px]"
                  value={form.watch('request')}
                  onChange={(e) => form.setValue('request', e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={handlePasteFromClipboard} className="gap-2">
                    <Clipboard className="h-4 w-4" /> Paste
                </Button>
                <Button type="button" variant="outline" size="sm" asChild className="gap-2">
                    <Label htmlFor="image-upload">
                        <ImageIcon className="h-4 w-4" /> Upload Image
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
                  Parsing...
                </>
              ) : (
                'Parse Order'
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText/> Parsed Order Confirmation</CardTitle>
          <CardDescription>
            Verify the details extracted by the AI below and confirm the order.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isPending && !parsedData && (
             <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p>AI is processing the order...</p>
             </div>
          )}
          {!isPending && !parsedData && (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
                <Bot className="h-8 w-8" />
                <p>Awaiting order details to parse.</p>
             </div>
          )}
          {parsedData && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customerName" className="flex items-center gap-2"><User className="h-4 w-4"/> Customer Name</Label>
                <Input id="customerName" value={parsedData.customerName || ''} readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2"><Home className="h-4 w-4"/> Delivery Address</Label>
                <Input id="address" value={parsedData.address || ''} readOnly />
              </div>
              <div>
                 <Label className="flex items-center gap-2 mb-2"><ShoppingBasket className="h-4 w-4"/> Items</Label>
                 <div className="space-y-2 rounded-md border p-4">
                     {parsedData.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center">
                            <span className="flex items-center gap-2"><Hash className="h-3 w-3 text-muted-foreground"/>{item}</span>
                            <Badge variant="secondary">Qty: {parsedData.quantity[index]}</Badge>
                        </div>
                     ))}
                 </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
            <Button disabled={!parsedData}>Confirm & Create Order</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
