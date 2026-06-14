'use client';

import { useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOrdersStore } from '@/store/orders-store';
import { useSettings } from '@/contexts/SettingsContext';
import { useDriverOrders } from '@/hooks/use-driver-orders';
import Icon from '@/components/icon';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const STATUS_CFG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  'تم التوصيل':   { label: 'مسلّم',       bg: 'bg-emerald-500/15', text: 'text-emerald-600', border: 'border-emerald-500/30' },
  'جاري التوصيل': { label: 'في الطريق',   bg: 'bg-blue-500/15',    text: 'text-blue-600',    border: 'border-blue-500/30'   },
  'بالانتظار':    { label: 'معيّن لي',     bg: 'bg-amber-500/15',   text: 'text-amber-600',   border: 'border-amber-500/30'  },
  'مؤجل':         { label: 'مؤجل',         bg: 'bg-orange-500/15',  text: 'text-orange-600',  border: 'border-orange-500/30' },
  'مرتجع':        { label: 'مرتجع',        bg: 'bg-red-500/15',     text: 'text-red-600',     border: 'border-red-500/30'    },
};

function OrderCard({ order, onTap }: { order: any; onTap: (o: any) => void }) {
  const cfg = STATUS_CFG[order.status] ?? { label: order.status, bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-border' };
  const { formatCurrency } = useSettings();

  return (
    <button
      onClick={() => onTap(order)}
      className="w-full text-right flex items-center gap-3 p-4 rounded-2xl border bg-card hover:border-primary/40 active:scale-[0.985] transition-all shadow-sm"
    >
      <div className={cn('w-1 self-stretch rounded-full shrink-0', cfg.text.replace('text-', 'bg-').replace('600', '400'))} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="font-mono text-xs font-bold text-primary">#{order.id?.slice(-6)}</span>
          <span className={cn('text-[11px] font-semibold px-2 py-0.5 rounded-full border', cfg.bg, cfg.text, cfg.border)}>
            {cfg.label}
          </span>
        </div>
        <p className="font-bold text-sm truncate">{order.recipient}</p>
        <div className="flex items-center gap-3 mt-1">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Icon name="MapPin" className="h-3 w-3" />
            {order.region || order.city || 'عمان'}
          </span>
          {order.cod > 0 && (
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
              <Icon name="Banknote" className="h-3 w-3" />
              {formatCurrency(order.cod)}
            </span>
          )}
        </div>
      </div>

      <Icon name="ChevronLeft" className="h-4 w-4 text-muted-foreground shrink-0" />
    </button>
  );
}

function QuickActionSheet({ order, onClose, onAction }: {
  order: any; onClose: () => void; onAction: (id: string, status: string, reason?: string) => void;
}) {
  const [step, setStep] = useState<'main' | 'fail'>('main');
  const [reason, setReason] = useState('');
  const { formatCurrency } = useSettings();

  const failReasons = ['لا رد على الهاتف', 'رفض الاستلام', 'العنوان غير صحيح', 'طلب التأجيل', 'أخرى'];

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full bg-card rounded-t-3xl p-5 pb-8 space-y-4 shadow-2xl animate-in slide-in-from-bottom-4 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-muted-foreground/20 rounded-full mx-auto mb-2" />

        <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl">
          <div className="p-2.5 bg-primary/10 rounded-xl">
            <Icon name="Package" className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold truncate">{order.recipient}</p>
            <p className="text-xs text-muted-foreground">
              {order.region || order.city} • <span className="font-mono">#{order.id?.slice(-6)}</span>
            </p>
          </div>
          {order.cod > 0 && (
            <span className="font-black text-emerald-600 text-lg">{formatCurrency(order.cod)}</span>
          )}
        </div>

        {step === 'main' ? (
          <>
            <div className="grid grid-cols-2 gap-2">
              <a
                href={`tel:${order.phone}`}
                className="flex items-center justify-center gap-2 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 font-semibold text-sm"
              >
                <Icon name="Phone" className="h-4 w-4" /> اتصال
              </a>
              <a
                href={`https://api.whatsapp.com/send?phone=${order.phone?.replace(/[^0-9]/g, '')}`}
                target="_blank" rel="noreferrer"
                className="flex items-center justify-center gap-2 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 font-semibold text-sm"
              >
                <Icon name="MessageCircle" className="h-4 w-4" /> واتساب
              </a>
            </div>

            {order.address && (
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(order.address + ' ' + (order.region || ''))}`}
                target="_blank" rel="noreferrer"
                className="flex items-center justify-center gap-2 h-11 w-full rounded-xl bg-muted/60 border text-muted-foreground font-medium text-sm"
              >
                <Icon name="Map" className="h-4 w-4" /> فتح الخريطة
              </a>
            )}

            <div className="space-y-2 pt-1">
              <button
                onClick={() => onAction(order.id, 'تم التوصيل')}
                className="w-full h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white font-black text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all"
              >
                <Icon name="PackageCheck" className="h-5 w-5" />
                تم التسليم ✓
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onAction(order.id, 'مؤجل')}
                  className="h-11 rounded-xl border bg-muted/40 text-muted-foreground hover:border-orange-400 hover:text-orange-600 font-semibold text-sm transition-colors"
                >
                  تأجيل
                </button>
                <button
                  onClick={() => setStep('fail')}
                  className="h-11 rounded-xl border bg-muted/40 text-muted-foreground hover:border-red-400 hover:text-red-600 font-semibold text-sm transition-colors"
                >
                  فشل التسليم
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <p className="font-bold text-sm text-center text-muted-foreground">اختر سبب الفشل</p>
            <div className="space-y-2">
              {failReasons.map(r => (
                <button
                  key={r}
                  onClick={() => setReason(r)}
                  className={cn(
                    'w-full h-11 rounded-xl border text-sm font-semibold transition-colors',
                    reason === r
                      ? 'bg-red-500/10 border-red-400 text-red-600'
                      : 'bg-muted/40 text-muted-foreground hover:border-red-300'
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
            <button
              disabled={!reason}
              onClick={() => onAction(order.id, 'مرتجع', reason)}
              className="w-full h-12 rounded-2xl bg-red-500 disabled:opacity-40 hover:bg-red-600 text-white font-black text-sm transition-colors"
            >
              تأكيد الفشل
            </button>
            <button onClick={() => setStep('main')} className="w-full text-center text-sm text-muted-foreground">
              ← رجوع
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function DriverHomePage() {
  const { updateOrderStatus } = useOrdersStore();
  const { formatCurrency } = useSettings();
  const { orders: myOrders, isLoading } = useDriverOrders();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const activeOrders = useMemo(() =>
    myOrders.filter(o => ['جاري التوصيل', 'بالانتظار'].includes(o.status))
  , [myOrders]);

  const todayStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayO = myOrders.filter(o => o.date?.startsWith(today));
    return {
      total:        todayO.length,
      delivered:    todayO.filter(o => o.status === 'تم التوصيل').length,
      pending:      todayO.filter(o => ['جاري التوصيل', 'بالانتظار'].includes(o.status)).length,
      returned:     todayO.filter(o => o.status === 'مرتجع').length,
      codTotal:     todayO.reduce((s, o) => s + (o.cod || 0), 0),
      codCollected: todayO.filter(o => o.status === 'تم التوصيل').reduce((s, o) => s + (o.cod || 0), 0),
    };
  }, [myOrders]);

  const completionRate = todayStats.total ? Math.round((todayStats.delivered / todayStats.total) * 100) : 0;

  const handleAction = async (orderId: string, status: string) => {
    try { await updateOrderStatus(orderId, status as any); } catch { /* reverted */ }
    setSelectedOrder(null);
  };

  if (isLoading) return (
    <div className="space-y-3 pb-4">
      <Skeleton className="h-32 rounded-2xl -mx-4 -mt-4" />
      <div className="grid grid-cols-4 gap-2">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
      </div>
      {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
    </div>
  );

  return (
    <div className="space-y-4 pb-4">

      {/* ── Hero: progress card (edge-to-edge) ── */}
      <div className="-mx-4 -mt-4 relative overflow-hidden bg-gradient-to-bl from-primary via-blue-600 to-indigo-700 px-5 pt-6 pb-10">
        <div className="absolute -top-8 -left-8 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-4 right-0 w-28 h-28 bg-black/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <p className="text-white/75 text-xs mb-1 font-medium">إنجاز اليوم</p>
          <div className="flex items-end justify-between mb-3">
            <p className="text-white font-black text-5xl leading-none">{completionRate}<span className="text-2xl">%</span></p>
            <div className="text-left pb-1">
              <p className="text-white font-bold text-sm">{todayStats.delivered} مسلّم</p>
              <p className="text-white/60 text-xs">{todayStats.pending} متبقي</p>
            </div>
          </div>
          <Progress value={completionRate} className="h-2 bg-white/20 [&>div]:bg-white" />
        </div>
      </div>

      {/* ── 4 stat chips (floating over hero bottom) ── */}
      <div className="grid grid-cols-4 gap-2 -mt-6">
        {[
          { val: todayStats.total,     label: 'إجمالي', icon: 'Package',      bg: 'bg-card',           text: 'text-foreground'  },
          { val: todayStats.delivered, label: 'مسلّم',  icon: 'PackageCheck', bg: 'bg-emerald-500/10', text: 'text-emerald-600' },
          { val: todayStats.pending,   label: 'قيد',    icon: 'Clock',        bg: 'bg-amber-500/10',   text: 'text-amber-600'   },
          { val: todayStats.returned,  label: 'مرتجع',  icon: 'Undo2',        bg: 'bg-red-500/10',     text: 'text-red-600'     },
        ].map(c => (
          <div key={c.label} className={`rounded-2xl border shadow-md ${c.bg} p-3 text-center`}>
            <Icon name={c.icon as any} className={`h-4 w-4 mx-auto mb-1 ${c.text}`} />
            <p className={`text-xl font-black leading-none ${c.text}`}>{c.val}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      {/* ── COD summary ── */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border bg-card p-4 flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 rounded-xl shrink-0">
            <Icon name="Wallet" className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">محصّل اليوم</p>
            <p className="font-black text-emerald-600 text-base leading-tight">{formatCurrency(todayStats.codCollected)}</p>
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-4 flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 rounded-xl shrink-0">
            <Icon name="Banknote" className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">متبقي للتحصيل</p>
            <p className="font-black text-amber-600 text-base leading-tight">
              {formatCurrency(todayStats.codTotal - todayStats.codCollected)}
            </p>
          </div>
        </div>
      </div>

      {/* ── Active orders ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            الطلبات النشطة
            <Badge variant="secondary" className="rounded-full text-xs">{activeOrders.length}</Badge>
          </h2>
          <Link href="/driver/orders" className="text-xs text-primary font-semibold flex items-center gap-1">
            عرض الكل <Icon name="ArrowLeft" className="h-3 w-3" />
          </Link>
        </div>

        {activeOrders.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-muted/20 p-10 text-center">
            <Icon name="PackageCheck" className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground text-sm font-medium">لا توجد طلبات نشطة</p>
            <p className="text-muted-foreground/60 text-xs mt-1">ستظهر طلباتك هنا عند تعيينها لك</p>
          </div>
        ) : (
          <div className="space-y-2">
            {activeOrders.slice(0, 5).map(o => (
              <OrderCard key={o.id} order={o} onTap={setSelectedOrder} />
            ))}
            {activeOrders.length > 5 && (
              <Link href="/driver/orders">
                <div className="w-full h-11 rounded-2xl border border-dashed text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center">
                  + {activeOrders.length - 5} طلب آخر
                </div>
              </Link>
            )}
          </div>
        )}
      </div>

      {/* ── Quick nav ── */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { href: '/driver/orders',  icon: 'ClipboardList', label: 'طلباتي',  bg: 'bg-blue-500/10',    ic: 'text-blue-600'    },
          { href: '/driver/scan',    icon: 'ScanBarcode',   label: 'مسح',     bg: 'bg-primary/10',     ic: 'text-primary'     },
          { href: '/driver/records', icon: 'Wallet',        label: 'محفظتي',  bg: 'bg-emerald-500/10', ic: 'text-emerald-600' },
          { href: '/driver/history', icon: 'History',       label: 'السجل',   bg: 'bg-purple-500/10',  ic: 'text-purple-600'  },
        ].map(a => (
          <Link key={a.href} href={a.href}>
            <div className="rounded-2xl border bg-card p-3 flex flex-col items-center gap-1.5 hover:border-primary/40 active:scale-[0.97] transition-all text-center cursor-pointer">
              <div className={`p-2.5 rounded-xl ${a.bg}`}>
                <Icon name={a.icon as any} className={`h-5 w-5 ${a.ic}`} />
              </div>
              <span className="text-[11px] font-semibold">{a.label}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Bottom sheet ── */}
      {selectedOrder && (
        <QuickActionSheet
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onAction={handleAction}
        />
      )}
    </div>
  );
}
