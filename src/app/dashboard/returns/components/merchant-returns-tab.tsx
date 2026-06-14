'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Building2, RefreshCw, ChevronDown, ChevronRight,
  Settings2, SquareCheck, SquareMinus, Square, Trash2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem,
  DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { DataTable, DataTableColumn } from '@/components/ui/data-table';
import { useSettings } from '@/contexts/SettingsContext';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface MerchantSlipOrder {
  id: string;
  recipient: string;
  status: string;
  cod: number;
}

interface MerchantSlip {
  id: string;
  merchant: string;
  date: string;
  items: number;
  status: string;
  orders: MerchantSlipOrder[];
}

const SLIP_STATUS_OPTIONS = ['جاهز للتسليم', 'في الطريق', 'تم التسليم'];

const statusColor: Record<string, string> = {
  'جاهز للتسليم': 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300',
  'في الطريق':    'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300',
  'تم التسليم':  'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300',
};

// ─── أعمدة قابلة للإخفاء ──────────────────────────────────────────────────────
const ALL_COLUMNS = ['id', 'merchant', 'date', 'items', 'status', 'actions'] as const;
type ColKey = typeof ALL_COLUMNS[number];
const COL_LABELS: Record<ColKey, string> = {
  id: 'رقم السند', merchant: 'التاجر', date: 'التاريخ',
  items: 'الطلبات', status: 'الحالة', actions: 'تغيير الحالة',
};

