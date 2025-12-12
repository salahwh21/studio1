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
        .filter(o => o.status === 'جاري التوصيل')
        .reduce((sum, o) => sum + (o.cod || 0), 0),
    };
  }, [myOrders]);

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
    <div className="space-y-6">
      {/* Welcome Card */}
      <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">
                مرحباً، {user?.name}! 👋
              </h1>
              <p className="text-primary-foreground/80">
                لديك {activeOrders.length} طلب نشط اليوم
              </p>
            </div>
            <div className="hidden md:block">
              <Icon name="Truck" className="h-16 w-16 opacity-20" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                <Icon name="Package" className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{todayStats.total}</p>
                <p className="text-xs text-muted-foreground">إجمالي اليوم</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                <Icon name="PackageCheck" className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{todayStats.delivered}</p>
                <p className="text-xs text-muted-foreground">تم التوصيل</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900">
                <Icon name="Clock" className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{todayStats.pending}</p>
                <p className="text-xs text-muted-foreground">قيد التوصيل</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                <Icon name="Wallet" className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-lg font-bold">{formatCurrency(todayStats.cashCollected)}</p>
                <p className="text-xs text-muted-foreground">تم التحصيل</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Orders */}
      {activeOrders.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Icon name="TrendingUp" className="h-5 w-5 text-primary" />
                الطلبات النشطة
              </CardTitle>
              <Link href="/driver/orders">
                <Button variant="ghost" size="sm">
                  عرض الكل
                  <Icon name="ArrowLeft" className="mr-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeOrders.slice(0, 5).map((order) => (
              <div
                key={order.id}
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors cursor-pointer"
                onClick={() => setSelectedOrder(order)}
              >
                <div className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center",
                  getStatusColor(order.status)
                )}>
                  <Icon name="Package" className="h-5 w-5 text-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{order.recipient}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {order.region} - {order.city}
                  </p>
                </div>

                <div className="text-left">
                  <p className="font-bold">{formatCurrency(order.cod)}</p>
                  <Badge variant="outline" className="text-xs">
                    {order.status}
                  </Badge>
                </div>

                <Button variant="ghost" size="icon">
                  <Icon name="ChevronLeft" className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Zap" className="h-5 w-5 text-primary" />
            إجراءات سريعة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link href="/driver/orders?filter=pending">
              <Button variant="outline" className="w-full h-auto flex-col gap-2 py-4">
                <Icon name="Clock" className="h-6 w-6 text-yellow-600" />
                <span className="text-sm">قيد التوصيل</span>
                <Badge variant="secondary">{todayStats.pending}</Badge>
              </Button>
            </Link>

            <Link href="/driver/map">
              <Button variant="outline" className="w-full h-auto flex-col gap-2 py-4">
                <Icon name="Map" className="h-6 w-6 text-blue-600" />
                <span className="text-sm">عرض الخريطة</span>
              </Button>
            </Link>

            <Link href="/driver/orders?filter=postponed">
              <Button variant="outline" className="w-full h-auto flex-col gap-2 py-4">
                <Icon name="CalendarClock" className="h-6 w-6 text-orange-600" />
                <span className="text-sm">المؤجلة</span>
                <Badge variant="secondary">{todayStats.postponed}</Badge>
              </Button>
            </Link>

            <Link href="/driver/history">
              <Button variant="outline" className="w-full h-auto flex-col gap-2 py-4">
                <Icon name="History" className="h-6 w-6 text-purple-600" />
                <span className="text-sm">السجل</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

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
