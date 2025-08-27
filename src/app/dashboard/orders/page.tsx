
'use client';

import * as React from 'react';
import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ListFilter,
  MoreHorizontal,
  PlusCircle,
  Search,
  Trash2,
  Printer,
  UserCheck,
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
  History,
  ChevronLeft,
  ChevronRight,
  User,
  MapPin,
  MessageCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from "@/lib/utils";

// ShadCN UI Components
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// Mock Data
const initialOrders = Array.from({ length: 85 }, (_, i) => ({
  id: `ORD-171981000${1+i}`,
  source: (['Shopify', 'Manual', 'API', 'WooCommerce'] as const)[i % 4],
  referenceNumber: `REF-00${100+i}`,
  recipient: ['محمد جاسم', 'أحمد محمود', 'أحمد خالد', 'فاطمة علي', 'حسن محمود', 'نور الهدى', 'خالد وليد'][i % 7],
  phone: `07${(791234567 + i * 1111111).toString().slice(0,8)}`,
  address: `${['الصويفية', 'تلاع العلي', 'تلاع العلي', 'حي معصوم', 'الجبيهة', 'الحي الشرقي', 'العبدلي'][i % 7]}`,
  city: ['عمان', 'الزرقاء', 'إربد'][i % 3],
  region: ['الصويفية', 'خلدا', 'تلاع العلي', 'حي معصوم', 'الجبيهة', 'الحي الشرقي', 'العبدلي'][i % 7],
  status: (['تم التسليم', 'جاري التوصيل', 'بالانتظار', 'راجع', 'مؤجل', 'تم استلام المال في الفرع'] as const)[i % 6],
  driver: ['علي الأحمد', 'ابو العبد', 'محمد الخالد', 'يوسف إبراهيم', 'عائشة بكر', 'غير معين'][i % 6],
  merchant: ['تاجر أ', 'متجر العامري', 'تاجر ج', 'تاجر د'][i % 4],
  cod: 35.50 + i * 5,
  itemPrice: 34.00 + i * 5,
  deliveryFee: 1.50,
  date: `2024-07-${(1 + i % 5).toString().padStart(2,'0')}`,
  notes: i % 3 === 0 ? 'اتصل قبل الوصول' : '',
}));

type Order = typeof initialOrders[0];
type OrderSource = Order['source'];

function useMediaQuery(query: string) {
    const [matches, setMatches] = useState(false);
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const media = window.matchMedia(query);
            if (media.matches !== matches) {
                setMatches(media.matches);
            }
            const listener = () => setMatches(media.matches);
            window.addEventListener("resize", listener);
            return () => window.removeEventListener("resize", listener);
        }
    }, [matches, query]);
    return matches;
}


const sourceIcons: Record<OrderSource, React.ElementType> = {
    Shopify: Store,
    WooCommerce: Store,
    Manual: Edit,
    API: FileText,
};

const statusOptions: {value: Order['status'], label: string, icon: React.ElementType, color: string, bgColor: string}[] = [
    { value: 'تم التسليم', label: 'تم التسليم', icon: CheckCircle2, color: 'text-green-800', bgColor: 'bg-green-100' },
    { value: 'تم استلام المال في الفرع', label: 'تم استلام المال في الفرع', icon: CheckCircle2, color: 'text-green-800', bgColor: 'bg-green-100' },
    { value: 'جاري التوصيل', label: 'جاري التوصيل', icon: Truck, color: 'text-blue-800', bgColor: 'bg-blue-100' },
    { value: 'بالانتظار', label: 'بالانتظار', icon: Clock, color: 'text-yellow-800', bgColor: 'bg-yellow-100' },
    { value: 'راجع', label: 'راجع', icon: Undo2, color: 'text-red-800', bgColor: 'bg-red-100' },
    { value: 'مؤجل', label: 'مؤجل', icon: Clock, color: 'text-orange-800', bgColor: 'bg-orange-100' },
];

const getStatusInfo = (statusValue: string) => {
    return statusOptions.find(s => s.value === statusValue) || { label: statusValue, icon: Package, color: 'text-gray-800', bgColor: 'bg-gray-100' };
};

type ModalState = 
    | { type: 'none' }
    | { type: 'delete' }
    | { type: 'history', order: Order }
    | { type: 'whatsapp', order: Order }
    | { type: 'barcode', order: Order }
    | { type: 'assignDriver' }
    | { type: 'changeStatus' };


