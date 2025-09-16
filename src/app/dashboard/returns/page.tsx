

'use client';

import * as React from 'react';
import { useState, useMemo, useEffect, useCallback, useRef, useTransition } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import {
  ListFilter,
  MoreHorizontal,
  PlusCircle,
  Search,
  Trash2,
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
  Loader2,
  ChevronsRight,
  ChevronsLeft,
  ChevronsUpDown,
  Printer,
  ArrowRight,
  ArrowLeft as ArrowLeftIcon,
  Save,
  FileSpreadsheet,
  ChevronsUp,
  ChevronUp,
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
import dynamic from 'next/dynamic';
import Papa from 'papaparse';



import { useToast } from '@/hooks/use-toast';
import { cn } from "@/lib/utils";
import { useOrdersStore, type Order } from '@/store/orders-store';
import { useSettings, type SavedTemplate, readyTemplates } from '@/contexts/SettingsContext';
import { PrintablePolicy } from '@/components/printable-policy';
import { useStatusesStore } from '@/store/statuses-store';
import { useUsersStore } from '@/store/user-store';
import { getOrders, type OrderSortConfig, type FilterDefinition } from '@/app/actions/get-orders';
import { updateOrderAction } from '@/app/actions/update-order';


// ShadCN UI Components
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Icon from '@/components/icon';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';


const CSVLink = dynamic(() => import('react-csv').then(mod => mod.CSVLink), { ssr: false });

type ColumnConfig = { key: keyof Order | 'id-link'; label: string; sortable?: boolean };

// Columns specific to the returns page
const RETURNS_COLUMNS: ColumnConfig[] = [
    { key: 'id-link', label: 'رقم الطلب', sortable: true },
    { key: 'source', label: 'المصدر' },
    { key: 'referenceNumber', label: 'الرقم المرجعي', sortable: true },
    { key: 'recipient', label: 'المستلم', sortable: true },
    { key: 'phone', label: 'الهاتف' },
    { key: 'address', label: 'العنوان' },
    { key: 'region', label: 'المنطقة', sortable: true },
    { key: 'city', label: 'المدينة', sortable: true },
    { key: 'merchant', label: 'التاجر', sortable: true },
    { key: 'status', label: 'الحالة', sortable: true },
    { key: 'previousStatus', label: 'الحالة السابقة', sortable: true },
    { key: 'date', label: 'التاريخ', sortable: true },
    { key: 'notes', label: 'ملاحظات/سبب الإرجاع' },
];

const SEARCHABLE_FIELDS: { key: keyof Order; label: string; type: 'text' | 'select', options?: string[] }[] = [
    { key: 'id', label: 'رقم الطلب', type: 'text' },
    { key: 'referenceNumber', label: 'الرقم المرجعي', type: 'text' },
    { key: 'recipient', label: 'المستلم', type: 'text' },
    { key: 'phone', label: 'الهاتف', type: 'text' },
    { key: 'merchant', label: 'التاجر', type: 'text' },
    { key: 'city', label: 'المدينة', type: 'text' },
    { key: 'region', label: 'المنطقة', type: 'text' },
    { key: 'date', label: 'التاريخ', type: 'text' },
    { key: 'previousStatus', label: 'الحالة السابقة', type: 'text' },
];


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


const AdvancedSearch = ({
      filters,
      onAddFilter,
      onRemoveFilter,
    }: {
      filters: FilterDefinition[];
      onAddFilter: (filter: FilterDefinition) => void;
      onRemoveFilter: (index: number) => void;
    }) => {
      const [popoverOpen, setPopoverOpen] = useState(false);
      const [inputValue, setInputValue] = useState('');
      const [currentField, setCurrentField] = useState<(typeof SEARCHABLE_FIELDS)[number] | null>(null);
      const inputRef = useRef<HTMLInputElement>(null);

      useEffect(() => {
        if (currentField && currentField.type === 'text' && inputRef.current) {
          inputRef.current.focus();
        }
      }, [currentField]);

      const handleSelectField = (fieldKey: string) => {
        const field = SEARCHABLE_FIELDS.find(f => f.key === fieldKey);
        if (field) {
          setCurrentField(field);
          setPopoverOpen(false);
        }
      };

      const handleAddTextFilter = () => {
        if (currentField && inputValue) {
          onAddFilter({
            field: currentField.key,
            operator: 'contains', // Simplified for now
            value: inputValue,
          });
          setCurrentField(null);
          setInputValue('');
        }
      };

      return (
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <div className="flex items-center gap-2 flex-wrap border rounded-lg p-1.5 min-h-[40px] w-full max-w-lg bg-background">
            <Search className="h-4 w-4 text-muted-foreground ml-1" />
            {filters.map((filter, index) => (
              <Badge key={index} variant="secondary" className="gap-1.5">
                {SEARCHABLE_FIELDS.find(f => f.key === filter.field)?.label || filter.field}: {filter.value}
                <button onClick={() => onRemoveFilter(index)} className="rounded-full hover:bg-background/50">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            <PopoverTrigger asChild>
                <div className="flex-1 min-w-[150px]">
                    {currentField ? (
                        <div className="flex items-center gap-1">
                            <span className="text-sm text-muted-foreground">{currentField.label}:</span>
                            <Input
                                ref={inputRef}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddTextFilter()}
                                onBlur={() => { if (!inputValue) setCurrentField(null); }}
                                className="h-7 border-none focus-visible:ring-0 p-1"
                                placeholder="أدخل قيمة..."
                            />
                        </div>
                    ) : (
                        <button className="text-sm text-muted-foreground hover:text-foreground">إضافة فلتر...</button>
                    )}
                </div>
            </PopoverTrigger>
          </div>
          <PopoverContent className="w-[250px] p-0" align="start">
             <Command>
                <CommandInput placeholder="ابحث عن حقل..." />
                <CommandList>
                    <CommandEmpty>لم يتم العثور على حقل.</CommandEmpty>
                    <CommandGroup>
                        {SEARCHABLE_FIELDS.map(field => (
                            <CommandItem key={field.key} onSelect={() => handleSelectField(field.key)}>
                                {field.label}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </CommandList>
             </Command>
          </PopoverContent>
        </Popover>
      );
    };



const ReturnsTable = ({
    orders,
    isLoading,
    columns,
    sortConfig,
    onSort,
    selectedRows,
    onSelectRow,
    onSelectAll,
    isAllSelected,
    isIndeterminate,
}: {
    orders: Order[],
    isLoading: boolean,
    columns: ColumnConfig[],
    sortConfig: OrderSortConfig | null,
    onSort: (key: keyof Order) => void,
    selectedRows: string[],
    onSelectRow: (id: string, checked: boolean) => void,
    onSelectAll: (checked: boolean) => void,
    isAllSelected: boolean,
    isIndeterminate: boolean,
}) => {

    const renderOrderRow = (order: Order, index: number) => {
        return (
            <TableRow key={order.id} data-state={selectedRows.includes(order.id) ? 'selected' : ''}>
                <TableCell className="sticky right-0 z-10 p-2 text-center border-l bg-card data-[state=selected]:bg-primary/20">
                     <Checkbox
                        checked={selectedRows.includes(order.id)}
                        onCheckedChange={(checked) => onSelectRow(order.id, !!checked)}
                    />
                </TableCell>
                <TableCell className="p-2 text-center border-l">{index + 1}</TableCell>
                {columns.map(col => {
                    let content: React.ReactNode = order[col.key as keyof Order] as string;
                    if (col.key === 'id-link') {
                        content = <Link href={`/dashboard/orders/${order.id}`} className="text-primary hover:underline font-mono">{order.id}</Link>
                    } else if (col.key === 'status') {
                        content = <Badge variant="secondary">{order.status}</Badge>
                    } else if (col.key === 'previousStatus') {
                        content = order.previousStatus ? <Badge variant="outline">{order.previousStatus}</Badge> : '-'
                    } else if (col.key === 'date') {
                        content = new Date(order.date).toLocaleDateString('ar-JO');
                    }
                    return <TableCell key={col.key} className="p-2 text-center whitespace-nowrap border-l">{content || '-'}</TableCell>
                })}
            </TableRow>
        )
    }

    return (
        <div className="flex-1 border rounded-lg overflow-auto flex flex-col">
            <Table>
                <TableHeader className="sticky top-0 z-20">
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="sticky right-0 z-30 p-2 text-center border-l w-12 bg-slate-800">
                           <Checkbox
                                checked={isAllSelected}
                                onCheckedChange={(e) => onSelectAll(e as boolean)}
                                indeterminate={isIndeterminate}
                                aria-label="Select all rows"
                                className='border-white data-[state=checked]:bg-white data-[state=checked]:text-slate-800 data-[state=indeterminate]:bg-white data-[state=indeterminate]:text-slate-800'
                            />
                        </TableHead>
                        <TableHead className="w-12 text-center border-l bg-slate-800 text-white">#</TableHead>
                        {columns.map(col => (
                            <TableHead key={col.key} className="p-2 text-center whitespace-nowrap border-b border-l bg-slate-800 !text-white hover:!bg-slate-700 transition-colors duration-200">
                                 {col.sortable ? (
                                    <Button variant="ghost" onClick={() => onSort(col.key as keyof Order)} className="text-white hover:bg-transparent hover:text-white w-full p-0 h-auto">
                                        {col.label}
                                        <ArrowUpDown className="mr-2 h-3 w-3 text-white" />
                                    </Button>
                                ) : <span className='text-white'>{col.label}</span>}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                {isLoading ? (
                    Array.from({ length: 10 }).map((_, i) => (
                        <TableRow key={`skel-${i}`}>
                            <TableCell className="text-center border-l"><Checkbox disabled/></TableCell>
                             <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                            {columns.map(c => <TableCell key={c.key}><Skeleton className="h-4 w-full" /></TableCell>)}
                        </TableRow>
                    ))
                ) : orders.length === 0 ? (
                     <TableRow><TableCell colSpan={columns.length + 2} className="h-24 text-center">لا توجد مرتجعات لهذا التاجر.</TableCell></TableRow>
                ) : orders.map((order, index) => renderOrderRow(order, index)) }
                </TableBody>
            </Table>
        </div>
    );
};

const mockStatements = [
    { id: 'STMT-001', date: '2024-07-20', itemCount: 5, status: 'مدفوع' },
    { id: 'STMT-002', date: '2024-07-13', itemCount: 8, status: 'مدفوع' },
    { id: 'STMT-003', date: '2024-07-06', itemCount: 3, status: 'بانتظار الدفع' },
];

const ReturnsManagementPage = () => {
    const { statuses } = useStatusesStore();
    const { users } = useUsersStore();
    
    const [allReturnedOrders, setAllReturnedOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMerchant, setSelectedMerchant] = useState<string | null>(null);

    const [filters, setFilters] = useState<FilterDefinition[]>([]);
    const [sortConfig, setSortConfig] = useState<OrderSortConfig | null>(null);
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    
    const [columns, setColumns] = useState<ColumnConfig[]>(RETURNS_COLUMNS);
    const [visibleColumnKeys, setVisibleColumnKeys] = useState<string[]>(RETURNS_COLUMNS.map(c => c.key));
    const sensors = useSensors(useSensor(PointerSensor));
    
    const COLUMN_SETTINGS_KEY = 'returnsTableColumnSettings';

    useEffect(() => {
        try {
            const savedColumnSettings = localStorage.getItem(COLUMN_SETTINGS_KEY);
            if (savedColumnSettings) {
                const { savedColumns, savedVisibleKeys } = JSON.parse(savedColumnSettings);
                setColumns(savedColumns);
                setVisibleColumnKeys(savedVisibleKeys);
            }
        } catch (e) { console.error(e); }
    }, []);

    useEffect(() => {
        const settingsToSave = JSON.stringify({ savedColumns: columns, savedVisibleKeys: visibleColumnKeys });
        localStorage.setItem(COLUMN_SETTINGS_KEY, settingsToSave);
    }, [columns, visibleColumnKeys]);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            // Hardcoded filter for returned orders
            const baseFilters: FilterDefinition[] = [{ field: 'status', operator: 'equals', value: 'مرجع للفرع' }];
            const result = await getOrders({
                page: 0,
                rowsPerPage: 9999, // Fetch all for now, no pagination in this view
                sortConfig,
                filters: [...baseFilters, ...filters],
            });
            setAllReturnedOrders(result.orders);
        } catch (error) {
            console.error("Failed to fetch returned orders", error);
        } finally {
            setIsLoading(false);
        }
    }, [sortConfig, filters]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const returnsByMerchant = useMemo(() => {
        return allReturnedOrders.reduce((acc, order) => {
                const merchantName = order.merchant;
                if (!acc[merchantName]) {
                    acc[merchantName] = [];
                }
                acc[merchantName].push(order);
                return acc;
            }, {} as Record<string, Order[]>);
    }, [allReturnedOrders]);

    const merchantsWithReturns = Object.keys(returnsByMerchant);
    
    const selectedOrders = useMemo(() => {
        return selectedMerchant ? returnsByMerchant[selectedMerchant] || [] : [];
    }, [selectedMerchant, returnsByMerchant]);

    useEffect(() => {
        if (!selectedMerchant && merchantsWithReturns.length > 0) {
            setSelectedMerchant(merchantsWithReturns[0]);
        }
    }, [merchantsWithReturns, selectedMerchant]);
    
    // When merchant changes, clear selection
    useEffect(() => {
      setSelectedRows([]);
    }, [selectedMerchant]);

    const visibleColumns = useMemo(() => columns.filter(c => visibleColumnKeys.includes(c.key)), [columns, visibleColumnKeys]);
    
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
    
    const handleSelectAll = (checked: boolean) => {
        setSelectedRows(checked ? selectedOrders.map(o => o.id) : []);
    };
    
    const isAllSelected = selectedOrders.length > 0 && selectedRows.length === selectedOrders.length;
    const isIndeterminate = selectedRows.length > 0 && selectedRows.length < selectedOrders.length;


    const renderSidebar = () => {
        return (
            <Card className="h-full">
                <CardHeader className="p-4">
                    <CardTitle className="text-lg">قائمة التجار</CardTitle>
                    <CardDescription>التجار الذين لديهم مرتجعات في الفرع</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <ScrollArea className="h-[calc(100vh-16rem)]">
                        {merchantsWithReturns.map(merchant => (
                            <button
                                key={merchant}
                                onClick={() => setSelectedMerchant(merchant)}
                                className={cn(
                                    "w-full text-right flex justify-between items-center p-4 border-b hover:bg-muted/50 transition-colors",
                                    selectedMerchant === merchant && "bg-primary/10 text-primary"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <Store className="h-4 w-4" />
                                    <span className="font-medium">{merchant}</span>
                                </div>
                                <Badge variant={selectedMerchant === merchant ? "default" : "secondary"}>
                                    {returnsByMerchant[merchant]?.length || 0}
                                </Badge>
                            </button>
                        ))}
                        {isLoading && Array.from({length: 5}).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                        {!isLoading && merchantsWithReturns.length === 0 && <p className="p-4 text-center text-muted-foreground">لا توجد مرتجعات حالياً.</p>}
                    </ScrollArea>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex-row items-center justify-between gap-4 p-4 md:p-6">
                    <div>
                        <CardTitle className="text-2xl">إدارة المرتجعات</CardTitle>
                        <CardDescription>تتبع وإدارة جميع الشحنات المرتجعة للفرع.</CardDescription>
                    </div>
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/dashboard"><ArrowLeftIcon className="h-4 w-4" /></Link>
                    </Button>
                </CardHeader>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-3">
                    {renderSidebar()}
                </div>
                <div className="md:col-span-9 space-y-6">
                    <Card className="h-full flex flex-col">
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                <div>
                                    <CardTitle>
                                        مرتجعات التاجر: <span className="text-primary">{selectedMerchant}</span>
                                    </CardTitle>
                                     <CardDescription>
                                        إجمالي {selectedOrders.length} طلبات مرتجعة لهذا التاجر.
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                     <AdvancedSearch
                                        filters={filters}
                                        onAddFilter={(filter) => setFilters(prev => [...prev, filter])}
                                        onRemoveFilter={(index) => setFilters(prev => prev.filter((_, i) => i !== index))}
                                     />
                                     <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm" className="gap-1">
                                                <ListOrdered className="h-4 w-4" />
                                                <span>الأعمدة</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-64 p-2 max-h-[400px] flex flex-col">
                                            <DropdownMenuLabel>إظهار/إخفاء الأعمدة</DropdownMenuLabel>
                                            <div className='flex items-center gap-2 p-1'>
                                                <Button variant="link" size="sm" className='h-auto p-1' onClick={() => setVisibleColumnKeys(RETURNS_COLUMNS.map(c => c.key))}>إظهار الكل</Button>
                                                <Separator orientation="vertical" className="h-4" />
                                                <Button variant="link" size="sm" className='h-auto p-1' onClick={() => setVisibleColumnKeys(['id-link', 'recipient', 'status'])}>إخفاء الكل</Button>
                                            </div>
                                            <DropdownMenuSeparator />
                                            <div className="flex-1 min-h-0 overflow-auto">
                                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleColumnDragEnd}>
                                                    <SortableContext items={columns.map(c => c.key)} strategy={verticalListSortingStrategy}>
                                                        {RETURNS_COLUMNS.map((column) => (
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
                                            </div>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col">
                             <div className="flex items-center gap-2 mb-4">
                                <Button variant="default" size="sm" disabled={selectedRows.length === 0}>
                                    إنشاء كشف مرتجع للتاجر
                                </Button>
                                <Button variant="outline" size="sm" disabled={selectedRows.length === 0}>
                                    <FileText className="ml-2 h-4 w-4" /> تصدير الكشف المحدد
                                </Button>
                                <Button variant="outline" size="sm">
                                    <Download className="ml-2 h-4 w-4" /> تصدير كل المرتجعات
                                </Button>
                            </div>
                            <ReturnsTable
                                orders={selectedOrders}
                                isLoading={isLoading}
                                columns={visibleColumns}
                                onSort={(key) => {
                                    setSortConfig(prev => {
                                        if (prev?.key === key) {
                                            return { ...prev, direction: prev.direction === 'ascending' ? 'descending' : 'ascending' };
                                        }
                                        return { key, direction: 'ascending' };
                                    });
                                }}
                                sortConfig={sortConfig}
                                selectedRows={selectedRows}
                                onSelectRow={(id, checked) => setSelectedRows(prev => checked ? [...prev, id] : prev.filter(rowId => rowId !== id))}
                                onSelectAll={handleSelectAll}
                                isAllSelected={isAllSelected}
                                isIndeterminate={isIndeterminate}
                            />
                        </CardContent>
                         <CardFooter className="p-2 border-t">
                            <span className="text-xs text-muted-foreground">
                                إجمالي {selectedOrders.length} طلبات
                            </span>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>الكشوفات المصدرة للتاجر</CardTitle>
                            <CardDescription>
                                قائمة بالكشوفات التي تم إنشاؤها مسبقًا لهذا التاجر.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>رقم الكشف</TableHead>
                                        <TableHead>تاريخ الإنشاء</TableHead>
                                        <TableHead>عدد القطع</TableHead>
                                        <TableHead>الحالة</TableHead>
                                        <TableHead className="text-left">إجراءات</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {mockStatements.map((stmt) => (
                                        <TableRow key={stmt.id}>
                                            <TableCell className="font-mono">{stmt.id}</TableCell>
                                            <TableCell>{stmt.date}</TableCell>
                                            <TableCell>{stmt.itemCount}</TableCell>
                                            <TableCell>
                                                <Badge variant={stmt.status === 'مدفوع' ? 'default' : 'secondary'} className={stmt.status === 'مدفوع' ? 'bg-green-100 text-green-700' : ''}>
                                                    {stmt.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-left">
                                                <Button variant="outline" size="sm">
                                                    <Printer className="ml-2 h-4 w-4" /> طباعة
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default function ReturnsPage() {
    return (
        <React.Suspense fallback={<Skeleton className="w-full h-screen" />}>
            <ReturnsManagementPage />
        </React.Suspense>
    )
}
