
'use client';

import * as React from 'react';
import { useState, useMemo, Suspense, useEffect } from 'react';
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
  ListOrdered,
  Package,
  GripVertical,
  X,
  History
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from "@/lib/utils";

// ShadCN UI Components
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


// Mock Data (Assuming these exist and are adapted for the new structure)
const initialOrders = Array.from({ length: 15 }, (_, i) => ({
  id: `#32${10 + i}`,
  source: (['Shopify', 'Manual', 'API', 'WooCommerce'] as const)[i % 4],
  recipient: ['محمد جاسم', 'سارة كريم', 'أحمد خالد', 'فاطمة علي', 'حسن محمود', 'نور الهدى', 'خالد وليد'][i % 7],
  phone: `07${(701112233 + i * 1111111).toString().slice(0,8)}`,
  city: ['عمان', 'الزرقاء', 'إربد'][i % 3],
  region: ['الصويفية', 'خلدا', 'تلاع العلي', 'حي معصوم', 'الجبيهة', 'الحي الشرقي', 'العبدلي'][i % 7],
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

const statusOptions: {value: Order['status'], label: string, icon: React.ElementType, badgeClasses: string}[] = [
    { value: 'delivered', label: 'تم التسليم', icon: CheckCircle2, badgeClasses: 'bg-green-100 text-green-800 border-green-300' },
    { value: 'in_delivery', label: 'جاري التوصيل', icon: Truck, badgeClasses: 'bg-blue-100 text-blue-800 border-blue-300' },
    { value: 'pending', label: 'لم يتم التعيين', icon: Clock, badgeClasses: 'bg-gray-100 text-gray-800 border-gray-300' },
    { value: 'returned', label: 'راجع', icon: Undo2, badgeClasses: 'bg-red-100 text-red-800 border-red-300' },
    { value: 'postponed', label: 'مؤجل', icon: Clock, badgeClasses: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
];

const getStatusInfo = (statusValue: string) => {
    return statusOptions.find(s => s.value === statusValue) || { label: statusValue, icon: Package, badgeClasses: 'bg-gray-100 text-gray-800' };
};

type ModalState = 
    | { type: 'none' }
    | { type: 'delete' }
    | { type: 'history', order: Order }
    | { type: 'whatsapp', order: Order }
    | { type: 'barcode', order: Order }
    | { type: 'assignDriver' }
    | { type: 'changeStatus' };

function useMediaQuery(query: string) {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const media = window.matchMedia(query);
        if (media.matches !== matches) {
            setMatches(media.matches);
        }
        const listener = () => {
            setMatches(media.matches);
        };
        media.addEventListener('change', listener);
        return () => media.removeEventListener('change', listener);
    }, [matches, query]);

    return matches;
}


function OrdersPageContent() {
    const { toast } = useToast();
    const [isClient, setIsClient] = useState(false);
    const [orders, setOrders] = useState<Order[]>(initialOrders);
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [modalState, setModalState] = useState<ModalState>({ type: 'none' });
    const isMobile = useMediaQuery('(max-width: 1024px)');
    const [searchQuery, setSearchQuery] = useState('');
    const [columnConfig, setColumnConfig] = useState<any[]>([]); // Simplified for brevity

    useEffect(() => { setIsClient(true); }, []);

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const searchLower = searchQuery.toLowerCase();
            return searchQuery === '' ||
                order.recipient.toLowerCase().includes(searchLower) ||
                order.phone.includes(searchQuery) ||
                order.id.toLowerCase().includes(searchLower) ||
                order.merchant.toLowerCase().includes(searchLower);
        });
    }, [orders, searchQuery]);

    const handleSelectAll = (checked: boolean | 'indeterminate') => {
        setSelectedRows(checked === true ? filteredOrders.map(o => o.id) : []);
    };
    
    const handleSelectRow = (id: string, checked: boolean) => {
        setSelectedRows(prev => checked ? [...prev, id] : prev.filter(rowId => rowId !== id));
    };

    const handleFieldChange = (orderId: string, field: keyof Order, value: any) => {
        setOrders(prev => prev.map(order => 
            order.id === orderId ? { ...order, [field]: value } : order
        ));
    };

    const handleDeleteSelected = () => {
        setOrders(prev => prev.filter(o => !selectedRows.includes(o.id)));
        toast({ title: `تم حذف ${selectedRows.length} طلبات بنجاح` });
        setSelectedRows([]);
        setModalState({type: 'none'});
    };

    const handleBulkUpdate = (field: keyof Order, value: any) => {
        setOrders(prev => prev.map(order => 
            selectedRows.includes(order.id) ? { ...order, [field]: value } : order
        ));
        toast({ title: `تم تحديث ${selectedRows.length} طلبات` });
        setSelectedRows([]);
        setModalState({type: 'none'});
    }


    if (!isClient) {
        return <Skeleton className="w-full h-screen" />;
    }

    return (
        <TooltipProvider>
            <div className="flex flex-col gap-4">
                <Card>
                    <CardHeader className="p-2 border-b">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                             <div className="flex items-center gap-2 flex-grow sm:flex-grow-0">
                                {selectedRows.length > 0 ? (
                                    <>
                                        <span className="text-sm text-muted-foreground">{selectedRows.length} محدد</span>
                                        <Separator orientation="vertical" className="h-6 mx-1"/>
                                        <Button variant="outline" size="sm" onClick={() => setModalState({ type: 'assignDriver' })}><UserPlus className="h-4 w-4 ml-1"/> تعيين سائق</Button>
                                        <Button variant="outline" size="sm" onClick={() => setModalState({ type: 'changeStatus' })}><RefreshCw className="h-4 w-4 ml-1"/> تغيير الحالة</Button>
                                        <Button variant="destructive" size="sm" onClick={() => setModalState({ type: 'delete' })}><Trash2 className="h-4 w-4 ml-1"/> حذف</Button>
                                    </>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="icon"><RefreshCw className="h-4 w-4"/></Button>
                                        <Button variant="outline" size="icon"><Printer className="h-4 w-4"/></Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline"><FileDown className="h-4 w-4 ml-1" /><span>تصدير</span></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end"><DropdownMenuItem>تصدير كـ CSV</DropdownMenuItem><DropdownMenuItem>تصدير كـ PDF</DropdownMenuItem></DropdownMenuContent>
                                        </DropdownMenu>
                                         <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="outline" size="icon"><ListOrdered className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent align="end"><DropdownMenuLabel>تخصيص الأعمدة</DropdownMenuLabel></DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                )}
                            </div>
                             <div className="flex items-center gap-2 w-full sm:w-auto sm:flex-grow-0">
                                <div className="relative flex-grow">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="بحث شامل..." className="pl-8" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                                </div>
                                <Button size="sm"><PlusCircle className="h-4 w-4 ml-1" /><span>إضافة طلب</span></Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {isMobile ? (
                            <div className="p-2 space-y-2">
                                {filteredOrders.map(order => (
                                    <Card key={order.id}>
                                         <CardHeader className="flex flex-row items-center justify-between p-2 bg-muted/50">
                                             <div className="flex items-center gap-2">
                                                 <Checkbox checked={selectedRows.includes(order.id)} onCheckedChange={(checked) => handleSelectRow(order.id, !!checked)} />
                                                 <Link href="#"><span className="font-semibold text-primary">{order.id}</span></Link>
                                             </div>
                                              <Badge variant="outline" className={cn(getStatusInfo(order.status).badgeClasses, "gap-1.5")}>
                                                 <span className="font-semibold">{getStatusInfo(order.status).label}</span>
                                             </Badge>
                                         </CardHeader>
                                         <CardContent className="p-2 text-sm space-y-1">
                                             <p><strong>المستلم:</strong> {order.recipient}</p>
                                             <p><strong>الهاتف:</strong> {order.phone}</p>
                                             <p><strong>السائق:</strong> {order.driver}</p>
                                             <p><strong>المبلغ:</strong> {order.cod.toFixed(2)} د.أ</p>
                                         </CardContent>
                                         <CardFooter className="p-1 bg-muted/50 flex justify-end gap-1">
                                             <Button variant="ghost" size="icon"><Wand2 className="h-4 w-4"/></Button>
                                             <Button variant="ghost" size="icon"><Printer className="h-4 w-4"/></Button>
                                             <Button variant="ghost" size="icon"><History className="h-4 w-4"/></Button>
                                         </CardFooter>
                                     </Card>
                                ))}
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-10"><Checkbox onCheckedChange={handleSelectAll} checked={selectedRows.length === filteredOrders.length && filteredOrders.length > 0} /></TableHead>
                                        <TableHead>رقم الطلب</TableHead>
                                        <TableHead>المصدر</TableHead>
                                        <TableHead>المستلم</TableHead>
                                        <TableHead>الهاتف</TableHead>
                                        <TableHead>العنوان</TableHead>
                                        <TableHead>الحالة</TableHead>
                                        <TableHead>السائق</TableHead>
                                        <TableHead>مبلغ الوصل</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredOrders.map(order => (
                                        <TableRow key={order.id} data-state={selectedRows.includes(order.id) ? 'selected' : ''}>
                                            <TableCell><Checkbox checked={selectedRows.includes(order.id)} onCheckedChange={(checked) => handleSelectRow(order.id, !!checked)}/></TableCell>
                                            <TableCell className="font-medium text-primary"><Link href="#">{order.id}</Link></TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="gap-1.5 font-normal">
                                                    {React.createElement(sourceIcons[order.source] || LinkIcon, { className: "h-3 w-3" })}
                                                    {order.source}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{order.recipient}</TableCell>
                                            <TableCell>{order.phone}</TableCell>
                                            <TableCell>{order.address}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={cn(getStatusInfo(order.status).badgeClasses, "gap-1.5")}>
                                                    {React.createElement(getStatusInfo(order.status).icon, { className: "h-3 w-3" })}
                                                    {getStatusInfo(order.status).label}
                                                 </Badge>
                                            </TableCell>
                                            <TableCell>{order.driver}</TableCell>
                                            <TableCell>{order.cod.toFixed(2)} د.أ</TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal/></Button></DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                        <DropdownMenuItem>تعديل</DropdownMenuItem>
                                                        <DropdownMenuItem>طباعة</DropdownMenuItem>
                                                        <DropdownMenuItem className="text-red-600">حذف</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                    <CardFooter className="justify-center p-2 border-t">
                         <div className="text-xs text-muted-foreground">
                            عرض <strong>{filteredOrders.length}</strong> من <strong>{orders.length}</strong> طلبات
                        </div>
                    </CardFooter>
                </Card>
            </div>
            
            {/* Modals */}
            <AlertDialog open={modalState.type === 'delete'} onOpenChange={(open) => !open && setModalState({ type: 'none' })}>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>تأكيد الحذف</AlertDialogTitle><AlertDialogDescription>هل أنت متأكد من حذف {selectedRows.length} طلبات؟</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>إلغاء</AlertDialogCancel><AlertDialogAction onClick={handleDeleteSelected}>حذف</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Dialog open={modalState.type === 'assignDriver' || modalState.type === 'changeStatus'} onOpenChange={(open) => !open && setModalState({ type: 'none' })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{modalState.type === 'assignDriver' ? 'تعيين سائق' : 'تغيير الحالة'}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Select onValueChange={(value) => handleBulkUpdate(modalState.type === 'assignDriver' ? 'driver' : 'status', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder={modalState.type === 'assignDriver' ? 'اختر سائق...' : 'اختر حالة...'} />
                            </SelectTrigger>
                            <SelectContent>
                                { (modalState.type === 'assignDriver' ? ['علي الأحمد', 'محمد الخالد'] : statusOptions.map(s=>s.value)).map(item => (
                                    <SelectItem key={item} value={item}>{modalState.type === 'changeStatus' ? getStatusInfo(item).label : item}</SelectItem>
                                )) }
                            </SelectContent>
                        </Select>
                    </div>
                </DialogContent>
            </Dialog>

        </TooltipProvider>
    );
}

export default function OrdersPage() {
    return <OrdersPageContent />
}
