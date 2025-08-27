
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
  Wand2,
  ListOrdered
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
type OrderSource = Order['source'];

const sourceIcons: Record<OrderSource, React.ElementType> = {
    Shopify: Store,
    WooCommerce: Store,
    Manual: Edit,
    API: FileText,
};

const getStatusInfo = (status: string): { label: string; badge: React.ReactNode } => {
    const commonClasses = "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium w-fit";
    switch (status) {
        case 'delivered': return { label: 'تم التسليم', badge: <Badge className={`${commonClasses} bg-green-100 text-green-800 border border-green-300`}><CheckCircle2 className="h-3 w-3"/>تم التسليم</Badge>};
        case 'in_delivery': return { label: 'جاري التوصيل', badge: <Badge className={`${commonClasses} bg-blue-100 text-blue-800 border border-blue-300`}><Truck className="h-3 w-3"/>جاري التوصيل</Badge>};
        case 'pending': return { label: 'لم يتم التعيين', badge: <Badge className={`${commonClasses} bg-gray-100 text-gray-800 border border-gray-300`}><Clock className="h-3 w-3"/>لم يتم التعيين</Badge>};
        case 'returned': return { label: 'راجع', badge: <Badge className={`${commonClasses} bg-red-100 text-red-800 border border-red-300`}><Undo2 className="h-3 w-3"/>راجع</Badge>};
        case 'postponed': return { label: 'مؤجل', badge: <Badge className={`${commonClasses} bg-yellow-100 text-yellow-800 border border-yellow-300`}><Clock className="h-3 w-3"/>مؤجل</Badge>};
        default: return { label: status, badge: <Badge variant="outline">{status}</Badge> };
    }
};

const statusOptions = ['pending', 'in_delivery', 'delivered', 'postponed', 'returned'];

// Helper to render the table cells with inline editing capability
const EditableTableCell = ({ value, onSave }: { value: string | number; onSave: (newValue: string) => void }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [currentValue, setCurrentValue] = useState(String(value));
    const inputRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [isEditing]);

    const handleSave = () => {
        setIsEditing(false);
        onSave(currentValue);
    };

    if (isEditing) {
        return (
            <Input
                ref={inputRef}
                type="text"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                onBlur={handleSave}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                className="h-8 text-xs"
            />
        );
    }
    return <div onClick={() => setIsEditing(true)} className="min-h-[2rem] flex items-center p-2 cursor-pointer">{value}</div>;
};


