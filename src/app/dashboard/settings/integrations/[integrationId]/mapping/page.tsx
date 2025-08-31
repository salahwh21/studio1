
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/icon';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { suggestMappingAction } from '@/app/actions/suggest-mapping';
import { useFormState } from 'react-dom';


const mockPayloads = [
  { id: 'payload_1', receivedAt: '2023-09-01 11:05:12', status: 'success', data: { customer_name: 'علي حسن', phone_number: '0791112233', address_details: 'عمان, الدوار السابع', items: '2x بيتزا', total_price: 20.50 } },
  { id: 'payload_2', receivedAt: '2023-09-01 10:55:41', status: 'failed', data: { name: 'سارة وليد', total: 15, details: { street: 'شارع الجامعة', city: 'الزرقاء' } } },
  { id: 'payload_3', receivedAt: '2023-09-01 10:45:02', status: 'success', data: { customer_name: 'خالد أحمد', phone_number: '0785556677', address_details: 'الزرقاء, حي معصوم', items: '1x عطر', total_price: 55 } },
];

const ourOrderFields = [
    { key: 'recipient', label: 'اسم المستلم' },
    { key: 'phone', label: 'رقم الهاتف' },
    { key: 'address', label: 'العنوان' },
    { key: 'cod', label: 'المبلغ المطلوب' },
    { key: 'notes', label: 'ملاحظات' },
    { key: 'referenceNumber', label: 'الرقم المرجعي' },
];

type Mapping = {
    id: number;
    source: string;
    destination: string;
};