function OrdersPageContent() {
    const { toast } = useToast();
    const [isClient, setIsClient] = useState(false);
    const [orders, setOrders] = useState<Order[]>(initialOrders);
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [modalState, setModalState] = useState<ModalState>({ type: 'none' });
    const isMobile = useMediaQuery('(max-width: 1024px)');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(15);
    
    const tableContainerRef = useRef<HTMLDivElement>(null);
    const totalsContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => { setIsClient(true); }, []);
    
    useEffect(() => {
        const tableContainer = tableContainerRef.current;
        const totalsContainer = totalsContainerRef.current;
        if (tableContainer && totalsContainer) {
            const handleScroll = () => {
                totalsContainer.scrollLeft = tableContainer.scrollLeft;
            };
            tableContainer.addEventListener('scroll', handleScroll);
            return () => tableContainer.removeEventListener('scroll', handleScroll);
        }
    }, []);


    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const searchLower = searchQuery.toLowerCase();
            return searchQuery === '' ||
                order.recipient.toLowerCase().includes(searchLower) ||
                order.phone.includes(searchQuery) ||
                order.id.toLowerCase().includes(searchLower) ||
                order.merchant.toLowerCase().includes(searchLower) ||
                order.referenceNumber.toLowerCase().includes(searchLower);
        });
    }, [orders, searchQuery]);

    const paginatedOrders = useMemo(() => {
        const startIndex = page * rowsPerPage;
        return filteredOrders.slice(startIndex, startIndex + rowsPerPage);
    }, [filteredOrders, page, rowsPerPage]);
    
    const totalPages = Math.ceil(filteredOrders.length / rowsPerPage);

    const handleSelectAll = (checked: boolean | 'indeterminate') => {
        setSelectedRows(checked === true ? paginatedOrders.map(o => o.id) : []);
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
    
    const totals = useMemo(() => {
        const calculateTotals = (orderList: Order[]) => orderList.reduce((acc, order) => {
            acc.cod += order.cod;
            acc.itemPrice += order.itemPrice;
            acc.deliveryFee += order.deliveryFee;
            return acc;
        }, { cod: 0, itemPrice: 0, deliveryFee: 0 });

        const selectedOrdersList = orders.filter(o => selectedRows.includes(o.id));
        const paginatedTotals = calculateTotals(paginatedOrders);
        const selectedTotals = calculateTotals(selectedOrdersList);

        return { paginated: paginatedTotals, selected: selectedTotals };
    }, [orders, selectedRows, paginatedOrders]);

    const displayTotals = selectedRows.length > 0 ? totals.selected : totals.paginated;
    const displayLabel = selectedRows.length > 0 
        ? `مجاميع المحددة (${selectedRows.length})` 
        : `مجاميع الصفحة الحالية (${paginatedOrders.length})`;


    if (!isClient) {
        return <Skeleton className="w-full h-screen" />;
    }

    if (isMobile) {
        return (
            <div className="flex flex-col h-full bg-muted/30">
                 <div className="flex-none p-2 flex-row items-center justify-between flex flex-wrap gap-2 border-b bg-background">
                     <div className="relative w-full max-w-xs">
                        <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="بحث شامل..." className="pr-8" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                    <div className="flex items-center gap-2">
                         <Button variant="outline" size="icon" className="h-9 w-9 bg-orange-100 text-orange-600 border-orange-200 hover:bg-orange-200">
                            <X className="h-4 w-4"/>
                         </Button>
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                 <Button variant="outline" size="icon" className="h-9 w-9"><ListFilter className="h-4 w-4"/></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem><PlusCircle className="ml-2 h-4 w-4" /> إضافة طلب</DropdownMenuItem>
                                <DropdownMenuItem><FileDown className="ml-2 h-4 w-4" /> تصدير</DropdownMenuItem>
                                <DropdownMenuItem><Printer className="ml-2 h-4 w-4" /> طباعة</DropdownMenuItem>
                                <DropdownMenuItem><Trash2 className="ml-2 h-4 w-4" /> حذف المحدد</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
                 <div className="flex-1 overflow-y-auto p-2 space-y-3">
                    {paginatedOrders.map(order => {
                         const statusInfo = getStatusInfo(order.status);
                         const DetailRow = ({ icon: Icon, label, value }: {icon: React.ElementType, label: string, value: string | number}) => (
                            <div className="flex items-center gap-3 text-sm">
                                <Icon className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">{label}:</span>
                                <span className="font-medium text-foreground">{value}</span>
                            </div>
                         );
                         const ActionButton = ({ icon: Icon, label }: {icon: React.ElementType, label: string}) => (
                            <div className="flex flex-col items-center gap-1 text-xs text-muted-foreground">
                                <Icon className="h-5 w-5" />
                                <span>{label}</span>
                            </div>
                         );
                         return (
                            <Card key={order.id} className={cn('overflow-hidden border-r-4 shadow-sm bg-card', statusInfo.color.replace('text-','border-').replace('-800','-500'))}>
                                <div className='p-3 space-y-3'>
                                    <div className="flex items-center justify-between">
                                        <Badge className={cn("gap-1.5", statusInfo.bgColor, statusInfo.color)}>{statusInfo.label}</Badge>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs text-primary">{order.id}</span>
                                            <Checkbox checked={selectedRows.includes(order.id)} onCheckedChange={(checked) => handleSelectRow(order.id, !!checked)} />
                                        </div>
                                    </div>

                                    <div className="space-y-2.5">
                                        <DetailRow icon={Store} label="المتجر" value={order.merchant} />
                                        <DetailRow icon={User} label="المستلم" value={order.recipient} />
                                        <DetailRow icon={Phone} label="الهاتف" value={order.phone} />
                                        <DetailRow icon={MapPin} label="العنوان" value={`${order.address}, ${order.city}`} />
                                        <DetailRow icon={Truck} label="السائق" value={order.driver} />
                                    </div>
                                    
                                    <Separator className='my-3' />

                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">المستحق للتاجر</span>
                                            <span className="font-medium">{order.itemPrice.toFixed(2)} د.أ</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">أجور التوصيل</span>
                                            <span className="font-medium">{order.deliveryFee.toFixed(2)} د.أ</span>
                                        </div>
                                    </div>

                                    <Separator className='my-3' />

                                    <div className="flex justify-between items-center">
                                        <span className="text-base font-bold">قيمة التحصيل</span>
                                        <span className="text-lg font-bold text-primary">{order.cod.toFixed(2)} د.أ</span>
                                    </div>
                                </div>
                                <CardFooter className='p-2 bg-muted/50 grid grid-cols-4 items-center justify-items-center'>
                                     <div className="flex flex-col items-center gap-1">
                                        <Avatar className='h-7 w-7 text-xs'>
                                            <AvatarFallback>{order.driver.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                     </div>
                                     <ActionButton icon={MessageCircle} label="واتساب" />
                                     <ActionButton icon={History} label="سجل" />
                                     <ActionButton icon={Printer} label="طباعة" />
                                </CardFooter>
                            </Card>
                         )
                    })}
                </div>
                 <CardFooter className="flex-none flex items-center justify-between p-2 border-t bg-background">
                    <span className="text-xs text-muted-foreground">
                        عرض {paginatedOrders.length} من {filteredOrders.length} طلبات
                    </span>
                    <div className="flex items-center gap-1">
                        <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>السابق</Button>
                        <span className="text-xs p-2">صفحة {page + 1} من {totalPages}</span>
                        <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}>التالي</Button>
                    </div>
                </CardFooter>
            </div>
        )
    }

    return (
        <TooltipProvider>
            <div className="flex flex-col h-[calc(100vh-64px)] bg-background">
                <div className="flex-none p-4 flex-row items-center justify-between flex flex-wrap gap-2 border-b">
                     <div className="relative w-full max-w-xs">
                        <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="بحث شامل..." className="pr-8" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                    <div className="flex items-center gap-2">
                         <Button variant="outline" size="sm" className="gap-1 bg-orange-100 text-orange-600 border-orange-200 hover:bg-orange-200">
                            <X className="h-4 w-4"/>
                            <span>مسح الفلتر</span>
                         </Button>
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-1"><FileDown /><span>تصدير</span></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem>تصدير كـ CSV</DropdownMenuItem>
                                <DropdownMenuItem>تصدير كـ PDF</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button variant="outline" size="sm"><Printer /></Button>
                        <Button variant="outline" size="sm"><RefreshCw /></Button>
                    </div>
                </div>
                 <div ref={tableContainerRef} className="flex-1 overflow-auto">
                    <Table className="min-w-full border-separate border-spacing-0">
                        <TableHeader className="sticky top-0 z-20 bg-background">
                            <TableRow>
                                <TableHead className="sticky right-0 p-1 bg-primary border-l border-primary-foreground/20 text-right z-30 w-12">
                                </TableHead>
                                <TableHead className="p-1 align-top bg-primary border-l border-primary-foreground/20 text-right">
                                    <Input placeholder="فلتر..." className="h-8 bg-primary-foreground/20 text-white placeholder:text-white/70 border-white/50"/>
                                </TableHead>
                                <TableHead className="p-1 align-top bg-primary border-l border-primary-foreground/20 text-right">
                                    <Input placeholder="فلتر..." className="h-8 bg-primary-foreground/20 text-white placeholder:text-white/70 border-white/50"/>
                                </TableHead>
                                <TableHead className="p-1 align-top bg-primary border-l border-primary-foreground/20 text-right">
                                    <Input placeholder="فلتر..." className="h-8 bg-primary-foreground/20 text-white placeholder:text-white/70 border-white/50"/>
                                </TableHead>
                                <TableHead className="p-1 align-top bg-primary border-l border-primary-foreground/20 text-right">
                                    <Input placeholder="فلتر..." className="h-8 bg-primary-foreground/20 text-white placeholder:text-white/70 border-white/50"/>
                                </TableHead>
                                <TableHead className="p-1 align-top bg-primary border-l border-primary-foreground/20 text-right">
                                    <Input placeholder="فلتر..." className="h-8 bg-primary-foreground/20 text-white placeholder:text-white/70 border-white/50"/>
                                </TableHead>
                                <TableHead className="p-1 align-top bg-primary border-l border-primary-foreground/20 text-right">
                                    <Input placeholder="فلتر..." className="h-8 bg-primary-foreground/20 text-white placeholder:text-white/70 border-white/50"/>
                                </TableHead>
                                <TableHead className="p-1 align-top bg-primary border-l border-primary-foreground/20 text-right">
                                    <Input placeholder="فلتر..." className="h-8 bg-primary-foreground/20 text-white placeholder:text-white/70 border-white/50"/>
                                </TableHead>
                                <TableHead className="p-1 align-top bg-primary border-l border-primary-foreground/20 text-right">
                                    <Input placeholder="فلتر..." className="h-8 bg-primary-foreground/20 text-white placeholder:text-white/70 border-white/50"/>
                                </TableHead>
                                <TableHead className="p-1 align-top bg-primary border-l border-primary-foreground/20 text-right">
                                    <Input placeholder="فلتر..." className="h-8 bg-primary-foreground/20 text-white placeholder:text-white/70 border-white/50"/>
                                </TableHead>
                                <TableHead className="p-1 align-top bg-primary border-l border-primary-foreground/20 text-right">
                                    <Input placeholder="فلتر..." className="h-8 bg-primary-foreground/20 text-white placeholder:text-white/70 border-white/50"/>
                                </TableHead>
                                <TableHead className="p-1 align-top bg-primary border-l border-primary-foreground/20 text-right">
                                    <Input placeholder="فلتر..." className="h-8 bg-primary-foreground/20 text-white placeholder:text-white/70 border-white/50"/>
                                </TableHead>
                                <TableHead className="p-1 align-top bg-primary border-l border-primary-foreground/20 text-right">
                                    <Input placeholder="فلتر..." className="h-8 bg-primary-foreground/20 text-white placeholder:text-white/70 border-white/50"/>
                                </TableHead>
                                <TableHead className="p-1 align-top bg-primary border-l border-primary-foreground/20 text-right">
                                    <Input placeholder="فلتر..." className="h-8 bg-primary-foreground/20 text-white placeholder:text-white/70 border-white/50"/>
                                </TableHead>
                            </TableRow>
                            <TableRow className="bg-muted/50 hover:bg-muted/80">
                                <TableHead className="sticky right-0 px-4 border-l bg-muted text-right flex items-center justify-center z-30 w-12">
                                    <Checkbox
                                        onCheckedChange={handleSelectAll}
                                        checked={selectedRows.length === paginatedOrders.length && paginatedOrders.length > 0}
                                        className="border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                    />
                                </TableHead>
                                <TableHead className="text-right border-l bg-muted">رقم الطلب</TableHead>
                                <TableHead className="text-right border-l bg-muted">المصدر</TableHead>
                                <TableHead className="text-right border-l bg-muted">الرقم المرجعي</TableHead>
                                <TableHead className="text-right border-l bg-muted">المستلم</TableHead>
                                <TableHead className="text-right border-l bg-muted">الهاتف</TableHead>
                                <TableHead className="text-right border-l bg-muted">المنطقة</TableHead>
                                <TableHead className="text-right border-l bg-muted">المدينة</TableHead>
                                <TableHead className="text-right border-l bg-muted">المتجر</TableHead>
                                <TableHead className="text-right border-l bg-muted">الحالة</TableHead>
                                <TableHead className="text-right border-l bg-muted">السائق</TableHead>
                                <TableHead className="text-right border-l bg-muted">المستحق للتاجر</TableHead>
                                <TableHead className="text-right border-l bg-muted">أجور التوصيل</TableHead>
                                <TableHead className="text-right border-l bg-muted">قيمة التحصيل</TableHead>
                                <TableHead className="text-right border-l bg-muted">التاريخ</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedOrders.map(order => {
                                const statusInfo = getStatusInfo(order.status);
                                const SourceIcon = sourceIcons[order.source] || LinkIcon;
                                return (
                                <TableRow key={order.id} data-state={selectedRows.includes(order.id) ? 'selected' : ''}>
                                    <TableCell className="sticky right-0 border-l bg-muted flex items-center justify-center z-10">
                                        <Checkbox
                                            checked={selectedRows.includes(order.id)}
                                            onCheckedChange={(checked) => handleSelectRow(order.id, !!checked)}
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium text-primary p-1 border-l text-right"><Link href="#">{order.id}</Link></TableCell>
                                    <TableCell className="p-1 border-l text-right">
                                        <Badge variant="outline" className="gap-1.5 font-normal">
                                            <SourceIcon className="h-3 w-3" />
                                            {order.source}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="p-1 border-l text-right">{order.referenceNumber}</TableCell>
                                    <TableCell className="p-1 border-l text-right">{order.recipient}</TableCell>
                                    <TableCell className="p-1 border-l text-right">{order.phone}</TableCell>
                                    <TableCell className="p-1 border-l text-right">{order.region}</TableCell>
                                    <TableCell className="p-1 border-l text-right">{order.city}</TableCell>
                                    <TableCell className="p-1 border-l text-right">{order.merchant}</TableCell>
                                    <TableCell className="p-1 border-l text-right">
                                            <Select value={order.status} onValueChange={(newStatus) => handleFieldChange(order.id, 'status', newStatus)}>
                                            <SelectTrigger className={cn("border-0 h-8", statusInfo.bgColor, statusInfo.color)}>
                                                <SelectValue placeholder="الحالة" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                    <SelectGroup>
                                                    {statusOptions.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                                                    </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell className="p-1 border-l text-right">{order.driver}</TableCell>
                                    <TableCell className="p-1 border-l text-right">{order.itemPrice.toFixed(2)}</TableCell>
                                    <TableCell className="p-1 border-l text-right">{order.deliveryFee.toFixed(2)}</TableCell>
                                    <TableCell className="p-1 border-l text-right">{order.cod.toFixed(2)}</TableCell>
                                    <TableCell className="p-1 border-l text-right">{order.date}</TableCell>
                                </TableRow>
                            )})}
                        </TableBody>
                    </Table>
                </div>
                <div ref={totalsContainerRef} className="flex-none overflow-x-hidden bg-muted/80 backdrop-blur">
                    <div className="w-fit min-w-full">
                        <div className="table min-w-full border-separate border-spacing-0">
                             <div className="table-row">
                                <div className="table-cell p-2 border-l text-right font-semibold" style={{ width: 'calc(100% - 30rem - 2px)' }}>
                                    <div className={cn('p-2 rounded text-xs', selectedRows.length > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-800')}>
                                        {displayLabel}
                                    </div>
                                </div>
                                <div className="table-cell p-2 border-l text-right font-bold w-40">{displayTotals.itemPrice.toFixed(2)}</div>
                                <div className="table-cell p-2 border-l text-right font-bold w-40">{displayTotals.deliveryFee.toFixed(2)}</div>
                                <div className="table-cell p-2 border-l text-right font-bold w-40">{displayTotals.cod.toFixed(2)}</div>
                                <div className="table-cell p-2 border-l text-right w-40"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <CardFooter className="flex-none flex items-center justify-between p-2 border-t bg-background">
                    <span className="text-xs text-muted-foreground">
                        عرض {paginatedOrders.length} من {filteredOrders.length} طلبات
                    </span>
                    <div className="flex items-center gap-1">
                        <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>السابق</Button>
                        <span className="text-xs p-2">صفحة {page + 1} من {totalPages}</span>
                        <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}>التالي</Button>
                    </div>
                </CardFooter>
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
