'use client';

import * as React from 'react';
import { useState, useMemo, useEffect } from 'react';
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
  Check,
  ArrowUpDown,
  ListTree,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { useToast } from '@/hooks/use-toast';
import { cn } from "@/lib/utils";
import { useOrdersStore, type Order } from '@/store/orders-store';


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


type OrderSource = Order['source'];
type ColumnConfig = { key: keyof Order | 'id-link'; label: string; type?: 'default' | 'financial'; sortable?: boolean };
type GroupByOption = keyof Order | null;

// Initial columns configuration
const ALL_COLUMNS: ColumnConfig[] = [
    { key: 'id', label: 'رقم الطلب' },
    { key: 'source', label: 'المصدر', sortable: true },
    { key: 'referenceNumber', label: 'الرقم المرجعي' },
    { key: 'recipient', label: 'المستلم' },
    { key: 'phone', label: 'الهاتف' },
    { key: 'region', label: 'المنطقة', sortable: true },
    { key: 'city', label: 'المدينة', sortable: true },
    { key: 'merchant', label: 'المتجر', sortable: true },
    { key: 'status', label: 'الحالة', sortable: true },
    { key: 'driver', label: 'السائق', sortable: true },
    { key: 'itemPrice', label: 'المستحق للتاجر', type: 'financial' },
    { key: 'deliveryFee', label: 'أجور التوصيل', type: 'financial' },
    { key: 'cod', label: 'قيمة التحصيل', type: 'financial' },
    { key: 'date', label: 'التاريخ', sortable: true },
];

const GROUP_BY_OPTIONS: { value: GroupByOption; label: string }[] = [
    { value: null, label: 'بدون تجميع' },
    { value: 'merchant', label: 'التاجر' },
    { value: 'status', label: 'الحالة' },
    { value: 'region', label: 'المنطقة' },
    { value: 'city', label: 'المدينة' },
    { value: 'driver', label: 'السائق' },
    { value: 'date', label: 'التاريخ' },
];

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

type SortConfig = { key: keyof Order; direction: 'ascending' | 'descending' };

type GroupedOrders = { [key: string]: Order[] };

const SortableColumn = ({ id, label, onToggle, isVisible }: { id: string; label: string; onToggle: (id: string, checked: boolean) => void; isVisible: boolean; }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
    const style = { transform: transform ? CSS.Transform.toString(transform) : undefined, transition };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center gap-2 p-2 rounded-md hover:bg-muted"
        >
            <GripVertical {...attributes} {...listeners} className="h-5 w-5 cursor-grab text-muted-foreground" />
            <Checkbox checked={isVisible} id={`col-${id}`} onCheckedChange={(checked) => onToggle(id, !!checked)} className="h-4 w-4" />
            <Label htmlFor={`col-${id}`} className="flex-1 cursor-pointer">{label}</Label>
        </div>
    );
};

