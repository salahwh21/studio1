

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
  ChevronsDown,
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
import { type Order } from '@/store/orders-store';
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
import { Switch } from '@/components/ui/switch';


const CSVLink = dynamic(() => import('react-csv').then(mod => mod.CSVLink), { ssr: false });

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
    | { type: 'print' }
    | { type: 'export' };

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

const SEARCHABLE_FIELDS: { key: keyof Order; label: string; type: 'text' | 'select', options?: string[] }[] = [
    { key: 'id', label: 'رقم الطلب', type: 'text' },
    { key: 'referenceNumber', label: 'الرقم المرجعي', type: 'text' },
    { key: 'recipient', label: 'المستلم', type: 'text' },
    { key: 'phone', label: 'الهاتف', type: 'text' },
    { key: 'address', label: 'العنوان', type: 'text' },
    { key: 'status', label: 'الحالة', type: 'select', options: [] },
    { key: 'driver', label: 'السائق', type: 'select', options: [] },
    { key: 'merchant', label: 'التاجر', type: 'select', options: [] },
    { key: 'city', label: 'المدينة', type: 'text' },
    { key: 'region', label: 'المنطقة', type: 'text' },
    { key: 'date', label: 'التاريخ', type: 'text' },
];

const ExportDataDialog = ({
    open,
    onOpenChange,
    allColumns,
    initialVisibleColumns,
    ordersToExport,
    isClient,
  }: {
    open: boolean;
    onOpenChange: (isOpen: boolean) => void;
    allColumns: ColumnConfig[];
    initialVisibleColumns: ColumnConfig[];
    ordersToExport: Order[];
    isClient: boolean;
  }) => {
    const { toast } = useToast();
    const [exportPurpose, setExportPurpose] = useState('all_data');
    const [fileFormat, setFileFormat] = useState('csv');
    
    const [availableFields, setAvailableFields] = useState<ColumnConfig[]>([]);
    const [exportedFields, setExportedFields] = useState<ColumnConfig[]>([]);
    const [selectedAvailable, setSelectedAvailable] = useState<string[]>([]);
    const [selectedExported, setSelectedExported] = useState<string[]>([]);

    const EXPORT_FIELDS_KEY = 'ordersExportFieldsSettings';
  
    useEffect(() => {
        if(open) {
            const savedFieldsJson = localStorage.getItem(EXPORT_FIELDS_KEY);
            if (savedFieldsJson) {
                const savedFieldKeys: string[] = JSON.parse(savedFieldsJson);
                const savedExportedFields = savedFieldKeys.map((key: string) => allColumns.find(c => c.key === key)).filter((c): c is ColumnConfig => !!c);
                const savedAvailableFields = allColumns.filter(col => !savedFieldKeys.includes(col.key));
                setExportedFields(savedExportedFields);
                setAvailableFields(savedAvailableFields);
            } else {
                setExportedFields(initialVisibleColumns);
                setAvailableFields(allColumns.filter(c => !initialVisibleColumns.some(vc => vc.key === c.key)));
            }
        }
    }, [open, allColumns, initialVisibleColumns]);

    const handleSaveFields = () => {
        const fieldKeys = exportedFields.map(f => f.key);
        localStorage.setItem(EXPORT_FIELDS_KEY, JSON.stringify(fieldKeys));
        toast({ title: "تم الحفظ", description: "تم حفظ قائمة الحقول المصدرة." });
    };

    const handleFieldClick = (key: string, list: 'available' | 'exported') => {
        const selector = list === 'available' ? setSelectedAvailable : setSelectedExported;
        selector(prev => 
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        );
    };

    const handleMove = (direction: 'add' | 'remove' | 'add_all' | 'remove_all') => {
        if (direction === 'add') {
            const toMove = availableFields.filter(f => selectedAvailable.includes(f.key));
            setExportedFields(prev => [...prev, ...toMove]);
            setAvailableFields(prev => prev.filter(f => !selectedAvailable.includes(f.key)));
            setSelectedAvailable([]);
        } else if (direction === 'remove') {
            const toMove = exportedFields.filter(f => selectedExported.includes(f.key));
            setAvailableFields(prev => [...prev, ...toMove]);
            setExportedFields(prev => prev.filter(f => !selectedExported.includes(f.key)));
            setSelectedExported([]);
        } else if (direction === 'add_all') {
            setExportedFields(allColumns);
            setAvailableFields([]);
        } else if (direction === 'remove_all') {
            setAvailableFields(allColumns);
            setExportedFields([]);
        }
    };
    
    const handleReorder = (direction: 'up' | 'down' | 'top' | 'bottom') => {
        if(selectedExported.length !== 1) return;
        const id = selectedExported[0];
        const currentIndex = exportedFields.findIndex(f => f.key === id);
        if (currentIndex === -1) return;

        let newIndex = currentIndex;
        if (direction === 'up' && currentIndex > 0) newIndex = currentIndex - 1;
        if (direction === 'down' && currentIndex < exportedFields.length - 1) newIndex = currentIndex + 1;
        if (direction === 'top') newIndex = 0;
        if (direction === 'bottom') newIndex = exportedFields.length - 1;

        if (newIndex !== currentIndex) {
            setExportedFields(prev => {
                const newArray = [...prev];
                const [item] = newArray.splice(currentIndex, 1);
                newArray.splice(newIndex, 0, item);
                return newArray;
            });
        }
    }
    
    const handleExport = async () => {
        const headers = exportedFields.map(field => field.label);
        const dataRows = ordersToExport.map(order => {
            return exportedFields.map(field => {
                return order[field.key as keyof Order] ?? '';
            });
        });

        if (fileFormat === 'csv') {
            const csvData = Papa.unparse([headers, ...dataRows]);
            const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvData], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.setAttribute('download', 'orders_export.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
             toast({ variant: 'destructive', title: 'غير متوفر', description: 'تصدير Excel غير متوفر حاليًا.' });
        }
    }
  
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <DialogHeader><DialogTitle>تصدير البيانات</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
              <div className="space-y-4">
                  <div className="space-y-2">
                      <Label className="font-semibold">ما الذي تريد فعله؟</Label>
                      <RadioGroup value={exportPurpose} onValueChange={setExportPurpose} className="space-y-1">
                          <div className="flex items-center space-x-2 space-x-reverse"><RadioGroupItem value="all_data" id="r1_exp" /><Label htmlFor="r1_exp">استخدام البيانات في الجدول (تصدير كافة البيانات)</Label></div>
                          <div className="flex items-center space-x-2 space-x-reverse"><RadioGroupItem value="update_data" id="r2_exp" /><Label htmlFor="r2_exp">تحديث البيانات (تصدير صالح للاستيراد)</Label></div>
                      </RadioGroup>
                  </div>
                   <div className="space-y-2">
                      <Label className="font-semibold">صيغة الملف المصدر:</Label>
                       <RadioGroup value={fileFormat} onValueChange={setFileFormat} className="flex gap-4">
                          <div className="flex items-center space-x-2 space-x-reverse"><RadioGroupItem value="excel" id="f_excel" /><Label htmlFor="f_excel">Excel</Label></div>
                          <div className="flex items-center space-x-2 space-x-reverse"><RadioGroupItem value="csv" id="f_csv" /><Label htmlFor="f_csv">CSV</Label></div>
                      </RadioGroup>
                  </div>
              </div>
              <div className="flex flex-col items-center justify-center bg-muted rounded-md p-4 space-y-4">
                  <Icon name="FileSpreadsheet" className="w-24 h-24 text-muted-foreground" />
                  <p className="text-center text-muted-foreground">سيتم تصدير {ordersToExport.length} سجلات مع {exportedFields.length} حقول.</p>
                  <div className="w-full space-y-2">
                    <Button onClick={handleExport} className="w-full"><Download className="ml-2 h-4 w-4" /> تصدير لملف</Button>
                    <DialogClose asChild><Button variant="outline" className="w-full">إقفال</Button></DialogClose>
                  </div>
              </div>
          </div>
          
            <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center pt-4 border-t">
                <div className="flex flex-col gap-2">
                    <Label>الحقول المتاحة</Label>
                    <ScrollArea className="h-64 border rounded-md p-2">
                        {availableFields.map(field => (
                            <div key={field.key} onClick={() => handleFieldClick(field.key, 'available')} className={cn("p-2 text-sm rounded-md cursor-pointer hover:bg-muted", selectedAvailable.includes(field.key) && "bg-primary/10 text-primary ring-1 ring-primary")}>{field.label}</div>
                        ))}
                    </ScrollArea>
                </div>
                <div className="flex flex-col gap-2 justify-center">
                    <Button variant="outline" size="sm" onClick={() => handleMove('add')} disabled={selectedAvailable.length === 0}>إضافة <ArrowLeftIcon className="mr-2 h-4"/></Button>
                    <Button variant="outline" size="sm" onClick={() => handleMove('remove')} disabled={selectedExported.length === 0}>إزالة <ArrowRight className="mr-2 h-4"/></Button>
                    <Separator className="my-2"/>
                    <Button variant="outline" size="icon" onClick={() => handleReorder('top')} disabled={selectedExported.length !== 1}> <ChevronsUp className="h-4"/> </Button>
                    <Button variant="outline" size="icon" onClick={() => handleReorder('up')} disabled={selectedExported.length !== 1}> <ChevronUp className="h-4"/> </Button>
                    <Button variant="outline" size="icon" onClick={() => handleReorder('down')} disabled={selectedExported.length !== 1}> <ChevronDown className="h-4"/> </Button>
                    <Button variant="outline" size="icon" onClick={() => handleReorder('bottom')} disabled={selectedExported.length !== 1}> <ChevronsDown className="h-4"/> </Button>
                    <Separator className="my-2"/>
                    <Button variant="outline" size="sm" onClick={() => handleMove('remove_all')}>إزالة الكل</Button>
                </div>
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <Label>الحقول المراد تصديرها</Label>
                        <Button variant="link" size="sm" className="h-auto p-0" onClick={handleSaveFields}>حفظ قائمة الحقول</Button>
                    </div>
                     <ScrollArea className="h-64 border rounded-md p-2">
                        {exportedFields.map(field => (
                            <div key={field.key} onClick={() => handleFieldClick(field.key, 'exported')} className={cn("p-2 text-sm rounded-md cursor-pointer hover:bg-muted", selectedExported.includes(field.key) && "bg-primary/10 text-primary ring-1 ring-primary")}>{field.label}</div>
                        ))}
                    </ScrollArea>
                </div>
            </div>

        </DialogContent>
      </Dialog>
    );
  };

