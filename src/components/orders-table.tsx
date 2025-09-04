

'use client';

import * as React from 'react';
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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
  Upload,
  Download,
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
import { useSettings, type SavedTemplate, readyTemplates } from '@/contexts/SettingsContext';
import { PrintablePolicy } from '@/components/printable-policy';
import { useStatusesStore } from '@/store/statuses-store';


// ShadCN UI Components
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Icon from '@/components/icon';


type OrderSource = Order['source'];
type ColumnConfig = { key: keyof Order | 'id-link' | 'notes' | 'companyDue'; label: string; type?: 'default' | 'financial' | 'admin_financial'; sortable?: boolean };
type GroupByOption = keyof Order | null;


// Initial columns configuration
const ALL_COLUMNS: ColumnConfig[] = [
    { key: 'id', label: 'رقم الطلب' },
    { key: 'source', label: 'المصدر', sortable: true },
    { key: 'referenceNumber', label: 'الرقم المرجعي' },
    { key: 'recipient', label: 'المستلم' },
    { key: 'phone', label: 'الهاتف' },
    { key: 'address', label: 'العنوان' },
    { key: 'region', label: 'المنطقة', sortable: true },
    { key: 'city', label: 'المدينة', sortable: true },
    { key: 'merchant', label: 'التاجر', sortable: true },
    { key: 'status', label: 'الحالة', sortable: true },
    { key: 'previousStatus', label: 'الحالة السابقة', sortable: true },
    { key: 'driver', label: 'السائق', sortable: true },
    { key: 'itemPrice', label: 'المستحق للتاجر', type: 'financial' },
    { key: 'deliveryFee', label: 'أجور التوصيل', type: 'financial' },
    { key: 'additionalCost', label: 'تكلفة إضافية', type: 'admin_financial' },
    { key: 'driverFee', label: 'أجور السائق', type: 'admin_financial' },
    { key: 'driverAdditionalFare', label: 'أجور إضافية للسائق', type: 'admin_financial' },
    { key: 'companyDue', label: 'المطلوب للشركة', type: 'admin_financial' },
    { key: 'cod', label: 'قيمة التحصيل', type: 'financial' },
    { key: 'date', label: 'التاريخ', sortable: true },
    { key: 'notes', label: 'ملاحظات' },
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

type ModalState = 
    | { type: 'none' }
    | { type: 'delete' }
    | { type: 'history', order: Order }
    | { type: 'whatsapp', order: Order }
    | { type: 'barcode', order: Order }
    | { type: 'assignDriver' }
    | { type: 'changeStatus' }
    | { type: 'print' };

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

const OrdersTableComponent = () => {
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const [isClient, setIsClient] = useState(false);
    const context = useSettings();
    const { settings: orderSettings, isHydrated: settingsHydrated, formatCurrency } = context;
    const { statuses } = useStatusesStore();
    
    const { orders, setOrders, updateOrderStatus, deleteOrders, refreshOrders, updateOrderField } = useOrdersStore();
    
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [modalState, setModalState] = useState<ModalState>({ type: 'none' });
    const isMobile = useMediaQuery('(max-width: 1024px)');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(15);
    const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
    const [groupBy, setGroupBy] = useState<GroupByOption>(null);
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

    const [columns, setColumns] = useState<ColumnConfig[]>(ALL_COLUMNS);
    const [visibleColumnKeys, setVisibleColumnKeys] = useState<string[]>(ALL_COLUMNS.map(c => c.key));
    const sensors = useSensors(useSensor(PointerSensor));

    const [availableTemplates, setAvailableTemplates] = useState<SavedTemplate[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<SavedTemplate | null>(null);
    const printablePolicyRef = useRef<{ handleExport: () => void; handleDirectPrint: (order: any, type: 'zpl' | 'escpos') => Promise<void> }>(null);


    useEffect(() => { 
        setIsClient(true);
        try {
            const savedTemplatesJson = localStorage.getItem('policyTemplates');
            const savedTemplates = savedTemplatesJson ? JSON.parse(savedTemplatesJson) : [];
            setAvailableTemplates([...readyTemplates, ...savedTemplates]);
        } catch (e) {
            setAvailableTemplates(readyTemplates);
        }
    }, []);

    useEffect(() => {
        setOpenGroups({});
    }, [groupBy]);
    
    const visibleColumns = useMemo(() => columns.filter(c => visibleColumnKeys.includes(c.key)), [columns, visibleColumnKeys]);
    
    const filteredOrders = useMemo(() => {
        const statusFilter = searchParams.get('status');
        const driverFilter = searchParams.get('driver');

        return orders.filter(order => {
            const searchLower = searchQuery.toLowerCase();
            const searchMatch = searchQuery === '' ||
                order.recipient.toLowerCase().includes(searchLower) ||
                order.phone.includes(searchQuery) ||
                order.id.toLowerCase().includes(searchLower) ||
                order.merchant.toLowerCase().includes(searchLower) ||
                (order.referenceNumber && order.referenceNumber.toLowerCase().includes(searchLower));

            const statusMatch = !statusFilter || order.status === statusFilter;
            const driverMatch = !driverFilter || order.driver === driverFilter;
            
            return searchMatch && statusMatch && driverMatch;
        });
    }, [orders, searchQuery, searchParams]);
    
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
    
    const footerTotals = useMemo(() => {
        const listForCalculation = selectedRows.length > 0 
            ? orders.filter(o => selectedRows.includes(o.id))
            : (Array.isArray(paginatedOrders) ? paginatedOrders : []);
        
        return listForCalculation.reduce((acc, order) => {
            acc.itemPrice += order.itemPrice || 0;
            acc.deliveryFee += order.deliveryFee || 0;
            acc.cod += order.cod || 0;
            acc.driverFee += (order.driverFee || 0) + (order.driverAdditionalFare || 0);
            acc.additionalCost += order.additionalCost || 0;
            acc.companyDue += (order.deliveryFee + (order.additionalCost || 0)) - ((order.driverFee || 0) + (order.driverAdditionalFare || 0));
            return acc;
        }, { itemPrice: 0, deliveryFee: 0, cod: 0, driverFee: 0, additionalCost: 0, companyDue: 0 });
    }, [orders, selectedRows, paginatedOrders]);

    const totalPages = groupBy ? Object.keys(groupedAndSortedOrders).length : Math.ceil(sortedOrders.length / rowsPerPage);

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
    
    const visibleOrdersInOpenGroups = useMemo(() => {
        if (!groupBy || Array.isArray(groupedAndSortedOrders)) return [];
        return Object.entries(groupedAndSortedOrders).reduce((acc: Order[], [groupKey, groupOrders]) => {
            const isGroupOpen = openGroups[groupKey] ?? false; // Default to closed
            if (isGroupOpen) {
                return [...acc, ...groupOrders];
            }
            return acc;
        }, []);
    }, [groupedAndSortedOrders, groupBy, openGroups]);
    
    const currentOrderList = groupBy ? visibleOrdersInOpenGroups : (Array.isArray(paginatedOrders) ? paginatedOrders : []);

    const isAllSelected = currentOrderList.length > 0 && selectedRows.length > 0 && currentOrderList.every(o => selectedRows.includes(o.id));
    const isIndeterminate = selectedRows.length > 0 && !isAllSelected;


    const handleSelectAll = (checked: boolean | 'indeterminate') => {
        const orderIdsToSelect = currentOrderList.map(o => o.id);
        if (checked) {
            setSelectedRows(prev => [...new Set([...prev, ...orderIdsToSelect])]);
        } else {
            setSelectedRows(prev => prev.filter(id => !orderIdsToSelect.includes(id)));
        }
    };
    
    const handleSelectRow = (id: string, checked: boolean) => {
        setSelectedRows(prev => checked ? [...prev, id] : prev.filter(rowId => rowId !== id));
    };

    const handleFieldChange = (orderId: string, field: keyof Order, value: any) => {
        updateOrderField(orderId, field, value);
    };

    const handleDeleteSelected = () => {
        deleteOrders(selectedRows);
        toast({ title: `تم حذف ${selectedRows.length} طلبات بنجاح` });
        setSelectedRows([]);
        setModalState({type: 'none'});
    };

    const handleBulkUpdate = (field: keyof Order, value: any) => {
        selectedRows.forEach(id => {
            updateOrderField(id, field, value);
        });

        toast({ title: `تم تحديث ${selectedRows.length} طلبات` });
        setSelectedRows([]);
        setModalState({type: 'none'});
    }

    const handleColumnVisibilityChange = (key: string, checked: boolean) => {
        setVisibleColumnKeys(prev => 
            checked ? [...new Set([...prev, key])] : prev.filter(k => k !== key)
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

    const handlePrintClick = () => {
        if (selectedRows.length === 0) {
            toast({ variant: 'destructive', title: 'لا توجد طلبات محددة', description: 'الرجاء تحديد طلب واحد على الأقل للطباعة.' });
            return;
        }
        setSelectedTemplate(availableTemplates.length > 0 ? availableTemplates[0] : null);
        setModalState({ type: 'print' });
    };

    const getStatusInfo = (statusValue: string) => {
        return statuses.find(s => s.name === statusValue) || { name: statusValue, icon: 'Package', color: '#808080' };
    };

    const renderOrderRow = (order: Order, index: number) => {
        return (
            <TableRow key={order.id} data-state={selectedRows.includes(order.id) ? 'selected' : ''} className="hover:bg-muted/50">
                <TableCell className="sticky right-0 z-10 p-4 text-center border-l bg-card dark:bg-slate-900 data-[state=selected]:bg-primary/20">
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
                    let content: React.ReactNode;
                    switch (col.key) {
                        case 'id':
                            content = <Link href={`/dashboard/orders/${order.id}`} className="text-primary hover:underline font-medium">{value as string}</Link>;
                            break;
                        case 'source':
                            const IconC = sourceIcons[value as OrderSource] || LinkIcon;
                            content = <Badge variant="outline" className="gap-1.5 font-normal"><IconC className="h-3 w-3" />{value as string}</Badge>;
                            break;
                        case 'status':
                            const sInfo = getStatusInfo(value as string);
                            content = <Select value={value as string} onValueChange={(newStatus) => handleFieldChange(order.id, 'status', newStatus as Order['status'])}>
                                <SelectTrigger className={cn("border-0 h-8")} style={{ backgroundColor: `${sInfo.color}20`, color: sInfo.color}}>
                                    <SelectValue placeholder="الحالة" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {statuses.filter(s => s.isActive).map(s => 
                                            <SelectItem key={s.code} value={s.name}>
                                                <div className="flex items-center gap-2">
                                                    <Icon name={s.icon as any} style={{ color: s.color }} className="h-4 w-4" />
                                                    {s.name}
                                                </div>
                                            </SelectItem>
                                        )}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>;
                            break;
                        case 'previousStatus':
                            content = value ? <Badge variant="secondary">{value as string}</Badge> : '-';
                            break;
                        case 'companyDue':
                             content = formatCurrency((order.deliveryFee + (order.additionalCost || 0)) - ((order.driverFee || 0) + (order.driverAdditionalFare || 0)));
                             break;
                        case 'itemPrice':
                        case 'deliveryFee':
                        case 'driverFee':
                        case 'cod':
                        case 'additionalCost':
                        case 'driverAdditionalFare':
                            content = formatCurrency(value as number);
                            break;
                        default:
                            content = value as React.ReactNode;
                    }
                    return <TableCell key={col.key} className="p-5 text-center whitespace-nowrap border-l text-base">{content}</TableCell>
                })}
            </TableRow>
        )
    }

    if (!isClient || !settingsHydrated) {
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
                                <DropdownMenuItem onClick={handlePrintClick}><Printer className="ml-2 h-4 w-4" /> طباعة</DropdownMenuItem>
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
                             <Card key={order.id} className={cn('overflow-hidden border-r-4 shadow-sm bg-card')} style={{borderRightColor: statusInfo.color}}>
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
                                        <Badge className={cn("gap-1.5")} style={{backgroundColor: `${statusInfo.color}20`, color: statusInfo.color}}><Icon name={statusInfo.icon as any} className="h-3 w-3"/>{statusInfo.name}</Badge>
                                        <span className="text-lg font-bold text-primary">{formatCurrency(order.cod)}</span>
                                    </div>

                                    {/* Spanning ID and Date */}
                                    <div className="col-start-2 col-end-4 flex justify-between text-xs text-muted-foreground">
                                        <Link href={`/dashboard/orders/${order.id}`} className="font-mono text-primary hover:underline">{order.id}</Link>
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
                            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>التالي</Button>
                        </div>
                    )}
                </CardFooter>
            </div>
        )
    }

    return (
        <>
            <TooltipProvider>
                <Card className="flex flex-col h-[calc(100vh-8rem)] bg-background p-4 gap-4">
                    {/* Header */}
                    <div className="flex-none flex-row items-center justify-between flex flex-wrap gap-2">
                        {selectedRows.length > 0 ? (
                             <div className='flex items-center gap-2'>
                                <span className='text-sm font-semibold text-muted-foreground'>{selectedRows.length} طلبات محددة</span>
                                <Separator orientation="vertical" className="h-6 mx-1" />
                                 <Button variant="outline" size="sm" onClick={() => setModalState({ type: 'assignDriver' })}><UserCheck className="ml-2 h-4 w-4" /> تعيين سائق</Button>
                                <Button variant="outline" size="sm" onClick={() => setModalState({ type: 'changeStatus' })}><RefreshCw className="ml-2 h-4 w-4" /> تغيير الحالة</Button>
                                <Button variant="outline" size="sm" onClick={handlePrintClick}><Printer className="ml-2 h-4 w-4" /> طباعة</Button>
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
                                        <DropdownMenuContent align="end" className="w-64 p-2 flex flex-col">
                                            <DropdownMenuLabel>إظهار/إخفاء الأعمدة</DropdownMenuLabel>
                                            <div className='flex items-center gap-2 p-1'>
                                                <Button variant="link" size="sm" className='h-auto p-1' onClick={() => setVisibleColumnKeys(ALL_COLUMNS.map(c => c.key))}>إظهار الكل</Button>
                                                <Separator orientation="vertical" className="h-4" />
                                                <Button variant="link" size="sm" className='h-auto p-1' onClick={() => setVisibleColumnKeys(['id', 'recipient', 'status'])}>إخفاء الكل</Button>
                                            </div>
                                            <DropdownMenuSeparator />
                                            <ScrollArea className='max-h-96'>
                                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleColumnDragEnd}>
                                                    <SortableContext items={columns.map(c => c.key)} strategy={verticalListSortingStrategy}>
                                                        {ALL_COLUMNS.map((column) => (
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
                                            </ScrollArea>
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
                                    <Button variant="outline" size="sm" onClick={handlePrintClick}><Printer /></Button>
                                    <Button variant="outline" size="sm" onClick={handleRefresh}><RefreshCw className="h-4 w-4"/></Button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Table Container */}
                     <div className="flex-1 border rounded-lg overflow-auto flex flex-col">
                        <Table>
                            <TableHeader className="sticky top-0 z-20">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="sticky right-0 z-30 p-4 text-center border-b border-l w-24 bg-slate-800 text-white">
                                      <div className="flex items-center justify-center gap-2">
                                        <span className="text-sm font-bold">#</span>
                                        <Checkbox
                                            onCheckedChange={handleSelectAll}
                                            checked={isAllSelected}
                                            indeterminate={isIndeterminate}
                                            aria-label="Select all rows"
                                            className='border-white data-[state=checked]:bg-white data-[state=checked]:text-slate-800 data-[state=indeterminate]:bg-white data-[state=indeterminate]:text-slate-800'
                                        />
                                      </div>
                                    </TableHead>
                                    {visibleColumns.map((col) => (
                                    <TableHead key={col.key} className="p-5 text-center whitespace-nowrap border-b border-l bg-slate-800 text-white hover:bg-slate-700 transition-colors duration-200">
                                        {col.sortable ? (
                                            <Button variant="ghost" onClick={() => handleSort(col.key as keyof Order)} className="text-white hover:bg-transparent hover:text-white w-full p-0 h-auto">
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
                                                <TableRow
                                                    onClick={() => setOpenGroups(prev => ({...prev, [groupKey]: !isGroupOpen}))}
                                                    className="font-bold text-base w-full bg-muted/50 hover:bg-muted/70 cursor-pointer border-b-2 border-border"
                                                >
                                                    <TableCell className="p-4">
                                                        <div className="flex items-center gap-2">
                                                            <ChevronDown className={cn("h-5 w-5 transition-transform", !isGroupOpen && "-rotate-90")} />
                                                            <span>{groupKey} ({groupOrders.length})</span>
                                                        </div>
                                                    </TableCell>
                                                    {visibleColumns.slice(1).map(col => {
                                                        const isFinancial = col.type === 'financial' || col.type === 'admin_financial';
                                                        if (isFinancial) {
                                                            const totalValue = groupOrders.reduce((sum, order) => {
                                                                let value = 0;
                                                                if (col.key === 'companyDue') {
                                                                    value = (order.deliveryFee + (order.additionalCost || 0)) - ((order.driverFee || 0) + (order.driverAdditionalFare || 0));
                                                                } else {
                                                                    value = order[col.key as keyof Order] as number || 0;
                                                                }
                                                                return sum + value;
                                                            }, 0);
                                                            return <TableCell key={col.key} className="p-5 text-center whitespace-nowrap text-primary font-bold">{formatCurrency(totalValue)}</TableCell>
                                                        }
                                                        return <TableCell key={col.key} className="p-5 text-center whitespace-nowrap"></TableCell>
                                                    })}
                                                </TableRow>
                                                
                                                {isGroupOpen && groupOrders.map((order, index) => renderOrderRow(order, index))}
                                            </React.Fragment>
                                        );
                                    })
                                ) : Array.isArray(paginatedOrders) ? (
                                    paginatedOrders.map((order, index) => renderOrderRow(order, index))
                                ) : null}
                            </TableBody>
                         </Table>
                    </div>

                    {/* Pagination and Totals Footer */}
                    <CardFooter className="flex-none flex items-center justify-between p-2 border-t">
                        <div className="flex items-center gap-4 text-xs font-medium">
                            <div className='p-2 rounded text-xs bg-slate-800 text-white font-bold'>
                                {selectedRows.length > 0
                                ? `إجمالي المحدد (${selectedRows.length})`
                                : `إجمالي الصفحة (${Array.isArray(paginatedOrders) ? paginatedOrders.length : 0})`
                                }
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="text-muted-foreground">المستحق للتاجر:</span>
                                <span className="font-bold text-primary">{formatCurrency(footerTotals.itemPrice)}</span>
                            </div>
                             <div className="flex items-center gap-1">
                                <span className="text-muted-foreground">أجور التوصيل:</span>
                                <span className="font-bold text-primary">{formatCurrency(footerTotals.deliveryFee + footerTotals.additionalCost)}</span>
                            </div>
                             <div className="flex items-center gap-1">
                                <span className="text-muted-foreground">أجور السائق:</span>
                                <span className="font-bold text-primary">{formatCurrency(footerTotals.driverFee)}</span>
                            </div>
                             <div className="flex items-center gap-1">
                                <span className="text-muted-foreground">المطلوب للشركة:</span>
                                <span className="font-bold text-primary">{formatCurrency(footerTotals.companyDue)}</span>
                            </div>
                             <div className="flex items-center gap-1">
                                <span className="text-muted-foreground">قيمة التحصيل:</span>
                                <span className="font-bold text-primary">{formatCurrency(footerTotals.cod)}</span>
                            </div>
                        </div>
                        {!groupBy && (
                            <div className="flex items-center gap-1">
                                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>السابق</Button>
                                <span className="text-xs p-2">صفحة {page + 1} من {totalPages}</span>
                                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>التالي</Button>
                            </div>
                        )}
                    </CardFooter>
                </Card>
            </TooltipProvider>

            {/* Modals */}
            <AlertDialog open={modalState.type === 'delete'} onOpenChange={(open) => !open && setModalState({ type: 'none' })}>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>تأكيد الحذف</AlertDialogTitle><AlertDialogDescription>هل أنت متأكد من حذف {selectedRows.length} طلبات؟</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>إلغاء</AlertDialogCancel><AlertDialogAction onClick={handleDeleteSelected}>حذف</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

             <Dialog open={modalState.type === 'print'} onOpenChange={(open) => !open && setModalState({type: 'none'})}>
                <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>طباعة البوالص</DialogTitle>
                        <DialogDescription>اختر القالب وقم بمعاينة البوالص قبل الطباعة النهائية.</DialogDescription>
                    </DialogHeader>
                     <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1 min-h-0">
                        <div className="md:col-span-1 flex flex-col gap-4">
                            <Card>
                                <CardHeader className='p-4'><CardTitle className='text-base'>1. اختر القالب</CardTitle></CardHeader>
                                <CardContent className='p-4'>
                                    <RadioGroup
                                        value={selectedTemplate?.id}
                                        onValueChange={(id) => setSelectedTemplate(availableTemplates.find(t => t.id === id) || null)}
                                    >
                                        {availableTemplates.map(template => (
                                            <div key={template.id} className="flex items-center space-x-2 space-x-reverse">
                                                <RadioGroupItem value={template.id} id={`tpl-${template.id}`} />
                                                <Label htmlFor={`tpl-${template.id}`}>{template.name}</Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className='p-4'><CardTitle className='text-base'>2. إجراء الطباعة</CardTitle></CardHeader>
                                <CardContent className='p-4 flex flex-col gap-2'>
                                    <Button onClick={() => printablePolicyRef.current?.handleExport()} className="w-full">
                                        <Icon name="Save" className="ml-2 h-4 w-4 inline" /> طباعة PDF
                                    </Button>
                                    <Button variant="secondary" onClick={() => printablePolicyRef.current?.handleDirectPrint(orders.find(o => o.id === selectedRows[0]), 'zpl')}>
                                        <Icon name="Printer" className="ml-2 h-4 w-4 inline" /> طباعة ZPL (أول طلب)
                                    </Button>
                                    <Button variant="secondary" onClick={() => printablePolicyRef.current?.handleDirectPrint(orders.find(o => o.id === selectedRows[0]), 'escpos')}>
                                        <Icon name="Printer" className="ml-2 h-4 w-4 inline" /> طباعة ESC/POS (أول طلب)
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="md:col-span-3 bg-muted rounded-md flex items-center justify-center overflow-hidden">
                            <ScrollArea className="h-full w-full">
                                <div className="p-4 flex items-center justify-center">
                                    {selectedTemplate && (
                                        <PrintablePolicy ref={printablePolicyRef} orders={orders.filter(o => selectedRows.includes(o.id))} template={selectedTemplate} />
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

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
                                { (modalState.type === 'assignDriver' ? ['علي الأحمد', 'ابو العبد', 'محمد الخالد'] : statuses.filter(s => s.isActive).map(s=>s.name)).map(item => (
                                    <SelectItem key={item} value={item}>{item}</SelectItem>
                                )) }
                            </SelectContent>
                        </Select>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}


// The main page component that wraps the table logic in a Suspense boundary
// This is necessary because the table component uses `useSearchParams`, which requires it.
export function OrdersTable() {
    return (
        <React.Suspense fallback={<Skeleton className="w-full h-screen" />}>
            <OrdersTableComponent />
        </React.Suspense>
    );
}
