'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Users,
  MapPin,
  Calendar,
  BarChart3,
  PieChart,
  Download,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useOrdersStore } from '@/store/orders-store';

export default function MerchantReportsPage() {
  const [period, setPeriod] = useState('month');
  const { orders: allOrders } = useOrdersStore();
  const { settings, formatCurrency } = useSettings();
  const currencySymbol = settings.regional.currencySymbol;

  // حساب البيانات من الطلبات الحقيقية
  const data = useMemo(() => {
    const now = new Date();

    const getFilteredOrders = (days: number) => {
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() - days);
      return allOrders.filter(order => new Date(order.date) >= startDate);
    };

    const calculatePeriodData = (orders: typeof allOrders) => {
      const delivered = orders.filter(o => o.status === 'تم التوصيل');
      const cancelled = orders.filter(o => o.status === 'ملغي');
      const returned = orders.filter(o => o.status === 'مرتجع');

      const revenue = delivered.reduce((sum, o) => sum + (o.cod || 0), 0);
      const avgOrderValue = delivered.length > 0 ? revenue / delivered.length : 0;
      const successRate = orders.length > 0 ? (delivered.length / orders.length) * 100 : 0;
      const cancellationRate = orders.length > 0 ? (cancelled.length / orders.length) * 100 : 0;
      const returnRate = orders.length > 0 ? (returned.length / orders.length) * 100 : 0;

      return {
        orders: orders.length,
        revenue,
        successRate: Math.round(successRate),
        avgOrderValue,
        cancellationRate: Math.round(cancellationRate),
        returnRate: Math.round(returnRate),
        trend: { orders: 12, revenue: 18, successRate: 3 }, // يمكن حسابها لاحقاً بمقارنة الفترات
      };
    };

    return {
      week: calculatePeriodData(getFilteredOrders(7)),
      month: calculatePeriodData(getFilteredOrders(30)),
      quarter: calculatePeriodData(getFilteredOrders(90)),
      year: calculatePeriodData(getFilteredOrders(365)),
    };
  }, [allOrders]);

  const currentData = data[period as keyof typeof data];

  // Monthly revenue data from real orders
  const monthlyRevenue = useMemo(() => {
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    const monthlyData: Record<number, { revenue: number; orders: number }> = {};

    allOrders.forEach(order => {
      const orderDate = new Date(order.date);
      const month = orderDate.getMonth();

      if (!monthlyData[month]) {
        monthlyData[month] = { revenue: 0, orders: 0 };
      }

      if (order.status === 'تم التوصيل') {
        monthlyData[month].revenue += order.cod || 0;
      }
      monthlyData[month].orders += 1;
    });

    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month: months[parseInt(month)],
        revenue: data.revenue,
        orders: data.orders,
      }))
      .slice(-6); // آخر 6 أشهر
  }, [allOrders]);

  // Status distribution from real orders
  const statusData = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    const total = allOrders.length;

    allOrders.forEach(order => {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
    });

    const statusColors: Record<string, string> = {
      'تم التوصيل': 'bg-green-500',
      'جاري التوصيل': 'bg-blue-500',
      'قيد التوصيل': 'bg-blue-500',
      'بالانتظار': 'bg-yellow-500',
      'قيد المعالجة': 'bg-yellow-500',
      'ملغي': 'bg-red-500',
      'مرتجع': 'bg-orange-500',
    };

    return Object.entries(statusCounts)
      .map(([status, count]) => ({
        status,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        color: statusColors[status] || 'bg-gray-500',
      }))
      .sort((a, b) => b.count - a.count);
  }, [allOrders]);

  // Top products from order notes
  const topProducts = useMemo(() => {
    const products: Record<string, { orders: number; revenue: number }> = {};

    allOrders.forEach(order => {
      if (order.notes && order.status === 'تم التوصيل') {
        const productName = order.notes.split('×')[0].trim() || 'منتج غير محدد';
        if (!products[productName]) {
          products[productName] = { orders: 0, revenue: 0 };
        }
        products[productName].orders += 1;
        products[productName].revenue += order.cod || 0;
      }
    });

    return Object.entries(products)
      .map(([name, data]) => ({
        name,
        orders: data.orders,
        revenue: data.revenue,
        trend: 0, // يمكن حسابه بمقارنة الفترات
        stock: 'متوفر',
      }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 5);
  }, [allOrders]);

  // Top cities from real orders
  const topCities = useMemo(() => {
    const cities: Record<string, { orders: number; revenue: number }> = {};

    allOrders.forEach(order => {
      if (!cities[order.city]) {
        cities[order.city] = { orders: 0, revenue: 0 };
      }
      cities[order.city].orders += 1;
      if (order.status === 'تم التوصيل') {
        cities[order.city].revenue += order.cod || 0;
      }
    });

    const total = allOrders.length;

    return Object.entries(cities)
      .map(([city, data]) => ({
        city,
        orders: data.orders,
        revenue: data.revenue,
        percentage: total > 0 ? Math.round((data.orders / total) * 100) : 0,
      }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 4);
  }, [allOrders]);

  // Customer insights from real orders
  const customerInsights = useMemo(() => {
    const customers: Record<string, { orders: number; revenue: number }> = {};

    allOrders.forEach(order => {
      if (!customers[order.recipient]) {
        customers[order.recipient] = { orders: 0, revenue: 0 };
      }
      customers[order.recipient].orders += 1;
      if (order.status === 'تم التوصيل') {
        customers[order.recipient].revenue += order.cod || 0;
      }
    });

    const uniqueCustomers = Object.keys(customers).length;
    const returningCustomers = Object.values(customers).filter(c => c.orders > 1).length;
    const newCustomers = uniqueCustomers - returningCustomers;
    const avgOrdersPerCustomer = uniqueCustomers > 0 ? allOrders.length / uniqueCustomers : 0;

    const topCustomer = Object.entries(customers)
      .sort((a, b) => b[1].orders - a[1].orders)[0];

    return {
      newCustomers,
      returningCustomers,
      avgOrdersPerCustomer: parseFloat(avgOrdersPerCustomer.toFixed(1)),
      topCustomer: topCustomer ? {
        name: topCustomer[0],
        orders: topCustomer[1].orders,
        revenue: topCustomer[1].revenue,
      } : { name: 'لا يوجد', orders: 0, revenue: 0 },
    };
  }, [allOrders]);

  const handleExport = (format: 'excel' | 'pdf' | 'csv') => {
    console.log(`Exporting as ${format}`);
    // سيتم تنفيذ التصدير الفعلي
  };

  const TrendBadge = ({ value }: { value: number }) => {
    const isPositive = value > 0;
    return (
      <Badge variant="secondary" className={`gap-1 ${isPositive ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
        {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {Math.abs(value)}%
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">التقارير والإحصائيات</h1>
          <p className="text-muted-foreground mt-1">تحليل شامل ومفصل لأداء متجرك</p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">آخر أسبوع</SelectItem>
              <SelectItem value="month">آخر شهر</SelectItem>
              <SelectItem value="quarter">آخر 3 أشهر</SelectItem>
              <SelectItem value="year">آخر سنة</SelectItem>
            </SelectContent>
          </Select>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Download className="ml-2 h-4 w-4" />
                تصدير
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport('excel')}>
                <FileSpreadsheet className="ml-2 h-4 w-4" />
                تصدير Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                <FileText className="ml-2 h-4 w-4" />
                تصدير PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('csv')}>
                <Download className="ml-2 h-4 w-4" />
                تصدير CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              إجمالي الطلبات
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentData.orders}</div>
            <div className="flex items-center gap-2 mt-2">
              <TrendBadge value={currentData.trend.orders} />
              <span className="text-xs text-muted-foreground">من الفترة السابقة</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              إجمالي الإيرادات
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" dir="ltr">{currentData.revenue.toFixed(2)} {currencySymbol}</div>
            <div className="flex items-center gap-2 mt-2">
              <TrendBadge value={currentData.trend.revenue} />
              <span className="text-xs text-muted-foreground">من الفترة السابقة</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              معدل التوصيل الناجح
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentData.successRate}%</div>
            <Progress value={currentData.successRate} className="mt-2" />
            <div className="flex items-center gap-2 mt-2">
              <TrendBadge value={currentData.trend.successRate} />
              <span className="text-xs text-muted-foreground">من الفترة السابقة</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              متوسط قيمة الطلب
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" dir="ltr">{currentData.avgOrderValue.toFixed(2)} {currencySymbol}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                معدل الإلغاء: {currentData.cancellationRate}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">الإيرادات الشهرية</TabsTrigger>
          <TabsTrigger value="status">توزيع الحالات</TabsTrigger>
          <TabsTrigger value="customers">العملاء</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>الإيرادات والطلبات الشهرية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyRevenue.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{item.month}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-muted-foreground">{item.orders} طلب</span>
                        <span className="font-bold text-green-600" dir="ltr">{item.revenue.toFixed(2)} {currencySymbol}</span>
                      </div>
                    </div>
                    <Progress value={(item.revenue / 10000) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>توزيع الطلبات حسب الحالة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statusData.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`h-3 w-3 rounded-full ${item.color}`} />
                        <span className="font-medium">{item.status}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-muted-foreground">{item.count} طلب</span>
                        <span className="font-bold">{item.percentage}%</span>
                      </div>
                    </div>
                    <Progress value={item.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>إحصائيات العملاء</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <span className="text-sm font-medium">عملاء جدد</span>
                  <span className="text-2xl font-bold text-blue-600">{customerInsights.newCustomers}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <span className="text-sm font-medium">عملاء عائدون</span>
                  <span className="text-2xl font-bold text-green-600">{customerInsights.returningCustomers}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <span className="text-sm font-medium">متوسط الطلبات لكل عميل</span>
                  <span className="text-2xl font-bold text-purple-600">{customerInsights.avgOrdersPerCustomer}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>أفضل عميل</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-lg">{customerInsights.topCustomer.name}</p>
                      <p className="text-sm text-muted-foreground">أفضل عميل هذا الشهر</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground">عدد الطلبات</p>
                      <p className="text-2xl font-bold">{customerInsights.topCustomer.orders}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">إجمالي الإنفاق</p>
                      <p className="text-2xl font-bold" dir="ltr">{customerInsights.topCustomer.revenue.toFixed(2)} {currencySymbol}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Bottom Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>المنتجات الأكثر طلباً</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-4 last:border-0">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-muted-foreground">{product.orders} طلب</span>
                        <Badge variant="secondary" className="text-xs">{product.stock}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold" dir="ltr">{product.revenue.toFixed(2)} {currencySymbol}</p>
                    <TrendBadge value={product.trend} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Cities */}
        <Card>
          <CardHeader>
            <CardTitle>المدن الأكثر طلباً</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCities.map((city, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{city.city}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">{city.orders} طلب</span>
                      <span className="font-bold text-green-600" dir="ltr">{city.revenue.toFixed(2)} {currencySymbol}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={city.percentage} className="flex-1 h-2" />
                    <span className="text-sm font-medium min-w-[40px] text-right">{city.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
