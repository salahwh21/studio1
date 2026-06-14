'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  MapPin,
  Users,
  Package,
  DollarSign,
  Search,
  Phone,
  Clock,
  CheckCircle2,
  Navigation,
  Wand2
} from 'lucide-react';
import dynamic from 'next/dynamic';
import type { LatLngTuple } from 'leaflet';
import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

import { useUsersStore } from '@/store/user-store';
import { useOrdersStore, type Order } from '@/store/orders-store';
import { useSettings } from '@/contexts/SettingsContext';
import { useStatusesStore } from '@/store/statuses-store';
import { cn } from '@/lib/utils';
import { OptimizeRouteDialog } from '@/components/dashboard/optimize-route-sheet';
import { api } from '@/lib/api';
import { connectSocket } from '@/lib/socket';

const DriversMapComponent = dynamic(() => import('@/components/drivers-map-component'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-muted/30">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">جاري تحميل الخريطة...</p>
      </div>
    </div>
  ),
});

interface Driver {
  id: string;
  name: string;
  status: string;
  parcels: number;
  avatar: string;
  position: LatLngTuple;
  isSimulating?: boolean;
}

export default function DriversMapPage() {
  const { users } = useUsersStore();
  const { orders } = useOrdersStore();
  const { statuses } = useStatusesStore();
  const { settings, formatCurrency } = useSettings();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [highlightedOrder, setHighlightedOrder] = useState<Order | null>(null);
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  
  const excludedStatuses = [
    'بالانتظار', 'بانتظار السائق', 'تم استلام المال في الفرع', 'مكتمل', 
    'مرتجع للفرع', 'مرتجع للتاجر', 'مرجع للفرع', 'مرجع للتاجر', 
    'تسوية', 'تمت التسوية', 'مؤرشف', 'مرشف', 'تم محاسبة التاجر', 'محاسبة التاجر',
    'STS_001', 'STS_005', 'STS_008'
  ];
  const relevantStatuses = useMemo(() => {
    return statuses.filter(s => {
      // Exclude specific names/codes, and also any status containing specific phrases
      if (excludedStatuses.some(ex => s.name === ex || s.code === ex)) return false;
      if (
        s.name.includes('مرتجع للفرع') || 
        s.name.includes('مرتجع للتاجر') || 
        s.name.includes('مرجع للفرع') || 
        s.name.includes('مرجع للتاجر') || 
        s.name.includes('تسوية') ||
        s.name.includes('محاسبة التاجر')
      ) return false;
      return true;
    });
  }, [statuses]);

  const [optimizeSheetOpen, setOptimizeSheetOpen] = useState(false);
  const [driverToOptimize, setDriverToOptimize] = useState<string | null>(null);

  // Set default filters when statuses load
  useEffect(() => {
    if (relevantStatuses.length > 0 && statusFilters.length === 0) {
      setStatusFilters(relevantStatuses.map(s => s.name));
    }
  }, [relevantStatuses, statusFilters.length]);

  // جلب مواقع السائقين من الـ API + الاستماع لتحديثات Socket
  useEffect(() => {
    const driverUsers = users.filter(u => u.roleId === 'driver');

    // جلب المواقع الحالية من الـ database
    const fetchLocations = async () => {
      try {
        const response = await api.getDriverLocations();
        const locations: Record<string, { lat: number; lng: number; is_online: boolean }> = {};
        (response as any[]).forEach((loc: any) => {
          locations[loc.id] = {
            lat: parseFloat(loc.current_latitude),
            lng: parseFloat(loc.current_longitude),
            is_online: loc.is_online,
          };
        });

        const initialDrivers = driverUsers.map((driver) => {
          const driverOrders = orders.filter(o => o.driver === driver.name);
          const loc = locations[driver.id];
          return {
            id: driver.id,
            name: driver.name,
            status: loc?.is_online ? 'نشط' : (driverOrders.length > 0 ? 'نشط' : 'غير نشط'),
            parcels: driverOrders.length,
            avatar: driver.avatar,
            position: (loc ? [loc.lat, loc.lng] : [31.9539, 35.9106]) as LatLngTuple,
            isSimulating: false,
          };
        });
        setDrivers(initialDrivers);

        if (initialDrivers.length > 0 && !selectedDriverId) {
          setSelectedDriverId(initialDrivers[0].id);
        }
      } catch {
        // fallback: استخدام users بدون مواقع
        const fallbackDrivers = driverUsers.map((driver) => {
          const driverOrders = orders.filter(o => o.driver === driver.name);
          return {
            id: driver.id,
            name: driver.name,
            status: driverOrders.length > 0 ? 'نشط' : 'غير نشط',
            parcels: driverOrders.length,
            avatar: driver.avatar,
            position: [31.9539, 35.9106] as LatLngTuple,
            isSimulating: false,
          };
        });
        setDrivers(fallbackDrivers);
      }
    };

    fetchLocations();

    // الاستماع لتحديثات GPS المباشرة عبر Socket
    const socket = connectSocket();
    const handleLocationUpdate = (data: { driver_id: string; latitude: number; longitude: number }) => {
      setDrivers(prev => prev.map(d =>
        d.id === data.driver_id
          ? { ...d, position: [data.latitude, data.longitude] as LatLngTuple, status: 'نشط' }
          : d
      ));
    };

    socket?.on('driver_location_update', handleLocationUpdate);

    return () => {
      socket?.off('driver_location_update', handleLocationUpdate);
    };
  }, [users, orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const st = statuses.find(s => s.name === o.status || s.code === o.status || s.id === o.status);
      const statusName = st ? st.name : o.status;
      return statusFilters.includes(statusName);
    });
  }, [orders, statusFilters, statuses]);

  // Calculate statistics based on accurate status matching
  const stats = useMemo(() => {
    // Dynamic out for delivery check
    const isOutForDelivery = (orderStatus: string) => {
      const st = statuses.find(s => s.name === orderStatus || s.code === orderStatus || s.id === orderStatus);
      return st ? (st.code === 'STS_002' || st.name === 'جاري التوصيل') : (orderStatus === 'جاري التوصيل');
    };

    const activeDeliveries = orders.filter(o => isOutForDelivery(o.status)).length;
    const activeDrivers = drivers.filter(d => d.status === 'نشط').length;
    const totalOrders = filteredOrders.length;
    
    return {
      totalOrders,
      activeDeliveries,
      activeDrivers,
    };
  }, [orders, drivers, filteredOrders.length, statuses]);

  const getDriverOrders = (driverId: string) => {
    const driver = drivers.find(d => d.id === driverId);
    if (!driver) return [];
    return filteredOrders.filter(o => o.driver === driver.name || o.driver === driver.id || (o as any).driverId === driver.id);
  };

  const filteredDrivers = useMemo(() => {
    if (!searchQuery) return drivers;
    return drivers.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [drivers, searchQuery]);

  const activeDrivers = filteredDrivers.filter(d => d.status === 'نشط');
  const inactiveDrivers = filteredDrivers.filter(d => d.status === 'غير نشط');

  const handleDriverPositionChange = (driverId: string, newPosition: LatLngTuple) => {
    setDrivers(prev => prev.map(d =>
      d.id === driverId ? { ...d, position: newPosition, isSimulating: true } : d
    ));
  };

  const handleOrderSelect = (order: Order | null) => {
    setHighlightedOrder(order);
  };

  const handleOptimizeRoute = (driverId: string) => {
    setDriverToOptimize(driverId);
    setOptimizeSheetOpen(true);
  };

  return (
    <div className="relative h-[calc(100vh-6rem)] w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
      {/* Background Map */}
      <div className="absolute inset-0 z-0">
        <DriversMapComponent
          drivers={drivers}
          orders={filteredOrders}
          initialSelectedDriverId={selectedDriverId}
          highlightedOrder={highlightedOrder}
          onSelectDriverInMap={setSelectedDriverId}
          onDriverPositionChange={handleDriverPositionChange}
          onOrderPositionSelect={handleOrderSelect}
        />
      </div>

      {/* Floating Glass Header */}
      <div className="relative z-10 flex flex-col gap-3 p-4 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-b shadow-sm pointer-events-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MapPin className="h-6 w-6 text-primary animate-pulse" />
              رادار المتابعة المباشرة
            </h1>
            <p className="text-muted-foreground mt-1 text-xs">تتبع السائقين والطلبات الفعالة فورياً</p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="rounded-full shadow-sm" title="العودة للرئيسية">
                <Navigation className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters and Stats Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 min-w-0" style={{ scrollbarWidth: 'none' }}>
            <div className="flex gap-1.5 flex-nowrap">
              {relevantStatuses.map(status => (
                <Button
                  key={status.id}
                  size="sm"
                  variant={statusFilters.includes(status.name) ? "default" : "outline"}
                  className="h-7 text-[11px] gap-1.5 px-2.5 rounded-full flex-shrink-0 transition-all hover:scale-105 shadow-sm bg-white/50 hover:bg-white/80 dark:bg-slate-900/50"
                  style={statusFilters.includes(status.name) ? { backgroundColor: status.color, color: '#fff', borderColor: status.color } : {}}
                  onClick={() => {
                    setStatusFilters(prev =>
                      prev.includes(status.name)
                        ? prev.filter(s => s !== status.name)
                        : [...prev, status.name]
                    );
                  }}
                >
                  {!statusFilters.includes(status.name) && (
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: status.color }}></div>
                  )}
                  {status.name}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs flex-shrink-0">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-100/50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full border border-blue-200/50 dark:border-blue-800/50 shadow-sm">
              <Package className="h-3.5 w-3.5" />
              <span className="font-semibold whitespace-nowrap">إجمالي: <span className="font-bold text-sm ml-1">{stats.totalOrders}</span></span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-green-100/50 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full border border-green-200/50 dark:border-green-800/50 shadow-sm">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span className="font-semibold whitespace-nowrap">بالطريق: <span className="font-bold text-sm ml-1">{stats.activeDeliveries}</span></span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-orange-100/50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 rounded-full border border-orange-200/50 dark:border-orange-800/50 shadow-sm">
              <Users className="h-3.5 w-3.5" />
              <span className="font-semibold whitespace-nowrap">متاحين: <span className="font-bold text-sm ml-1">{stats.activeDrivers}</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Driver Sidebar */}
      <div className="absolute top-36 right-4 bottom-4 w-80 flex flex-col gap-2 z-10 pointer-events-none hidden md:flex">
        <Card className="flex-1 flex flex-col overflow-hidden pointer-events-auto bg-white/85 dark:bg-slate-950/85 backdrop-blur-xl shadow-2xl border border-primary/20 rounded-2xl">
          <CardHeader className="py-3 flex-shrink-0 border-b bg-white/40 dark:bg-slate-900/40">
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <Users className="h-5 w-5 text-primary" />
              قائمة السائقين
            </CardTitle>
          </CardHeader>

          <div className="p-3 border-b flex-shrink-0">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث عن سائق..."
                className="pr-10 h-9 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <Tabs defaultValue="all" dir="rtl" className="flex-1 flex flex-col">
            <TabsList className="mx-3 mt-3 flex-shrink-0 bg-slate-100/50 dark:bg-slate-800/50 backdrop-blur-sm">
              <TabsTrigger value="all" className="text-xs">
                الكل <Badge variant="secondary" className="mr-1 text-[10px] px-1">{filteredDrivers.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="active" className="text-xs">
                نشط <Badge variant="secondary" className="mr-1 text-[10px] px-1">{activeDrivers.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="inactive" className="text-xs">
                غير نشط <Badge variant="secondary" className="mr-1 text-[10px] px-1">{inactiveDrivers.length}</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="flex-1 mt-2">
              <ScrollArea className="h-[calc(100vh-22rem)] px-3">
                <div className="space-y-2 pb-4">
                  {filteredDrivers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
                      <p className="text-xs">لا يوجد سائقين</p>
                    </div>
                  ) : (
                    filteredDrivers.map(driver => (
                      <DriverCard
                        key={driver.id}
                        driver={driver}
                        driverOrders={getDriverOrders(driver.id)}
                        isSelected={selectedDriverId === driver.id}
                        onSelect={() => setSelectedDriverId(driver.id)}
                        onOrderSelect={handleOrderSelect}
                        formatCurrency={formatCurrency}
                        onOptimizeRoute={handleOptimizeRoute}
                      />
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="active" className="flex-1 mt-2">
              <ScrollArea className="h-[calc(100vh-22rem)] px-3">
                <div className="space-y-2 pb-4">
                  {activeDrivers.map(driver => (
                    <DriverCard
                      key={driver.id}
                      driver={driver}
                      driverOrders={getDriverOrders(driver.id)}
                      isSelected={selectedDriverId === driver.id}
                      onSelect={() => setSelectedDriverId(driver.id)}
                      onOrderSelect={handleOrderSelect}
                      formatCurrency={formatCurrency}
                      onOptimizeRoute={handleOptimizeRoute}
                    />
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="inactive" className="flex-1 mt-2">
              <ScrollArea className="h-[calc(100vh-22rem)] px-3">
                <div className="space-y-2 pb-4">
                  {inactiveDrivers.map(driver => (
                    <DriverCard
                      key={driver.id}
                      driver={driver}
                      driverOrders={getDriverOrders(driver.id)}
                      isSelected={selectedDriverId === driver.id}
                      onSelect={() => setSelectedDriverId(driver.id)}
                      onOrderSelect={handleOrderSelect}
                      formatCurrency={formatCurrency}
                      onOptimizeRoute={handleOptimizeRoute}
                    />
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      <OptimizeRouteDialog 
        open={optimizeSheetOpen} 
        onOpenChange={setOptimizeSheetOpen} 
        driverId={driverToOptimize} 
      />
    </div>
  );
}

// Driver Card Component
interface DriverCardProps {
  driver: Driver;
  driverOrders: Order[];
  isSelected: boolean;
  onSelect: () => void;
  onOrderSelect: (order: Order) => void;
  formatCurrency: (amount: number | undefined | null) => string;
  onOptimizeRoute: (driverId: string) => void;
}

function DriverCard({ driver, driverOrders, isSelected, onSelect, onOrderSelect, formatCurrency, onOptimizeRoute }: DriverCardProps) {
  // Use a more generic check for out for delivery, accounting for different potential status names
  const outForDeliveryOrders = driverOrders.filter(o => 
    o.status === 'جاري التوصيل' || 
    o.status === 'STS_002' || 
    o.status.includes('جاري')
  );
  const totalCOD = outForDeliveryOrders.reduce((sum, order) => sum + (order.cod || 0), 0);

  return (
    <Collapsible>
      <CollapsibleTrigger asChild>
        <Card
          className={cn(
            "cursor-pointer transition-all hover:border-primary",
            isSelected && "border-primary bg-primary/5"
          )}
          onClick={onSelect}
        >
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={driver.avatar} alt={driver.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                    {driver.name.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                {driver.status === 'نشط' && (
                  <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{driver.name}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  {driverOrders.length} طلبات
                </p>
              </div>

              <Badge
                variant={driver.status === 'نشط' ? "default" : "secondary"}
                className="text-xs"
              >
                {driver.status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="mt-2 p-3 bg-muted/50 rounded-md space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 bg-background rounded text-center">
              <p className="text-[10px] text-muted-foreground">قيد التوصيل</p>
              <p className="font-bold text-sm text-green-600">{outForDeliveryOrders.length}</p>
            </div>
            <div className="p-2 bg-background rounded text-center">
              <p className="text-[10px] text-muted-foreground">إجمالي الطلبات</p>
              <p className="font-bold text-sm">{driverOrders.length}</p>
            </div>
            <div className="p-2 bg-background rounded text-center">
              <p className="text-[10px] text-muted-foreground">التحصيل</p>
              <p className="font-bold text-sm text-blue-600">{formatCurrency(totalCOD)}</p>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Clock className="h-3 w-3" />
              طلبات قيد التوصيل
            </h4>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">{outForDeliveryOrders.length}</Badge>
              {outForDeliveryOrders.length >= 2 && (
                <Button size="sm" variant="outline" className="h-6 text-[10px] px-2 gap-1 border-primary/20 hover:bg-primary/5 text-primary" onClick={(e) => { e.stopPropagation(); onOptimizeRoute(driver.id); }}>
                  <Wand2 className="h-3 w-3" />
                  تحسين
                </Button>
              )}
            </div>
          </div>

          <ScrollArea className="h-40 rounded bg-background border">
            <div className="p-2 space-y-2">
              {outForDeliveryOrders.map(order => (
                <div
                  key={order.id}
                  className="p-2 bg-muted/50 rounded hover:bg-muted cursor-pointer transition-colors"
                  onClick={() => onOrderSelect(order)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 space-y-1">
                      <p className="font-medium text-sm">{order.recipient}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {order.address}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <p className="font-bold text-sm">{formatCurrency(order.cod)}</p>
                      <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">
                        <Phone className="h-3 w-3" />
                        اتصال
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {outForDeliveryOrders.length === 0 && (
                <div className="text-center text-muted-foreground py-4">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">لا توجد طلبات قيد التوصيل</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