const OrdersTableComponent = () => {
    const { toast } = useToast();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    
    const [isClient, setIsClient] = useState(false);
    const context = useSettings();
    const { formatCurrency } = context;
    const { statuses } = useStatusesStore();
    const { users } = useUsersStore();

    const drivers = useMemo(() => users.filter(u => u.roleId === 'driver'), [users]);
    const merchants = useMemo(() => users.filter(u => u.roleId === 'merchant'), [users]);
    
    const [orders, setOrders] = useState<Order[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(100);
    const [sortConfig, setSortConfig] = useState<OrderSortConfig | null>(null);
    const [filters, setFilters] = useState<FilterDefinition[]>([]);
    const [globalSearch, setGlobalSearch] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);


    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [modalState, setModalState] = useState<ModalState>({ type: 'none' });
    const isMobile = useMediaQuery('(max-width: 1024px)');
    const [groupBy, setGroupBy] = useState<GroupByOption>(null);
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
    
    const [columns, setColumns] = useState<ColumnConfig[]>(ALL_COLUMNS);
    const [visibleColumnKeys, setVisibleColumnKeys] = useState<string[]>(ALL_COLUMNS.map(c => c.key));
    const sensors = useSensors(useSensor(PointerSensor));

    const [availableTemplates, setAvailableTemplates] = useState<SavedTemplate[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<SavedTemplate | null>(null);
    const printablePolicyRef = useRef<{ handleExport: () => void; handleDirectPrint: (order: any, type: 'zpl' | 'escpos') => Promise<void> }>(null);

    const COLUMN_SETTINGS_KEY = 'ordersTableColumnSettings';

    useEffect(() => { 
        setIsClient(true);
        try {
            const savedTemplatesJson = localStorage.getItem('policyTemplates');
            const userTemplates = savedTemplatesJson ? JSON.parse(savedTemplatesJson) : [];
            const uniqueTemplates = [...readyTemplates];
            const readyIds = new Set(readyTemplates.map(t => t.id));
            userTemplates.forEach((t: SavedTemplate) => {
                if (!readyIds.has(t.id)) {
                    uniqueTemplates.push(t);
                }
            });
            setAvailableTemplates(uniqueTemplates);

            const savedColumnSettings = localStorage.getItem(COLUMN_SETTINGS_KEY);
            if (savedColumnSettings) {
                const { savedColumns, savedVisibleKeys } = JSON.parse(savedColumnSettings);
                if (Array.isArray(savedColumns) && Array.isArray(savedVisibleKeys)) {
                    setColumns(savedColumns);
                    setVisibleColumnKeys(savedVisibleKeys);
                }
            }

        } catch (e) {
            setAvailableTemplates(readyTemplates);
        }
    }, []);

    useEffect(() => {
        if (isClient) {
            const settingsToSave = JSON.stringify({ savedColumns: columns, savedVisibleKeys: visibleColumnKeys });
            localStorage.setItem(COLUMN_SETTINGS_KEY, settingsToSave);
        }
    }, [columns, visibleColumnKeys, isClient]);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const statusFilter = searchParams.get('status');
            const driverFilter = searchParams.get('driver');

            let allFilters = [...filters];
            if (statusFilter) allFilters.push({ field: 'status', operator: 'equals', value: statusFilter });
            if (driverFilter) allFilters.push({ field: 'driver', operator: 'equals', value: driverFilter });

            const result = await getOrders({
                page: groupBy ? 0 : page,
                rowsPerPage: groupBy ? 9999 : rowsPerPage,
                sortConfig,
                filters: allFilters,
                globalSearch: globalSearch,
            });
            setOrders(result.orders);
            setTotalCount(result.totalCount);
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'فشل جلب البيانات', description: 'حدث خطأ أثناء تحميل الطلبات.' });
        } finally {
            setIsLoading(false);
        }
    }, [page, rowsPerPage, filters, sortConfig, searchParams, groupBy, toast, globalSearch]);

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchData();
        }, 300); // Debounce search
        return () => clearTimeout(handler);
    }, [fetchData]);
    
    useEffect(() => {
        setOpenGroups({});
    }, [groupBy]);
    
    const visibleColumns = useMemo(() => columns.filter(c => visibleColumnKeys.includes(c.key)), [columns, visibleColumnKeys]);
    
    const groupedOrders = useMemo(() => {
        if (!groupBy) {
            return null;
        }
        return orders.reduce((acc: GroupedOrders, order) => {
            const key = order[groupBy] as string;
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(order);
            return acc;
        }, {});
    }, [orders, groupBy]);

    const totalPages = groupBy ? 1 : Math.ceil(totalCount / rowsPerPage);

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
        if (!groupBy || !groupedOrders) return [];
        return Object.entries(groupedOrders).reduce((acc: Order[], [groupKey, groupOrders]) => {
            const isGroupOpen = openGroups[groupKey] ?? false; 
            if (isGroupOpen) {
                return [...acc, ...groupOrders];
            }
            return acc;
        }, []);
    }, [groupedOrders, groupBy, openGroups]);
    
    const currentOrderList = groupBy ? visibleOrdersInOpenGroups : orders;

    const isAllSelected = currentOrderList.length > 0 && selectedRows.length > 0 && currentOrderList.every(o => selectedRows.includes(o.id));
    const isIndeterminate = selectedRows.length > 0 && !isAllSelected;

    const areAllGroupsOpen = useMemo(() => {
        if (!groupedOrders) return false;
        const groupKeys = Object.keys(groupedOrders);
        if (groupKeys.length === 0) return false;
        return groupKeys.every(key => openGroups[key]);
    }, [groupedOrders, openGroups]);

    const toggleAllGroups = () => {
        if (!groupedOrders) return;
        if (areAllGroupsOpen) {
            setOpenGroups({});
        } else {
            const newOpenGroups: Record<string, boolean> = {};
            for (const key in groupedOrders) {
                newOpenGroups[key] = true;
            }
            setOpenGroups(newOpenGroups);
        }
    };


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
    
    const footerTotals = useMemo(() => {
        const listForCalculation = selectedRows.length > 0 
            ? orders.filter(o => selectedRows.includes(o.id))
            : (groupBy ? [] : orders);
        
        return listForCalculation.reduce((acc, order) => {
            acc.itemPrice += order.itemPrice || 0;
            acc.deliveryFee += order.deliveryFee || 0;
            acc.cod += order.cod || 0;
            acc.driverFee += (order.driverFee || 0) + (order.driverAdditionalFare || 0);
            acc.additionalCost += order.additionalCost || 0;
            acc.companyDue += (order.deliveryFee + (order.additionalCost || 0)) - ((order.driverFee || 0) + (order.driverAdditionalFare || 0));
            return acc;
        }, { itemPrice: 0, deliveryFee: 0, cod: 0, driverFee: 0, additionalCost: 0, companyDue: 0 });
    }, [orders, selectedRows, groupBy]);

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
        fetchData();
        toast({ title: "تم تحديث البيانات" });
    }

    const handleUpdateField = (orderId: string, field: keyof Order, value: any) => {
        startTransition(async () => {
            const originalOrders = [...orders];
            
            const updatedOrders = orders.map(o => o.id === orderId ? { ...o, [field]: value } : o);
            setOrders(updatedOrders);

            const result = await updateOrderAction({ orderId, field, value });
            
            if (!result.success) {
                setOrders(originalOrders);
                toast({
                    variant: 'destructive',
                    title: `فشل تحديث ${field}`,
                    description: result.error,
                });
            } else {
                 toast({
                    title: `تم تحديث الحقل`,
                });
            }
        });
    };

    const getStatusInfo = (statusValue: string) => {
        return statuses.find(s => s.name === statusValue) || { name: statusValue, icon: 'Package', color: '#808080' };
    };

    const searchableFieldsWithOptions = useMemo(() => {
        return SEARCHABLE_FIELDS.map(field => {
            if (field.key === 'status') return { ...field, options: statuses.map(s => s.name) };
            if (field.key === 'driver') return { ...field, options: drivers.map(d => d.name) };
            if (field.key === 'merchant') return { ...field, options: merchants.map(m => m.storeName || m.name) };
            return field;
        });
    }, [statuses, drivers, merchants]);
    
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
      const [currentField, setCurrentField] = useState<(typeof searchableFieldsWithOptions)[number] | null>(null);
      const inputRef = useRef<HTMLInputElement>(null);
    
      useEffect(() => {
        if (currentField && currentField.type === 'text' && inputRef.current) {
          inputRef.current.focus();
        }
      }, [currentField]);
    
      const handleSelectField = (fieldKey: string) => {
        const field = searchableFieldsWithOptions.find(f => f.key === fieldKey);
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
    
      const handleAddSelectFilter = (value: string) => {
        if (currentField) {
          onAddFilter({
              field: currentField.key,
              operator: 'equals',
              value: value,
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
                {searchableFieldsWithOptions.find(f => f.key === filter.field)?.label || filter.field}: {filter.value}
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
                            {currentField.type === 'text' ? (
                                <Input
                                    ref={inputRef}
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddTextFilter()}
                                    onBlur={() => { if (!inputValue) setCurrentField(null); }}
                                    className="h-7 border-none focus-visible:ring-0 p-1"
                                    placeholder="أدخل قيمة..."
                                />
                            ) : (
                                 <Select onValueChange={handleAddSelectFilter}>
                                    <SelectTrigger className="h-7 border-none focus:ring-0 p-1 w-auto text-muted-foreground">
                                        <SelectValue placeholder="اختر قيمة..."/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {currentField.options?.map(opt => (
                                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
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
                        {searchableFieldsWithOptions.map(field => (
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

    const renderOrderRow = (order: Order, index: number) => {
        return (
            <TableRow key={order.id} data-state={selectedRows.includes(order.id) ? 'selected' : ''} className="hover:bg-muted/50">
                <TableCell className="sticky right-0 z-10 p-2 text-center border-l bg-card dark:bg-slate-900 data-[state=selected]:bg-primary/20">
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
                            content = (
                                <Select disabled={!isEditMode} value={value as string} onValueChange={(newValue) => handleUpdateField(order.id, 'status', newValue)}>
                                    <SelectTrigger className="bg-transparent border-0 focus:ring-0 focus:ring-offset-0 h-8 p-0 w-full disabled:opacity-100 disabled:cursor-default">
                                        <SelectValue asChild>
                                            <div className="flex items-center justify-center font-semibold text-xs px-2.5 py-0.5 rounded-sm w-[180px] mx-auto h-full" style={{ backgroundColor: `${sInfo.color}20`, color: sInfo.color }}>
                                                <div className="flex items-center justify-center w-full gap-2">
                                                    <Icon name={sInfo.icon as any} className="h-4 w-4 ml-2"/>
                                                    <span>{sInfo.name}</span>
                                                </div>
                                            </div>
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statuses.filter(s => s.isActive).map(status => (
                                            <SelectItem key={status.id} value={status.name}>
                                                <div className="flex items-center gap-2">
                                                    <Icon name={status.icon as any} className="h-4 w-4" style={{ color: status.color }}/>
                                                    {status.name}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            );
                            break;
                        case 'merchant':
                        case 'driver':
                            const options = col.key === 'merchant' ? merchants : drivers;
                            content = (
                                <Popover>
                                    <PopoverTrigger asChild disabled={!isEditMode}>
                                        <Button variant="ghost" className="w-full h-8 justify-between hover:bg-muted font-normal border disabled:opacity-100 disabled:cursor-default disabled:border-transparent">
                                            {value as string}
                                            <ArrowUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[200px] p-0">
                                        <Command>
                                            <CommandInput placeholder="بحث..."/>
                                            <CommandList>
                                                <CommandEmpty>لم يتم العثور على نتائج.</CommandEmpty>
                                                <CommandGroup>
                                                    {options.map(item => (
                                                        <CommandItem
                                                            key={item.id}
                                                            value={item.name}
                                                            onSelect={(currentValue) => {
                                                                const selectedName = options.find(o => (o.storeName || o.name).toLowerCase() === currentValue)?.name || '';
                                                                handleUpdateField(order.id, col.key, col.key === 'merchant' ? (options.find(o => (o.storeName || o.name).toLowerCase() === currentValue)?.storeName || '') : selectedName);
                                                            }}
                                                        >
                                                            <Check className={cn("mr-2 h-4 w-4", value === (item.storeName || item.name) ? "opacity-100" : "opacity-0")} />
                                                            {item.storeName || item.name}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            );
                            break;
                        case 'previousStatus':
                            content = value ? <Badge variant="secondary">{value as string}</Badge> : '-';
                            break;
                        case 'companyDue':
                             content = formatCurrency((order.deliveryFee || 0) + (order.additionalCost || 0) - ((order.driverFee || 0) + (order.driverAdditionalFare || 0)));
                             break;
                        case 'itemPrice':
                        case 'deliveryFee':
                        case 'driverFee':
                        case 'cod':
                        case 'additionalCost':
                        case 'driverAdditionalFare':
                            content = (
                                <Input
                                    type="number"
                                    defaultValue={value as number}
                                    onBlur={(e) => handleUpdateField(order.id, col.key, parseFloat(e.target.value) || 0)}
                                    className="h-8 text-center border-0 focus-visible:ring-offset-0 focus-visible:ring-2 bg-transparent hover:bg-muted disabled:opacity-100 disabled:cursor-default"
                                    disabled={!isEditMode}
                                />
                            );
                            break;
                        default:
                             content = (
                                <Input
                                    defaultValue={value as string}
                                    onBlur={(e) => handleUpdateField(order.id, col.key, e.target.value)}
                                    className="h-8 text-center border-0 focus-visible:ring-offset-0 focus-visible:ring-2 bg-transparent hover:bg-muted disabled:opacity-100 disabled:cursor-default"
                                    disabled={!isEditMode}
                                />
                            );
                    }
                    return <TableCell key={col.key} className="p-2 text-center border-l text-sm">{content}</TableCell>
                })}
            </TableRow>
        )
    }

    if (!isClient) {
        return <Skeleton className="w-full h-screen" />;
    }

    if (isMobile) {
        return (
            <div className="flex flex-col h-full">
                <div className="flex-none p-4 flex-row items-center justify-between flex flex-wrap gap-2 border-b bg-background">
                     <div className="relative w-full max-w-xs">
                        <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="بحث شامل..." className="pr-8" />
                    </div>
                    <div className="flex items-center gap-2">
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                 <Button variant="outline" size="icon" className="h-9 w-9"><ListFilter className="h-4 w-4"/></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem><PlusCircle className="ml-2 h-4 w-4" /> إضافة طلب</DropdownMenuItem>
                                <DropdownMenuItem><Trash2 className="ml-2 h-4 w-4" /> حذف المحدد</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-3">
                    {orders.map(order => {
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
                                    <div className="row-span-3 flex items-center justify-center">
                                        <Checkbox checked={selectedRows.includes(order.id)} onCheckedChange={(checked) => handleSelectRow(order.id, !!checked)} className="h-5 w-5"/>
                                    </div>
                                    <div className="col-start-2 col-end-3 space-y-1">
                                        <div className="flex items-center gap-2 font-medium"><User className="h-4 w-4 text-muted-foreground"/><span>{order.recipient}</span></div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground"><Phone className="h-4 w-4"/><span>{order.phone}</span></div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4"/><span>{order.address}, {order.city}</span></div>
                                    </div>
                                    <div className="col-start-3 col-end-4 row-span-2 flex flex-col items-end justify-start gap-1">
                                        <Badge className={cn("gap-1.5")} style={{backgroundColor: `${statusInfo.color}20`, color: statusInfo.color}}><Icon name={statusInfo.icon as any} className="h-3 w-3"/>{statusInfo.name}</Badge>
                                        <span className="text-lg font-bold text-primary">{formatCurrency(order.cod)}</span>
                                    </div>
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
                    <span className="text-xs text-muted-foreground">عرض {orders.length} من {totalCount} طلبات</span>
                    <div className="flex items-center gap-1">
                        <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>السابق</Button>
                        <span className="text-xs p-2">صفحة {page + 1} من {totalPages}</span>
                        <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>التالي</Button>
                    </div>
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
                        <div className="flex items-center gap-2">
                             <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    placeholder="بحث شامل..." 
                                    className="pl-10" 
                                    value={globalSearch}
                                    onChange={(e) => setGlobalSearch(e.target.value)}
                                />
                            </div>
                            <AdvancedSearch
                                filters={filters}
                                onAddFilter={(filter) => setFilters(prev => [...prev, filter])}
                                onRemoveFilter={(index) => setFilters(prev => prev.filter((_, i) => i !== index))}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="flex items-center space-x-2 space-x-reverse">
                                <Switch id="edit-mode" checked={isEditMode} onCheckedChange={setIsEditMode} />
                                <Label htmlFor="edit-mode">قابل للتعديل</Label>
                            </div>
                            <Separator orientation="vertical" className="h-6" />
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
                                        <DropdownMenuCheckboxItem key={option.label} checked={groupBy === option.value} onSelect={() => setGroupBy(option.value)}>
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
                                <DropdownMenuContent align="end" className="w-64 p-2 max-h-[400px] flex flex-col">
                                    <DropdownMenuLabel>إظهار/إخفاء الأعمدة</DropdownMenuLabel>
                                    <div className='flex items-center gap-2 p-1'>
                                        <Button variant="link" size="sm" className='h-auto p-1' onClick={() => setVisibleColumnKeys(ALL_COLUMNS.map(c => c.key))}>إظهار الكل</Button>
                                        <Separator orientation="vertical" className="h-4" />
                                        <Button variant="link" size="sm" className='h-auto p-1' onClick={() => setVisibleColumnKeys(['id', 'recipient', 'status'])}>إخفاء الكل</Button>
                                    </div>
                                    <DropdownMenuSeparator />
                                    <div className="flex-1 min-h-0 overflow-auto">
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
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="gap-1">
                                        <Icon name="Settings2" className="h-4 w-4" />
                                        <span>الإجراءات</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>الإجراءات المجمعة</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem disabled={selectedRows.length === 0} onSelect={() => setModalState({ type: 'assignDriver' })}>
                                        <UserCheck className="ml-2 h-4 w-4" /> تعيين سائق
                                    </DropdownMenuItem>
                                    <DropdownMenuItem disabled={selectedRows.length === 0} onSelect={() => setModalState({ type: 'changeStatus' })}>
                                        <RefreshCw className="ml-2 h-4 w-4" /> تغيير الحالة
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem disabled={selectedRows.length === 0} className="text-destructive" onSelect={() => setModalState({ type: 'delete' })}>
                                        <Trash2 className="ml-2 h-4 w-4" /> حذف المحدد
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="gap-1">
                                        <Printer className="h-4 w-4" />
                                        <span>طباعة / تصدير</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                     <DropdownMenuItem onSelect={() => setModalState({ type: 'print' })} disabled={selectedRows.length === 0}>
                                        <Printer className="ml-2 h-4 w-4" /> طباعة بوليصة
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => setModalState({ type: 'export' })}>
                                        <FileDown className="ml-2 h-4 w-4" />
                                        تصدير البيانات
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Button variant="outline" size="sm" onClick={toggleAllGroups} disabled={!groupBy}><ChevronsUpDown className="h-4 w-4"/></Button>
                            <Button variant="outline" size="sm" onClick={handleRefresh}><RefreshCw className="h-4 w-4"/></Button>
                        </div>
                    </div>
                    {/* Table Container */}
                     <div className="flex-1 border rounded-lg overflow-auto flex flex-col">
                        <Table>
                            <TableHeader className="sticky top-0 z-20">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="sticky right-0 z-30 p-2 text-center border-l w-20 bg-slate-800"><div className="flex items-center justify-center gap-2"><span className="text-sm font-bold text-white">#</span><Checkbox onCheckedChange={handleSelectAll} checked={isAllSelected} indeterminate={isIndeterminate} aria-label="Select all rows" className='border-white data-[state=checked]:bg-white data-[state=checked]:text-slate-800 data-[state=indeterminate]:bg-white data-[state=indeterminate]:text-slate-800' /></div></TableHead>
                                    {visibleColumns.map((col) => (<TableHead key={col.key} className="p-2 text-center border-b border-l bg-slate-800 !text-white hover:!bg-slate-700 transition-colors duration-200">{col.sortable ? (<Button variant="ghost" onClick={() => handleSort(col.key as keyof Order)} className="text-white hover:bg-transparent hover:text-white w-full p-0 h-auto">{col.label}<ArrowUpDown className="mr-2 h-3 w-3 text-white" /></Button>) : (<span className='text-white'>{col.label}</span>)}</TableHead>))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="sticky right-0 z-10 p-2 text-center border-l bg-card"><Skeleton className="h-5 w-16" /></TableCell>
                                            {visibleColumns.map(col => <TableCell key={col.key} className="p-2 text-center border-l"><Skeleton className="h-5 w-full" /></TableCell>)}
                                        </TableRow>
                                    ))
                                ) : groupedOrders ? (
                                    Object.entries(groupedOrders).map(([groupKey, groupOrders], groupIndex) => {
                                        const isGroupOpen = openGroups[groupKey] ?? false; 
                                        const groupTotals = groupOrders.reduce((acc, order) => {
                                            acc.itemPrice += order.itemPrice || 0;
                                            acc.deliveryFee += (order.deliveryFee || 0) + (order.additionalCost || 0);
                                            acc.cod += order.cod || 0;
                                            acc.companyDue += (order.deliveryFee || 0) + (order.additionalCost || 0) - ((order.driverFee || 0) + (order.driverAdditionalFare || 0));
                                            return acc;
                                        }, { itemPrice: 0, deliveryFee: 0, cod: 0, companyDue: 0 });

                                        const firstFinancialIndex = visibleColumns.findIndex(c => c.type && c.type.includes('financial'));
                                        const colSpan = firstFinancialIndex !== -1 ? firstFinancialIndex : visibleColumns.length;

                                        return (
                                            <React.Fragment key={groupKey}>
                                                <TableRow onClick={() => setOpenGroups(prev => ({ ...prev, [groupKey]: !isGroupOpen }))} className={cn("cursor-pointer font-bold transition-all duration-300", groupIndex % 2 === 0 ? "bg-primary/80 hover:bg-primary/90 text-primary-foreground" : "bg-slate-800 hover:bg-slate-700 text-slate-50")}>
                                                     <TableCell className="p-0 border-l" colSpan={colSpan + 1}>
                                                        <div className="flex items-center px-4 py-3">
                                                            <ChevronDown className={cn("h-5 w-5 transition-transform ml-2", !isGroupOpen && "-rotate-90")} />
                                                            <span>{groupKey || 'غير محدد'}</span><span className="text-sm opacity-90 mr-1">({groupOrders.length})</span>
                                                        </div>
                                                     </TableCell>
                                                    {visibleColumns.slice(colSpan).map(col => {
                                                        let totalValue = '';
                                                        switch(col.key) {
                                                            case 'itemPrice': totalValue = formatCurrency(groupTotals.itemPrice); break;
                                                            case 'deliveryFee': totalValue = formatCurrency(groupOrders.reduce((s, o) => s + (o.deliveryFee || 0), 0)); break;
                                                            case 'additionalCost': totalValue = formatCurrency(groupOrders.reduce((s, o) => s + (o.additionalCost || 0), 0)); break;
                                                            case 'driverFee': totalValue = formatCurrency(groupOrders.reduce((s, o) => s + (o.driverFee || 0), 0)); break;
                                                            case 'driverAdditionalFare': totalValue = formatCurrency(groupOrders.reduce((s, o) => s + (o.driverAdditionalFare || 0), 0)); break;
                                                            case 'companyDue': totalValue = formatCurrency(groupTotals.companyDue); break;
                                                            case 'cod': totalValue = formatCurrency(groupTotals.cod); break;
                                                            default: totalValue = '';
                                                        }
                                                        return <TableCell key={col.key} className="p-3 text-center border-l">{totalValue}</TableCell>
                                                    })}
                                                </TableRow>
                                                {isGroupOpen && groupOrders.map((order, index) => renderOrderRow(order, index))}
                                            </React.Fragment>
                                        );
                                    })
                                ) : (
                                    orders.map((order, index) => renderOrderRow(order, index))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination and Totals Footer */}
                    <CardFooter className="flex-none flex items-center justify-between p-2 border-t">
                        <div className="flex items-center gap-4 text-xs font-medium">
                            <div className='p-2 rounded text-xs bg-slate-800 text-white font-bold'>{selectedRows.length > 0 ? `إجمالي المحدد (${selectedRows.length})` : `إجمالي الصفحة (${orders.length})`}</div>
                            <div className="flex items-center gap-1"><span className="text-muted-foreground">المستحق للتاجر:</span><span className="font-bold text-primary">{formatCurrency(footerTotals.itemPrice)}</span></div>
                            <div className="flex items-center gap-1"><span className="text-muted-foreground">أجور التوصيل:</span><span className="font-bold text-primary">{formatCurrency(footerTotals.deliveryFee + footerTotals.additionalCost)}</span></div>
                            <div className="flex items-center gap-1"><span className="text-muted-foreground">أجور السائق:</span><span className="font-bold text-primary">{formatCurrency(footerTotals.driverFee)}</span></div>
                            <div className="flex items-center gap-1"><span className="text-muted-foreground">المطلوب للشركة:</span><span className="font-bold text-primary">{formatCurrency(footerTotals.companyDue)}</span></div>
                            <div className="flex items-center gap-1"><span className="text-muted-foreground">قيمة التحصيل:</span><span className="font-bold text-primary">{formatCurrency(footerTotals.cod)}</span></div>
                        </div>
                        {!groupBy && (
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium">صفوف الصفحة:</p>
                                    <Select
                                        value={`${rowsPerPage}`}
                                        onValueChange={(value) => {
                                            setRowsPerPage(Number(value));
                                            setPage(0);
                                        }}
                                    >
                                        <SelectTrigger className="h-8 w-[70px]">
                                            <SelectValue placeholder={rowsPerPage} />
                                        </SelectTrigger>
                                        <SelectContent side="top">
                                            {[100, 250, 500].map((pageSize) => (
                                                <SelectItem key={pageSize} value={`${pageSize}`}>
                                                    {pageSize}
                                                </SelectItem>
                                            ))}
                                             <SelectItem value={`${totalCount}`}>
                                                    الكل
                                                </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="text-sm font-medium">
                                    صفحة {page + 1} من {totalPages}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button
                                    variant="outline"
                                    className="h-8 w-8 p-0"
                                    onClick={() => setPage(0)}
                                    disabled={page === 0}
                                    >
                                    <span className="sr-only">Go to first page</span>
                                    <ChevronsRight className="h-4 w-4" />
                                    </Button>
                                    <Button
                                    variant="outline"
                                    className="h-8 w-8 p-0"
                                    onClick={() => setPage(page - 1)}
                                    disabled={page === 0}
                                    >
                                    <span className="sr-only">Go to previous page</span>
                                    <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button
                                    variant="outline"
                                    className="h-8 w-8 p-0"
                                    onClick={() => setPage(page + 1)}
                                    disabled={page >= totalPages - 1}
                                    >
                                    <span className="sr-only">Go to next page</span>
                                    <ChevronRight className="h-4 w-4" />
                                    </Button>
                                     <Button
                                    variant="outline"
                                    className="h-8 w-8 p-0"
                                    onClick={() => setPage(totalPages - 1)}
                                    disabled={page >= totalPages - 1}
                                    >
                                    <span className="sr-only">Go to last page</span>
                                    <ChevronsLeft className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardFooter>
                </Card>
            </TooltipProvider>

            {/* Modals */}
            <AlertDialog open={modalState.type === 'delete'} onOpenChange={(open) => !open && setModalState({ type: 'none' })}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>تأكيد الحذف</AlertDialogTitle><AlertDialogDescription>هل أنت متأكد من حذف {selectedRows.length} طلبات؟</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>إلغاء</AlertDialogCancel><AlertDialogAction>حذف</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
            <Dialog open={modalState.type === 'print'} onOpenChange={(open) => !open && setModalState({type: 'none'})}><DialogContent className="max-w-4xl h-[90vh] flex flex-col"><DialogHeader><DialogTitle>طباعة البوالص</DialogTitle><DialogDescription>اختر القالب وقم بمعاينة البوالص قبل الطباعة النهائية.</DialogDescription></DialogHeader><div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1 min-h-0"><div className="md:col-span-1 flex flex-col gap-4"><Card><CardHeader className='p-4'><CardTitle className='text-base'>1. اختر القالب</CardTitle></CardHeader><CardContent className='p-4'><RadioGroup value={selectedTemplate?.id} onValueChange={(id) => setSelectedTemplate(availableTemplates.find(t => t.id === id) || null)}>{availableTemplates.map(template => (<div key={template.id} className="flex items-center space-x-2 space-x-reverse"><RadioGroupItem value={template.id} id={`tpl-${template.id}`} /><Label htmlFor={`tpl-${template.id}`}>{template.name}</Label></div>))}</RadioGroup></CardContent></Card><Card><CardHeader className='p-4'><CardTitle className='text-base'>2. إجراء الطباعة</CardTitle></CardHeader><CardContent className='p-4 flex flex-col gap-2'><Button onClick={() => printablePolicyRef.current?.handleExport()} className="w-full"><Icon name="Save" className="ml-2 h-4 w-4 inline" /> طباعة PDF</Button><Button variant="secondary" onClick={() => printablePolicyRef.current?.handleDirectPrint(orders.find(o => o.id === selectedRows[0]), 'zpl')}><Icon name="Printer" className="ml-2 h-4 w-4 inline" /> طباعة ZPL (أول طلب)</Button><Button variant="secondary" onClick={() => printablePolicyRef.current?.handleDirectPrint(orders.find(o => o.id === selectedRows[0]), 'escpos')}><Icon name="Printer" className="ml-2 h-4 w-4 inline" /> طباعة ESC/POS (أول طلب)</Button></CardContent></Card></div><div className="md:col-span-3 bg-muted rounded-md flex items-center justify-center overflow-hidden"><ScrollArea className="h-full w-full"><div className="p-4 flex items-center justify-center">{selectedTemplate && (<PrintablePolicy ref={printablePolicyRef} orders={orders.filter(o => selectedRows.includes(o.id))} template={selectedTemplate} />)}</div></ScrollArea></div></div></DialogContent></Dialog>
            <Dialog open={modalState.type === 'assignDriver' || modalState.type === 'changeStatus'} onOpenChange={(open) => !open && setModalState({ type: 'none' })}><DialogContent><DialogHeader><DialogTitle>{modalState.type === 'assignDriver' ? 'تعيين سائق' : 'تغيير الحالة'}</DialogTitle></DialogHeader><div className="py-4"><Select><SelectTrigger><SelectValue placeholder={modalState.type === 'assignDriver' ? 'اختر سائق...' : 'اختر حالة...'} /></SelectTrigger><SelectContent>{ (modalState.type === 'assignDriver' ? ['علي الأحمد', 'ابو العبد', 'محمد الخالد'] : statuses.filter(s => s.isActive).map(s=>s.name)).map(item => (<SelectItem key={item} value={item}>{item}</SelectItem>)) }</SelectContent></Select></div></DialogContent></Dialog>
            <ExportDataDialog
                open={modalState.type === 'export'}
                onOpenChange={(open) => !open && setModalState({type: 'none'})}
                allColumns={ALL_COLUMNS}
                initialVisibleColumns={visibleColumns}
                ordersToExport={selectedRows.length > 0 ? orders.filter(o => selectedRows.includes(o.id)) : orders}
                isClient={isClient}
            />
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



    





    