export default function FieldMappingPage() {
    const params = useParams();
    const { integrationId } = params;
    const { toast } = useToast();
    
    const [mappings, setMappings] = useState<Mapping[]>([
        { id: 1, source: 'customer_name', destination: 'recipient' },
        { id: 2, source: 'phone_number', destination: 'phone' },
        { id: 3, source: 'address_details', destination: 'address' },
        { id: 4, source: 'total_price', destination: 'cod' },
    ]);
    const [lastPayload, setLastPayload] = useState(JSON.stringify(mockPayloads[0].data, null, 2));

    // AI Suggestion Form State
    const [aiState, formAction] = useFormState(suggestMappingAction, { data: null, error: null, success: false });

    useEffect(() => {
        if(aiState.success && aiState.data) {
            const newMappings = aiState.data.suggestedMappings.map((m, i) => ({
                id: Date.now() + i,
                source: m.source,
                destination: m.destination
            }));
            setMappings(newMappings);
            toast({ title: "تم اقتراح الربط", description: "قام الذكاء الاصطناعي بملء الحقول المقترحة." });
        } else if (aiState.error) {
            toast({ variant: 'destructive', title: "خطأ في الاقتراح", description: aiState.error });
        }
    }, [aiState, toast]);

    const handleAddMapping = () => {
        setMappings([...mappings, { id: Date.now(), source: '', destination: '' }]);
    };

    const handleMappingChange = (id: number, type: 'source' | 'destination', value: string) => {
        setMappings(mappings.map(m => m.id === id ? { ...m, [type]: value } : m));
    };

    const handleRemoveMapping = (id: number) => {
        setMappings(mappings.filter(m => m.id !== id));
    }

    const handleSave = () => {
        toast({ title: "تم الحفظ", description: "تم حفظ إعدادات ربط الحقول بنجاح." });
    }

    return (
        <div className="space-y-6">
             <Card>
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-2xl font-bold tracking-tight">إدارة ربط الحقول وسجل البيانات</CardTitle>
                        <CardDescription className="mt-1">تخصيص كيفية قراءة البيانات الواردة من الويب هوك ومراجعة السجلات.</CardDescription>
                    </div>
                     <Button variant="outline" size="icon" asChild>
                        <Link href={`/dashboard/settings/integrations/${integrationId}`}><Icon name="ArrowLeft" className="h-4 w-4" /></Link>
                    </Button>
                </CardHeader>
            </Card>

            <Tabs defaultValue="mapping">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="mapping"><Icon name="Link" className="ml-2"/>ربط الحقول</TabsTrigger>
                    <TabsTrigger value="history"><Icon name="History" className="ml-2"/>سجل البيانات المستلمة</TabsTrigger>
                </TabsList>
                <TabsContent value="mapping" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>ربط حقول الويب هوك</CardTitle>
                            <CardDescription>
                                قم بربط الحقول القادمة من نظامك الخارجي مع حقول الطلبات في نظامنا لضمان استيراد البيانات بشكل صحيح.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form action={formAction}>
                                <input type="hidden" name="payload" value={lastPayload} />
                                <Button type="submit" variant="outline" className="gap-2 mb-4">
                                    <Icon name="Wand2" className="h-4 w-4" />
                                    اقتراح باستخدام الذكاء الاصطناعي
                                </Button>
                            </form>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-2/5">الحقل المصدر (من نظامك)</TableHead>
                                        <TableHead className="w-2/5">الحقل الهدف (في نظامنا)</TableHead>
                                        <TableHead className="w-1/5 text-center">إجراء</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {mappings.map(mapping => (
                                        <TableRow key={mapping.id}>
                                            <TableCell>
                                                <Input 
                                                    placeholder="e.g., customer.name" 
                                                    value={mapping.source}
                                                    onChange={(e) => handleMappingChange(mapping.id, 'source', e.target.value)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Select value={mapping.destination} onValueChange={(value) => handleMappingChange(mapping.id, 'destination', value)}>
                                                    <SelectTrigger><SelectValue placeholder="اختر حقل..." /></SelectTrigger>
                                                    <SelectContent>
                                                        {ourOrderFields.map(field => (
                                                            <SelectItem key={field.key} value={field.key}>{field.label}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                 <Button variant="ghost" size="icon" onClick={() => handleRemoveMapping(mapping.id)}>
                                                    <Icon name="Trash2" className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <Button variant="outline" onClick={handleAddMapping} className="mt-4 w-full">
                                <Icon name="PlusCircle" className="mr-2 h-4 w-4" /> إضافة حقل جديد
                            </Button>
                        </CardContent>
                        <CardContent>
                            <div className="flex justify-end">
                                <Button onClick={handleSave}><Icon name="Save" className="ml-2" />حفظ الإعدادات</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                 <TabsContent value="history" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>سجل البيانات المستلمة (Payload History)</CardTitle>
                            <CardDescription>
                                استعراض آخر البيانات التي تم استلامها من هذا الويب هوك لتشخيص المشاكل.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>وقت الاستلام</TableHead>
                                        <TableHead>الحالة</TableHead>
                                        <TableHead>عرض البيانات</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {mockPayloads.map(payload => (
                                        <TableRow key={payload.id}>
                                            <TableCell>{payload.receivedAt}</TableCell>
                                            <TableCell>
                                                <Badge variant={payload.status === 'success' ? 'default' : 'destructive'} className={payload.status === 'success' ? 'bg-green-100 text-green-800' : ''}>
                                                    {payload.status === 'success' ? 'نجاح' : 'فشل'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="outline" size="sm" onClick={() => setLastPayload(JSON.stringify(payload.data, null, 2))}>
                                                          عرض Payload
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-2xl">
                                                        <DialogHeader>
                                                            <DialogTitle>بيانات الطلب المستلمة</DialogTitle>
                                                             <DialogDescription>استخدم هذه البيانات كمرجع عند اقتراح ربط الحقول.</DialogDescription>
                                                        </DialogHeader>
                                                        <ScrollArea className="max-h-96 w-full rounded-md border mt-4">
                                                            <pre className="p-4 text-sm text-left font-mono" dir="ltr">
                                                                {JSON.stringify(payload.data, null, 2)}
                                                            </pre>
                                                        </ScrollArea>
                                                        <DialogFooter>
                                                            <DialogClose asChild>
                                                                <Button>إغلاق</Button>
                                                            </DialogClose>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
