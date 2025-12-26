'use client';

import { useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOrdersStore } from '@/store/orders-store';
import { useSettings } from '@/contexts/SettingsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/icon';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';

export default function DriverHomePage() {
  const { user } = useAuth();
  const { orders, updateOrderField } = useOrdersStore();
  const { formatCurrency } = useSettings();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // طلبات السائق
  const myOrders = useMemo(() => {
    return orders.filter(o => o.driver === user?.name);
  }, [orders, user]);

  // الطلبات النشطة (قيد التوصيل + بالانتظار)
  const activeOrders = useMemo(() => {
    return myOrders.filter(o =>
      o.status === 'جاري التوصيل' || o.status === 'بالانتظار'
    );
  }, [myOrders]);

  // إحصائيات اليوم
  const todayStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayOrders = myOrders.filter(o => o.date === today);

    return {
      total: todayOrders.length,
      delivered: todayOrders.filter(o => o.status === 'تم التوصيل').length,
      pending: todayOrders.filter(o => o.status === 'جاري التوصيل' || o.status === 'بالانتظار').length,
      returned: todayOrders.filter(o => o.status === 'مرتجع').length,
      postponed: todayOrders.filter(o => o.status === 'مؤجل').length,
      cashCollected: todayOrders
        .filter(o => o.status === 'تم التوصيل')
        .reduce((sum, o) => sum + (o.cod || 0), 0),
      cashPending: todayOrders
        .filter(o => o.status === 'جاري التوصيل' || o.status === 'بالانتظار')
        .reduce((sum, o) => sum + (o.cod || 0), 0),
    };
  }, [myOrders]);

  // تجميع حسب المنطقة للطلبات النشطة
  const regionsSummary = useMemo(() => {
    const regions: Record<string, { count: number; total: number }> = {};
    activeOrders.forEach(order => {
      const region = order.region || 'غير محدد';
      if (!regions[region]) {
        regions[region] = { count: 0, total: 0 };
      }
      regions[region].count++;
      regions[region].total += order.cod || 0;
    });
    return Object.entries(regions)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [activeOrders]);

  // حساب نسبة الإنجاز
  const completionRate = useMemo(() => {
    if (todayStats.total === 0) return 0;
    return Math.round((todayStats.delivered / todayStats.total) * 100);
  }, [todayStats]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'تم التوصيل': 'bg-green-500',
      'جاري التوصيل': 'bg-blue-500',
      'بالانتظار': 'bg-yellow-500',
      'مؤجل': 'bg-orange-500',
      'مرتجع': 'bg-red-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  const handleQuickAction = (orderId: string, newStatus: string) => {
    updateOrderField(orderId, 'status', newStatus);
    setSelectedOrder(null);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Welcome Card with Progress */}
      <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-bold mb-0.5">
                مرحباً، {user?.name?.split(' ')[0]}! 👋
              </h1>
              <p className="text-sm text-primary-foreground/80">
                {activeOrders.length} طلب نشط • {formatCurrency(todayStats.cashPending)} للتحصيل
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{completionRate}%</div>
              <div className="text-xs text-primary-foreground/70">إنجاز</div>
            </div>
          </div>
          <Progress value={completionRate} className="h-2 bg-primary-foreground/20" />
          <div className="flex justify-between mt-2 text-xs text-primary-foreground/70">
            <span>{todayStats.delivered} تم توصيلها</span>
            <span>{todayStats.pending} متبقية</span>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats - أصغر وأبسط */}
      <div className="grid grid-cols-4 gap-2">
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200">
          <CardContent className="p-3 text-center">
            <Icon name="Package" className="h-5 w-5 text-blue-600 mx-auto mb-1" />
            <p className="text-xl font-bold text-blue-600">{todayStats.total}</p>
            <p className="text-[10px] text-muted-foreground">إجمالي</p>
          </CardContent>
        </Card>

        <Card className="bg-green-50 dark:bg-green-950 border-green-200">
          <CardContent className="p-3 text-center">
            <Icon name="PackageCheck" className="h-5 w-5 text-green-600 mx-auto mb-1" />
            <p className="text-xl font-bold text-green-600">{todayStats.delivered}</p>
            <p className="text-[10px] text-muted-foreground">تم</p>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 dark:bg-orange-950 border-orange-200">
          <CardContent className="p-3 text-center">
            <Icon name="Clock" className="h-5 w-5 text-orange-600 mx-auto mb-1" />
            <p className="text-xl font-bold text-orange-600">{todayStats.pending}</p>
            <p className="text-[10px] text-muted-foreground">قيد</p>
          </CardContent>
        </Card>

        <Card className="bg-red-50 dark:bg-red-950 border-red-200">
          <CardContent className="p-3 text-center">
            <Icon name="Undo2" className="h-5 w-5 text-red-600 mx-auto mb-1" />
            <p className="text-xl font-bold text-red-600">{todayStats.returned}</p>
            <p className="text-[10px] text-muted-foreground">مرتجع</p>
          </CardContent>
        </Card>
      </div>

      {/* Cash Summary */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                <Icon name="Wallet" className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-green-600">{formatCurrency(todayStats.cashCollected)}</p>
                <p className="text-xs text-muted-foreground">تم تحصيله</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900">
                <Icon name="Receipt" className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-yellow-600">{formatCurrency(todayStats.cashPending)}</p>
                <p className="text-xs text-muted-foreground">متبقي للتحصيل</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Regions Summary - ملخص المناطق */}
      {regionsSummary.length > 0 && (
        <Card>
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Icon name="MapPin" className="h-4 w-4 text-primary" />
              المناطق النشطة
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="flex flex-wrap gap-2">
              {regionsSummary.map((region) => (
                <Link 
                  key={region.name} 
                  href={`/driver/orders?search=${encodeURIComponent(region.name)}`}
                >
                  <Badge 
                    variant="secondary" 
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors py-1.5 px-3"
                  >
                    <Icon name="MapPin" className="h-3 w-3 ml-1" />
                    {region.name}
                    <span className="bg-primary/10 text-primary rounded-full px-1.5 py-0.5 text-xs mr-2">
                      {region.count}
                    </span>
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Orders - الطلبات العاجلة أولاً */}
      {activeOrders.length > 0 && (
        <Card>
          <CardHeader className="p-3 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Icon name="TrendingUp" className="h-4 w-4 text-primary" />
                الطلبات النشطة
                <Badge variant="secondary" className="mr-1">{activeOrders.length}</Badge>
              </CardTitle>
              <Link href="/driver/orders?filter=pending">
                <Button variant="ghost" size="sm" className="h-7 text-xs">
                  عرض الكل
                  <Icon name="ArrowLeft" className="mr-1 h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-2 space-y-2">
            {activeOrders.slice(0, 4).map((order) => (
              <div
                key={order.id}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent transition-colors cursor-pointer active:scale-[0.99]"
                onClick={() => setSelectedOrder(order)}
              >
                <div className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                  getStatusColor(order.status)
                )}>
                  <Icon name="Package" className="h-5 w-5 text-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{order.recipient}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Icon name="MapPin" className="h-3 w-3" />
                    <span className="truncate">{order.region}</span>
                  </div>
                </div>

                <div className="text-left shrink-0">
                  <p className="font-bold text-green-600">{formatCurrency(order.cod)}</p>
                </div>

                <Icon name="ChevronLeft" className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
            
            {activeOrders.length > 4 && (
              <Link href="/driver/orders?filter=pending">
                <Button variant="outline" className="w-full h-9 text-sm">
                  عرض {activeOrders.length - 4} طلب آخر
                  <Icon name="ArrowLeft" className="mr-2 h-4 w-4" />
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions - إجراءات سريعة أبسط */}
      <div className="grid grid-cols-4 gap-2">
        <Link href="/driver/orders">
          <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
            <CardContent className="p-3 text-center flex flex-col items-center justify-center">
              <div className="p-2 rounded-full bg-blue-100 mb-1">
                <Icon name="List" className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-xs">طلباتي</span>
            </CardContent>
          </Card>
        </Link>

        <Link href="/driver/map">
          <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
            <CardContent className="p-3 text-center flex flex-col items-center justify-center">
              <div className="p-2 rounded-full bg-green-100 mb-1">
                <Icon name="Map" className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-xs">الخريطة</span>
            </CardContent>
          </Card>
        </Link>

        <Link href="/driver/orders?filter=postponed">
          <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
            <CardContent className="p-3 text-center flex flex-col items-center justify-center relative">
              <div className="p-2 rounded-full bg-orange-100 mb-1">
                <Icon name="CalendarClock" className="h-5 w-5 text-orange-600" />
              </div>
              <span className="text-xs">مؤجلة</span>
              {todayStats.postponed > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                  {todayStats.postponed}
                </Badge>
              )}
            </CardContent>
          </Card>
        </Link>

        <Link href="/driver/history">
          <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
            <CardContent className="p-3 text-center flex flex-col items-center justify-center">
              <div className="p-2 rounded-full bg-purple-100 mb-1">
                <Icon name="History" className="h-5 w-5 text-purple-600" />
              </div>
              <span className="text-xs">السجل</span>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تفاصيل الطلب</DialogTitle>
            <DialogDescription>
              رقم الطلب: {selectedOrder?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">العميل:</span>
                  <span className="font-medium">{selectedOrder.recipient}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الهاتف:</span>
                  <a href={`tel:${selectedOrder.phone}`} className="font-medium text-primary">
                    {selectedOrder.phone}
                  </a>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">العنوان:</span>
                  <span className="font-medium text-left">{selectedOrder.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">المبلغ:</span>
                  <span className="font-bold text-lg">{formatCurrency(selectedOrder.cod)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الحالة:</span>
                  <Badge>{selectedOrder.status}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => window.open(`tel:${selectedOrder.phone}`)}
                >
                  <Icon name="Phone" className="ml-2 h-4 w-4" />
                  اتصال
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open(`https://maps.google.com/?q=${selectedOrder.address}`)}
                >
                  <Icon name="MapPin" className="ml-2 h-4 w-4" />
                  الموقع
                </Button>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <p className="text-sm font-medium">تحديث الحالة:</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="default"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleQuickAction(selectedOrder.id, 'تم التوصيل')}
                  >
                    <Icon name="PackageCheck" className="ml-2 h-4 w-4" />
                    تم التوصيل
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleQuickAction(selectedOrder.id, 'مؤجل')}
                  >
                    <Icon name="Clock" className="ml-2 h-4 w-4" />
                    تأجيل
                  </Button>
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-600 hover:bg-red-50"
                    onClick={() => handleQuickAction(selectedOrder.id, 'مرتجع')}
                  >
                    <Icon name="Undo2" className="ml-2 h-4 w-4" />
                    إرجاع
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedOrder(null)}
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
