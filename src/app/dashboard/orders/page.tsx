
'use client';

import * as React from 'react';
import { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import {
  ListFilter,
  MoreHorizontal,
  PlusCircle,
  Search,
  Trash2,
  Printer,
  UserPlus,
  RefreshCw,
  XCircle,
  ArrowDownUp,
  FileDown,
  CheckCircle2,
  Phone,
  Clock,
  Undo2,
  Truck,
  Edit,
  Store,
  FileText,
  Link as LinkIcon,
  ChevronDown,
  Wand2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

// Mock Data - In a real app, this would come from an API
const initialOrders = Array.from({ length: 15 }, (_, i) => ({
  id: `#32${10 + i}`,
  source: (['Shopify', 'Manual', 'API', 'WooCommerce'] as const)[i % 4],
  recipient: ['محمد جاسم', 'سارة كريم', 'أحمد خالد', 'فاطمة علي', 'حسن محمود', 'نور الهدى', 'خالد وليد'][i % 7],
  phone: `07${(701112233 + i * 1111111).toString().slice(0,8)}`,
  city: ['عمان', 'الزرقاء', 'إربد'][i % 3],
  area: ['الصويفية', 'خلدا', 'تلاع العلي', 'حي معصوم', 'الجبيهة', 'الحي الشرقي', 'العبدلي'][i % 7],
  address: `${['عمان', 'الزرقاء', 'إربد'][i % 3]}, ${['الصويفية', 'خلدا', 'تلاع العلي', 'حي معصوم', 'الجبيهة', 'الحي الشرقي', 'العبدلي'][i % 7]}`,
  status: (['delivered', 'in_delivery', 'pending', 'returned', 'postponed'] as const)[i % 5],
  driver: ['علي الأحمد', 'فاطمة الزهراء', 'محمد الخالد', 'يوسف إبراهيم', 'عائشة بكر', 'غير معين'][i % 6],
  merchant: ['تاجر أ', 'تاجر ب', 'تاجر ج', 'تاجر د'][i % 4],
  cod: 50.00 + i * 5,
  itemPrice: 45.00 + i * 5,
  deliveryFee: 5.00,
  referenceNumber: `REF-00${100+i}`,
  date: `2024-07-${(1 + i % 5).toString().padStart(2,'0')}`,
  notes: i % 3 === 0 ? 'اتصل قبل الوصول' : '',
}));

type Order = typeof initialOrders[0];

const getStatusBadge = (status: string) => {
  const commonClasses = "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium w-fit";
  switch (status) {
    case 'delivered': return <Badge className={`${commonClasses} bg-green-100 text-green-800 border border-green-300`}><CheckCircle2 className="h-3 w-3"/>تم التسليم</Badge>;
    case 'in_delivery': return <Badge className={`${commonClasses} bg-blue-100 text-blue-800 border border-blue-300`}><Truck className="h-3 w-3"/>جاري التوصيل</Badge>;
    case 'pending': return <Badge className={`${commonClasses} bg-gray-100 text-gray-800 border border-gray-300`}><Clock className="h-3 w-3"/>لم يتم التعيين</Badge>;
    case 'returned': return <Badge className={`${commonClasses} bg-red-100 text-red-800 border border-red-300`}><Undo2 className="h-3 w-3"/>راجع</Badge>;
    case 'postponed': return <Badge className={`${commonClasses} bg-yellow-100 text-yellow-800 border border-yellow-300`}><Clock className="h-3 w-3"/>مؤجل</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
};

const getSourceIcon = (source: string) => {
    switch(source) {
        case 'Shopify': return <Store className="h-4 w-4" />;
        case 'WooCommerce': return <Store className="h-4 w-4" />;
        case 'Manual': return <Edit className="h-4 w-4" />;
        case 'API': return <FileText className="h-4 w-4" />;
        default: return <LinkIcon className="h-4 w-4" />;
    }
}

const OrdersTable = ({ ordersData }: { ordersData: Order[] }) => {
    const { toast } = useToast();
    const [selectedRows, setSelectedRows] = useState<string[]>([]);

    const handleSelectAll = (checked: boolean | 'indeterminate') => {
        setSelectedRows(checked === true ? ordersData.map(o => o.id) : []);
    };
    const handleSelectRow = (id: string, checked: boolean) => {
        setSelectedRows(prev => checked ? [...prev, id] : prev.filter(rowId => rowId !== id));
    };

    const isAllSelected = selectedRows.length === ordersData.length && ordersData.length > 0;
    const isIndeterminate = selectedRows.length > 0 && !isAllSelected;

    return (
        <Card>
            <CardHeader className="p-4 border-b">
                 <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        {selectedRows.length > 0 ? (
                            <>
                                <span className="text-sm text-muted-foreground">{selectedRows.length} محدد</span>
                                <Separator orientation="vertical" className="h-6 mx-2"/>
                                <DialogAssignDriver selectedCount={selectedRows.length} />
                                <DialogChangeStatus selectedCount={selectedRows.length} />
                                <DialogDeleteOrders selectedCount={selectedRows.length} />
                            </>
                        ) : (
                            <>
                                <Button variant="outline" size="icon"><RefreshCw className="h-4 w-4"/></Button>
                                <Button variant="outline" size="icon"><Printer className="h-4 w-4"/></Button>
                                <DropdownExport />
                            </>
                        )}
                    </div>
                     <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative flex-1">
                            <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="بحث شامل..." className="pr-8 sm:w-64" />
                        </div>
                        <Button size="sm" className="h-9 gap-1">
                            <PlusCircle className="h-4 w-4" />
                            <span className="hidden sm:inline">إضافة طلب</span>
                        </Button>
                    </div>
                 </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-12 text-center">
                        <Checkbox onCheckedChange={handleSelectAll} checked={isAllSelected || isIndeterminate} aria-label="Select all rows" />
                      </TableHead>
                      <TableHead>رقم الوصل</TableHead>
                      <TableHead>المصدر</TableHead>
                      <TableHead>اسم المستلم</TableHead>
                      <TableHead>رقم الهاتف</TableHead>
                      <TableHead>العنوان</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>السائق</TableHead>
                      <TableHead>التاجر</TableHead>
                      <TableHead>مبلغ الوصل</TableHead>
                      <TableHead>أجور التوصيل</TableHead>
                      <TableHead>التاريخ</TableHead>
                      <TableHead className="text-center">إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ordersData.map((order) => (
                      <TableRow key={order.id} data-state={selectedRows.includes(order.id) && "selected"}>
                         <TableCell className="text-center">
                           <Checkbox onCheckedChange={(checked) => handleSelectRow(order.id, !!checked)} checked={selectedRows.includes(order.id)} aria-label={`Select row ${order.id}`} />
                        </TableCell>
                        <TableCell className="font-medium text-blue-600 cursor-pointer hover:underline">{order.id}</TableCell>
                        <TableCell><Badge variant="secondary" className="font-normal gap-1">{getSourceIcon(order.source)} {order.source}</Badge></TableCell>
                        <TableCell>{order.recipient}</TableCell>
                        <TableCell>
                            <a href={`tel:${order.phone}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                                <Phone className="h-3 w-3"/>
                                {order.phone}
                            </a>
                        </TableCell>
                        <TableCell>{order.address}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>{order.driver}</TableCell>
                        <TableCell>{order.merchant}</TableCell>
                        <TableCell>{order.cod.toLocaleString('ar-JO')} د.أ</TableCell>
                        <TableCell>{order.deliveryFee.toLocaleString('ar-JO')} د.أ</TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell className="text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">فتح القائمة</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>إجراءات</DropdownMenuLabel>
                              <DropdownMenuItem><Edit className="ml-2 h-4 w-4"/> تعديل</DropdownMenuItem>
                              <DialogWhatsapp order={order} />
                              <DropdownMenuItem><Printer className="ml-2 h-4 w-4"/> طباعة</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10"><Trash2 className="ml-2 h-4 w-4"/> حذف</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="p-4 border-t">
                 <div className="text-xs text-muted-foreground">
                    عرض <strong>{ordersData.length}</strong> من <strong>{initialOrders.length}</strong> طلبات
                </div>
            </CardFooter>
          </Card>
    );
};

const FiltersPanel = () => (
    <Card className="h-full">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg"><ListFilter className="h-5 w-5"/> تصفية الطلبات</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
            <Accordion type="multiple" defaultValue={["status", "city"]} className="w-full">
                 <AccordionItem value="status">
                    <AccordionTrigger>الحالة</AccordionTrigger>
                    <AccordionContent className="space-y-2">
                        {['pending', 'in_delivery', 'delivered', 'postponed', 'returned'].map(s => <div key={s} className="flex items-center gap-2"><Checkbox id={s}/><Label htmlFor={s}>{s}</Label></div>)}
                    </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="merchant">
                    <AccordionTrigger>التاجر</AccordionTrigger>
                    <AccordionContent>تاجر أ, تاجر ب...</AccordionContent>
                </AccordionItem>
                 <AccordionItem value="driver">
                    <AccordionTrigger>السائق</AccordionTrigger>
                    <AccordionContent>علي الأحمد, ...</AccordionContent>
                </AccordionItem>
                 <AccordionItem value="city">
                    <AccordionTrigger>المدينة</AccordionTrigger>
                    <AccordionContent>عمان, الزرقاء...</AccordionContent>
                </AccordionItem>
            </Accordion>
        </CardContent>
    </Card>
);

const DialogAssignDriver = ({ selectedCount }: { selectedCount: number }) => (
    <Dialog>
        <DialogTrigger asChild>
            <Button variant="secondary" size="sm" className="gap-1"><UserPlus className="h-4 w-4"/> تعيين سائق ({selectedCount})</Button>
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>تعيين سائق للطلبات المحددة</DialogTitle>
                <DialogDescription>اختر سائقًا لتعيينه للطلبات الـ {selectedCount} المحددة.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
                 <Select>
                    <SelectTrigger>
                        <SelectValue placeholder="اختر سائقًا..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ali">علي الأحمد</SelectItem>
                        <SelectItem value="fatima">فاطمة الزهراء</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="outline">إلغاء</Button></DialogClose>
                <Button>حفظ</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
);

const DialogChangeStatus = ({ selectedCount }: { selectedCount: number }) => (
     <Dialog>
        <DialogTrigger asChild>
            <Button variant="secondary" size="sm" className="gap-1"><RefreshCw className="h-4 w-4"/> تغيير الحالة ({selectedCount})</Button>
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>تغيير حالة الطلبات</DialogTitle>
                <DialogDescription>اختر حالة جديدة لتطبيقها على الطلبات الـ {selectedCount} المحددة.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
                 <Select>
                    <SelectTrigger><SelectValue placeholder="اختر حالة..." /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="in_delivery">جاري التوصيل</SelectItem>
                        <SelectItem value="delivered">تم التسليم</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="outline">إلغاء</Button></DialogClose>
                <Button>حفظ</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
)

const DialogDeleteOrders = ({ selectedCount }: { selectedCount: number }) => (
    <AlertDialog>
        <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="gap-1"><Trash2 className="h-4 w-4"/> حذف ({selectedCount})</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>هل أنت متأكد تمامًا؟</AlertDialogTitle>
                <AlertDialogDescription>
                    هذا الإجراء لا يمكن التراجع عنه. سيؤدي هذا إلى حذف {selectedCount} طلبات بشكل دائم.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                <AlertDialogAction>نعم، حذف</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
)

const DialogWhatsapp = ({ order }: {order: Order}) => (
    <Dialog>
        <DialogTrigger asChild>
            <div className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                 <Wand2 className="ml-2 h-4 w-4"/>
                 <span>رسالة واتساب (AI)</span>
            </div>
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>إنشاء رسالة واتساب للعميل</DialogTitle>
                <DialogDescription>
                   سيقوم الذكاء الاصطناعي بإنشاء رسالة لإعلام العميل بحالة الطلب.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
                <p className="text-sm p-4 bg-muted rounded-md">
                    مرحباً {order.recipient}، نود إعلامك بأن حالة طلبك رقم {order.id} قد تغيرت إلى {order.status}.
                </p>
                <div className="space-y-2">
                    <Label htmlFor="notes">ملاحظات إضافية (اختياري)</Label>
                    <Textarea id="notes" placeholder="مثال: سيصلك السائق خلال ساعة."/>
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="outline">إلغاء</Button></DialogClose>
                <Button variant="default" className="bg-green-600 hover:bg-green-700 text-white gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16.75 13.96c.25.42.42.77.29 1.14c-.13.37-.58.55-1.02.62c-.44.07-1.02.04-1.57-.24c-.55-.28-1.57-1.02-2.9-2.45c-1.33-1.43-2.26-2.9-2.48-3.41c-.22-.51-.05-.8.18-.99c.23-.19.46-.27.63-.27c.17 0 .34.02.48.04c.14.02.33.1.5.38c.17.28.53 1.25.57 1.34c.04.09.06.2 0 .33c-.06.13-.12.22-.25.35c-.13.13-.26.29-.39.41c-.13.12-.24.26-.06.51c.18.25.75 1.21 1.63 2.08c.88.87 1.76 1.45 2.01 1.6c.25.15.39.12.54-.03c.12-.12.26-.26.39-.39c.13-.13.25-.19.4-.11c.15.08.9.43 1.07.52c.17.09.28.13.32.19c.04.06.02.36-.23.78zM12 2C6.486 2 2 6.486 2 12c0 1.95.55 3.78 1.55 5.34L2.05 22l4.8-1.53C8.18 21.45 10.01 22 12 22c5.514 0 10-4.486 10-10S17.514 2 12 2z"/></svg>
                    إرسال عبر واتساب
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
);

const DropdownExport = () => (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
             <Button variant="outline" className="gap-1">
                <FileDown className="h-4 w-4" />
                <span className="hidden sm:inline">تصدير</span>
                <ChevronDown className="h-4 w-4 opacity-50"/>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
            <DropdownMenuItem>تصدير كـ CSV</DropdownMenuItem>
            <DropdownMenuItem>تصدير كـ PDF</DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
)

const OrdersPageContent = () => {
    const [isClient, setIsClient] = useState(false);
    useEffect(() => { setIsClient(true) }, []);

    if (!isClient) {
        return (
             <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
                <div className="hidden lg:block lg:col-span-1">
                    <Card><CardHeader><Skeleton className="h-6 w-32"/></CardHeader><CardContent className="space-y-4"><Skeleton className="h-8 w-full"/><Skeleton className="h-8 w-full"/><Skeleton className="h-8 w-full"/></CardContent></Card>
                </div>
                <div className="col-span-1 lg:col-span-4">
                    <Card>
                        <CardHeader className="p-4 border-b"><div className="flex justify-between"><Skeleton className="h-8 w-48"/><Skeleton className="h-8 w-64"/></div></CardHeader>
                        <CardContent className="p-0"><Table><TableHeader><TableRow><TableHead className="w-12"><Skeleton className="h-5 w-5"/></TableHead>{Array.from({length: 8}).map((_,i) => <TableHead key={i}><Skeleton className="h-5 w-24"/></TableHead>)}</TableRow></TableHeader><TableBody>{Array.from({length:10}).map((_,i) => <TableRow key={i}><TableCell><Skeleton className="h-5 w-5"/></TableCell>{Array.from({length: 8}).map((_,j) => <TableCell key={j}><Skeleton className="h-5 w-24"/></TableCell>)}</TableRow>)}</TableBody></Table></CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
                <div className="hidden lg:block lg:col-span-1">
                    <FiltersPanel />
                </div>
                <div className="col-span-1 lg:col-span-4">
                    <div className="flex flex-col gap-4">
                        <div className="lg:hidden">
                            <Accordion type="single" collapsible>
                                <AccordionItem value="filters">
                                    <AccordionTrigger>
                                        <div className='flex items-center gap-2'>
                                            <ListFilter className="h-4 w-4" /> عرض الفلاتر
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <FiltersPanel />
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>
                        <OrdersTable ordersData={initialOrders} />
                    </div>
                </div>
            </div>
        </Suspense>
    );
};

export default function OrdersPage() {
    return <OrdersPageContent />
}
