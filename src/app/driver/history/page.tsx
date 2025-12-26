'use client';

import { useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOrdersStore } from '@/store/orders-store';
import { useSettings } from '@/contexts/SettingsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/icon';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function DriverHistoryPage() {
  const { user } = useAuth();
  const { orders } = useOrdersStore();
  const { formatCurrency, formatDate } = useSettings();
  const [period, setPeriod] = useState('week');

  // طلبات السائق
  const myOrders = useMemo(() => {
    return orders.filter(o => o.driver === user?.name);
  }, [orders, user]);

  // فلترة حسب الفترة
  const filteredOrders = useMemo(() => {
    const now = new Date();
    const getStartDate = () => {
      switch (period) {
        case 'today':
          return new Date(now.setHours(0, 0, 0, 0));
        case 'week':
          const weekAgo = new Date(now);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return weekAgo;
        case 'month':
          const monthAgo = new Date(now);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return monthAgo;
        default:
          return new Date(0);
      }
    };

    const startDate = getStartDate();
    return myOrders.filter(o => new Date(o.date) >= startDate);
  }, [myOrders, period]);

  // إحصائيات الفترة
  const stats = useMemo(() => {
    const delivered = filteredOrders.filter(o => o.status === 'تم التوصيل');
    const returned = filteredOrders.filter(o => o.status === 'مرتجع');
    const postponed = filteredOrders.filter(o => o.status === 'مؤجل');

    const totalCash = delivered.reduce((sum, o) => sum + (o.cod || 0), 0);
    const totalFees = delivered.reduce((sum, o) => sum + (o.driverFee || 0), 0);

    return {
      total: filteredOrders.length,
      delivered: delivered.length,
      returned: returned.length,
      postponed: postponed.length,
      successRate: filteredOrders.length > 0
        ? Math.round((delivered.length / filteredOrders.length) * 100)
        : 0,
      totalCash,
      totalFees,
    };
  }, [filteredOrders]);

  // تجميع حسب التاريخ
  const ordersByDate = useMemo(() => {
    const grouped: Record<string, typeof filteredOrders> = {};
    filteredOrders.forEach(order => {
      if (!grouped[order.date]) {
        grouped[order.date] = [];
      }
      grouped[order.date].push(order);
    });

    return Object.entries(grouped)
      .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
      .map(([date, orders]) => ({
        date,
        orders,
        delivered: orders.filter(o => o.status === 'تم التوصيل').length,
        total: orders.length,
        cash: orders
          .filter(o => o.status === 'تم التوصيل')
          .reduce((sum, o) => sum + (o.cod || 0), 0),
      }));
  }, [filteredOrders]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'تم التوصيل': 'text-green-600 bg-green-100',
      'جاري التوصيل': 'text-blue-600 bg-blue-100',
      'بالانتظار': 'text-yellow-600 bg-yellow-100',
      'مؤجل': 'text-orange-600 bg-orange-100',
      'مرتجع': 'text-red-600 bg-red-100',
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">سجل الطلبات</h1>
          <p className="text-muted-foreground mt-1">
            عرض سجل طلباتك وإحصائياتك
          </p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">اليوم</SelectItem>
            <SelectItem value="week">آخر أسبوع</SelectItem>
            <SelectItem value="month">آخر شهر</SelectItem>
            <SelectItem value="all">الكل</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Icon name="Package" className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">إجمالي الطلبات</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Icon name="PackageCheck" className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.delivered}</p>
                <p className="text-xs text-muted-foreground">تم التوصيل</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Icon name="Target" className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{stats.successRate}%</p>
                <p className="text-xs text-muted-foreground">نسبة النجاح</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Icon name="Wallet" className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-lg font-bold">{formatCurrency(stats.totalCash)}</p>
                <p className="text-xs text-muted-foreground">تم التحصيل</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="BarChart3" className="h-5 w-5 text-primary" />
            ملخص الأداء
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.delivered}</div>
              <p className="text-sm text-muted-foreground mt-1">مكتملة</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{stats.returned}</div>
              <p className="text-sm text-muted-foreground mt-1">مرتجعة</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{stats.postponed}</div>
              <p className="text-sm text-muted-foreground mt-1">مؤجلة</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{formatCurrency(stats.totalFees)}</div>
              <p className="text-sm text-muted-foreground mt-1">أجور السائق</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders by Date */}
      <div className="space-y-4">
        {ordersByDate.map(({ date, orders, delivered, total, cash }) => (
          <Card key={date}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {formatDate(date, { longFormat: true })}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {delivered} من {total} طلب • {formatCurrency(cash)}
                  </p>
                </div>
                <Badge variant="outline">
                  {total} طلب
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="font-medium truncate">{order.recipient}</p>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {order.region} • {order.phone}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="font-bold">{formatCurrency(order.cod)}</p>
                    <p className="text-xs text-muted-foreground">#{order.id}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}

        {ordersByDate.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Icon name="History" className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">
                لا توجد طلبات في هذه الفترة
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
