'use client';

import { useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOrdersStore } from '@/store/orders-store';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Icon from '@/components/icon';
import { Badge } from '@/components/ui/badge';
import type { LatLngTuple } from 'leaflet';

const DriversMapComponent = dynamic(() => import('@/components/drivers-map-component'), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-full rounded-lg" />,
});

export default function DriverMapPage() {
  const { user } = useAuth();
  const { orders } = useOrdersStore();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // طلبات السائق النشطة
  const myActiveOrders = useMemo(() => {
    return orders.filter(o => 
      o.driver === user?.name && 
      (o.status === 'جاري التوصيل' || o.status === 'بالانتظار')
    );
  }, [orders, user]);

  // بيانات السائق للخريطة
  const driverData = useMemo(() => {
    if (!user) return null;
    return {
      id: user.id,
      name: user.name,
      avatar: user.avatar || `https://i.pravatar.cc/150?u=${user.id}`,
      position: [31.9539, 35.9106] as LatLngTuple, // Default Amman position
      isSimulating: true,
    };
  }, [user]);

  const selectedOrder = useMemo(() => {
    return myActiveOrders.find(o => o.id === selectedOrderId);
  }, [myActiveOrders, selectedOrderId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">خريطة التوصيل</h1>
        <p className="text-muted-foreground mt-1">
          عرض مواقع الطلبات والمسار المقترح
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Icon name="MapPin" className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{myActiveOrders.length}</p>
                <p className="text-xs text-muted-foreground">نقطة توصيل</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Icon name="Route" className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">~15</p>
                <p className="text-xs text-muted-foreground">كم متبقي</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Icon name="Clock" className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">~45</p>
                <p className="text-xs text-muted-foreground">دقيقة متبقية</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Icon name="Navigation" className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">محسّن</p>
                <p className="text-xs text-muted-foreground">المسار</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Map */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon name="Map" className="h-5 w-5 text-primary" />
              الخريطة التفاعلية
            </CardTitle>
            <Button variant="outline" size="sm">
              <Icon name="Navigation" className="ml-2 h-4 w-4" />
              تحسين المسار
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[60vh] rounded-b-lg overflow-hidden">
            {driverData && (
              <DriversMapComponent
                drivers={[driverData]}
                orders={myActiveOrders}
                initialSelectedDriverId={driverData.id}
                onSelectDriverInMap={() => {}}
                onDriverPositionChange={() => {}}
                onOrderPositionSelect={(order) => setSelectedOrderId(order?.id || null)}
                highlightedOrder={selectedOrder || null}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Selected Order Details */}
      {selectedOrder && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>الطلب المحدد</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedOrderId(null)}
              >
                <Icon name="X" className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-bold text-lg">{selectedOrder.recipient}</p>
                <p className="text-sm text-muted-foreground">#{selectedOrder.id}</p>
              </div>
              <Badge>{selectedOrder.status}</Badge>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Icon name="Phone" className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${selectedOrder.phone}`} className="text-primary">
                  {selectedOrder.phone}
                </a>
              </div>
              <div className="flex items-start gap-2">
                <Icon name="MapPin" className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span>{selectedOrder.address}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                className="flex-1"
                onClick={() => window.open(`https://maps.google.com/?q=${selectedOrder.address}`)}
              >
                <Icon name="Navigation" className="ml-2 h-4 w-4" />
                فتح في خرائط جوجل
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open(`tel:${selectedOrder.phone}`)}
              >
                <Icon name="Phone" className="ml-2 h-4 w-4" />
                اتصال
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الطلبات على الخريطة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {myActiveOrders.map((order, index) => (
            <div
              key={order.id}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedOrderId === order.id
                  ? 'border-primary bg-primary/5'
                  : 'hover:bg-accent'
              }`}
              onClick={() => setSelectedOrderId(order.id)}
            >
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{order.recipient}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {order.region}
                </p>
              </div>
              <Icon name="ChevronLeft" className="h-4 w-4 text-muted-foreground" />
            </div>
          ))}
          
          {myActiveOrders.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Icon name="MapPin" className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>لا توجد طلبات نشطة للعرض على الخريطة</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
