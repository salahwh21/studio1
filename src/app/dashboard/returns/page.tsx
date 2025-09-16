
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
    { key: 'id', label: '#' },
    { key: 'id-link', label: 'رقم الطلب' },
    { key: 'source', label: 'المصدر' },
    { key: 'referenceNumber', label: 'الرقم المرجعي' },
    { key: 'recipient', label: 'المستلم' },
    { key: 'phone', label: 'الهاتف' },
    { key: 'address', label: 'العنوان' },
    { key: 'region', label: 'المنطقة' },
    { key: 'city', label: 'المدينة' },
    { key: 'merchant', label: 'التاجر' },
    { key: 'status', label: 'الحالة' },
    { key: 'previousStatus', label: 'الحالة السابقة' },
    { key: 'date', label: 'التاريخ' },
    { key: 'notes', label: 'ملاحظات/سبب الإرجاع' },
];

const ReturnsTable = ({ orders, statuses }: { orders: Order[], statuses: any[] }) => {
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    
    const isAllSelected = orders.length > 0 && selectedRows.length === orders.length;
    
    const handleSelectAll = useCallback((checked: boolean | 'indeterminate') => {
        if (checked === true) {
            setSelectedRows(orders.map(order => order.id));
        } else {
            setSelectedRows([]);
        }
    }, [orders]);

    const handleSelectionChange = useCallback((id: string, isSelected: boolean) => {
      setSelectedRows(prev => 
        isSelected ? [...prev, id] : prev.filter(rowId => rowId !== id)
      );
    }, []);

    const isIndeterminate = selectedRows.length > 0 && selectedRows.length < orders.length;

    return (
        <div className="overflow-x-auto">
            <div className="flex items-center gap-2 mb-4">
                <Button variant="default" size="sm" disabled={selectedRows.length === 0}>
                    إنشاء كشف مرتجع للتاجر
                </Button>
                 <Button variant="outline" size="sm" disabled={selectedRows.length === 0}>
                    <FileText className="ml-2 h-4 w-4" /> تصدير الكشف
                </Button>
            </div>
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12 text-center border-l">
                           <Checkbox
                                checked={isAllSelected || isIndeterminate}
                                onCheckedChange={handleSelectAll}
                                ref={(input: HTMLButtonElement | null) => {
                                  if (input) input.indeterminate = isIndeterminate;
                                }}
                                aria-label="Select all rows"
                            />
                        </TableHead>
                        {RETURNS_COLUMNS.map(col => <TableHead key={col.key}>{col.label}</TableHead>)}
                    </TableRow>
                </TableHeader>
                <TableBody>
                {orders.map((order, index) => (
                    <TableRow key={order.id} data-state={selectedRows.includes(order.id) ? "selected" : ""}>
                    <TableCell className="text-center border-l">
                        <Checkbox
                            checked={selectedRows.includes(order.id)}
                            onCheckedChange={(checked) => handleSelectionChange(order.id, !!checked)}
                        />
                    </TableCell>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium font-mono text-primary hover:underline">
                        <Link href={`/dashboard/orders/${order.id}`}>{order.id}</Link>
                    </TableCell>
                    <TableCell>{order.source}</TableCell>
                    <TableCell>{order.referenceNumber}</TableCell>
                    <TableCell>{order.recipient}</TableCell>
                    <TableCell>{order.phone}</TableCell>
                    <TableCell>{order.address}</TableCell>
                    <TableCell>{order.region}</TableCell>
                    <TableCell>{order.city}</TableCell>
                    <TableCell>{order.merchant}</TableCell>
                    <TableCell><Badge variant="secondary">{order.status}</Badge></TableCell>
                    <TableCell>{order.previousStatus ? <Badge variant="outline">{order.previousStatus}</Badge> : '-'}</TableCell>
                    <TableCell>{new Date(order.date).toLocaleDateString('ar-JO')}</TableCell>
                    <TableCell>{order.notes || 'غير محدد'}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </div>
    );
};


export default function ReturnsManagementPage() {
    const { orders } = useOrdersStore();
    const { statuses } = useStatusesStore();

    const [selectedMerchant, setSelectedMerchant] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    
    const returnsByMerchant = useMemo(() => {
        return orders
            .filter(order => order.status === 'راجع')
            .reduce((acc, order) => {
                const merchantName = order.merchant;
                if (!acc[merchantName]) {
                    acc[merchantName] = [];
                }
                acc[merchantName].push(order);
                return acc;
            }, {} as Record<string, Order[]>);
    }, [orders]);

    const merchantsWithReturns = Object.keys(returnsByMerchant);

    useEffect(() => {
        if (merchantsWithReturns.length > 0 && !selectedMerchant) {
            setSelectedMerchant(merchantsWithReturns[0]);
        }
    }, [merchantsWithReturns, selectedMerchant]);
    
    const selectedOrders = useMemo(() => {
        const ordersForMerchant = selectedMerchant ? returnsByMerchant[selectedMerchant] || [] : [];
        if (!searchQuery) {
            return ordersForMerchant;
        }
        const lowercasedQuery = searchQuery.toLowerCase();
        return ordersForMerchant.filter(order =>
            order.id.toLowerCase().includes(lowercasedQuery) ||
            (order.referenceNumber || '').toLowerCase().includes(lowercasedQuery) ||
            order.recipient.toLowerCase().includes(lowercasedQuery) ||
            order.phone.toLowerCase().includes(lowercasedQuery)
        );
    }, [selectedMerchant, returnsByMerchant, searchQuery]);
    
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
                        {merchantsWithReturns.length === 0 && <p className="p-4 text-center text-muted-foreground">لا توجد مرتجعات حالياً.</p>}
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
                <div className="md:col-span-9">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>
                                    مرتجعات التاجر: <span className="text-primary">{selectedMerchant}</span>
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            placeholder="بحث في طلبات التاجر..."
                                            className="pr-10"
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ReturnsTable
                                orders={selectedOrders}
                                statuses={statuses}
                            />
                        </CardContent>
                         <CardFooter className="p-2 border-t">
                            <span className="text-xs text-muted-foreground">
                                إجمالي {selectedOrders.length} طلبات
                            </span>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}