export function MerchantReturnsTab() {
  const { formatCurrency } = useSettings();
  const { toast } = useToast();

  const [slips, setSlips] = useState<MerchantSlip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedSlip, setExpandedSlip] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // تحديد صفوف
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // أعمدة مرئية
  const [visibleCols, setVisibleCols] = useState<Set<ColKey>>(new Set(ALL_COLUMNS));

  // حذف جماعي
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const filters: any = {};
      if (filterStatus !== 'all') filters.status = filterStatus;
      const data = await api.getMerchantReturnSlips(filters);
      setSlips(data.slips || []);
      setSelected(new Set());
    } catch {
      toast({ variant: 'destructive', title: 'خطأ', description: 'تعذّر تحميل البيانات' });
    } finally {
      setIsLoading(false);
    }
  }, [filterStatus, toast]);

  useEffect(() => { load(); }, [load]);

  const handleUpdateStatus = async (slipId: string, newStatus: string) => {
    try {
      await api.updateMerchantReturnSlipStatus(slipId, newStatus);
      setSlips(prev => prev.map(s => s.id === slipId ? { ...s, status: newStatus } : s));
      toast({ title: 'تم تحديث الحالة', description: `"${newStatus}"` });
    } catch {
      toast({ variant: 'destructive', title: 'خطأ', description: 'فشل تحديث الحالة' });
    }
  };

  const handleBulkStatusChange = async (newStatus: string) => {
    if (selected.size === 0) return;
    let ok = 0;
    for (const id of Array.from(selected)) {
      try {
        await api.updateMerchantReturnSlipStatus(id, newStatus);
        ok++;
      } catch { /* skip */ }
    }
    setSlips(prev => prev.map(s => selected.has(s.id) ? { ...s, status: newStatus } : s));
    setSelected(new Set());
    toast({ title: `تم تحديث ${ok} سند`, description: newStatus });
  };

  const handleBulkDelete = async () => {
    setIsDeleting(true);
    let failed = 0;
    for (const id of Array.from(selected)) {
      try {
        await api.deleteMerchantReturnSlip(id);
      } catch { failed++; }
    }
    setSlips(prev => prev.filter(s => !selected.has(s.id)));
    const deleted = selected.size - failed;
    setSelected(new Set());
    setShowBulkDelete(false);
    toast({ title: `تم حذف ${deleted} سند`, variant: failed > 0 ? 'destructive' : 'default' });
    setIsDeleting(false);
  };

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const displayed = slips
    .filter(s => filterStatus === 'all' || s.status === filterStatus)
    .sort((a, b) => {
      let va: any = a[sortKey as keyof MerchantSlip];
      let vb: any = b[sortKey as keyof MerchantSlip];
      if (sortKey === 'date') { va = new Date(a.date).getTime(); vb = new Date(b.date).getTime(); }
      if (sortKey === 'items') { va = a.items; vb = b.items; }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

  const allSelected = displayed.length > 0 && displayed.every(s => selected.has(s.id));
  const someSelected = displayed.some(s => selected.has(s.id)) && !allSelected;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelected(prev => { const n = new Set(prev); displayed.forEach(s => n.delete(s.id)); return n; });
    } else {
      setSelected(prev => { const n = new Set(prev); displayed.forEach(s => n.add(s.id)); return n; });
    }
  };

  // ─── تعريف الأعمدة ────────────────────────────────────────────────────────────
  type ColDef = DataTableColumn<MerchantSlip> & { colKey: ColKey };

  const allColDefs: ColDef[] = [
    {
      colKey: 'id',
      key: 'id',
      label: 'رقم السند',
      render: (s) => <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{s.id}</span>,
    },
    {
      colKey: 'merchant',
      key: 'merchant',
      label: 'التاجر',
      sortable: true,
      render: (s) => (
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
            <Building2 className="h-3.5 w-3.5 text-blue-600" />
          </div>
          <span className="font-semibold">{s.merchant}</span>
        </div>
      ),
    },
    {
      colKey: 'date',
      key: 'date',
      label: 'التاريخ',
      sortable: true,
      render: (s) => (
        <span className="text-sm text-muted-foreground">
          {new Date(s.date).toLocaleDateString('ar-SA', { dateStyle: 'medium' })}
        </span>
      ),
    },
    {
      colKey: 'items',
      key: 'items',
      label: 'الطلبات',
      sortable: true,
      render: (s) => (
        <Badge className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-0 text-xs">
          {s.items} طلب
        </Badge>
      ),
    },
    {
      colKey: 'status',
      key: 'status',
      label: 'الحالة',
      sortable: true,
      render: (s) => (
        <Badge className={cn('text-xs border', statusColor[s.status] ?? 'bg-gray-100 text-gray-700 border-gray-200')}>
          {s.status}
        </Badge>
      ),
    },
    {
      colKey: 'actions',
      key: 'actions',
      label: 'تغيير الحالة',
      className: 'text-center',
      render: (s) => (
        <div className="flex items-center gap-1.5 justify-center" onClick={e => e.stopPropagation()}>
          {s.status !== 'تم التسليم' ? (
            <Select value={s.status} onValueChange={v => handleUpdateStatus(s.id, v)}>
              <SelectTrigger className="w-36 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SLIP_STATUS_OPTIONS.map(opt => (
                  <SelectItem key={opt} value={opt} className="text-xs">{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-0 text-xs">
              مكتمل
            </Badge>
          )}
          <Button
            variant="ghost" size="sm"
            className="h-8 w-8 p-0 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600"
            onClick={e => { e.stopPropagation(); setExpandedSlip(expandedSlip === s.id ? null : s.id); }}
            title="عرض الطلبات"
          >
            {expandedSlip === s.id
              ? <ChevronDown className="h-4 w-4" />
              : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
      ),
    },
  ];

  const visibleColDefs = allColDefs.filter(c => visibleCols.has(c.colKey));

  const orderCols: DataTableColumn<MerchantSlipOrder>[] = [
    { key: 'id', label: 'رقم الطلب', render: (o) => <span className="font-mono text-xs text-slate-500">#{o.id.slice(-8)}</span> },
    { key: 'recipient', label: 'المستلم', render: (o) => <span className="font-medium">{o.recipient}</span> },
    { key: 'status', label: 'الحالة', render: (o) => <Badge variant="outline" className="text-xs">{o.status}</Badge> },
    { key: 'cod', label: 'المبلغ', render: (o) => <span className="font-bold text-orange-600 tabular-nums">{formatCurrency(o.cod)}</span> },
  ];

  return (
    <div className="space-y-4">
      {/* شريط الأدوات */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="كل الحالات" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الحالات</SelectItem>
              {SLIP_STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">{displayed.length} سند</span>
        </div>
        <div className="flex items-center gap-2">
          {/* تخصيص الأعمدة */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Settings2 className="h-4 w-4" />
                الأعمدة
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel className="text-xs">إظهار / إخفاء</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {ALL_COLUMNS.map(col => (
                <DropdownMenuCheckboxItem
                  key={col}
                  checked={visibleCols.has(col)}
                  onCheckedChange={checked => {
                    setVisibleCols(prev => {
                      const n = new Set(prev);
                      checked ? n.add(col) : n.delete(col);
                      return n;
                    });
                  }}
                  className="text-xs"
                >
                  {COL_LABELS[col]}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" onClick={load} disabled={isLoading}>
            <RefreshCw className={cn('h-4 w-4 ml-1', isLoading && 'animate-spin')} />
            تحديث
          </Button>
        </div>
      </div>

      {/* شريط الإجراءات الجماعية */}
      {displayed.length > 0 && (
        <div className={cn(
          'flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all',
          selected.size > 0
            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
            : 'bg-muted/40 border-muted',
        )}>
          <button
            onClick={toggleSelectAll}
            className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            {allSelected
              ? <SquareCheck className="h-4 w-4 text-blue-500" />
              : someSelected
              ? <SquareMinus className="h-4 w-4 text-blue-500" />
              : <Square className="h-4 w-4" />}
          </button>

          {selected.size > 0 ? (
            <>
              <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                {selected.size} سند محدد
              </span>
              <div className="flex items-center gap-2 mr-auto flex-wrap">
                {/* تغيير حالة جماعي */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 text-xs gap-1 border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400">
                      تغيير الحالة ({selected.size})
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    {SLIP_STATUS_OPTIONS.map(s => (
                      <DropdownMenuItem key={s} onClick={() => handleBulkStatusChange(s)} className="text-xs">
                        {s}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  variant="outline" size="sm"
                  className="gap-1.5 h-8 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20 text-xs"
                  onClick={() => setShowBulkDelete(true)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  حذف ({selected.size})
                </Button>
                <Button
                  variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground"
                  onClick={() => setSelected(new Set())}
                >
                  إلغاء
                </Button>
              </div>
            </>
          ) : (
            <span className="text-xs text-muted-foreground">اختر سندات لإجراء جماعي</span>
          )}
        </div>
      )}

      {/* الجدول */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <DataTable
          columns={visibleColDefs}
          data={displayed}
          rowKey={s => s.id}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
          isRowHighlighted={s => expandedSlip === s.id}
          emptyMessage="لا توجد مرتجعات تجار بعد"
          selectedRows={selected}
          onRowSelect={toggleSelect}
        />
      )}

      {/* تفاصيل السند المفتوح */}
      {expandedSlip && (() => {
        const slip = displayed.find(s => s.id === expandedSlip);
        if (!slip?.orders?.length) return null;
        return (
          <div className="rounded-xl border-2 border-blue-200 dark:border-blue-800 p-4 bg-blue-50/30 dark:bg-blue-900/10 space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-bold text-sm flex items-center gap-2">
                <Building2 className="h-4 w-4 text-blue-600" />
                طلبات — {slip.merchant}
              </p>
              <span className="font-mono text-xs text-muted-foreground">{slip.id}</span>
            </div>
            <DataTable
              columns={orderCols}
              data={slip.orders}
              rowKey={o => o.id}
              stickyHeader={false}
              emptyMessage=""
            />
          </div>
        );
      })()}

      {/* تأكيد الحذف الجماعي */}
      <AlertDialog open={showBulkDelete} onOpenChange={open => !open && setShowBulkDelete(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف {selected.size} سند</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف {selected.size} سند مرتجعات تجار؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90">
              {isDeleting ? <RefreshCw className="h-4 w-4 animate-spin ml-1" /> : <Trash2 className="h-4 w-4 ml-1" />}
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
