'use client';

import { useState } from 'react';
import {
  PackageX, Building2, CheckCircle2, Truck,
  History, RefreshCw, ArrowRight, Printer,
  Banknote, Receipt, ChevronDown, ChevronUp, Users, ChevronLeft,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useOrdersStore, Order } from '@/store/orders-store';
import { useStatusesStore } from '@/store/statuses-store';
import { useSettings } from '@/contexts/SettingsContext';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { MerchantReturnsTab } from './components/merchant-returns-tab';
import { ReturnSlipsHistory } from './components/return-slips-history';
import { cn } from '@/lib/utils';

// الحالات التي تعني "الطلب لم يُسلَّم وهو الآن مع السائق في الميدان" → تحتاج تصنيفاً عند الاستلام
const UNDELIVERED_WITH_DRIVER = ['جاري التوصيل', 'بانتظار السائق'];
// الحالات التي تعني "تم التوصيل وبانتظار تحصيل المال" → تُحسب في الكاش
const DELIVERED_STATUS = 'تم التوصيل';
// الحالات التي لا معنى لإعادة التعيين إليها عند الاستلام (للـ dropdown في خطوة التصنيف)
const EXCLUDED_STATUSES = ['تم التوصيل', 'تم استلام المال في الفرع', 'تم محاسبة التاجر', 'جاري التوصيل', 'بانتظار السائق'];
type DecisionMap = Record<string, string | null>;

