
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

// Mock Data
const initialOrders = Array.from({ length: 85 }, (_, i) => ({
  id: `#32${10 + i}`,
  source: (['Shopify', 'Manual', 'API', 'WooCommerce'] as const)[i % 4],
  referenceNumber: `REF-00${100+i}`,
  recipient: ['محمد جاسم', 'سارة كريم', 'أحمد خالد', 'فاطمة علي', 'حسن محمود', 'نور الهدى', 'خالد وليد'][i % 7],
  phone: `07${(701112233 + i * 1111111).toString().slice(0,8)}`,
  address: `${['الصويفية', 'خلدا', 'تلاع العلي', 'حي معصوم', 'الجبيهة', 'الحي الشرقي', 'العبدلي'][i % 7]}`,
  city: ['عمان', 'الزرقاء', 'إربد'][i % 3],
  region: ['الصويفية', 'خلدا', 'تلاع العلي', 'حي معصوم', 'الجبيهة', 'الحي الشرقي', 'العبدلي'][i % 7],
  status: (['تم التسليم', 'جاري التوصيل', 'بالانتظار', 'راجع', 'مؤجل'] as const)[i % 5],
  driver: ['علي الأحمد', 'فاطمة الزهراء', 'محمد الخالد', 'يوسف إبراهيم', 'عائشة بكر', 'غير معين'][i % 6],
  merchant: ['تاجر أ', 'تاجر ب', 'تاجر ج', 'تاجر د'][i % 4],
  cod: 50.00 + i * 5,
  itemPrice: 45.00 + i * 5,
  deliveryFee: 5.00,
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

// Mobile-specific card component
const MobileOrderCard = ({ order, isSelected, onCheckboxClick, openModal }: { order: Order, isSelected: boolean, onCheckboxClick: (id: string) => void, openModal: (state: ModalState) => void }) => {
    const statusInfo = getStatusInfo(order.status);
    const handleWhatsAppClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        openModal({ type: 'whatsapp', order });
    }
    
    return (
        <Card className={`overflow-hidden border-r-4 ${statusInfo.bgColor.replace('bg-', 'border-')}`}>
            <CardHeader className="flex flex-row items-start gap-4 p-3 bg-muted/50">
                <div className="flex items-center gap-3 flex-1">
                    <Checkbox checked={isSelected} onCheckedChange={(checked) => onCheckboxClick(order.id)} />
                    <div className="grid gap-0.5">
                        <Link href="#"><span className="font-semibold text-primary">{order.id}</span></Link>
                        <span className="text-xs text-muted-foreground">{order.recipient}</span>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <Badge variant="outline" className={cn(statusInfo.bgColor, statusInfo.color, "gap-1.5")}>
                        {React.createElement(statusInfo.icon, { className: "h-3 w-3" })}
                        {statusInfo.label}
                    </Badge>
                    <span className="font-bold text-sm">{order.cod.toFixed(2)} د.أ</span>
                </div>
            </CardHeader>
            <CardContent className="p-3 text-sm space-y-2">
                <p><strong>الهاتف:</strong> {order.phone}</p>
                <p><strong>العنوان:</strong> {order.address}</p>
                <p><strong>السائق:</strong> {order.driver}</p>
            </CardContent>
            <CardFooter className="p-2 bg-muted/50 flex justify-end gap-1">
                <Button variant="ghost" size="sm" onClick={() => openModal({ type: 'barcode', order })}>طباعة</Button>
                <Button variant="ghost" size="sm" onClick={() => openModal({ type: 'history', order })}>سجل</Button>
                <Button variant="ghost" size="sm" onClick={handleWhatsAppClick}>واتساب</Button>
            </CardFooter>
        </Card>
    );
}


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
    
    useEffect(() => { setIsClient(true); }, []);

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
        const selectedOrders = orders.filter(o => selectedRows.includes(o.id));
        const paginatedTotals = paginatedOrders.reduce((acc, order) => {
            acc.cod += order.cod;
            acc.itemPrice += order.itemPrice;
            acc.deliveryFee += order.deliveryFee;
            return acc;
        }, { cod: 0, itemPrice: 0, deliveryFee: 0 });

        const selectedTotals = selectedOrders.reduce((acc, order) => {
            acc.cod += order.cod;
            acc.itemPrice += order.itemPrice;
            acc.deliveryFee += order.deliveryFee;
            return acc;
        }, { cod: 0, itemPrice: 0, deliveryFee: 0 });

        return { paginated: paginatedTotals, selected: selectedTotals };
    }, [orders, selectedRows, paginatedOrders]);


    if (!isClient) {
        return <Skeleton className="w-full h-screen" />;
    }

    return (
        <TooltipProvider>
            <div className="flex flex-col h-[calc(100vh-64px)]">
                 <Card className="sticky top-[64px] z-20 rounded-none border-x-0 border-t-0">
                    <CardContent className="p-2 flex-row items-center justify-between flex flex-wrap gap-2">
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
                    </CardContent>
                </Card>
                <div className="flex-1 overflow-auto">
                    <Card className="border-0 shadow-none">
                        <CardContent className="p-0">
                            {isMobile ? (
                                <div className="p-2 space-y-2">
                                    {paginatedOrders.map(order => (
                                        <MobileOrderCard 
                                            key={order.id} 
                                            order={order}
                                            isSelected={selectedRows.includes(order.id)}
                                            onCheckboxClick={(id) => handleSelectRow(id, !selectedRows.includes(id))}
                                            openModal={setModalState}
                                        />
                                    ))}
                                </div>
                            ) : (
                               <div className="relative overflow-x-auto">
                                <Table className="min-w-max border-b">
                                    <TableHeader className="sticky top-0 z-10">
                                        <TableRow className="bg-primary hover:bg-primary/90">
                                            <TableHead className="sticky right-0 p-1 bg-primary border-l border-primary-foreground/20 text-right bg-muted">
                                                {/* This cell is now empty */}
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
                                            <TableHead className="sticky right-0 w-12 px-4 border-l bg-muted text-right flex items-center justify-center">
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
                                                <TableCell className="sticky right-0 border-l bg-muted flex items-center justify-center">
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
                                    <TableFooter className="sticky bottom-0 bg-muted/95">
                                        <TableRow>
                                            <TableCell colSpan={11} className="p-1 border-l text-right font-semibold">
                                                <div className="p-1 rounded bg-blue-100 text-blue-800 text-xs">مجاميع المحددة ({selectedRows.length})</div>
                                            </TableCell>
                                            <TableCell className="p-1 border-l text-right font-bold">{totals.selected.itemPrice.toFixed(2)}</TableCell>
                                            <TableCell className="p-1 border-l text-right font-bold">{totals.selected.deliveryFee.toFixed(2)}</TableCell>
                                            <TableCell className="p-1 border-l text-right font-bold">{totals.selected.cod.toFixed(2)}</TableCell>
                                            <TableCell className="p-1 border-l text-right"></TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell colSpan={11} className="p-1 border-l text-right font-semibold">
                                                 <div className="p-1 rounded bg-gray-200 text-gray-800 text-xs">مجاميع الصفحة الحالية ({paginatedOrders.length})</div>
                                            </TableCell>
                                            <TableCell className="p-1 border-l text-right font-bold">{totals.paginated.itemPrice.toFixed(2)}</TableCell>
                                            <TableCell className="p-1 border-l text-right font-bold">{totals.paginated.deliveryFee.toFixed(2)}</TableCell>
                                            <TableCell className="p-1 border-l text-right font-bold">{totals.paginated.cod.toFixed(2)}</TableCell>
                                            <TableCell className="p-1 border-l text-right"></TableCell>
                                        </TableRow>
                                    </TableFooter>
                                </Table>
                               </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
                <CardFooter className="sticky bottom-0 flex items-center justify-between p-2 border-t bg-background z-10">
                     <div className="text-sm text-muted-foreground">
                         عرض <strong>{paginatedOrders.length}</strong> من <strong>{filteredOrders.length}</strong> طلبات
                     </div>
                     <div className="flex items-center gap-2">
                         <Button
                             variant="outline"
                             size="sm"
                             onClick={() => setPage(prev => Math.max(prev - 1, 0))}
                             disabled={page === 0}
                         >
                             <ChevronRight className="h-4 w-4" />
                             <span>السابق</span>
                         </Button>
                         <span className="text-sm text-muted-foreground">
                             صفحة {page + 1} من {totalPages}
                         </span>
                         <Button
                             variant="outline"
                             size="sm"
                             onClick={() => setPage(prev => Math.min(prev + 1, totalPages - 1))}
                             disabled={page >= totalPages - 1}
                         >
                            <span>التالي</span>
                             <ChevronLeft className="h-4 w-4" />
                         </Button>
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

    