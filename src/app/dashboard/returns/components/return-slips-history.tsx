'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  RefreshCw, Printer, Trash2, CheckCircle2, PackageX,
  Search, ChevronDown, ChevronRight, Truck, Settings2,
  SquareCheck, SquareMinus, Square,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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

interface SlipOrder {
  id: string;
  orderNumber?: string;
  recipient: string;
  status: string;
  merchant: string;
  cod: number;
  phone?: string;
}

interface DriverSlip {
  id: string;
  driverName: string;
  date: string;
  itemCount: number;
  orders: SlipOrder[];
}

function printSlip(slip: DriverSlip, companyName: string) {
  const delivered = slip.orders.filter(o => o.status === 'تم التوصيل');
  const returned = slip.orders.filter(o => o.status !== 'تم التوصيل');
  const netAmount = delivered.reduce((s, o) => s + (o.cod || 0), 0);

  const mkRows = (list: SlipOrder[], offset = 0) => list.map((o, i) => `
    <tr style="background:${i % 2 === 0 ? '#f9fafb' : '#fff'}">
      <td style="padding:7px 11px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:11px">${offset + i + 1}</td>
      <td style="padding:7px 11px;border-bottom:1px solid #e5e7eb;font-weight:600">${o.recipient}</td>
      <td style="padding:7px 11px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:11px">${o.merchant || '—'}</td>
      <td style="padding:7px 11px;border-bottom:1px solid #e5e7eb;font-weight:700;color:#d97706">${o.cod || 0}</td>
      <td style="padding:7px 11px;border-bottom:1px solid #e5e7eb">
        <span style="padding:2px 7px;border-radius:20px;background:${o.status === 'تم التوصيل' ? '#dcfce7' : '#fef9c3'};color:${o.status === 'تم التوصيل' ? '#166534' : '#854d0e'};font-size:11px">${o.status}</span>
      </td>
    </tr>`).join('');

  const html = `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"/>
  <title>كشف استلام - ${slip.id}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:'Arial',sans-serif;font-size:13px;color:#111;}
    .hdr{background:linear-gradient(to right,#1e293b,#0f172a);color:#fff;padding:16px 22px;display:flex;justify-content:space-between;align-items:center;}
    .hdr h1{font-size:17px;font-weight:700;} .hdr p{font-size:11px;opacity:.75;margin-top:2px;}
    .slip-id{font-family:monospace;font-size:15px;font-weight:700;}
    .sum{display:grid;grid-template-columns:repeat(4,1fr);border-bottom:2px solid #e5e7eb;}
    .sc{padding:11px 14px;text-align:center;border-left:1px solid #e5e7eb;}
    .sc .l{font-size:10px;color:#6b7280;margin-bottom:2px;} .sc .v{font-size:15px;font-weight:700;}
    .sec{padding:7px 14px;background:#f8fafc;border-bottom:1px solid #e5e7eb;font-size:10px;font-weight:700;color:#475569;letter-spacing:.05em;}
    table{width:100%;border-collapse:collapse;}
    thead tr{background:linear-gradient(to right,#1e293b,#0f172a);}
    th{padding:8px 11px;text-align:right;font-size:11px;font-weight:600;color:#fff;border-left:1px solid rgba(255,255,255,.1);}
    th:first-child{background:linear-gradient(to right,#ea580c,#f97316);}
    .sigs{display:grid;grid-template-columns:1fr 1fr;gap:40px;padding:18px 22px;border-top:1px solid #e5e7eb;}
    .sig{text-align:center;} .sig-line{border-bottom:1px dashed #9ca3af;height:34px;margin-bottom:5px;}
    @media print{@page{margin:10mm;}}
  </style></head><body>
  <div class="hdr">
    <div><h1>${companyName}</h1><p>كشف استلام سائق</p></div>
    <div style="text-align:left"><div class="slip-id">${slip.id}</div>
    <div style="font-size:11px;opacity:.75;margin-top:3px">${new Date(slip.date).toLocaleString('ar-SA', { dateStyle: 'full', timeStyle: 'short' })}</div></div>
  </div>
  <div class="sum">
    <div class="sc"><div class="l">السائق</div><div class="v">${slip.driverName}</div></div>
    <div class="sc"><div class="l">المبلغ المستلم</div><div class="v" style="color:#15803d">${netAmount}</div></div>
    <div class="sc"><div class="l">مُسلَّمة</div><div class="v" style="color:#1d4ed8">${delivered.length}</div></div>
    <div class="sc"><div class="l">مرتجعات</div><div class="v" style="color:#b45309">${returned.length}</div></div>
  </div>
  ${delivered.length > 0 ? `<div class="sec">الطلبات المُسلَّمة (${delivered.length})</div>
  <table><thead><tr><th>#</th><th>المستلم</th><th>التاجر</th><th>المبلغ</th><th>الحالة</th></tr></thead>
  <tbody>${mkRows(delivered)}</tbody></table>` : ''}
  ${returned.length > 0 ? `<div class="sec" style="margin-top:4px">المرتجعات (${returned.length})</div>
  <table><thead><tr><th>#</th><th>المستلم</th><th>التاجر</th><th>المبلغ</th><th>الحالة</th></tr></thead>
  <tbody>${mkRows(returned, delivered.length)}</tbody></table>` : ''}
  <div class="sigs">
    <div class="sig"><div class="sig-line"></div><p style="font-size:11px;color:#6b7280">توقيع السائق</p><p style="font-size:11px;font-weight:600;margin-top:3px">${slip.driverName}</p></div>
    <div class="sig"><div class="sig-line"></div><p style="font-size:11px;color:#6b7280">توقيع المستلم</p></div>
  </div>
  <script>window.onload=function(){window.print();window.onafterprint=function(){window.close();};};</script>
  </body></html>`;

  const w = window.open('', '_blank', 'width=900,height=650');
  if (w) { w.document.write(html); w.document.close(); }
}