// ─── Step 1: اختيار السائق ───────────────────────────────────────────────────
function StepSelectDriver({ orders, isLoading, onSelect }: {
  orders: Order[];
  isLoading: boolean;
  onSelect: (driver: string) => void;
}) {
  const { formatCurrency } = useSettings();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
        <RefreshCw className="h-10 w-10 animate-spin" />
        <p>جاري تحميل الطلبات...</p>
      </div>
    );
  }

  // نبني الخريطة من جدول الطلبات الأساسي مباشرة:
  // - undelivered = خرجت مع السائق ولم تُسلَّم (جاري التوصيل / بانتظار السائق)
  // - delivered   = تم توصيلها (لحساب الكاش الذي يجمعه السائق)
  const driversMap = new Map<string, { delivered: Order[]; undelivered: Order[] }>();
  for (const o of orders) {
    if (!o.driver) continue;
    if (o.status === DELIVERED_STATUS) {
      const d = driversMap.get(o.driver) ?? { delivered: [], undelivered: [] };
      d.delivered.push(o);
      driversMap.set(o.driver, d);
    } else if (UNDELIVERED_WITH_DRIVER.includes(o.status)) {
      const d = driversMap.get(o.driver) ?? { delivered: [], undelivered: [] };
      d.undelivered.push(o);
      driversMap.set(o.driver, d);
    }
  }

  const drivers = Array.from(driversMap.entries())
    .filter(([, d]) => d.undelivered.length > 0 || d.delivered.length > 0)
    .map(([name, d]) => ({
      name,
      delivered: d.delivered,
      undelivered: d.undelivered,
      cashCollected: d.delivered.reduce((s, o) => s + (o.cod || 0), 0),
    }))
    .sort((a, b) => b.undelivered.length - a.undelivered.length);

  if (drivers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
        <CheckCircle2 className="h-16 w-16 text-green-500 opacity-60" />
        <p className="text-lg font-medium">لا يوجد سائقون بانتظار الاستلام</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" /> من الذي عاد؟
        </h2>
        <p className="text-sm text-muted-foreground mt-1">اختر السائق لبدء عملية الاستلام والتسوية</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {drivers.map((d) => (
          <button
            key={d.name}
            onClick={() => onSelect(d.name)}
            className="text-right p-5 rounded-2xl border-2 border-muted hover:border-primary hover:shadow-md hover:bg-primary/5 transition-all group"
          >
            <div className="flex items-start justify-between gap-2 mb-4">
              <p className="font-bold text-lg group-hover:text-primary transition-colors">{d.name}</p>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Truck className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2 text-center">
                <p className="text-xl font-bold text-green-700 dark:text-green-400">{d.delivered.length}</p>
                <p className="text-xs text-green-600 dark:text-green-500">مُسلَّم</p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2 text-center">
                <p className="text-xl font-bold text-red-700 dark:text-red-400">{d.undelivered.length}</p>
                <p className="text-xs text-red-600 dark:text-red-500">مرتجع</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t flex items-center justify-between">
              <p className="text-xs text-muted-foreground">كاش جمعه</p>
              <p className="font-bold text-orange-600">{formatCurrency(d.cashCollected)}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Step 2: التسوية النقدية ─────────────────────────────────────────────────
function StepCashSettlement({ driver, orders, onNext, onBack }: {
  driver: string; orders: Order[]; onNext: () => void; onBack: () => void;
}) {
  const { formatCurrency } = useSettings();
  const [showDelivered, setShowDelivered] = useState(false);

  // القراءة مباشرة من جدول الطلبات حسب السائق
  const delivered = orders.filter(o => o.status === DELIVERED_STATUS);
  const undelivered = orders.filter(o => UNDELIVERED_WITH_DRIVER.includes(o.status));
  const cashCollected = delivered.reduce((s, o) => s + (o.cod || 0), 0);
  const driverFee = delivered.reduce((s, o) => s + (o.driverFee || 0), 0);
  const netToHandOver = Math.max(0, cashCollected - driverFee);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowRight className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold">التسوية النقدية</h2>
          <p className="text-sm text-muted-foreground">{driver}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* بطاقة الحساب */}
        <Card className="border-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Receipt className="h-4 w-4 text-primary" /> الحساب
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-0">
            <div className="flex items-center justify-between py-3 border-b">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">جمع من {delivered.length} طلب</p>
                  <p className="text-xs text-muted-foreground">طلبات مُسلَّمة</p>
                </div>
              </div>
              <p className="font-bold text-green-700 text-lg">{formatCurrency(cashCollected)}</p>
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Banknote className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">أجرة التوصيل</p>
                  <p className="text-xs text-muted-foreground">حق السائق</p>
                </div>
              </div>
              <p className="font-bold text-blue-700 text-lg">− {formatCurrency(driverFee)}</p>
            </div>
            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Receipt className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-bold">يُسلّم الآن</p>
                  <p className="text-xs text-muted-foreground">صافي المبلغ</p>
                </div>
              </div>
              <p className="text-3xl font-bold text-primary">{formatCurrency(netToHandOver)}</p>
            </div>
          </CardContent>
        </Card>

        {/* إحصائيات المرتجعات */}
        <Card className="border-2 border-orange-200 dark:border-orange-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <PackageX className="h-4 w-4 text-orange-600" /> المرتجعات تحتاج تصنيف
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold text-orange-600 mb-2">{undelivered.length}</p>
            <p className="text-sm text-muted-foreground mb-4">طلب لم يُسلَّم</p>
            <div className="space-y-1">
              {Object.entries(
                undelivered.reduce((acc, o) => {
                  acc[o.status] = (acc[o.status] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              ).map(([status, count]) => (
                <div key={status} className="flex justify-between text-sm">
                  <Badge variant="outline" className="text-xs">{status}</Badge>
                  <span className="font-bold">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* تفاصيل الطلبات المُسلَّمة */}
      {delivered.length > 0 && (
        <div>
          <button
            onClick={() => setShowDelivered(!showDelivered)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {showDelivered ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            تفاصيل الطلبات المُسلَّمة ({delivered.length})
          </button>
          {showDelivered && (
            <div className="mt-2 rounded-lg border overflow-hidden">
              <div className="grid grid-cols-3 bg-muted/50 text-xs font-medium px-4 py-2">
                <span>رقم الطلب</span><span>المستلم</span><span className="text-left">المبلغ</span>
              </div>
              {delivered.map(o => (
                <div key={o.id} className="grid grid-cols-3 px-4 py-2 text-sm border-t">
                  <span className="font-mono text-xs text-muted-foreground">#{o.orderNumber || o.id.slice(-6)}</span>
                  <span className="truncate">{o.recipient}</span>
                  <span className="font-bold text-green-700 text-left">{formatCurrency(o.cod)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <Button onClick={onNext} className="w-full h-12 text-base">
        <PackageX className="h-5 w-5 ml-2" />
        {undelivered.length > 0 ? `التالي: تصنيف ${undelivered.length} مرتجع` : 'إصدار السند (لا توجد مرتجعات)'}
      </Button>
    </div>
  );
}

// ─── Step 3: تصنيف المرتجعات ─────────────────────────────────────────────────
function StepClassify({ driver, undelivered, decisions, onDecide, onDecideBulk, onBack, onNext }: {
  driver: string;
  undelivered: Order[];
  decisions: DecisionMap;
  onDecide: (id: string, status: string) => void;
  onDecideBulk: (ids: string[], status: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const { formatCurrency } = useSettings();
  const { statuses } = useStatusesStore();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // الحالات المتاحة للاختيار (بدون الحالات التي لا معنى لها هنا)
  const availableStatuses = statuses.filter(s => s.isActive && !EXCLUDED_STATUSES.includes(s.name));

  const decided = Object.values(decisions).filter(Boolean).length;
  const anyDecided = decided > 0;

  const toggleSelect = (id: string) => {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const toggleSelectAll = () => {
    setSelected(prev => prev.size === undelivered.length ? new Set() : new Set(undelivered.map(o => o.id)));
  };

  const handleBulkStatus = (status: string) => {
    const targets = selected.size > 0 ? Array.from(selected) : undelivered.map(o => o.id);
    onDecideBulk(targets, status);
    setSelected(new Set());
  };

  // تجميع الحالات المختارة للعرض
  const statusCounts = undelivered.reduce((acc, o) => {
    const d = decisions[o.id];
    if (d) acc[d] = (acc[d] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowRight className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h2 className="text-xl font-bold">تحديد مصير المرتجعات</h2>
          <p className="text-sm text-muted-foreground">{driver} — {decided}/{undelivered.length} تم تحديدهم</p>
        </div>
        {/* ملخص حي */}
        <div className="flex gap-1.5 flex-wrap justify-end">
          {Object.entries(statusCounts).map(([status, count]) => {
            const s = statuses.find(x => x.name === status);
            return (
              <Badge key={status} style={{ backgroundColor: s?.color || '#888' }} className="text-white text-xs">
                {status} ({count})
              </Badge>
            );
          })}
        </div>
      </div>

      {/* شريط التقدم */}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${undelivered.length ? (decided / undelivered.length) * 100 : 0}%` }} />
      </div>

      {/* شريط الإجراءات الجماعية */}
      <div className="flex items-center gap-2 p-3 bg-muted/40 rounded-xl flex-wrap">
        <Checkbox
          checked={selected.size > 0 && selected.size === undelivered.length}
          onCheckedChange={toggleSelectAll}
        />
        <span className="text-sm text-muted-foreground flex-1 min-w-0">
          {selected.size > 0 ? `${selected.size} محدد` : 'تحديد الكل'}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline" className="gap-1">
              {selected.size > 0 ? `تغيير (${selected.size})` : 'تغيير الكل'}
              <ChevronLeft className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {availableStatuses.map(s => (
              <DropdownMenuItem key={s.name} onClick={() => handleBulkStatus(s.name)} className="gap-2">
                <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                {s.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* جدول الطلبات */}
      <div className="rounded-xl border overflow-hidden">
        <div className="grid grid-cols-[40px_1fr_1fr_120px_200px] bg-muted/50 text-xs font-semibold px-4 py-3 gap-3 border-b">
          <span />
          <span>رقم الطلب / المستلم</span>
          <span>التاجر / الحالة الحالية</span>
          <span>المبلغ</span>
          <span className="text-center">الحالة الجديدة</span>
        </div>
        {undelivered.map(order => {
          const dec = decisions[order.id];
          const decStatus = dec ? statuses.find(s => s.name === dec) : null;
          const isSel = selected.has(order.id);
          return (
            <div key={order.id} className={cn(
              'grid grid-cols-[40px_1fr_1fr_120px_200px] items-center px-4 py-3 gap-3 border-b last:border-b-0 transition-colors',
              dec && 'bg-primary/5',
              isSel && 'bg-primary/10',
            )}>
              <Checkbox checked={isSel} onCheckedChange={() => toggleSelect(order.id)} />

              {/* معلومات الطلب */}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">#{order.orderNumber || order.id.slice(-6)}</span>
                </div>
                <p className="text-sm truncate mt-0.5 text-muted-foreground">{order.recipient}</p>
                <p className="text-xs text-muted-foreground">{order.phone}</p>
              </div>

              {/* التاجر + الحالة الحالية */}
              <div className="min-w-0">
                <p className="text-sm truncate">{order.merchant}</p>
                <Badge variant="outline" className="text-xs mt-0.5">{order.status}</Badge>
              </div>

              {/* المبلغ */}
              <p className="font-bold text-orange-600">{formatCurrency(order.cod)}</p>

              {/* Dropdown لاختيار الحالة الجديدة */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline" className="w-full h-9 justify-between gap-1">
                    {dec ? (
                      <span className="flex items-center gap-1.5 min-w-0">
                        <span className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: decStatus?.color || '#888' }} />
                        <span className="truncate text-xs">{dec}</span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs">اختر الحالة</span>
                    )}
                    <ChevronLeft className="h-3 w-3 shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {availableStatuses.map(s => (
                    <DropdownMenuItem key={s.name} onClick={() => onDecide(order.id, s.name)} className="gap-2">
                      <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                      {s.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        })}
      </div>

      <div className="sticky bottom-4 pt-2">
        <Button onClick={onNext} disabled={!anyDecided}
          className="w-full h-12 text-base bg-green-600 hover:bg-green-700 text-white">
          <CheckCircle2 className="h-5 w-5 ml-2" />
          {decided === undelivered.length
            ? 'مراجعة وإصدار السند'
            : `مراجعة وإصدار السند (${decided} من ${undelivered.length} محدد)`}
        </Button>
      </div>
    </div>
  );
}

// ─── Step 4: ملخص نهائي ──────────────────────────────────────────────────────
function StepSummary({ driver, orders, decisions, onBack, onSubmit, isSubmitting }: {
  driver: string; orders: Order[]; decisions: DecisionMap;
  onBack: () => void; onSubmit: () => void; isSubmitting: boolean;
}) {
  const { formatCurrency } = useSettings();
  const { statuses } = useStatusesStore();

  const delivered = orders.filter(o => o.status === DELIVERED_STATUS);
  const undelivered = orders.filter(o => UNDELIVERED_WITH_DRIVER.includes(o.status));
  const cashCollected = delivered.reduce((s, o) => s + (o.cod || 0), 0);
  const driverFee = delivered.reduce((s, o) => s + (o.driverFee || 0), 0);
  const netToHandOver = Math.max(0, cashCollected - driverFee);

  // تجميع المرتجعات حسب الحالة الجديدة المختارة
  const byNewStatus = undelivered.reduce((acc, o) => {
    const d = decisions[o.id] || '—';
    if (!acc[d]) acc[d] = [];
    acc[d].push(o);
    return acc;
  }, {} as Record<string, Order[]>);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowRight className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold">ملخص الاستلام</h2>
          <p className="text-sm text-muted-foreground">{driver} — {new Date().toLocaleDateString('ar-SA')}</p>
        </div>
      </div>

      {/* التسوية النقدية */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <Receipt className="h-4 w-4 text-primary" /> التسوية النقدية
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-700">{formatCurrency(cashCollected)}</p>
              <p className="text-xs text-muted-foreground mt-1">جمع ({delivered.length} طلب)</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-700">− {formatCurrency(driverFee)}</p>
              <p className="text-xs text-muted-foreground mt-1">أجرة التوصيل</p>
            </div>
            <div className="bg-primary/10 rounded-xl p-2">
              <p className="text-2xl font-bold text-primary">{formatCurrency(netToHandOver)}</p>
              <p className="text-xs text-muted-foreground mt-1">يُسلّم الآن</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ملخص المرتجعات مجمّعة بالحالة الجديدة */}
      {undelivered.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground">المرتجعات ({undelivered.length} طلب)</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(byNewStatus).map(([status, ords]) => {
              const sData = statuses.find(s => s.name === status);
              return (
                <div key={status} className="rounded-xl border-2 p-4"
                  style={{ borderColor: sData?.color || '#e5e7eb' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: sData?.color || '#888' }} />
                    <span className="font-semibold text-sm">{status}</span>
                    <Badge variant="secondary" className="mr-auto">{ords.length}</Badge>
                  </div>
                  <div className="space-y-1">
                    {ords.slice(0, 3).map(o => (
                      <p key={o.id} className="text-xs text-muted-foreground truncate">{o.recipient}</p>
                    ))}
                    {ords.length > 3 && <p className="text-xs text-muted-foreground">+{ords.length - 3} أخرى</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button variant="outline" className="flex-1 h-12" onClick={onBack} disabled={isSubmitting}>تعديل</Button>
        <Button className="flex-1 h-12 text-base bg-green-600 hover:bg-green-700 text-white" onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting
            ? <><RefreshCw className="h-5 w-5 ml-2 animate-spin" />جاري الحفظ...</>
            : <><CheckCircle2 className="h-5 w-5 ml-2" />إصدار السند</>}
        </Button>
      </div>
    </div>
  );
}

// ─── Step 5: تم ──────────────────────────────────────────────────────────────
function StepDone({ slipId, driverName, netAmount, allOrders, onReset }: {
  slipId: string; driverName: string; netAmount: number;
  allOrders: Order[]; onReset: () => void;
}) {
  const { formatCurrency, settings } = useSettings();
  const now = new Date().toLocaleString('ar-SA', { dateStyle: 'full', timeStyle: 'short' });
  const companyName = (settings as any)?.companyName || 'نظام التوصيل';

  const deliveredOrders = allOrders.filter(o => o.status === DELIVERED_STATUS);
  const returnedOrders = allOrders.filter(o => !DELIVERED_STATUS.includes(o.status) && o.status !== DELIVERED_STATUS);

  const handlePrint = () => {
    const deliveredRows = deliveredOrders.map((o, i) => `
      <tr style="background:${i % 2 === 0 ? '#f0fdf4' : '#fff'}">
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-family:monospace">${i + 1}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-weight:600">${o.recipient}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:12px">${o.merchant || '—'}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-weight:700;color:#15803d">${o.cod || 0}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">
          <span style="display:inline-block;padding:2px 8px;border-radius:20px;background:#dcfce7;color:#166534;font-size:12px">تم التوصيل</span>
        </td>
      </tr>`).join('');
    const returnedRows = returnedOrders.map((o, i) => `
      <tr style="background:${i % 2 === 0 ? '#fefce8' : '#fff'}">
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-family:monospace">${deliveredOrders.length + i + 1}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-weight:600">${o.recipient}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:12px">${o.merchant || '—'}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-weight:700;color:#d97706">${o.cod || 0}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">
          <span style="display:inline-block;padding:2px 8px;border-radius:20px;background:#fef9c3;color:#854d0e;font-size:12px">${o.status}</span>
        </td>
      </tr>`).join('');
    const rows = deliveredRows + returnedRows;

    const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8"/>
  <title>كشف استلام - ${slipId}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: 'Arial', sans-serif; font-size:13px; color:#111; background:#fff; }
    .header { background:#1e293b; color:#fff; padding:16px 24px; display:flex; justify-content:space-between; align-items:center; }
    .header h1 { font-size:18px; font-weight:700; }
    .header p { font-size:12px; opacity:0.75; margin-top:3px; }
    .slip-id { font-family:monospace; font-size:16px; font-weight:700; }
    .summary { display:grid; grid-template-columns:repeat(4,1fr); border-bottom:2px solid #e5e7eb; }
    .sc { padding:12px 16px; text-align:center; border-left:1px solid #e5e7eb; }
    .sc:last-child { border-left:none; }
    .sc .lbl { font-size:10px; color:#6b7280; margin-bottom:3px; }
    .sc .val { font-size:16px; font-weight:700; }
    .section-title { padding:8px 16px; background:#f8fafc; border-bottom:1px solid #e5e7eb; font-size:11px; font-weight:700; color:#475569; letter-spacing:.05em; text-transform:uppercase; }
    table { width:100%; border-collapse:collapse; }
    th { padding:8px 12px; text-align:right; font-size:11px; font-weight:600; color:#374151; border-bottom:2px solid #e5e7eb; background:#f3f4f6; }
    td { padding:7px 12px; border-bottom:1px solid #f1f5f9; font-size:12px; }
    .signatures { display:grid; grid-template-columns:1fr 1fr; gap:40px; padding:20px 24px; border-top:1px solid #e5e7eb; }
    .sig { text-align:center; }
    .sig-line { border-bottom:1px dashed #9ca3af; height:36px; margin-bottom:6px; }
    .sig-label { font-size:11px; color:#6b7280; }
    .sig-name { font-size:11px; font-weight:600; margin-top:3px; }
    @media print { @page { margin:10mm; } }
  </style>
</head>
<body>
  <div class="header">
    <div><h1>${companyName}</h1><p>كشف استلام سائق</p></div>
    <div style="text-align:left">
      <div class="slip-id">${slipId}</div>
      <div style="font-size:11px;opacity:0.75;margin-top:3px">${now}</div>
    </div>
  </div>
  <div class="summary">
    <div class="sc"><div class="lbl">السائق</div><div class="val">${driverName}</div></div>
    <div class="sc"><div class="lbl">المبلغ المستلم</div><div class="val" style="color:#15803d">${netAmount}</div></div>
    <div class="sc"><div class="lbl">طلبات مُسلَّمة</div><div class="val" style="color:#1d4ed8">${deliveredOrders.length}</div></div>
    <div class="sc"><div class="lbl">مرتجعات</div><div class="val" style="color:#b45309">${returnedOrders.length}</div></div>
  </div>
  ${deliveredOrders.length > 0 ? `
  <div class="section-title">الطلبات المُسلَّمة (${deliveredOrders.length})</div>
  <table><thead><tr><th>#</th><th>المستلم</th><th>التاجر</th><th>المبلغ</th><th>الحالة</th></tr></thead>
  <tbody>${deliveredRows}</tbody></table>` : ''}
  ${returnedOrders.length > 0 ? `
  <div class="section-title" style="margin-top:4px">المرتجعات (${returnedOrders.length})</div>
  <table><thead><tr><th>#</th><th>المستلم</th><th>التاجر</th><th>المبلغ</th><th>الحالة الجديدة</th></tr></thead>
  <tbody>${returnedRows}</tbody></table>` : ''}
  <div class="signatures">
    <div class="sig"><div class="sig-line"></div><div class="sig-label">توقيع السائق</div><div class="sig-name">${driverName}</div></div>
    <div class="sig"><div class="sig-line"></div><div class="sig-label">توقيع المستلم</div></div>
  </div>
  <script>window.onload=function(){window.print();window.onafterprint=function(){window.close();};};</script>
</body></html>`;

    const w = window.open('', '_blank', 'width=900,height=650');
    if (w) { w.document.write(html); w.document.close(); }
  };

  return (
    <div className="w-full space-y-5">
      {/* شريط النجاح */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-8 w-8 text-green-600 shrink-0" />
          <div>
            <p className="font-bold text-green-800 dark:text-green-300">تم الاستلام بنجاح</p>
            <p className="text-xs text-green-600 font-mono">{slipId}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 ml-1" /> طباعة الكشف
          </Button>
          <Button size="sm" onClick={onReset}>
            <Truck className="h-4 w-4 ml-1" /> سائق آخر
          </Button>
        </div>
      </div>

      {/* إجماليات */}
      <div className="grid grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-center">
          <p className="text-2xl font-bold text-primary">{formatCurrency(netAmount)}</p>
          <p className="text-xs text-muted-foreground mt-1">استُلم نقداً</p>
        </div>
        <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 text-center">
          <p className="text-2xl font-bold text-green-700">{deliveredOrders.length}</p>
          <p className="text-xs text-muted-foreground mt-1">مُسلَّم</p>
        </div>
        <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 text-center">
          <p className="text-2xl font-bold text-orange-700">{returnedOrders.length}</p>
          <p className="text-xs text-muted-foreground mt-1">مرتجع مصنَّف</p>
        </div>
        <div className="p-4 rounded-xl bg-muted/50 border text-center">
          <p className="text-2xl font-bold">{allOrders.length}</p>
          <p className="text-xs text-muted-foreground mt-1">إجمالي الطلبات</p>
        </div>
      </div>

      {/* جدول كامل */}
      <div className="rounded-xl border overflow-hidden">
        {deliveredOrders.length > 0 && (
          <>
            <div className="bg-green-50 dark:bg-green-900/20 px-4 py-2.5 border-b flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <p className="font-semibold text-sm text-green-800 dark:text-green-300">مُسلَّمة ({deliveredOrders.length})</p>
            </div>
            <div className="grid grid-cols-[36px_1fr_1fr_110px_130px] bg-muted/30 text-xs font-semibold px-4 py-2 border-b gap-3">
              <span>#</span><span>المستلم</span><span>التاجر</span><span>المبلغ</span><span>الحالة</span>
            </div>
            {deliveredOrders.map((o, i) => (
              <div key={o.id} className={cn('grid grid-cols-[36px_1fr_1fr_110px_130px] items-center px-4 py-2.5 gap-3 border-b text-sm', i % 2 === 0 ? 'bg-green-50/30' : '')}>
                <span className="text-muted-foreground font-mono text-xs">{i + 1}</span>
                <div><p className="font-medium">{o.recipient}</p><p className="text-xs text-muted-foreground">{o.phone}</p></div>
                <span className="text-muted-foreground text-xs truncate">{o.merchant || '—'}</span>
                <span className="font-bold text-green-700">{formatCurrency(o.cod || 0)}</span>
                <Badge className="w-fit bg-green-100 text-green-800 border-0 text-xs">تم التوصيل</Badge>
              </div>
            ))}
          </>
        )}
        {returnedOrders.length > 0 && (
          <>
            <div className="bg-orange-50 dark:bg-orange-900/20 px-4 py-2.5 border-b flex items-center gap-2">
              <PackageX className="h-4 w-4 text-orange-600" />
              <p className="font-semibold text-sm text-orange-800 dark:text-orange-300">مرتجعات ({returnedOrders.length})</p>
            </div>
            <div className="grid grid-cols-[36px_1fr_1fr_110px_130px] bg-muted/30 text-xs font-semibold px-4 py-2 border-b gap-3">
              <span>#</span><span>المستلم</span><span>التاجر</span><span>المبلغ</span><span>الحالة الجديدة</span>
            </div>
            {returnedOrders.map((o, i) => (
              <div key={o.id} className={cn('grid grid-cols-[36px_1fr_1fr_110px_130px] items-center px-4 py-2.5 gap-3 border-b last:border-b-0 text-sm', i % 2 === 0 ? 'bg-orange-50/30' : '')}>
                <span className="text-muted-foreground font-mono text-xs">{deliveredOrders.length + i + 1}</span>
                <div><p className="font-medium">{o.recipient}</p><p className="text-xs text-muted-foreground">{o.phone}</p></div>
                <span className="text-muted-foreground text-xs truncate">{o.merchant || '—'}</span>
                <span className="font-bold text-orange-600">{formatCurrency(o.cod || 0)}</span>
                <Badge variant="outline" className="w-fit text-xs">{o.status}</Badge>
              </div>
            ))}
          </>
        )}
      </div>

      {/* توقيعات */}
      <div className="grid grid-cols-2 gap-8 pt-4 border-t">
        <div className="text-center">
          <div className="border-b-2 border-dashed border-muted-foreground/30 mb-3 h-12" />
          <p className="text-sm text-muted-foreground">توقيع السائق</p>
          <p className="text-sm font-bold mt-1">{driverName}</p>
        </div>
        <div className="text-center">
          <div className="border-b-2 border-dashed border-muted-foreground/30 mb-3 h-12" />
          <p className="text-sm text-muted-foreground">توقيع المستلم</p>
        </div>
      </div>
    </div>
  );
}

// ─── الصفحة الرئيسية ─────────────────────────────────────────────────────────
export default function ReturnsPage() {
  const { orders, isLoading, loadOrdersFromAPI } = useOrdersStore();
  const { toast } = useToast();

  const [step, setStep] = useState<'select' | 'cash' | 'classify' | 'summary' | 'done'>('select');
  const [selectedDriver, setSelectedDriver] = useState('');
  const [decisions, setDecisions] = useState<DecisionMap>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdSlipId, setCreatedSlipId] = useState('');
  // snapshot للطلبات لحظة الإرسال — حتى لا تختفي بعد مسح السائق
  const [slipSnapshot, setSlipSnapshot] = useState<{
    allOrders: Order[];
    decisionsAtSubmit: DecisionMap;
    netAmount: number;
  } | null>(null);

  // كل طلبات هذا السائق من جدول الطلبات (مصدر الحقيقة)
  const driverOrders = orders.filter(o => o.driver === selectedDriver);
  // المرتجعات التي تحتاج تصنيف = لم تُسلَّم وهي في الميدان
  const undelivered = driverOrders.filter(o => UNDELIVERED_WITH_DRIVER.includes(o.status));
  // عداد التنبيه في الهيدر
  const allPendingReturns = orders.filter(o => o.driver && (UNDELIVERED_WITH_DRIVER.includes(o.status) || o.status === DELIVERED_STATUS));

  const handleSelectDriver = (driver: string) => {
    setSelectedDriver(driver);
    const init: DecisionMap = {};
    orders.filter(o => o.driver === driver && UNDELIVERED_WITH_DRIVER.includes(o.status))
      .forEach(o => { init[o.id] = null; });
    setDecisions(init);
    setSlipSnapshot(null);
    setStep('cash');
  };

  const handleDecide = (id: string, status: string) =>
    setDecisions(prev => ({ ...prev, [id]: status }));

  const handleDecideBulk = (ids: string[], status: string) => {
    setDecisions(prev => {
      const updated = { ...prev };
      ids.forEach(id => { updated[id] = status; });
      return updated;
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    // snapshot كامل قبل الإرسال (الطلبات ستختفي بعد مسح السائق)
    const deliveredSnap = driverOrders.filter(o => o.status === DELIVERED_STATUS);
    const netAmountSnap = Math.max(0,
      deliveredSnap.reduce((s, o) => s + (o.cod || 0), 0) -
      deliveredSnap.reduce((s, o) => s + (o.driverFee || 0), 0)
    );
    // نبني snapshot بالحالة المختارة مضمّنة في كل طلب
    const allOrdersSnap: Order[] = driverOrders.map(o => ({
      ...o,
      // الطلبات غير المُسلَّمة: نضع الحالة الجديدة المختارة في previousStatus للعرض
      status: decisions[o.id] ? decisions[o.id] as any : o.status,
    }));
    setSlipSnapshot({ allOrders: allOrdersSnap, decisionsAtSubmit: { ...decisions }, netAmount: netAmountSnap });

    try {
      // تطبيق الحالة الجديدة + مسح السائق
      await Promise.all(
        undelivered
          .filter(o => decisions[o.id])
          .map(o => api.updateOrderStatus(o.id, decisions[o.id] as string, null))
      );

      // سندات مرتجعات التجار
      const merchantReturnOrders = undelivered.filter(o => decisions[o.id] === 'مرجع للتاجر' && o.merchant);
      if (merchantReturnOrders.length > 0) {
        const groups = new Map<string, string[]>();
        merchantReturnOrders.forEach(o => {
          const list = groups.get(o.merchant!) ?? [];
          groups.set(o.merchant!, [...list, o.id]);
        });
        await Promise.all(
          Array.from(groups.entries()).map(([merchant, ids]) =>
            api.createMerchantReturnSlip({ merchant, orderIds: ids })
          )
        );
      }

      // كشف استلام السائق — كل طلباته (مسلَّمة + مرتجعة)
      const slip = await api.createDriverReturnSlip({
        driverName: selectedDriver,
        orderIds: driverOrders.map(o => o.id),
      });

      setCreatedSlipId(slip.id);
      setStep('done');
      await loadOrdersFromAPI();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'خطأ', description: err.message || 'حدث خطأ أثناء الحفظ' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setStep('select');
    setSelectedDriver('');
    setDecisions({});
    setCreatedSlipId('');
    setSlipSnapshot(null);
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <PackageX className="h-8 w-8 text-primary" />
            استلام السائقين
          </h1>
          <p className="text-muted-foreground mt-1">تسوية نقدية وتصنيف المرتجعات عند عودة السائق</p>
        </div>
        {allPendingReturns.length > 0 && (
          <Badge variant="destructive" className="text-sm px-3 py-1.5">
            {allPendingReturns.length} طلب بانتظار المعالجة
          </Badge>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="receive" dir="rtl" className="flex-1 flex flex-col min-h-0">
        <TabsList className="w-fit flex-shrink-0">
          <TabsTrigger value="receive" className="gap-2">
            <Truck className="h-4 w-4" />
            استلام سائق
            {allPendingReturns.length > 0 && (
              <span className="bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 px-2 py-0.5 rounded-full text-xs font-bold">
                {allPendingReturns.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="merchant-returns" className="gap-2">
            <Building2 className="h-4 w-4" />
            مرتجعات التجار
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            السجل
          </TabsTrigger>
        </TabsList>

        <TabsContent value="receive" className="flex-1 overflow-y-auto mt-4 pb-6">
          <div className="px-1">
            {step === 'select' && (
              <StepSelectDriver orders={orders} isLoading={isLoading} onSelect={handleSelectDriver} />
            )}
            {step === 'cash' && (
              <StepCashSettlement
                driver={selectedDriver}
                orders={driverOrders}
                onNext={() => undelivered.length > 0 ? setStep('classify') : setStep('summary')}
                onBack={() => setStep('select')}
              />
            )}
            {step === 'classify' && (
              <StepClassify
                driver={selectedDriver}
                undelivered={undelivered}
                decisions={decisions}
                onDecide={handleDecide}
                onDecideBulk={handleDecideBulk}
                onBack={() => setStep('cash')}
                onNext={() => setStep('summary')}
              />
            )}
            {step === 'summary' && (
              <StepSummary
                driver={selectedDriver}
                orders={driverOrders}
                decisions={decisions}
                onBack={() => setStep(undelivered.length > 0 ? 'classify' : 'cash')}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
              />
            )}
            {step === 'done' && slipSnapshot && (
              <StepDone
                slipId={createdSlipId}
                driverName={selectedDriver}
                netAmount={slipSnapshot.netAmount}
                allOrders={slipSnapshot.allOrders}
                onReset={handleReset}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="merchant-returns" className="flex-1 overflow-y-auto mt-4">
          <MerchantReturnsTab />
        </TabsContent>

        <TabsContent value="history" className="flex-1 overflow-y-auto mt-4">
          <ReturnSlipsHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}
