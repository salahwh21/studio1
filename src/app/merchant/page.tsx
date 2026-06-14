'use client';

import { useState, useMemo } from 'react';
import { useOrdersStore } from '@/store/orders-store';
import { useSettings } from '@/contexts/SettingsContext';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Icon from '@/components/icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const STATUS_MAP: Record<string, { label: string; color: string; dot: string }> = {
  'تم التوصيل':    { label: 'تم التوصيل',    color: 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30', dot: 'bg-emerald-500' },
  'جاري التوصيل':  { label: 'جاري التوصيل',  color: 'bg-blue-500/15 text-blue-600 border border-blue-500/30',         dot: 'bg-blue-500' },
  'بالانتظار':     { label: 'بالانتظار',      color: 'bg-yellow-500/15 text-yellow-600 border border-yellow-500/30',   dot: 'bg-yellow-500' },
  'مرتجع':         { label: 'مرتجع',          color: 'bg-red-500/15 text-red-600 border border-red-500/30',             dot: 'bg-red-500' },
  'ملغي':          { label: 'ملغي',            color: 'bg-gray-500/15 text-gray-500 border border-gray-500/30',         dot: 'bg-gray-400' },
};

function StatusPill({ status }: { status: string }) {
  const s = STATUS_MAP[status] ?? { label: status, color: 'bg-gray-100 text-gray-600 border border-gray-200', dot: 'bg-gray-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${s.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

export default function MerchantDashboard() {
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');
  const { orders: allOrders } = useOrdersStore();
  const { settings, formatCurrency } = useSettings();
  const { user } = useAuth();

  const stats = useMemo(() => {
    const now = new Date();
    const filtered = (days: number) => {
      const from = new Date(now); from.setDate(from.getDate() - days);
      return allOrders.filter(o => new Date(o.date) >= from);
    };
    const calc = (orders: typeof allOrders) => {
      const delivered = orders.filter(o => o.status === 'تم التوصيل');
      const pending   = orders.filter(o => ['بالانتظار', 'جاري التوصيل'].includes(o.status));
      const returned  = orders.filter(o => o.status === 'مرتجع');
      const cod       = delivered.reduce((s, o) => s + (o.cod || 0), 0);
      return {
        total: orders.length,
        delivered: delivered.length,
        pending: pending.length,
        returned: returned.length,
        cod,
        rate: orders.length ? Math.round((delivered.length / orders.length) * 100) : 0,
      };
    };
    return { today: calc(filtered(1)), week: calc(filtered(7)), month: calc(filtered(30)) };
  }, [allOrders]);

  const s = stats[period];

  const recentOrders = useMemo(() =>
    allOrders.slice(0, 6).map(o => ({
      id: o.id, recipient: o.recipient,
      status: o.status, cod: o.cod,
      city: (o as any).city || 'عمان',
      date: o.date,
    }))
  , [allOrders]);

  const firstName = user?.name?.split(' ')[0] || 'التاجر';

  return (
    <div className="min-h-screen bg-background" dir="rtl">

      {/* ── Top greeting bar ── */}
      <div className="bg-gradient-to-l from-primary/5 via-background to-background border-b px-4 py-4 md:px-8 md:py-5">
        <div className="max-w-7xl mx-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">مرحباً،</p>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">{firstName} 👋</h1>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Period toggle */}
            <div className="flex items-center bg-muted rounded-xl p-1 gap-0.5">
              {(['today','week','month'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    period === p ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {p === 'today' ? 'اليوم' : p === 'week' ? 'الأسبوع' : 'الشهر'}
                </button>
              ))}
            </div>
            <Button size="sm" asChild className="gap-1.5 h-9">
              <Link href="/merchant/add-order">
                <Icon name="Plus" className="h-4 w-4" />
                شحنة جديدة
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-5 md:px-8 space-y-6">

        {/* ── KPI cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">

          {/* Total */}
          <div className="col-span-2 lg:col-span-1 rounded-2xl bg-gradient-to-br from-primary to-orange-400 p-5 text-white shadow-lg shadow-primary/20">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/70 text-xs font-medium mb-1">إجمالي الشحنات</p>
                <p className="text-4xl font-black leading-none">{s.total}</p>
              </div>
              <div className="p-2 bg-white/20 rounded-xl">
                <Icon name="Package" className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <Progress value={s.rate} className="h-1.5 bg-white/20" />
              <p className="text-white/70 text-xs mt-1">{s.rate}% معدل النجاح</p>
            </div>
          </div>

          {/* Delivered */}
          <div className="rounded-2xl border bg-card p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-xs font-medium mb-1">تم التوصيل</p>
                <p className="text-3xl font-black text-emerald-500">{s.delivered}</p>
              </div>
              <div className="p-2 bg-emerald-500/10 rounded-xl">
                <Icon name="PackageCheck" className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              {s.pending > 0 ? `${s.pending} قيد التوصيل` : 'لا يوجد معلّق'}
            </p>
          </div>

          {/* Returned */}
          <div className="rounded-2xl border bg-card p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-xs font-medium mb-1">مرتجعات</p>
                <p className="text-3xl font-black text-red-500">{s.returned}</p>
              </div>
              <div className="p-2 bg-red-500/10 rounded-xl">
                <Icon name="Undo2" className="h-5 w-5 text-red-500" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              {s.total > 0 ? `${Math.round((s.returned / s.total) * 100)}% من الإجمالي` : '—'}
            </p>
          </div>

          {/* COD */}
          <div className="rounded-2xl border bg-card p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-xs font-medium mb-1">COD محصّل</p>
                <p className="text-2xl font-black text-foreground leading-tight">
                  {formatCurrency(s.cod)}
                </p>
              </div>
              <div className="p-2 bg-primary/10 rounded-xl">
                <Icon name="Wallet" className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <p className="text-xs text-muted-foreground">من {s.delivered} شحنة مسلّمة</p>
            </div>
          </div>
        </div>

        {/* ── Quick actions ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/merchant/add-order',  icon: 'PackagePlus', label: 'إضافة شحنة',   bg: 'bg-blue-500/10',   icon_c: 'text-blue-600'   },
            { href: '/merchant/orders',     icon: 'Search',      label: 'تتبع الشحنات', bg: 'bg-emerald-500/10',icon_c: 'text-emerald-600'},
            { href: '/merchant/financials', icon: 'Wallet',      label: 'حسابي / COD',  bg: 'bg-primary/10',    icon_c: 'text-primary'    },
            { href: '/merchant/reports',    icon: 'BarChart3',   label: 'التقارير',      bg: 'bg-purple-500/10', icon_c: 'text-purple-600' },
          ].map(a => (
            <Link key={a.href} href={a.href}>
              <div className="rounded-2xl border bg-card p-4 flex flex-col items-center gap-2 hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5 transition-all text-center cursor-pointer">
                <div className={`p-3 rounded-xl ${a.bg}`}>
                  <Icon name={a.icon as any} className={`h-5 w-5 ${a.icon_c}`} />
                </div>
                <span className="text-sm font-semibold">{a.label}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* ── Recent orders ── */}
        <div className="rounded-2xl border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <h2 className="font-bold text-base flex items-center gap-2">
              <Icon name="Clock" className="h-4 w-4 text-primary" />
              آخر الشحنات
            </h2>
            <Link href="/merchant/orders" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
              عرض الكل <Icon name="ArrowLeft" className="h-3 w-3" />
            </Link>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground text-xs border-b bg-muted/30">
                  <th className="text-right px-5 py-3 font-medium">رقم الشحنة</th>
                  <th className="text-right px-4 py-3 font-medium">المستلم</th>
                  <th className="text-right px-4 py-3 font-medium">المدينة</th>
                  <th className="text-right px-4 py-3 font-medium">الحالة</th>
                  <th className="text-right px-4 py-3 font-medium">COD</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-muted-foreground">
                      <Icon name="Package" className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      لا توجد شحنات بعد
                    </td>
                  </tr>
                ) : recentOrders.map(o => (
                  <tr key={o.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs font-bold text-primary">{o.id}</td>
                    <td className="px-4 py-3.5 font-medium">{o.recipient}</td>
                    <td className="px-4 py-3.5 text-muted-foreground">{o.city}</td>
                    <td className="px-4 py-3.5"><StatusPill status={o.status} /></td>
                    <td className="px-4 py-3.5 font-bold">{formatCurrency(o.cod)}</td>
                    <td className="px-4 py-3.5">
                      <Link href={`/merchant/orders`} className="text-xs text-primary hover:underline">تفاصيل</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y">
            {recentOrders.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <Icon name="Package" className="h-8 w-8 mx-auto mb-2 opacity-30" />
                لا توجد شحنات بعد
              </div>
            ) : recentOrders.map(o => (
              <div key={o.id} className="px-4 py-3.5 flex items-center gap-3 hover:bg-muted/40 active:bg-muted/60 transition-colors">
                <div className="p-2.5 rounded-xl bg-primary/10 shrink-0">
                  <Icon name="Package" className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary">{o.id}</span>
                    <StatusPill status={o.status} />
                  </div>
                  <p className="text-sm font-medium truncate mt-0.5">{o.recipient}</p>
                  <p className="text-xs text-muted-foreground">{o.city}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-sm">{formatCurrency(o.cod)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── COD summary banner ── */}
        <div className="rounded-2xl bg-gradient-to-l from-emerald-500/10 via-emerald-500/5 to-background border border-emerald-500/20 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-500/15">
                <Icon name="Banknote" className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي COD المحصّل هذا الشهر</p>
                <p className="text-2xl font-black">{formatCurrency(stats.month.cod)}</p>
              </div>
            </div>
            <Button variant="outline" className="border-emerald-500/40 text-emerald-700 hover:bg-emerald-500/10 shrink-0 gap-2" asChild>
              <Link href="/merchant/financials">
                <Icon name="ArrowLeft" className="h-4 w-4" />
                عرض التفاصيل الكاملة
              </Link>
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