// ─── أعمدة قابلة للإخفاء ─────────────────────────────────────────────────────
const ALL_COLUMNS = ['id', 'driverName', 'date', 'itemCount', 'net', 'actions'] as const;
type ColKey = typeof ALL_COLUMNS[number];
const COL_LABELS: Record<ColKey, string> = {
  id: 'رقم الكشف', driverName: 'السائق', date: 'التاريخ',
  itemCount: 'الطلبات', net: 'المبلغ المستلم', actions: 'إجراءات',
};

export function ReturnSlipsHistory() {
  const { formatCurrency, settings } = useSettings();
  const { toast } = useToast();
  const companyName = (settings as any)?.companyName || 'نظام التوصيل';

  const [slips, setSlips] = useState<DriverSlip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSlip, setExpandedSlip] = useState<string | null>(null);
  const [filterDriver, setFilterDriver] = useState('all');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // تحديد صفوف
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // أعمدة مرئية
  const [visibleCols, setVisibleCols] = useState<Set<ColKey>>(new Set(ALL_COLUMNS));

  // حذف كشف
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // حذف طلب من كشف
  const [removeOrderTarget, setRemoveOrderTarget] = useState<{ slipId: string; orderId: string; recipient: string } | null>(null);
  const [isRemovingOrder, setIsRemovingOrder] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const filters: any = {};
      if (filterDriver !== 'all') filters.driverName = filterDriver;
      const data = await api.getDriverReturnSlips(filters);
      const detailed = await Promise.all(
        (data.slips || []).map(async (slip: any) => {
          try { return await api.getDriverReturnSlip(slip.id); } catch { return slip; }
        })
      );
      setSlips(detailed);
      setSelected(new Set());
    } catch {
      toast({ variant: 'destructive', title: 'خطأ', description: 'تعذّر تحميل السجل' });
    } finally {
      setIsLoading(false);
    }
  }, [filterDriver, toast]);

  useEffect(() => { load(); }, [load]);

  // ─── حذف كشف ─────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await api.deleteDriverReturnSlip(deleteTarget);
      setSlips(prev => prev.filter(s => s.id !== deleteTarget));
      setSelected(prev => { const n = new Set(prev); n.delete(deleteTarget); return n; });
      toast({ title: 'تم الحذف', description: `تم حذف الكشف ${deleteTarget}` });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'خطأ', description: err.message || 'تعذّر الحذف' });
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  // ─── حذف جماعي ────────────────────────────────────────────────────────────────
  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    setIsDeleting(true);
    let failed = 0;
    for (const id of Array.from(selected)) {
      try {
        await api.deleteDriverReturnSlip(id);
      } catch {
        failed++;
      }
    }
    setSlips(prev => prev.filter(s => !selected.has(s.id)));
    const deleted = selected.size - failed;
    setSelected(new Set());
    toast({
      title: `تم حذف ${deleted} كشف`,
      description: failed > 0 ? `فشل حذف ${failed}` : undefined,
      variant: failed > 0 ? 'destructive' : 'default',
    });
    setIsDeleting(false);
  };

  // ─── إزالة طلب من كشف وإعادة حالته ─────────────────────────────────────────
  const handleRemoveOrder = async () => {
    if (!removeOrderTarget) return;
    setIsRemovingOrder(true);
    try {
      await api.removeOrderFromDriverSlip(removeOrderTarget.slipId, removeOrderTarget.orderId);
      setSlips(prev => prev.map(s => {
        if (s.id !== removeOrderTarget.slipId) return s;
        return {
          ...s,
          itemCount: Math.max(0, s.itemCount - 1),
          orders: s.orders.filter(o => o.id !== removeOrderTarget.orderId),
        };
      }));
      toast({ title: 'تمت الإزالة', description: `طلب "${removeOrderTarget.recipient}" أُعيد لحالته السابقة` });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'خطأ', description: err.message || 'تعذّر الإزالة' });
    } finally {
      setIsRemovingOrder(false);
      setRemoveOrderTarget(null);
    }
  };

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  // ─── تحديد الصفوف ────────────────────────────────────────────────────────────
  const toggleSelect = (id: string) => {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const drivers = Array.from(new Set(slips.map(s => s.driverName)));

  const filtered = slips
    .filter(s =>
      (filterDriver === 'all' || s.driverName === filterDriver) &&
      (search === '' || s.driverName.includes(search) || s.id.includes(search) ||
        s.orders.some(o => o.recipient?.includes(search)))
    )
    .sort((a, b) => {
      let va: any = a[sortKey as keyof DriverSlip];
      let vb: any = b[sortKey as keyof DriverSlip];
      if (sortKey === 'date') { va = new Date(a.date).getTime(); vb = new Date(b.date).getTime(); }
      if (sortKey === 'itemCount') { va = a.itemCount; vb = b.itemCount; }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

  const allFilteredSelected = filtered.length > 0 && filtered.every(s => selected.has(s.id));
  const someSelected = filtered.some(s => selected.has(s.id)) && !allFilteredSelected;

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelected(prev => { const n = new Set(prev); filtered.forEach(s => n.delete(s.id)); return n; });
    } else {
      setSelected(prev => { const n = new Set(prev); filtered.forEach(s => n.add(s.id)); return n; });
    }
  };

  // ─── أعمدة الجدول ────────────────────────────────────────────────────────────
  type ColDef = DataTableColumn<DriverSlip> & { colKey: ColKey };

  const allColDefs: ColDef[] = [
    {
      colKey: 'id',
      key: 'id',
      label: 'رقم الكشف',
      sortable: false,
      render: (slip) => <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{slip.id}</span>,
    },
    {
      colKey: 'driverName',
      key: 'driverName',
      label: 'السائق',
      sortable: true,
      render: (slip) => (
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0">
            <Truck className="h-3.5 w-3.5 text-orange-600" />
          </div>
          <span className="font-semibold">{slip.driverName}</span>
        </div>
      ),
    },
    {
      colKey: 'date',
      key: 'date',
      label: 'التاريخ',
      sortable: true,
      render: (slip) => (
        <span className="text-sm text-muted-foreground">
          {new Date(slip.date).toLocaleString('ar-SA', { dateStyle: 'medium', timeStyle: 'short' })}
        </span>
      ),
    },
    {
      colKey: 'itemCount',
      key: 'itemCount',
      label: 'الطلبات',
      sortable: true,
      render: (slip) => {
        const delivered = slip.orders.filter(o => o.status === 'تم التوصيل').length;
        const returned = slip.orders.filter(o => o.status !== 'تم التوصيل').length;
        return (
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-0">
              {slip.itemCount} إجمالي
            </Badge>
            {delivered > 0 && (
              <Badge className="text-xs bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-0 gap-1">
                <CheckCircle2 className="h-2.5 w-2.5" />{delivered}
              </Badge>
            )}
            {returned > 0 && (
              <Badge className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300 border-0 gap-1">
                <PackageX className="h-2.5 w-2.5" />{returned}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      colKey: 'net',
      key: 'net',
      label: 'المبلغ المستلم',
      sortable: false,
      render: (slip) => {
        const net = slip.orders.filter(o => o.status === 'تم التوصيل').reduce((s, o) => s + (o.cod || 0), 0);
        return <span className="font-bold text-green-700 tabular-nums">{formatCurrency(net)}</span>;
      },
    },
    {
      colKey: 'actions',
      key: 'actions',
      label: 'إجراءات',
      className: 'text-center',
      render: (slip) => (
        <div className="flex items-center gap-1 justify-center">
          <Button
            variant="ghost" size="sm"
            className="h-8 w-8 p-0 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600"
            onClick={(e) => { e.stopPropagation(); setExpandedSlip(expandedSlip === slip.id ? null : slip.id); }}
            title="عرض التفاصيل"
          >
            {expandedSlip === slip.id
              ? <ChevronDown className="h-4 w-4" />
              : <ChevronRight className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost" size="sm"
            className="h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600"
            onClick={(e) => { e.stopPropagation(); printSlip(slip, companyName); }}
            title="طباعة الكشف"
          >
            <Printer className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost" size="sm"
            className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-destructive"
            onClick={(e) => { e.stopPropagation(); setDeleteTarget(slip.id); }}
            title="حذف الكشف"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const visibleColDefs = allColDefs.filter(c => visibleCols.has(c.colKey));

  // ─── أعمدة جدول الطلبات داخل الكشف ──────────────────────────────────────────
  const makeOrderCols = (slipId: string, isDelivered: boolean): DataTableColumn<SlipOrder>[] => [
    { key: 'recipient', label: 'المستلم', render: (o) => <span className="font-medium">{o.recipient}</span> },
    { key: 'merchant', label: 'التاجر', render: (o) => <span className="text-muted-foreground text-xs">{o.merchant || '—'}</span> },
    { key: 'cod', label: 'المبلغ', render: (o) => (
      <span className={cn('font-bold tabular-nums', isDelivered ? 'text-green-700' : 'text-orange-600')}>
        {formatCurrency(o.cod)}
      </span>
    )},
    { key: 'status', label: 'الحالة', render: (o) => (
      isDelivered
        ? <Badge className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-0 text-xs">تم التوصيل</Badge>
        : <Badge variant="outline" className="text-xs">{o.status}</Badge>
    )},
    {
      key: 'remove',
      label: '',
      className: 'w-10 text-center',
      render: (o) => (
        <Button
          variant="ghost" size="sm"
          className="h-7 w-7 p-0 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-destructive opacity-50 hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            setRemoveOrderTarget({ slipId, orderId: o.id, recipient: o.recipient });
          }}
          title="إزالة من الكشف وإعادة للحالة السابقة"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* شريط البحث والفلتر */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث بالسائق أو رقم الكشف أو المستلم..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pr-9"
          />
        </div>
        <Select value={filterDriver} onValueChange={setFilterDriver}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="كل السائقين" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل السائقين</SelectItem>
            {drivers.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground whitespace-nowrap">{filtered.length} كشف</span>

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

      {/* شريط الإجراءات الجماعية */}
      {filtered.length > 0 && (
        <div className={cn(
          'flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all',
          selected.size > 0
            ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700'
            : 'bg-muted/40 border-muted',
        )}>
          {/* زر تحديد الكل */}
          <button
            onClick={toggleSelectAll}
            className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
            title={allFilteredSelected ? 'إلغاء التحديد' : 'تحديد الكل'}
          >
            {allFilteredSelected
              ? <SquareCheck className="h-4 w-4 text-orange-500" />
              : someSelected
              ? <SquareMinus className="h-4 w-4 text-orange-500" />
              : <Square className="h-4 w-4" />}
          </button>

          {selected.size > 0 ? (
            <>
              <span className="text-sm font-medium text-orange-700 dark:text-orange-400">
                {selected.size} كشف محدد
              </span>
              <div className="flex items-center gap-2 mr-auto">
                <Button
                  variant="outline" size="sm"
                  className="gap-1.5 h-8 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 dark:border-red-800 dark:hover:bg-red-900/20"
                  onClick={() => {
                    if (confirm(`هل تريد حذف ${selected.size} كشف؟`)) handleBulkDelete();
                  }}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  حذف المحدد ({selected.size})
                </Button>
                <Button
                  variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground"
                  onClick={() => setSelected(new Set())}
                >
                  إلغاء التحديد
                </Button>
              </div>
            </>
          ) : (
            <span className="text-xs text-muted-foreground">اختر كشوفات لإجراء جماعي</span>
          )}
        </div>
      )}

      {/* الجدول الرئيسي */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <DataTable
          columns={visibleColDefs}
          data={filtered}
          rowKey={s => s.id}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
          isRowHighlighted={s => expandedSlip === s.id}
          emptyMessage="لا توجد كشوفات استلام بعد"
          selectedRows={selected}
          onRowSelect={toggleSelect}
        />
      )}

      {/* جدول تفاصيل الكشف المفتوح */}
      {expandedSlip && (() => {
        const slip = filtered.find(s => s.id === expandedSlip);
        if (!slip) return null;
        const delivered = slip.orders.filter(o => o.status === 'تم التوصيل');
        const returned = slip.orders.filter(o => o.status !== 'تم التوصيل');
        return (
          <div className="space-y-3 rounded-xl border-2 border-orange-200 dark:border-orange-800 p-4 bg-orange-50/30 dark:bg-orange-900/10">
            <div className="flex items-center justify-between">
              <p className="font-bold text-sm">تفاصيل الكشف — {slip.driverName}</p>
              <span className="font-mono text-xs text-muted-foreground">{slip.id}</span>
            </div>
            {delivered.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-2 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> مُسلَّمة ({delivered.length})
                </p>
                <DataTable
                  columns={makeOrderCols(slip.id, true)}
                  data={delivered}
                  rowKey={o => o.id}
                  stickyHeader={false}
                  emptyMessage=""
                />
              </div>
            )}
            {returned.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-orange-700 dark:text-orange-400 mb-2 flex items-center gap-1">
                  <PackageX className="h-3.5 w-3.5" /> مرتجعات ({returned.length})
                </p>
                <DataTable
                  columns={makeOrderCols(slip.id, false)}
                  data={returned}
                  rowKey={o => o.id}
                  stickyHeader={false}
                  emptyMessage=""
                />
              </div>
            )}
          </div>
        );
      })()}

      {/* تأكيد حذف الكشف */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الكشف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف الكشف <span className="font-mono font-bold">{deleteTarget}</span>؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90">
              {isDeleting ? <RefreshCw className="h-4 w-4 animate-spin ml-1" /> : <Trash2 className="h-4 w-4 ml-1" />}
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* تأكيد إزالة طلب من الكشف */}
      <AlertDialog open={!!removeOrderTarget} onOpenChange={open => !open && setRemoveOrderTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>إزالة طلب من الكشف</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم إزالة طلب <span className="font-bold">{removeOrderTarget?.recipient}</span> من هذا الكشف
              وإعادته إلى حالته السابقة قبل عملية الاستلام. هذا الإجراء لتصحيح أخطاء الاستلام.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemovingOrder}>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveOrder} disabled={isRemovingOrder}
              className="bg-orange-600 hover:bg-orange-700">
              {isRemovingOrder ? <RefreshCw className="h-4 w-4 animate-spin ml-1" /> : <PackageX className="h-4 w-4 ml-1" />}
              إزالة وإعادة الحالة
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
