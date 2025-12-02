'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useUsersStore } from '@/store/user-store';
import { useOrdersStore } from '@/store/orders-store';
import { useStatusesStore } from '@/store/statuses-store';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
    Area,
    Bar,
    BarChart,
    CartesianGrid,
    Line,
    LineChart,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import Icon from '@/components/icon';
import { useSettings } from '@/contexts/SettingsContext';
import { KPICard } from '@/components/dashboard/kpi-card';
import { AlertsSection } from '@/components/dashboard/alerts-section';
import { RecentActivities } from '@/components/dashboard/recent-activities';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { TimeFilters } from '@/components/dashboard/time-filters';
import { GoalsSection } from '@/components/dashboard/goals-section';


const chartConfig = {
  delivered: { label: 'تم التوصيل', color: '#10b981' }, // emerald-500
  postponed: { label: 'مؤجلة', color: '#f59e0b' }, // amber-500
  returned: { label: 'مرتجعة', color: '#ef4444' }, // red-500
  profit: { label: 'الربح', color: '#3b82f6' }, // blue-500
  'تم التوصيل': { label: 'مكتملة', color: '#10b981' },
  'جاري التوصيل': { label: 'قيد التوصيل', color: '#3b82f6' },
  'راجع': { label: 'مرتجعة', color: '#ef4444' },
};


const RevenueCard = ({ title, value, iconName, color = 'primary' }: { title: string, value: string | number, iconName: any, color?: string }) => (
    <Card className="bg-card/80 border border-border/60 shadow-sm">
        <CardContent className="p-4 sm:p-5 flex items-center justify-center text-center h-full gap-3">
            <div
                className={
                    `p-3 rounded-xl bg-primary/10 text-primary flex items-center justify-center` +
                    (typeof color === 'string' && color !== 'primary' ? ` text-${color}` : '')
                }
            >
                <Icon name={iconName} className="w-5 h-5" />
            </div>
            <div className="space-y-1">
                <p className="text-xs sm:text-sm text-muted-foreground">{title}</p>
                <p className="text-lg sm:text-2xl font-bold tracking-tight">{value}</p>
            </div>
        </CardContent>
    </Card>
);

