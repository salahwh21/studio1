'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/icon';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useOrdersStore } from '@/store/orders-store';
import { useSettings } from '@/contexts/SettingsContext';

export default function MerchantDashboard() {
  const [period, setPeriod] = useState('today');
  const { orders: allOrders } = useOrdersStore();
  const { settings, formatDate, formatCurrency } = useSettings();
  const currencySymbol = settings.regional.currencySymbol;

  // حساب الإحصائيات من البيانات الحقيقية
  const stats = useMemo(() => {
    const now = new Date();
    const getFilteredOrders = (days: number) => {
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() - days);
      return allOrders.filter(order => new Date(order.date) >= startDate);
    };

    const calculateStats = (orders: typeof allOrders) => {
      const delivered = orders.filter(o => o.status === 'تم التوصيل');
      const pending = orders.filter(o => o.status === 'قيد المعالجة' || o.status === 'جديد');
      const revenue = delivered.reduce((sum, o) => sum + (o.cod || 0), 0);
      const avgOrderValue = delivered.length > 0 ? revenue / delivered.length : 0;
      const successRate = orders.length > 0 ? (delivered.length / orders.length) * 100 : 0;

      return {
        orders: orders.length,
        revenue,
        pending: pending.length,
        delivered: delivered.length,
        avgOrderValue,
        successRate: Math.round(successRate),
      };
    };

    return {
      today: calculateStats(getFilteredOrders(1)),
      week: calculateStats(getFilteredOrders(7)),
      month: calculateStats(getFilteredOrders(30)),
    };
  }, [allOrders]);

  const currentStats = stats[period as keyof typeof stats];

  // آخر الطلبات الحقيقية
  const recentOrders = useMemo(() => {
    return allOrders
      .slice(0, 4)
      .map(order => ({
        id: order.id,
        customer: order.recipient,
        status: order.status,
        amount: order.cod,
        time: formatDate(order.date),
        priority: 'عادي',
      }));
  }, [allOrders]);

  // تحليل المنتجات (من الملاحظات)
  const topProducts = useMemo(() => {
    const products: Record<string, { sales: number; revenue: number }> = {};
    allOrders.forEach(order => {
      if (order.notes && order.status === 'تم التوصيل') {
        const productName = order.notes.split('×')[0].trim();
        if (!products[productName]) {
          products[productName] = { sales: 0, revenue: 0 };
        }
        products[productName].sales += 1;
        products[productName].revenue += order.cod || 0;
      }
    });

    return Object.entries(products)
      .map(([name, data]) => ({
        name,
        sales: data.sales,
        revenue: data.revenue,
        trend: '+0%',
      }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 3);
  }, [allOrders]);

  const alerts = useMemo(() => {
    const pending = allOrders.filter(o => o.status === 'قيد المعالجة' || o.status === 'جديد').length;
    const result = [];
    if (pending > 0) {
      result.push({ type: 'warning', message: `لديك ${pending} طلبات تحتاج للمعالجة`, action: 'عرض الطلبات' });
    }
    return result;
  }, [allOrders]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'تم التوصيل': 'bg-green-500 text-white',
      'قيد التوصيل': 'bg-blue-500 text-white',
      'قيد المعالجة': 'bg-yellow-500 text-white',
      'جديد': 'bg-purple-500 text-white',
      'ملغي': 'bg-red-500 text-white',
    };
    return colors[status] || 'bg-gray-500 text-white';
  };

  return (
    <div className="space-y-6">
      {/* Header with Period Selector */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">لوحة التحكم</h1>
          <p className="text-muted-foreground mt-1">مرحباً بك، إليك ملخص نشاط متجرك</p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">اليوم</SelectItem>
              <SelectItem value="week">هذا الأسبوع</SelectItem>
              <SelectItem value="month">هذا الشهر</SelectItem>
            </SelectContent>
          </Select>
          <Button asChild>
            <Link href="/merchant/add-order">
              <Icon name="Plus" className="ml-2 h-4 w-4" />
              طلب جديد
            </Link>
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, index) => (
            <Card key={index} className={alert.type === 'warning' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950' : 'border-blue-500 bg-blue-50 dark:bg-blue-950'}>
              <CardContent className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <Icon name={alert.type === 'warning' ? 'AlertCircle' : 'Info'} className={`h-5 w-5 ${alert.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'}`} />
                  <span className="text-sm font-medium">{alert.message}</span>
                </div>
                <Button variant="ghost" size="sm">
                  {alert.action}
                  <Icon name="ArrowLeft" className="mr-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              إجمالي الطلبات
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <Icon name="Package" className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{currentStats.orders}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                <Icon name="TrendingUp" className="h-3 w-3 ml-1" />
                +12%
              </Badge>
              <span className="text-xs text-muted-foreground">من الفترة السابقة</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              الإيرادات
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <Icon name="DollarSign" className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{currentStats.revenue.toFixed(2)} {currencySymbol}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                <Icon name="TrendingUp" className="h-3 w-3 ml-1" />
                +18%
              </Badge>
              <span className="text-xs text-muted-foreground">من الفترة السابقة</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              معدل النجاح
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
              <Icon name="Target" className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{currentStats.successRate}%</div>
            <Progress value={currentStats.successRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              متوسط قيمة الطلب
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
              <Icon name="TrendingUp" className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{currentStats.avgOrderValue.toFixed(2)} {currencySymbol}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                <Icon name="Minus" className="h-3 w-3 ml-1" />
                -2%
              </Badge>
              <span className="text-xs text-muted-foreground">من الفترة السابقة</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Tables */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>آخر الطلبات</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/merchant/orders">
                عرض الكل
                <Icon name="ArrowLeft" className="mr-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Icon name="Package" className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{order.id}</p>
                        {order.priority === 'عاجل' && (
                          <Badge variant="destructive" className="text-xs">عاجل</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{order.customer}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-left hidden md:block">
                      <p className="text-sm text-muted-foreground">{order.time}</p>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                    <p className="font-bold min-w-[80px] text-left">{order.amount.toFixed(2)} {currencySymbol}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>المنتجات الأكثر مبيعاً</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium">{product.name}</span>
                    </div>
                    <Badge variant="outline" className="text-green-600">
                      {product.trend}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{product.sales} مبيعة</span>
                    <span className="font-medium">{product.revenue.toFixed(2)} {currencySymbol}</span>
                  </div>
                  <Progress value={(product.sales / 50) * 100} className="h-1" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>إجراءات سريعة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Button variant="outline" className="h-auto flex-col gap-3 py-6 hover:border-primary hover:bg-primary/5" asChild>
              <Link href="/merchant/add-order">
                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <Icon name="PackagePlus" className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="font-medium">إضافة طلب جديد</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-3 py-6 hover:border-primary hover:bg-primary/5" asChild>
              <Link href="/merchant/orders">
                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <Icon name="Search" className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <span className="font-medium">تتبع الطلبات</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-3 py-6 hover:border-primary hover:bg-primary/5" asChild>
              <Link href="/merchant/financials">
                <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <Icon name="Receipt" className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="font-medium">عرض الفواتير</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-3 py-6 hover:border-primary hover:bg-primary/5" asChild>
              <Link href="/merchant/reports">
                <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                  <Icon name="BarChart3" className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <span className="font-medium">التقارير المفصلة</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