export function OrdersTable() {
    const { toast } = useToast();
    const [isClient, setIsClient] = useState(false);
    
    // Zustand store integration
    const { orders, setOrders, updateOrderStatus, deleteOrders, refreshOrders } = useOrdersStore();
    
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [modalState, setModalState] = useState<ModalState>({ type: 'none' });
    const isMobile = useMediaQuery('(max-width: 1024px)');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(15);
    const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
    const [groupBy, setGroupBy] = useState<GroupByOption>(null);
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

    
    // State for column management
    const [columns, setColumns] = useState<ColumnConfig[]>(ALL_COLUMNS);
    const [visibleColumnKeys, setVisibleColumnKeys] = useState<string[]>(ALL_COLUMNS.map(c => c.key));
    const sensors = useSensors(useSensor(PointerSensor));

    useEffect(() => { setIsClient(true); }, []);

    // Reset open groups when groupBy changes
    useEffect(() => {
        setOpenGroups({});
    }, [groupBy]);
    
    const visibleColumns = useMemo(() => columns.filter(c => visibleColumnKeys.includes(c.key)), [columns, visibleColumnKeys]);
    
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
    
    const sortedOrders = useMemo(() => {
        let sortableItems = [...filteredOrders];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                const valA = a[sortConfig.key];
                const valB = b[sortConfig.key];
                
                if (valA < valB) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (valA > valB) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [filteredOrders, sortConfig]);

    const groupedAndSortedOrders = useMemo(() => {
        if (!groupBy) {
            return sortedOrders;
        }
        return sortedOrders.reduce((acc: GroupedOrders, order) => {
            const key = order[groupBy] as string;
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(order);
            return acc;
        }, {});
    }, [sortedOrders, groupBy]);

    const paginatedOrders = useMemo(() => {
        if (groupBy) return groupedAndSortedOrders;
        const startIndex = page * rowsPerPage;
        return sortedOrders.slice(startIndex, startIndex + rowsPerPage);
    }, [sortedOrders, page, rowsPerPage, groupBy, groupedAndSortedOrders]);
    
    const totalPages = groupBy ? 1 : Math.ceil(sortedOrders.length / rowsPerPage);

    const handleSort = (key: keyof Order) => {
        if (sortConfig && sortConfig.key === key) {
            if (sortConfig.direction === 'ascending') {
                setSortConfig({ key, direction: 'descending' });
            } else {
                setSortConfig(null);
            }
        } else {
            setSortConfig({ key, direction: 'ascending' });
        }
    };
    
    const currentOrderList = Array.isArray(paginatedOrders) ? paginatedOrders : Object.values(paginatedOrders).flat();
    const isAllSelected = currentOrderList.length > 0 && selectedRows.length === currentOrderList.length;
    const isIndeterminate = selectedRows.length > 0 && selectedRows.length < currentOrderList.length;


    const handleSelectAll = (checked: boolean | 'indeterminate') => {
        // When grouped, select all visible orders. Otherwise, paginated.
        const orderList = Array.isArray(paginatedOrders) ? paginatedOrders : Object.values(paginatedOrders).flat();
        setSelectedRows(checked === true ? orderList.map(o => o.id) : []);
    };
    
    const handleSelectRow = (id: string, checked: boolean) => {
        setSelectedRows(prev => checked ? [...prev, id] : prev.filter(rowId => rowId !== id));
    };

    const handleFieldChange = (orderId: string, field: keyof Order, value: any) => {
        // Using the action from the store
        if (field === 'status') {
            updateOrderStatus(orderId, value);
        }
    };

    const handleDeleteSelected = () => {
        // Using the action from the store
        deleteOrders(selectedRows);
        toast({ title: `تم حذف ${selectedRows.length} طلبات بنجاح` });
        setSelectedRows([]);
        setModalState({type: 'none'});
    };

    const handleBulkUpdate = (field: keyof Order, value: any) => {
        // This would be a new action in the store, e.g., bulkUpdateOrders
        // For now, let's update them one by one
        selectedRows.forEach(id => {
            if (field === 'status') {
                updateOrderStatus(id, value);
            }
            // Add other bulk updates here
        });

        toast({ title: `تم تحديث ${selectedRows.length} طلبات` });
        setSelectedRows([]);
        setModalState({type: 'none'});
    }
    
    const totals = useMemo(() => {
        const calculateTotals = (orderList: Order[]) => {
            const totalsResult = visibleColumns.reduce((acc, col) => {
                if (col.type === 'financial') {
                    acc[col.key as string] = 0;
                }
                return acc;
            }, {} as Record<string, number>);

            for (const order of orderList) {
                for (const col of visibleColumns) {
                    if (col.type === 'financial') {
                        totalsResult[col.key as string] += order[col.key as keyof Order] as number;
                    }
                }
            }
            return totalsResult;
        };
        const selectedOrdersList = orders.filter(o => selectedRows.includes(o.id));
        const listForCalculation = groupBy ? sortedOrders : (Array.isArray(paginatedOrders) ? paginatedOrders : Object.values(paginatedOrders).flat());

        return {
            main: calculateTotals(listForCalculation),
            selected: calculateTotals(selectedOrdersList),
        };
    }, [orders, selectedRows, paginatedOrders, visibleColumns, sortedOrders, groupBy]);

    const displayTotals = selectedRows.length > 0 ? totals.selected : totals.main;
    const displayCount = selectedRows.length > 0 ? selectedRows.length : sortedOrders.length;
    const displayLabel = selectedRows.length > 0 ? 'المحدد' : 'الإجمالي';


    const handleColumnVisibilityChange = (key: string, checked: boolean) => {
        setVisibleColumnKeys(prev => 
            checked ? [...prev, key] : prev.filter(k => k !== key)
        );
    };

    const handleColumnDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setColumns((currentColumns) => {
                const oldIndex = currentColumns.findIndex(c => c.key === active.id);
                const newIndex = currentColumns.findIndex(c => c.key === over.id);
                return arrayMove(currentColumns, oldIndex, newIndex);
            });
        }
    };
    
    const handleRefresh = () => {
        refreshOrders();
        toast({
            title: "تم تحديث البيانات",
            description: "تم إعادة تحميل قائمة الطلبات بنجاح.",
        })
    }

    const renderOrderRow = (order: Order, index: number, isGrouped: boolean = false) => {
        const statusInfo = getStatusInfo(order.status);
        const SourceIcon = sourceIcons[order.source] || LinkIcon;
        return (
            <TableRow key={order.id} data-state={selectedRows.includes(order.id) ? 'selected' : ''} className={cn("hover:bg-muted/50 border-b", isGrouped ? "bg-card" : "")}>
                <TableCell className="sticky right-0 z-10 p-1 text-center border-l bg-card">
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-xs font-mono">{page * rowsPerPage + index + 1}</span>
                        <Checkbox
                            checked={selectedRows.includes(order.id)}
                            onCheckedChange={(checked) => handleSelectRow(order.id, !!checked)}
                        />
                    </div>
                </TableCell>
                {visibleColumns.map(col => {
                    const value = order[col.key as keyof Order];
                    if (col.key === 'id') {
                        return <TableCell key={col.key} className="font-medium text-primary p-1 text-center whitespace-nowrap border-l"><Link href="#">{value as string}</Link></TableCell>
                    }
                    if (col.key === 'source') {
                        const Icon = sourceIcons[value as OrderSource] || LinkIcon;
                        return <TableCell key={col.key} className="p-1 text-center whitespace-nowrap border-l"><Badge variant="outline" className="gap-1.5 font-normal"><Icon className="h-3 w-3" />{value as string}</Badge></TableCell>
                    }
                    if (col.key === 'status') {
                            const sInfo = getStatusInfo(value as string);
                            return <TableCell key={col.key} className="p-1 text-center whitespace-nowrap border-l"><Select value={value as string} onValueChange={(newStatus) => handleFieldChange(order.id, 'status', newStatus as Order['status'])}><SelectTrigger className={cn("border-0 h-8", sInfo.bgColor, sInfo.color)}><SelectValue placeholder="الحالة" /></SelectTrigger><SelectContent><SelectGroup>{statusOptions.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectGroup></SelectContent></Select></TableCell>
                    }
                    if (col.type === 'financial' && typeof value === 'number') {
                        return <TableCell key={col.key} className="p-1 text-center whitespace-nowrap border-l">{value.toFixed(2)}</TableCell>
                    }
                    return <TableCell key={col.key} className="p-1 text-center whitespace-nowrap border-l">{value as React.ReactNode}</TableCell>
                })}
            </TableRow>
        )
    }
    
    const FooterRow = () => (
        <TableRow className="font-bold bg-muted hover:bg-muted/80">
             <TableCell className="sticky right-0 z-10 p-1 text-center border-l bg-muted">
                 <div className='p-2 rounded text-xs bg-slate-600 text-white'>
                    {displayLabel} ({displayCount})
                </div>
            </TableCell>
            {visibleColumns.map(col => {
                if (col.type === 'financial') {
                    const totalValue = displayTotals[col.key as string] || 0;
                    return (
                        <TableCell key={col.key} className="p-1 text-center whitespace-nowrap border-l text-foreground">
                            {totalValue.toFixed(2)}
                        </TableCell>
                    );
                }
                return <TableCell key={col.key} className="border-l"></TableCell>;
            })}
        </TableRow>
    );

    if (!isClient) {
        return <Skeleton className="w-full h-screen" />;
    }

    if (isMobile) {
        return (
            <div className="flex flex-col h-full">
                <div className="flex-none p-4 flex-row items-center justify-between flex flex-wrap gap-2 border-b bg-background">
                     <div className="relative w-full max-w-xs">
                        <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="بحث شامل..." className="pr-8" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                    <div className="flex items-center gap-2">
                         <Button variant="outline" size="icon" className="h-9 w-9 bg-orange-100 text-orange-200 border-orange-200 hover:bg-orange-200">
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
                    {Array.isArray(paginatedOrders) && paginatedOrders.map(order => {
                        const statusInfo = getStatusInfo(order.status);
                        const ActionButton = ({ icon: Icon, label }: {icon: React.ElementType, label: string}) => (
                            <div className="flex flex-col items-center gap-1 text-xs text-muted-foreground">
                                <Icon className="h-5 w-5" />
                                <span>{label}</span>
                            </div>
                        );
                        return (
                             <Card key={order.id} className={cn('overflow-hidden border-r-4 shadow-sm bg-card', statusInfo.color.replace('text-','border-').replace('-800','-500'))}>
                                <div className='p-3 grid grid-cols-[auto_1fr_auto] gap-x-3 gap-y-2'>
                                    {/* Column 1: Checkbox */}
                                    <div className="row-span-3 flex items-center justify-center">
                                        <Checkbox checked={selectedRows.includes(order.id)} onCheckedChange={(checked) => handleSelectRow(order.id, !!checked)} className="h-5 w-5"/>
                                    </div>
                                    
                                    {/* Column 2: Order Info */}
                                    <div className="col-start-2 col-end-3 space-y-1">
                                        <div className="flex items-center gap-2 font-medium">
                                            <User className="h-4 w-4 text-muted-foreground"/>
                                            <span>{order.recipient}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Phone className="h-4 w-4"/>
                                            <span>{order.phone}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <MapPin className="h-4 w-4"/>
                                            <span>{order.address}, {order.city}</span>
                                        </div>
                                    </div>
                                    
                                    {/* Column 3: Status and Amount */}
                                    <div className="col-start-3 col-end-4 row-span-2 flex flex-col items-end justify-start gap-1">
                                        <Badge className={cn("gap-1.5", statusInfo.bgColor, statusInfo.color)}>{statusInfo.label}</Badge>
                                        <span className="text-lg font-bold text-primary">{order.cod.toFixed(2)} د.أ</span>
                                    </div>

                                    {/* Spanning ID and Date */}
                                    <div className="col-start-2 col-end-4 flex justify-between text-xs text-muted-foreground">
                                        <span className="font-mono text-primary">{order.id}</span>
                                        <span>{order.date}</span>
                                    </div>
                                </div>
                                <CardFooter className='p-2 bg-muted/50 grid grid-cols-4 items-center justify-items-center'>
                                     <ActionButton icon={MessageCircle} label="واتساب" />
                                     <ActionButton icon={History} label="سجل" />
                                     <ActionButton icon={Printer} label="طباعة" />
                                     <ActionButton icon={Edit} label="تعديل" />
                                </CardFooter>
                            </Card>
                        )
                    })}
                </div>
                <CardFooter className="flex-none flex items-center justify-between p-2 border-t bg-background">
                    <span className="text-xs text-muted-foreground">
                        عرض {Array.isArray(paginatedOrders) ? paginatedOrders.length : sortedOrders.length} من {sortedOrders.length} طلبات
                    </span>
                    {!groupBy && (
                        <div className="flex items-center gap-1">
                            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>السابق</Button>
                            <span className="text-xs p-2">صفحة {page + 1} من {totalPages}</span>
                            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}>التالي</Button>
                        </div>
                    )}
                </CardFooter>
            </div>
        )
    }

    return (
        <>
            <TooltipProvider>
                <Card className="flex flex-col h-[calc(100vh-8rem)] bg-background p-4 gap-4 overflow-hidden">
                    {/* Header */}
                    <div className="flex-none flex-row items-center justify-between flex flex-wrap gap-2">
                        {selectedRows.length > 0 ? (
                             <div className='flex items-center gap-2'>
                                <span className='text-sm font-semibold text-muted-foreground'>{selectedRows.length} طلبات محددة</span>
                                <Separator orientation="vertical" className="h-6 mx-1" />
                                 <Button variant="outline" size="sm" onClick={() => setModalState({ type: 'assignDriver' })}><UserCheck className="ml-2 h-4 w-4" /> تعيين سائق</Button>
                                <Button variant="outline" size="sm" onClick={() => setModalState({ type: 'changeStatus' })}><RefreshCw className="ml-2 h-4 w-4" /> تغيير الحالة</Button>
                                <Button variant="outline" size="sm"><Printer className="ml-2 h-4 w-4" /> طباعة</Button>
                                <Button variant="destructive" size="sm" onClick={() => setModalState({ type: 'delete' })}><Trash2 className="ml-2 h-4 w-4" /> حذف</Button>
                                <Button variant="ghost" size="icon" onClick={() => setSelectedRows([])}><X className="h-4 w-4" /></Button>
                            </div>
                        ) : (
                            <>
                                <div className="relative w-full max-w-xs">
                                    <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                    placeholder="بحث شامل..."
                                    className="pr-8"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                     <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm" className="gap-1">
                                            <ListTree className="h-4 w-4" />
                                            <span>التجميع حسب</span>
                                            {groupBy && <Badge variant="secondary" className='mr-1'>{GROUP_BY_OPTIONS.find(o => o.value === groupBy)?.label}</Badge>}
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>اختر حقل للتجميع</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            {GROUP_BY_OPTIONS.map(option => (
                                                <DropdownMenuCheckboxItem
                                                    key={option.label}
                                                    checked={groupBy === option.value}
                                                    onSelect={() => setGroupBy(option.value)}
                                                >
                                                    {option.label}
                                                </DropdownMenuCheckboxItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm" className="gap-1">
                                            <ListOrdered className="h-4 w-4" />
                                            <span>الأعمدة</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-64 p-2">
                                            <DropdownMenuLabel>إظهار/إخفاء الأعمدة</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleColumnDragEnd}>
                                                <SortableContext items={columns.map(c => c.key)} strategy={verticalListSortingStrategy}>
                                                    {columns.map((column) => (
                                                        <SortableColumn
                                                            key={column.key}
                                                            id={column.key}
                                                            label={column.label}
                                                            isVisible={visibleColumnKeys.includes(column.key)}
                                                            onToggle={handleColumnVisibilityChange}
                                                        />
                                                    ))}
                                                </SortableContext>
                                            </DndContext>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm" className="gap-1">
                                        <FileDown /><span>تصدير</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem>تصدير كـ CSV</DropdownMenuItem>
                                        <DropdownMenuItem>تصدير كـ PDF</DropdownMenuItem>
                                    </DropdownMenuContent>
                                    </DropdownMenu>
                                    <Button variant="outline" size="sm"><Printer /></Button>
                                    <Button variant="outline" size="sm" onClick={handleRefresh}><RefreshCw className="h-4 w-4"/></Button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Table Container */}
                    <div className="flex-1 relative overflow-auto border rounded-lg">
                        <Table className="w-full border-collapse text-sm">
                            <TableHeader className="sticky top-0 z-20 bg-card">
                            <TableRow className="bg-[#4A5568] hover:bg-[#4A5568]">
                                <TableHead className="sticky right-0 z-30 bg-[#4A5568] text-white p-1 text-center border-b border-l w-24">
                                  <div className="flex items-center justify-center gap-2">
                                    <span className="text-sm font-bold">#</span>
                                    <Checkbox
                                        onCheckedChange={handleSelectAll}
                                        checked={isAllSelected}
                                        indeterminate={isIndeterminate}
                                        aria-label="Select all rows"
                                    />
                                  </div>
                                </TableHead>
                                {visibleColumns.map((col) => (
                                <TableHead key={col.key} className="text-white p-1 text-center whitespace-nowrap border-b border-l">
                                    {col.sortable ? (
                                        <Button variant="ghost" onClick={() => handleSort(col.key as keyof Order)} className="text-white hover:bg-white/20 hover:text-white w-full p-0 h-auto">
                                            {col.label}
                                            <ArrowUpDown className="mr-2 h-3 w-3" />
                                        </Button>
                                    ) : (
                                        col.label
                                    )}
                                </TableHead>
                                ))}
                            </TableRow>
                            </TableHeader>
                             <TableBody>
                                {groupBy && !Array.isArray(groupedAndSortedOrders) ? (
                                    Object.entries(groupedAndSortedOrders).map(([groupKey, groupOrders]) => {
                                        const isGroupOpen = openGroups[groupKey] ?? false;
                                        return (
                                            <React.Fragment key={groupKey}>
                                                <TableRow onClick={() => setOpenGroups(prev => ({...prev, [groupKey]: !isGroupOpen}))} className="font-semibold text-base w-full bg-muted/50 hover:bg-muted/70 cursor-pointer border-b-2 border-border">
                                                    <TableCell colSpan={visibleColumns.length + 1} className="p-0">
                                                        <div className="flex items-center justify-start w-full px-4 py-3 gap-4">
                                                            <ChevronDown className={cn("h-5 w-5 transition-transform", !isGroupOpen && "-rotate-90")} />
                                                            <span className="font-bold text-lg">{groupKey} ({groupOrders.length})</span>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                                {isGroupOpen && groupOrders.map((order, index) => renderOrderRow(order, index, true))}
                                            </React.Fragment>
                                        );
                                    })
                                ) : Array.isArray(paginatedOrders) ? (
                                    paginatedOrders.map((order, index) => renderOrderRow(order, index, false))
                                ) : null}
                            </TableBody>

                             <TableFooter className="sticky bottom-0 z-10">
                                <FooterRow />
                             </TableFooter>
                        </Table>
                    </div>

                    {/* Pagination Footer */}
                    {!groupBy && (
                         <div className="flex-none flex items-center justify-between p-2 border-t">
                             <span className="text-xs text-muted-foreground">
                                 عرض {Array.isArray(paginatedOrders) ? paginatedOrders.length : 0} من {sortedOrders.length} طلبات
                             </span>
                             <div className="flex items-center gap-1">
                                 <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>السابق</Button>
                                 <span className="text-xs p-2">صفحة {page + 1} من {totalPages}</span>
                                 <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>التالي</Button>
                             </div>
                         </div>
                    )}
                </Card>
            </TooltipProvider>

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
        </>
    );
}