export default function DashboardPage() {
    const [selectedDriver, setSelectedDriver] = useState('all');
    const searchParams = useSearchParams();
    const { formatCurrency } = useSettings();
    const { users } = useUsersStore();
    const { orders } = useOrdersStore();
    const { statuses } = useStatusesStore();

    // قراءة الفلاتر من URLSearchParams
    const driverFilter = searchParams.get('driver') || 'all';
    const statusFilter = searchParams.get('status') || 'all';
    const regionFilter = searchParams.get('region') || 'all';
    const merchantFilter = searchParams.get('merchant') || 'all';
    const period = searchParams.get('period') || 'today';
    const dateFrom = searchParams.get('from');
    const dateTo = searchParams.get('to');

    // حساب filteredOrders بناءً على الفلاتر
    const filteredOrders = useMemo(() => {
        let filtered = orders.filter(o => {
            if (driverFilter !== 'all' && o.driver !== driverFilter) return false;
            if (statusFilter !== 'all' && o.status !== statusFilter) return false;
            if (regionFilter !== 'all' && o.region !== regionFilter) return false;
            if (merchantFilter !== 'all' && o.merchant !== merchantFilter) return false;
            
            // فلترة حسب التاريخ
            if (dateFrom && dateTo) {
                const orderDate = new Date(o.date);
                const fromDate = new Date(dateFrom);
                const toDate = new Date(dateTo);
                if (orderDate < fromDate || orderDate > toDate) return false;
            } else if (period !== 'custom' && period !== 'all') {
                // تطبيق الفلترة حسب الفترة المختارة
                const today = new Date();
                const orderDate = new Date(o.date);
                
                switch (period) {
                    case 'today':
                        if (o.date !== today.toISOString().split('T')[0]) return false;
                        break;
                    case 'yesterday':
                        const yesterday = new Date(today);
                        yesterday.setDate(yesterday.getDate() - 1);
                        if (o.date !== yesterday.toISOString().split('T')[0]) return false;
                        break;
                    case 'last7days':
                        const weekAgo = new Date(today);
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        if (orderDate < weekAgo) return false;
                        break;
                    case 'last30days':
                        const monthAgo = new Date(today);
                        monthAgo.setDate(monthAgo.getDate() - 30);
                        if (orderDate < monthAgo) return false;
                        break;
                    case 'thismonth':
                        if (orderDate.getMonth() !== today.getMonth() || orderDate.getFullYear() !== today.getFullYear()) return false;
                        break;
                    case 'lastmonth':
                        const lastMonth = new Date(today);
                        lastMonth.setMonth(lastMonth.getMonth() - 1);
                        if (orderDate.getMonth() !== lastMonth.getMonth() || orderDate.getFullYear() !== lastMonth.getFullYear()) return false;
                        break;
                }
            }
            
            return true;
        });
        return filtered;
    }, [orders, driverFilter, statusFilter, regionFilter, merchantFilter, period, dateFrom, dateTo]);

    const drivers = useMemo(() => users.filter(u => u.roleId === 'driver'), [users]);
    const merchants = useMemo(() => users.filter(u => u.roleId === 'merchant'), [users]);

    const driverStats = useMemo(() => {
        return drivers.map(driver => {
            // استخدام filteredOrders لضمان الاتساق
            const driverOrders = filteredOrders.filter(o => o.driver === driver.name);
            const completed = driverOrders.filter(o => o.status === 'تم التوصيل').length;
            const postponed = driverOrders.filter(o => o.status === 'مؤجل').length;
            const returned = driverOrders.filter(o => o.status === 'راجع').length;
            const total = driverOrders.length;
            return {
                id: driver.id,
                name: driver.name,
                avatar: driver.avatar,
                phone: driver.email,
                status: total > 0 ? 'نشط' : 'غير نشط',
                completed,
                postponed,
                returned,
                total
            };
        });
    }, [drivers, filteredOrders]);

    // حساب عدد الطلبات لكل حالة (من البيانات المفلترة)
    const orderStatusCounts = useMemo(() => {
        return filteredOrders.reduce((acc, order) => {
            const status = order.status;
            if (!acc[status]) {
                acc[status] = 0;
            }
            acc[status]++;
            return acc;
        }, {} as Record<string, number>);
    }, [filteredOrders]);

    // إنشاء بيانات الحالات - جميع الحالات النشطة مع عدد الطلبات
    const allStatusesData = useMemo(() => {
        return statuses
            .filter(status => status.isActive)
            .map(status => ({
                id: status.id,
                name: status.name,
                code: status.code,
                icon: status.icon,
                color: status.color,
                count: orderStatusCounts[status.name] || 0,
            }))
            .sort((a, b) => {
                // ترتيب: الحالات التي لديها طلبات أولاً، ثم الباقي
                if (a.count > 0 && b.count === 0) return -1;
                if (a.count === 0 && b.count > 0) return 1;
                return b.count - a.count;
            });
    }, [statuses, orderStatusCounts]);

    const profitChartData = useMemo(() => {
        const dataByDate = filteredOrders.reduce((acc, order) => {
            if (order.status === 'تم التوصيل') {
                const date = order.date;
                if (!acc[date]) {
                    acc[date] = 0;
                }
                acc[date] += (order.deliveryFee || 0) + (order.additionalCost || 0) - ((order.driverFee || 0) + (order.driverAdditionalFare || 0));
            }
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(dataByDate)
            .map(([date, profit]) => ({ date, profit }))
            .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [filteredOrders]);

    const filteredDriverStats = selectedDriver === 'all'
        ? driverStats
        : driverStats.filter(driver => driver.name === selectedDriver);

    // استخدام filteredDriverStats لضمان الاتساق مع الفلاتر
    const barChartData = useMemo(() => {
        return filteredDriverStats.map(d => ({
            name: d.name,
            delivered: d.completed,
            postponed: d.postponed,
            returned: d.returned
        }));
    }, [filteredDriverStats]);

    // حساب الإحصائيات
    const totalRevenue = useMemo(() => {
        return profitChartData.reduce((sum, item) => sum + (item.profit || 0), 0);
    }, [profitChartData]);

    // حساب الإيرادات للفترة السابقة (للمقارنة)
    const previousPeriodRevenue = useMemo(() => {
        // حساب إيرادات الفترة السابقة بناءً على الفترة المختارة
        const today = new Date();
        let previousStart: Date;
        let previousEnd: Date;
        
        // تحديد الفترة السابقة بناءً على الفترة الحالية
        if (dateFrom && dateTo) {
            const fromDate = new Date(dateFrom);
            const toDate = new Date(dateTo);
            const periodDays = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
            previousEnd = new Date(fromDate);
            previousEnd.setDate(previousEnd.getDate() - 1);
            previousStart = new Date(previousEnd);
            previousStart.setDate(previousStart.getDate() - periodDays);
        } else {
            // استخدام الفترة الافتراضية (أسبوع سابق)
            previousEnd = new Date(today);
            previousEnd.setDate(previousEnd.getDate() - 1);
            previousStart = new Date(previousEnd);
            previousStart.setDate(previousStart.getDate() - 7);
        }
        
        const previousOrders = orders.filter(o => {
            const orderDate = new Date(o.date);
            return orderDate >= previousStart && orderDate <= previousEnd && o.status === 'تم التوصيل';
        });
        
        return previousOrders.reduce((sum, o) => {
            return sum + (o.deliveryFee || 0) + (o.additionalCost || 0) - ((o.driverFee || 0) + (o.driverAdditionalFare || 0));
        }, 0);
    }, [orders, dateFrom, dateTo]);

    const revenueTrend = useMemo(() => {
        if (previousPeriodRevenue === 0) return 0;
        return Math.round(((totalRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100);
    }, [totalRevenue, previousPeriodRevenue]);

    const completedToday = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        return filteredOrders.filter(o => o.date === today && o.status === 'تم التوصيل').length;
    }, [filteredOrders]);

    const pendingOrders = useMemo(() => {
        return filteredOrders.filter(o => o.status === 'بالانتظار').length;
    }, [filteredOrders]);

    const activeDrivers = useMemo(() => {
        return drivers.filter(d => driverStats.find(ds => ds.id === d.id && ds.total > 0)).length;
    }, [drivers, driverStats]);

    const totalCompleted = useMemo(() => {
        return filteredOrders.filter(o => o.status === 'تم التوصيل').length;
    }, [filteredOrders]);

    const successRate = useMemo(() => {
        return filteredOrders.length > 0 ? Math.round((totalCompleted / filteredOrders.length) * 100) : 0;
    }, [filteredOrders, totalCompleted]);

    const criticalPending = useMemo(() => {
        return filteredOrders.filter(o => o.status === 'بالانتظار' || o.status === 'مؤجل').length;
    }, [filteredOrders]);

    // بيانات الأهداف
    const goals = useMemo(() => [
        {
            id: 'orders',
            label: 'الطلبات اليومية',
            current: completedToday,
            target: 100,
            icon: 'ShoppingCart',
        },
        {
            id: 'revenue',
            label: 'الإيرادات اليومية',
            current: totalRevenue,
            target: 5000,
            unit: 'د.أ',
            icon: 'TrendingUp',
        },
        {
            id: 'success-rate',
            label: 'نسبة النجاح',
            current: successRate,
            target: 90,
            unit: '%',
            icon: 'Target',
        },
    ], [completedToday, totalRevenue, successRate]);

    // تحصيل الأموال مع السائقين
    const cashWithDrivers = useMemo(() => {
        return filteredOrders
            .filter(o => o.status === 'تم التوصيل')
            .reduce((sum, o) => sum + (o.cod || 0), 0);
    }, [filteredOrders]);

    const cashCollected = useMemo(() => {
        return filteredOrders
            .filter(o => o.status === 'تم استلام المال في الفرع')
            .reduce((sum, o) => sum + (o.cod || 0), 0);
    }, [filteredOrders]);

    const totalCashFlow = useMemo(() => cashWithDrivers + cashCollected, [cashWithDrivers, cashCollected]);
    const collectionRate = useMemo(() => {
        return totalCashFlow > 0 ? Math.round((cashCollected / totalCashFlow) * 100) : 0;
    }, [cashCollected, totalCashFlow]);

    const driversWithOutstandingCash = useMemo(() => {
        return new Set(
            filteredOrders
                .filter(o => o.status === 'تم التوصيل')
                .map(o => o.driver)
        ).size;
    }, [filteredOrders]);

    // التنبيهات الحرجة
    const alerts = useMemo(() => {
      const alertsList: any[] = [];
      
      if (pendingOrders > 10) {
        alertsList.push({
          id: '1',
          title: 'عدد طلبات عالي',
          description: `هناك ${pendingOrders} طلب في الانتظار`,
          type: 'warning' as const,
          timestamp: new Date()
        });
      }
      
      const inactiveDrivers = drivers.filter(d => {
        const driverOrderCount = filteredOrders.filter(o => o.driver === d.name).length;
        return driverOrderCount === 0;
      });
      if (inactiveDrivers.length > 0) {
        alertsList.push({
          id: '2',
          title: 'سائقين غير نشطين',
          description: `${inactiveDrivers.length} من السائقين لم يقوموا بأي مهام`,
          type: 'info' as const,
          timestamp: new Date()
        });
      }

      return alertsList;
    }, [pendingOrders, drivers, filteredOrders]);

    // الأنشطة الحديثة - مرتبة حسب التاريخ (الأحدث أولاً)
    const activities = useMemo(() => {
      const recent = [...filteredOrders]
        .sort((a, b) => {
          // ترتيب حسب التاريخ (الأحدث أولاً)
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return dateB - dateA;
        })
        .slice(0, 5)
        .map((order) => ({
          id: order.id || `order-${order.orderNumber}`,
          user: order.merchant || 'نظام',
          avatar: '',
          action: 'أضاف طلبية',
          details: `إلى ${order.recipient} في ${order.region}`,
          timestamp: new Date(order.date),
          type: 'order' as const
        }));
      return recent;
    }, [filteredOrders]);

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-3xl font-bold">لوحة تحكم المدير</h1>
              <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString('ar-JO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            {/* إجراءات سريعة */}
            <QuickActions />

            {/* فلاتر زمنية */}
            <TimeFilters 
              defaultPeriod={(searchParams.get('period') as any) || 'today'}
              showCompare={true}
            />

            {/* مؤشرات KPI الرئيسية */}
            <div className="flex items-center justify-between mt-2">
              <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <Icon name="Gauge" className="h-4 w-4" />
                بطاقات الأداء الرئيسية
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard
                title="إجمالي الإيرادات"
                value={formatCurrency(totalRevenue)}
                icon="TrendingUp"
                variant="revenue"
                subtitle="إجمالي الربح في الفترة الحالية"
                trend={{
                  value: Math.abs(revenueTrend),
                  isPositive: revenueTrend >= 0,
                  previousValue: formatCurrency(previousPeriodRevenue),
                  period: "الفترة السابقة"
                }}
                onClick={() => window.location.href = '/dashboard/financials'}
              />
              <KPICard
                title="إجمالي الطلبات"
                value={filteredOrders.length}
                icon="ShoppingCart"
                variant="orders"
                subtitle={`${completedToday} طلب مكتمل اليوم`}
              />
              <KPICard
                title="نسبة النجاح"
                value={`${successRate}%`}
                icon="Percent"
                variant="success"
                subtitle="نسبة الطلبات التي تم توصيلها بنجاح"
                trend={successRate ? { value: successRate, isPositive: successRate >= 80 } : undefined}
                progress={successRate}
                target="90%"
              />
              <KPICard
                title="الطلبات المعلقة والحرجة"
                value={criticalPending}
                icon="Clock"
                variant="warning"
                subtitle="طلبات بالانتظار أو مؤجلة"
              />
            </div>

            {/* تحصيل الأموال مع السائقين */}
            <div className="flex items-center justify-between mt-4">
              <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <Icon name="Wallet" className="h-4 w-4" />
                تحصيل الأموال مع السائقين
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard
                title="مبالغ مع السائقين"
                value={formatCurrency(cashWithDrivers)}
                icon="Wallet"
                variant="warning"
                subtitle="أموال لَم يتم تسليمها بعد"
              />
              <KPICard
                title="مبالغ تم استلامها"
                value={formatCurrency(cashCollected)}
                icon="Banknote"
                variant="revenue"
                subtitle="أموال وصلت إلى الشركة"
              />
              <KPICard
                title="نسبة التحصيل"
                value={`${collectionRate}%`}
                icon="PieChart"
                variant="success"
                subtitle="جزء المبالغ المستلمة من الإجمالي"
              />
              <KPICard
                title="سائقون عليهم مبالغ"
                value={driversWithOutstandingCash}
                icon="Users"
                variant="orders"
                subtitle={`من أصل ${drivers.length} سائق`}
              />
            </div>

            {/* الأهداف اليومية */}
            <GoalsSection goals={goals} />

            {/* التنبيهات والأنشطة */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <AlertsSection alerts={alerts} />
              </div>
              <div className="lg:col-span-1">
              <RecentActivities activities={activities} />
              </div>
            </div>

            {/* تقرير الأرباح اليومي */}
            <Card className="border-2 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                          <Icon name="TrendingUp" className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <CardTitle>تقرير الأرباح اليومي</CardTitle>
                      </div>
                      <CardDescription className="mt-1">
                        نظرة على الأرباح المحققة خلال الأسبوع الماضي.
                      </CardDescription>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1 flex-shrink-0"
                      onClick={() => {
                        const canvas = document.querySelector('[data-chart] canvas');
                        if (canvas) {
                          const url = (canvas as HTMLCanvasElement).toDataURL('image/png');
                          const link = document.createElement('a');
                          link.download = 'تقرير-الأرباح.png';
                          link.href = url;
                          link.click();
                        }
                      }}
                    >
                      <Icon name="Download" className="h-4 w-4" />
                      تصدير
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="h-[400px]">
                  {profitChartData.length > 0 ? (
                    <>
                      <ChartContainer config={chartConfig} className="w-full h-full">
                        <LineChart 
                          data={profitChartData} 
                          margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
                        >
                          <defs>
                            <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid 
                            vertical={false} 
                            strokeDasharray="3 3" 
                            stroke="hsl(var(--muted))"
                            opacity={0.3}
                          />
                          <XAxis 
                            dataKey="date" 
                            tickFormatter={(value) => {
                              const date = new Date(value);
                              return date.toLocaleDateString('ar-JO', {day: 'numeric', month: 'short'});
                            }}
                            tickLine={false}
                            axisLine={false}
                            className="text-xs font-medium"
                          />
                          <YAxis 
                            tickFormatter={(value) => formatCurrency(value)}
                            tickLine={false}
                            axisLine={false}
                            className="text-xs font-medium"
                            width={80}
                          />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="rounded-lg border bg-background p-3 shadow-lg">
                                    <div className="font-semibold mb-2">
                                      {new Date(data.date).toLocaleDateString('ar-JO', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                      })}
                                    </div>
                                    <div className="flex items-center justify-between gap-4">
                                      <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                        <span className="text-sm text-muted-foreground">الربح</span>
                                      </div>
                                      <span className="font-bold text-blue-600">
                                        {formatCurrency(data.profit)}
                                      </span>
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                            cursor={{ stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '5 5' }}
                          />
                          <Legend 
                            wrapperStyle={{ paddingTop: '10px' }}
                            iconType="line"
                            formatter={(value) => (
                              <span className="text-xs font-medium">{value}</span>
                            )}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="profit" 
                            stroke="#3b82f6" 
                            strokeWidth={3} 
                            name="الربح"
                            dot={{ fill: '#3b82f6', r: 5, strokeWidth: 2, stroke: '#fff' }}
                            activeDot={{ r: 7, strokeWidth: 2, stroke: '#fff' }}
                            animationDuration={800}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="profit" 
                            fill="url(#profitGradient)" 
                            stroke="none"
                          />
                        </LineChart>
                      </ChartContainer>
                      
                      {/* إحصائيات سريعة - فقط أعلى ربح ومتوسط يومي (إجمالي الأرباح موجود في KPI) */}
                      <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {formatCurrency(Math.max(...profitChartData.map(d => d.profit)))}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">أعلى ربح</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-muted-foreground">
                            {formatCurrency(profitChartData.reduce((sum, d) => sum + d.profit, 0) / profitChartData.length || 0)}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">متوسط يومي</div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <Icon name="TrendingUp" className="h-12 w-12 mx-auto mb-2 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground">لا توجد بيانات للأرباح</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

            <Card className="border-2 shadow-sm">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Icon name="ListChecks" className="h-5 w-5 text-primary" />
                        </div>
                        <CardTitle>ملخص الحالات</CardTitle>
                    </div>
                    <CardDescription>عرض جميع حالات الطلبات مع عدد الطلبات لكل حالة</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                        {/* جميع الحالات فقط (الإيرادات والطلبات موجودة في KPI Cards أعلاه) */}
                        {allStatusesData.map((status) => {
                            const hasOrders = status.count > 0;
                            
                            return (
                                <Button
                                    key={status.id}
                                    asChild
                                    variant={hasOrders ? "default" : "outline"}
                                    className={`h-auto flex-col items-center justify-center p-4 transition-all hover:scale-105 ${
                                        hasOrders 
                                            ? 'border-2 shadow-sm' 
                                            : 'opacity-60 hover:opacity-100'
                                    }`}
                                    style={hasOrders ? {
                                        borderColor: status.color,
                                        backgroundColor: `${status.color}15`,
                                    } : {}}
                                >
                                    <Link href={`/dashboard/orders?status=${encodeURIComponent(status.name)}`}>
                                        <div 
                                            className="p-2 rounded-lg mb-2"
                                            style={{ backgroundColor: `${status.color}20` }}
                                        >
                                            <Icon 
                                                name={status.icon as any} 
                                                className="h-5 w-5"
                                                style={{ color: status.color }}
                                            />
                                        </div>
                                        <p 
                                            className="text-2xl font-bold mb-1"
                                            style={{ color: hasOrders ? status.color : 'inherit' }}
                                        >
                                            {status.count}
                                        </p>
                                        <p className="text-xs text-muted-foreground text-center leading-tight">
                                            {status.name}
                                        </p>
                                    </Link>
                                </Button>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* أداء السائقين - تصميم محسّن */}
            <Card className="border-2 shadow-sm">
                <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <Icon name="Users" className="h-5 w-5 text-primary" />
                                </div>
                                <CardTitle>أداء السائقين</CardTitle>
                            </div>
                            <CardDescription>عرض ملخص شامل لأداء كل سائق مع إمكانية المقارنة</CardDescription>
                        </div>
                        <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                            <SelectTrigger className="w-full sm:w-[240px]">
                                <SelectValue placeholder="فلترة حسب السائق" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">كل السائقين</SelectItem>
                                {drivers.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredDriverStats.length > 0 ? (
                        <div className="space-y-4">
                            {/* جدول مقارنة */}
                            <div className="overflow-x-auto rounded-lg border">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b bg-muted/50">
                                            <th className="p-4 text-right font-semibold text-sm">السائق</th>
                                            <th className="p-4 text-center font-semibold text-sm">إجمالي الطلبات</th>
                                            <th className="p-4 text-center font-semibold text-sm">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                                    تم التوصيل
                                                </div>
                                            </th>
                                            <th className="p-4 text-center font-semibold text-sm">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                                    مؤجلة
                                                </div>
                                            </th>
                                            <th className="p-4 text-center font-semibold text-sm">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                                    مرتجعة
                                                </div>
                                            </th>
                                            <th className="p-4 text-center font-semibold text-sm">نسبة النجاح</th>
                                            <th className="p-4 text-center font-semibold text-sm">الإجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredDriverStats
                                            .sort((a, b) => {
                                                const aRate = a.total > 0 ? (a.completed / a.total) * 100 : 0;
                                                const bRate = b.total > 0 ? (b.completed / b.total) * 100 : 0;
                                                return bRate - aRate;
                                            })
                                            .map((driver, index) => {
                                                const { id, name, phone, status, completed, postponed, returned, total, avatar } = driver;
                                                const successRate = total > 0 ? Math.round((completed / total) * 100) : 0;
                                                const isTopPerformer = index === 0 && selectedDriver === 'all';

                                                return (
                                                    <tr 
                                                        key={id} 
                                                        className="border-b hover:bg-muted/30 transition-colors"
                                                    >
                                                        <td className="p-4">
                                                            <div className="flex items-center gap-3">
                                                                <Avatar className="h-10 w-10 border-2 border-background">
                                                                    <AvatarImage src={avatar} alt={name} />
                                                                    <AvatarFallback className="font-semibold">
                                                                        {name.charAt(0)}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <Link 
                                                                            href={`/dashboard/orders?driver=${encodeURIComponent(name)}`}
                                                                            className="font-semibold hover:text-primary transition-colors"
                                                                        >
                                                                            {name}
                                                                        </Link>
                                                                        {isTopPerformer && (
                                                                            <Icon name="Star" className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center gap-1.5 mt-1">
                                                                        <div className={`w-2 h-2 rounded-full ${status === 'نشط' ? 'bg-emerald-500' : 'bg-muted-foreground/40'}`}></div>
                                                                        <span className="text-xs text-muted-foreground">{status}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="p-4 text-center">
                                                            <div className="font-bold text-lg">{total}</div>
                                                        </td>
                                                        <td className="p-4 text-center">
                                                            <Link 
                                                                href={`/dashboard/orders?driver=${encodeURIComponent(name)}&status=تم التوصيل`}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-950/50 transition-colors"
                                                            >
                                                                <Icon name="PackageCheck" className="h-4 w-4" />
                                                                {completed}
                                                            </Link>
                                                        </td>
                                                        <td className="p-4 text-center">
                                                            <Link 
                                                                href={`/dashboard/orders?driver=${encodeURIComponent(name)}&status=مؤجل`}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 font-semibold hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-colors"
                                                            >
                                                                <Icon name="RefreshCw" className="h-4 w-4" />
                                                                {postponed}
                                                            </Link>
                                                        </td>
                                                        <td className="p-4 text-center">
                                                            <Link 
                                                                href={`/dashboard/orders?driver=${encodeURIComponent(name)}&status=راجع`}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 font-semibold hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors"
                                                            >
                                                                <Icon name="XCircle" className="h-4 w-4" />
                                                                {returned}
                                                            </Link>
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex-1">
                                                                    <Progress 
                                                                        value={successRate} 
                                                                        className="h-2"
                                                                    />
                                                                </div>
                                                                <span className={`text-sm font-bold min-w-[3rem] text-right ${
                                                                    successRate >= 80 ? 'text-emerald-600' :
                                                                    successRate >= 60 ? 'text-amber-600' :
                                                                    'text-red-600'
                                                                }`}>
                                                                    {successRate}%
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    asChild
                                                                    className="h-8 w-8 p-0"
                                                                >
                                                                    <Link href={`/dashboard/orders?driver=${encodeURIComponent(name)}`}>
                                                                        <Icon name="Eye" className="h-4 w-4" />
                                                                    </Link>
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    asChild
                                                                    className="h-8 w-8 p-0"
                                                                >
                                                                    <Link href={`/dashboard/driver-app`}>
                                                                        <Icon name="User" className="h-4 w-4" />
                                                                    </Link>
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                    </tbody>
                                </table>
                            </div>

                            {/* إحصائيات إجمالية */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                                <div className="text-center p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900">
                                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                        {filteredDriverStats.reduce((sum, d) => sum + d.completed, 0)}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">إجمالي المكتملة</div>
                                </div>
                                <div className="text-center p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
                                    <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                                        {filteredDriverStats.reduce((sum, d) => sum + d.postponed, 0)}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">إجمالي المؤجلة</div>
                                </div>
                                <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
                                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                        {filteredDriverStats.reduce((sum, d) => sum + d.returned, 0)}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">إجمالي المرتجعة</div>
                                </div>
                                <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
                                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                        {filteredDriverStats.length > 0 
                                            ? Math.round(
                                                filteredDriverStats.reduce((sum, d) => {
                                                    const rate = d.total > 0 ? (d.completed / d.total) * 100 : 0;
                                                    return sum + rate;
                                                }, 0) / filteredDriverStats.length
                                            )
                                            : 0
                                        }%
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">متوسط نسبة النجاح</div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Icon name="Users" className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                            <p className="text-muted-foreground font-medium">
                                {selectedDriver !== 'all' ? 'لم يتم العثور على سائق بهذا الاسم' : 'لا يوجد سائقين لعرضهم'}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

        </div>
    )
}

    