const OrdersTable = ({ 
    ordersData, 
    selectedRows, 
    handleSelectAll, 
    handleSelectRow, 
    handleFieldUpdate 
}: { 
    ordersData: Order[];
    selectedRows: string[];
    handleSelectAll: (checked: boolean | 'indeterminate') => void;
    handleSelectRow: (id: string, checked: boolean) => void;
    handleFieldUpdate: (orderId: string, field: keyof Order, value: any) => void;
}) => {
    const { toast } = useToast();
    const isAllSelected = selectedRows.length === ordersData.length && ordersData.length > 0;
    const isIndeterminate = selectedRows.length > 0 && !isAllSelected;

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow>
                        <TableHead className="w-12 text-center sticky left-0 bg-muted/90 z-10">
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
                    {ordersData.map((order) => {
                        const isSelected = selectedRows.includes(order.id);
                        const SourceIcon = sourceIcons[order.source] || LinkIcon;
                        return (
                            <TableRow key={order.id} data-state={isSelected && "selected"}>
                                <TableCell className="text-center sticky left-0 bg-background data-[state=selected]:bg-muted z-10">
                                    <Checkbox onCheckedChange={(checked) => handleSelectRow(order.id, !!checked)} checked={isSelected} aria-label={`Select row ${order.id}`} />
                                </TableCell>
                                <TableCell className="font-medium text-blue-600 cursor-pointer hover:underline"><Link href={`/dashboard/orders/${order.id}`}>{order.id}</Link></TableCell>
                                <TableCell><Badge variant="secondary" className="font-normal gap-1"><SourceIcon className="h-3 w-3" /> {order.source}</Badge></TableCell>
                                <TableCell><EditableTableCell value={order.recipient} onSave={(val) => handleFieldUpdate(order.id, 'recipient', val)} /></TableCell>
                                <TableCell>
                                    <a href={`tel:${order.phone}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                                        <Phone className="h-3 w-3"/>
                                        <EditableTableCell value={order.phone} onSave={(val) => handleFieldUpdate(order.id, 'phone', val)} />
                                    </a>
                                </TableCell>
                                <TableCell><EditableTableCell value={order.address} onSave={(val) => handleFieldUpdate(order.id, 'address', val)} /></TableCell>
                                <TableCell>
                                     <Select value={order.status} onValueChange={(value) => handleFieldUpdate(order.id, 'status', value)}>
                                        <SelectTrigger className="w-[150px] border-0 focus:ring-0 shadow-none bg-transparent">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {statusOptions.map(s => <SelectItem key={s} value={s}>{getStatusInfo(s).label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell><EditableTableCell value={order.driver} onSave={(val) => handleFieldUpdate(order.id, 'driver', val)} /></TableCell>
                                <TableCell><EditableTableCell value={order.merchant} onSave={(val) => handleFieldUpdate(order.id, 'merchant', val)} /></TableCell>
                                <TableCell><EditableTableCell value={order.cod.toFixed(2)} onSave={(val) => handleFieldUpdate(order.id, 'cod', parseFloat(val) || 0)} /></TableCell>
                                <TableCell><EditableTableCell value={order.deliveryFee.toFixed(2)} onSave={(val) => handleFieldUpdate(order.id, 'deliveryFee', parseFloat(val) || 0)} /></TableCell>
                                <TableCell><EditableTableCell value={order.date} onSave={(val) => handleFieldUpdate(order.id, 'date', val)} /></TableCell>
                                <TableCell className="text-center">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button aria-haspopup="true" size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /><span className="sr-only">فتح القائمة</span></Button>
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
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
};

const MobileOrderCard = ({ order, isSelected, onSelect, onUpdate, onAction }: { 
    order: Order;
    isSelected: boolean;
    onSelect: (id: string, checked: boolean) => void;
    onUpdate: (orderId: string, field: keyof Order, value: any) => void;
    onAction: (action: 'whatsapp' | 'print' | 'history', order: Order) => void;
}) => {
    return (
        <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between p-3 bg-muted/50">
                <div className="flex items-center gap-2">
                    <Checkbox checked={isSelected} onCheckedChange={(checked) => onSelect(order.id, !!checked)} />
                    <Link href={`/dashboard/orders/${order.id}`} className="font-semibold text-primary hover:underline">{order.id}</Link>
                </div>
                {getStatusInfo(order.status).badge}
            </CardHeader>
            <CardContent className="p-3 space-y-2 text-sm">
                 <div className="flex justify-between">
                    <span className="text-muted-foreground">المستلم:</span>
                    <EditableTableCell value={order.recipient} onSave={(val) => onUpdate(order.id, 'recipient', val)} />
                </div>
                 <div className="flex justify-between">
                    <span className="text-muted-foreground">الهاتف:</span>
                    <EditableTableCell value={order.phone} onSave={(val) => onUpdate(order.id, 'phone', val)} />
                </div>
                 <div className="flex justify-between">
                    <span className="text-muted-foreground">السائق:</span>
                    <EditableTableCell value={order.driver} onSave={(val) => onUpdate(order.id, 'driver', val)} />
                </div>
                 <div className="flex justify-between">
                    <span className="text-muted-foreground">مبلغ الوصل:</span>
                    <span className="font-semibold">{order.cod.toLocaleString('ar-JO')} د.أ</span>
                </div>
            </CardContent>
            <CardFooter className="p-2 bg-muted/50 flex justify-end gap-1">
                 <Button variant="ghost" size="icon" onClick={() => onAction('whatsapp', order)}><Wand2 className="h-4 w-4 text-green-600" /></Button>
                 <Button variant="ghost" size="icon" onClick={() => onAction('print', order)}><Printer className="h-4 w-4" /></Button>
            </CardFooter>
        </Card>
    )
}

const FiltersPanel = () => (
    <Card className="h-full">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg"><ListFilter className="h-5 w-5"/> تصفية الطلبات</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
            <Accordion type="multiple" defaultValue={["status", "city"]} className="w-full">
                <AccordionItem value="status">
                    <AccordionTrigger>الحالة</AccordionTrigger>
                    <AccordionContent className="space-y-2 pt-2">
                        {statusOptions.map(s => (
                            <div key={s} className="flex items-center gap-2">
                                <Checkbox id={`filter-${s}`} />
                                <Label htmlFor={`filter-${s}`}>{getStatusInfo(s).label}</Label>
                            </div>
                        ))}
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="merchant"><AccordionTrigger>التاجر</AccordionTrigger><AccordionContent>...</AccordionContent></AccordionItem>
                <AccordionItem value="driver"><AccordionTrigger>السائق</AccordionTrigger><AccordionContent>...</AccordionContent></AccordionItem>
                <AccordionItem value="city"><AccordionTrigger>المدينة</AccordionTrigger><AccordionContent>...</AccordionContent></AccordionItem>
            </Accordion>
        </CardContent>
    </Card>
);

const BulkActionDialog = ({ type, isOpen, onClose, onConfirm, count }: { 
    type: 'assignDriver' | 'changeStatus'; 
    isOpen: boolean; 
    onClose: () => void; 
    onConfirm: (value: string) => void;
    count: number;
}) => {
    const title = type === 'assignDriver' ? 'تعيين سائق' : 'تغيير الحالة';
    const description = `اختر ${type === 'assignDriver' ? 'سائقًا' : 'حالة جديدة'} لتطبيقها على الطلبات الـ ${count} المحددة.`;
    const options = type === 'assignDriver' ? 
        ['علي الأحمد', 'فاطمة الزهراء', 'محمد الخالد'] : 
        statusOptions;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Select onValueChange={onConfirm}>
                        <SelectTrigger><SelectValue placeholder={`اختر ${type === 'assignDriver' ? 'سائقًا' : 'حالة'}...`} /></SelectTrigger>
                        <SelectContent>
                            {options.map(opt => (
                                <SelectItem key={opt} value={opt}>{type === 'changeStatus' ? getStatusInfo(opt).label : opt}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">إلغاء</Button></DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const DeleteDialog = ({ isOpen, onClose, onConfirm, count }: { isOpen: boolean, onClose: () => void, onConfirm: () => void, count: number }) => (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>هل أنت متأكد تمامًا؟</AlertDialogTitle>
                <AlertDialogDescription>
                    هذا الإجراء لا يمكن التراجع عنه. سيؤدي هذا إلى حذف {count} طلبات بشكل دائم.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                <AlertDialogAction onClick={onConfirm}>نعم، حذف</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
);

const DialogWhatsapp = ({ order }: {order: Order}) => (
    <Dialog>
        <DialogTrigger asChild>
            <div className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                <Wand2 className="ml-2 h-4 w-4"/>
                <span>رسالة واتساب (AI)</span>
            </div>
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>إنشاء رسالة واتساب للعميل</DialogTitle>
                <DialogDescription>سيقوم الذكاء الاصطناعي بإنشاء رسالة لإعلام العميل بحالة الطلب.</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
                <p className="text-sm p-4 bg-muted rounded-md">
                    مرحباً {order.recipient}، نود إعلامك بأن حالة طلبك رقم {order.id} قد تغيرت إلى {getStatusInfo(order.status).label}.
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


const OrdersPageContent = () => {
    const [isClient, setIsClient] = useState(false);
    const [orders, setOrders] = useState<Order[]>(initialOrders);
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [modalType, setModalType] = useState<'none' | 'delete' | 'assignDriver' | 'changeStatus'>('none');
    const { toast } = useToast();
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        handleResize(); // Initial check
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleSelectAll = (checked: boolean | 'indeterminate') => {
        setSelectedRows(checked === true ? orders.map(o => o.id) : []);
    };
    const handleSelectRow = (id: string, checked: boolean) => {
        setSelectedRows(prev => checked ? [...prev, id] : prev.filter(rowId => rowId !== id));
    };

    const handleDelete = () => {
        setOrders(prev => prev.filter(o => !selectedRows.includes(o.id)));
        toast({ title: `تم حذف ${selectedRows.length} طلبات بنجاح` });
        setSelectedRows([]);
        setModalType('none');
    };
    
    const handleBulkUpdate = (field: 'driver' | 'status', value: string) => {
        setOrders(prev => prev.map(order => 
            selectedRows.includes(order.id) ? { ...order, [field]: value } : order
        ));
        toast({ title: `تم تحديث ${selectedRows.length} طلبات` });
        setSelectedRows([]);
        setModalType('none');
    }

    const handleFieldUpdate = (orderId: string, field: keyof Order, value: any) => {
        setOrders(prev => prev.map(order => order.id === orderId ? { ...order, [field]: value } : order));
    }
    
    if (!isClient) {
        return (
             <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
                    <div className="hidden lg:block lg:col-span-1"><Skeleton className="h-[500px] w-full" /></div>
                    <div className="col-span-1 lg:col-span-4"><Skeleton className="h-[500px] w-full" /></div>
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
                        <Card>
                             <CardHeader className="p-4 border-b">
                                 <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center gap-2">
                                        {selectedRows.length > 0 ? (
                                            <>
                                                <span className="text-sm text-muted-foreground">{selectedRows.length} محدد</span>
                                                <Separator orientation="vertical" className="h-6 mx-2"/>
                                                <Button variant="secondary" size="sm" onClick={() => setModalType('assignDriver')} className="gap-1"><UserPlus className="h-4 w-4"/> تعيين سائق</Button>
                                                <Button variant="secondary" size="sm" onClick={() => setModalType('changeStatus')} className="gap-1"><RefreshCw className="h-4 w-4"/> تغيير الحالة</Button>
                                                <Button variant="destructive" size="sm" onClick={() => setModalType('delete')} className="gap-1"><Trash2 className="h-4 w-4"/> حذف</Button>
                                            </>
                                        ) : (
                                            <>
                                                <Button variant="outline" size="icon"><RefreshCw className="h-4 w-4"/></Button>
                                                <Button variant="outline" size="icon"><Printer className="h-4 w-4"/></Button>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="outline" className="gap-1"><FileDown className="h-4 w-4" /><span>تصدير</span><ChevronDown className="h-4 w-4 opacity-50"/></Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end"><DropdownMenuItem>تصدير كـ CSV</DropdownMenuItem><DropdownMenuItem>تصدير كـ PDF</DropdownMenuItem></DropdownMenuContent>
                                                </DropdownMenu>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild><Button variant="outline" size="icon"><ListOrdered className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end"><DropdownMenuLabel>تخصيص الأعمدة</DropdownMenuLabel><DropdownMenuSeparator/><DropdownMenuCheckboxItem checked>الكل</DropdownMenuCheckboxItem></DropdownMenuContent>
                                                </DropdownMenu>
                                            </>
                                        )}
                                    </div>
                                     <div className="flex items-center gap-2 w-full sm:w-auto">
                                        <div className="relative flex-1">
                                            <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input placeholder="بحث شامل..." className="pr-8 sm:w-64" />
                                        </div>
                                        <Button size="sm" className="h-9 gap-1"><PlusCircle className="h-4 w-4" /><span>إضافة طلب</span></Button>
                                    </div>
                                 </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                {isMobile ? (
                                    <div className="space-y-3 p-3">
                                        {orders.map(order => (
                                            <MobileOrderCard 
                                                key={order.id} 
                                                order={order}
                                                isSelected={selectedRows.includes(order.id)}
                                                onSelect={handleSelectRow}
                                                onUpdate={handleFieldUpdate}
                                                onAction={(action, ord) => console.log(action, ord)}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <OrdersTable 
                                        ordersData={orders}
                                        selectedRows={selectedRows}
                                        handleSelectAll={handleSelectAll}
                                        handleSelectRow={handleSelectRow}
                                        handleFieldUpdate={handleFieldUpdate}
                                    />
                                )}
                            </CardContent>
                            <CardFooter className="p-4 border-t">
                                <div className="text-xs text-muted-foreground">عرض <strong>{orders.length}</strong> من <strong>{initialOrders.length}</strong> طلبات</div>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
            
            <BulkActionDialog
                type="assignDriver"
                isOpen={modalType === 'assignDriver'}
                onClose={() => setModalType('none')}
                onConfirm={(value) => handleBulkUpdate('driver', value)}
                count={selectedRows.length}
            />
            <BulkActionDialog
                type="changeStatus"
                isOpen={modalType === 'changeStatus'}
                onClose={() => setModalType('none')}
                onConfirm={(value) => handleBulkUpdate('status', value)}
                count={selectedRows.length}
            />
             <DeleteDialog
                isOpen={modalType === 'delete'}
                onClose={() => setModalType('none')}
                onConfirm={handleDelete}
                count={selectedRows.length}
            />
        </Suspense>
    );
};

export default function OrdersPage() {
    return <OrdersPageContent />
}
