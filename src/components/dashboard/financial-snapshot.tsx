'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/icon';
import { useSettings } from '@/contexts/SettingsContext';
import { cn } from '@/lib/utils';

interface FinancialSnapshotProps {
  orders: any[];
  isDelivered: (status: string) => boolean;
  isCashCollected: (status: string) => boolean;
}

type SnapshotPeriod = 'daily' | 'monthly' | 'yearly';

export function FinancialSnapshot({ orders, isDelivered, isCashCollected }: FinancialSnapshotProps) {
  const { formatCurrency } = useSettings();
  const [period, setPeriod] = useState<SnapshotPeriod>('monthly');

  // فلترة الطلبات حسب الفترة المختارة
  const filteredByPeriod = useMemo(() => {
    const now = new Date();
    return orders.filter(o => {
      const d = new Date(o.date);
      switch (period) {
        case 'daily':
          return d.toISOString().split('T')[0] === now.toISOString().split('T')[0];
        case 'monthly':
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        case 'yearly':
          return d.getFullYear() === now.getFullYear();
        default:
          return true;
      }
    });
  }, [orders, period]);

  // حساب الفترة السابقة للمقارنة
  const previousPeriod = useMemo(() => {
    const now = new Date();
    return orders.filter(o => {
      const d = new Date(o.date);
      switch (period) {
        case 'daily': {
          const yesterday = new Date(now);
          yesterday.setDate(yesterday.getDate() - 1);
          return d.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0];
        }
        case 'monthly': {
          const prevMonth = new Date(now);
          prevMonth.setMonth(prevMonth.getMonth() - 1);
          return d.getMonth() === prevMonth.getMonth() && d.getFullYear() === prevMonth.getFullYear();
        }
        case 'yearly':
          return d.getFullYear() === now.getFullYear() - 1;
        default:
          return false;
      }
    });
  }, [orders, period]);

  // حساب المؤشرات للفترة الحالية
  const currentRevenue = useMemo(() => {
    return filteredByPeriod
      .filter(o => isDelivered(o.status))
      .reduce((sum, o) => sum + (o.deliveryFee || 0) + (o.additionalCost || 0) - ((o.driverFee || 0) + (o.driverAdditionalFare || 0)), 0);
  }, [filteredByPeriod]);

  const currentCollected = useMemo(() => {
    return filteredByPeriod
      .filter(o => isCashCollected(o.status))
      .reduce((sum, o) => sum + (o.cod || 0), 0);
  }, [filteredByPeriod]);

  const currentCashWithDrivers = useMemo(() => {
    return filteredByPeriod
      .filter(o => isDelivered(o.status))
      .reduce((sum, o) => sum + (o.cod || 0), 0);
  }, [filteredByPeriod]);

  const totalCash = currentCashWithDrivers + currentCollected;
  const collectionPercent = totalCash > 0 ? Math.round((currentCollected / totalCash) * 100) : 0;
  const remaining = totalCash - currentCollected;

  // حساب المؤشرات للفترة السابقة
  const prevRevenue = useMemo(() => {
    return previousPeriod
      .filter(o => isDelivered(o.status))
      .reduce((sum, o) => sum + (o.deliveryFee || 0) + (o.additionalCost || 0) - ((o.driverFee || 0) + (o.driverAdditionalFare || 0)), 0);
  }, [previousPeriod]);

  const prevCollected = useMemo(() => {
    return previousPeriod
      .filter(o => isCashCollected(o.status))
      .reduce((sum, o) => sum + (o.cod || 0), 0);
  }, [previousPeriod]);

  // حساب التغيير
  const revenueChange = prevRevenue > 0 ? Math.round(((currentRevenue - prevRevenue) / prevRevenue) * 100) : 0;
  const collectedChange = prevCollected > 0 ? Math.round(((currentCollected - prevCollected) / prevCollected) * 100) : 0;

  const periodLabels: Record<SnapshotPeriod, string> = {
    daily: 'اليوم',
    monthly: 'هذا الشهر',
    yearly: 'هذه السنة',
  };

  const prevPeriodLabels: Record<SnapshotPeriod, string> = {
    daily: 'أمس',
    monthly: 'الشهر الماضي',
    yearly: 'السنة الماضية',
  };

  const metrics = [
    {
      label: 'إجمالي الإيرادات',
      value: currentRevenue,
      formatted: formatCurrency(currentRevenue),
      change: revenueChange,
      icon: 'TrendingUp',
      color: '#10b981', // emerald
      bgClass: 'bg-emerald-500',
      lightBg: 'bg-emerald-50 dark:bg-emerald-950/20',
      textClass: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'المبلغ المحصّل',
      value: currentCollected,
      formatted: formatCurrency(currentCollected),
      change: collectedChange,
      icon: 'Banknote',
      color: '#3b82f6', // blue
      bgClass: 'bg-blue-500',
      lightBg: 'bg-blue-50 dark:bg-blue-950/20',
      textClass: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'المتبقي للتحصيل',
      value: remaining,
      formatted: formatCurrency(remaining),
      percent: collectionPercent,
      icon: 'Wallet',
      color: '#f59e0b', // amber
      bgClass: 'bg-amber-500',
      lightBg: 'bg-amber-50 dark:bg-amber-950/20',
      textClass: 'text-amber-600 dark:text-amber-400',
    },
  ];

  return (
    <Card className="border-2 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <Icon name="PieChart" className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-base">الملخص المالي</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">{periodLabels[period]}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-muted/60 rounded-lg p-1">
            {(['daily', 'monthly', 'yearly'] as SnapshotPeriod[]).map((p) => (
              <Button
                key={p}
                variant={period === p ? 'default' : 'ghost'}
                size="sm"
                className={cn(
                  'h-7 px-3 text-xs font-medium rounded-md',
                  period === p ? 'shadow-sm' : 'hover:bg-muted'
                )}
                onClick={() => setPeriod(p)}
              >
                {p === 'daily' ? 'يومي' : p === 'monthly' ? 'شهري' : 'سنوي'}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {filteredByPeriod.length === 0 || (currentRevenue === 0 && currentCollected === 0 && remaining === 0) ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="p-4 rounded-2xl bg-muted/40 mb-4">
              <Icon name="PieChart" className="h-10 w-10 text-muted-foreground/40" />
            </div>
            <p className="text-base font-semibold text-foreground mb-1">
              لا توجد بيانات لهذه الفترة
            </p>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs">
              لم يتم تسجيل أي حركات مالية في فترة "{periodLabels[period]}". جرّب تغيير الفلتر.
            </p>
            <div className="flex items-center gap-2">
              {(['daily', 'monthly', 'yearly'] as SnapshotPeriod[]).filter(p => p !== period).map((p) => (
                <Button
                  key={p}
                  variant="outline"
                  size="sm"
                  className="h-8 px-4 text-xs gap-1.5"
                  onClick={() => setPeriod(p)}
                >
                  <Icon name="Calendar" className="h-3.5 w-3.5" />
                  {p === 'daily' ? 'يومي' : p === 'monthly' ? 'شهري' : 'سنوي'}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {metrics.map((metric, i) => (
              <div
                key={i}
                className={cn(
                  'relative p-4 rounded-xl border transition-all hover:shadow-md',
                  metric.lightBg
                )}
              >
                {/* دائرة إحصائية */}
                <div className="flex items-center gap-4">
                  <div className="relative flex-shrink-0">
                    <svg width="64" height="64" viewBox="0 0 64 64" className="transform -rotate-90">
                      {/* خلفية الدائرة */}
                      <circle
                        cx="32" cy="32" r="26"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="6"
                        className="text-muted/20"
                      />
                      {/* الدائرة المملوءة */}
                      <circle
                        cx="32" cy="32" r="26"
                        fill="none"
                        stroke={metric.color}
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 26}`}
                        strokeDashoffset={`${2 * Math.PI * 26 * (1 - (
                          i === 2
                            ? (100 - collectionPercent) / 100
                            : metric.value > 0
                              ? Math.min(metric.value / (Math.max(currentRevenue, 1)), 1)
                              : 0
                        ))}`}
                        className="transition-all duration-700 ease-out"
                      />
                    </svg>
                    {/* الأيقونة في المنتصف */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Icon name={metric.icon as any} className={cn('h-5 w-5', metric.textClass)} />
                    </div>
                  </div>

                  {/* البيانات */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-1">{metric.label}</p>
                    <p className={cn('text-xl font-bold tracking-tight', metric.textClass)}>
                      {metric.formatted}
                    </p>

                    {/* سطر المقارنة */}
                    {metric.change !== undefined && metric.change !== 0 && (
                      <div className="flex items-center gap-1 mt-1.5">
                        <Icon
                          name={metric.change > 0 ? 'TrendingUp' : 'TrendingDown'}
                          className={cn('h-3 w-3', metric.change > 0 ? 'text-emerald-500' : 'text-red-500')}
                        />
                        <span className={cn('text-[11px] font-medium', metric.change > 0 ? 'text-emerald-600' : 'text-red-600')}>
                          {metric.change > 0 ? '+' : ''}{metric.change}%
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          عن {prevPeriodLabels[period]}
                        </span>
                      </div>
                    )}

                    {/* نسبة التحصيل للبطاقة الثالثة */}
                    {i === 2 && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <div className="flex-1 h-1.5 rounded-full bg-muted/30 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-amber-500 transition-all duration-700"
                            style={{ width: `${100 - collectionPercent}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                          {100 - collectionPercent}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
