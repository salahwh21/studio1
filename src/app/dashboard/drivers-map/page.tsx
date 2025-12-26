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
  Navigation
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
  const [statusFilters, setStatusFilters] = useState<string[]>(['جاري التوصيل', 'بالانتظار', 'مؤجل', 'مرتجع', 'مرفوض', 'مرد']);
  const [drivers, setDrivers] = useState<Driver[]>([]);

  // Initialize drivers from users
  useEffect(() => {
    const driverUsers = users.filter(u => u.roleId === 'driver');
    const initialDrivers = driverUsers.map((driver, index) => {
      const driverOrders = orders.filter(o => o.driver === driver.name);
      return {
        id: driver.id,
        name: driver.name,
        status: driverOrders.length > 0 ? 'نشط' : 'غير نشط',
        parcels: driverOrders.length,
        avatar: driver.avatar,
        position: [31.9539 + (index * 0.01), 35.9106 + (index * 0.01)] as LatLngTuple,
        isSimulating: false,
      };
    });
    setDrivers(initialDrivers);

    if (initialDrivers.length > 0 && !selectedDriverId) {
      setSelectedDriverId(initialDrivers[0].id);
    }

    // Simulate driver movement
    const interval = setInterval(() => {
      setDrivers(prevDrivers => prevDrivers.map(d => {
        const isSelectedAndSimulating = d.id === selectedDriverId && d.isSimulating;
        if (isSelectedAndSimulating) return d;

        return {
          ...d,
          position: [
            d.position[0] + (Math.random() - 0.5) * 0.001,
            d.position[1] + (Math.random() - 0.5) * 0.001
          ] as LatLngTuple
        };
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, [users, orders, selectedDriverId]);

  // Calculate statistics
  const stats = useMemo(() => {
    const activeDeliveries = orders.filter(o => o.status === 'جاري التوصيل').length;
    const activeDrivers = drivers.filter(d => d.status === 'نشط').length;
    const totalOrders = orders.filter(o => statusFilters.includes(o.status)).length;
    const totalCOD = orders
      .filter(o => o.status === 'جاري التوصيل')
      .reduce((sum, o) => sum + o.cod, 0);

    return {
      totalOrders,
      activeDeliveries,
      activeDrivers,
      totalCOD
    };
  }, [orders, drivers, statusFilters]);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => statusFilters.includes(o.status));
  }, [orders, statusFilters]);

  const getDriverOrders = (driverId: string) => {
    const driver = drivers.find(d => d.id === driverId);
    if (!driver) return [];
    return orders.filter(o => o.driver === driver.name);
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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <MapPin className="h-8 w-8 text-primary" />
            خريطة السائقين
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">تتبع مواقع السائقين والطلبات في الوقت الفعلي</p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline" size="icon">
            <Navigation className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
        <Card className="border-r-4 border-r-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الطلبات</p>
                <p className="text-3xl font-bold mt-1" dir="ltr">{stats.totalOrders}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full dark:bg-blue-950">
                <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-r-4 border-r-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">قيد التوصيل</p>
                <p className="text-3xl font-bold mt-1" dir="ltr">{stats.activeDeliveries}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full dark:bg-green-950">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-r-4 border-r-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">السائقين النشطين</p>
                <p className="text-3xl font-bold mt-1" dir="ltr">{stats.activeDrivers}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full dark:bg-orange-950">
                <Users className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-r-4 border-r-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي التحصيل</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(stats.totalCOD)}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full dark:bg-purple-950">
                <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Filters */}
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-xs font-medium text-muted-foreground">تصفية:</span>
            {statuses.filter(s => ['جاري التوصيل', 'بالانتظار', 'مؤجل', 'مرتجع', 'مرفوض', 'مرد'].includes(s.name)).map(status => (
              <Button
                key={status.id}
                size="sm"
                variant={statusFilters.includes(status.name) ? "default" : "outline"}
                className="h-8 text-xs gap-1.5"
                onClick={() => {
                  setStatusFilters(prev =>
                    prev.includes(status.name)
                      ? prev.filter(s => s !== status.name)
                      : [...prev, status.name]
                  );
                }}
              >
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: status.color }}></div>
                {status.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3 min-h-[600px]">
        {/* Driver List Panel */}
        <Card className="lg:col-span-1 flex flex-col relative z-10">
          <CardHeader className="py-3 flex-shrink-0">
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <Users className="h-5 w-5 text-primary" />
              قائمة السائقين
            </CardTitle>
          </CardHeader>

          <div className="p-4 border-b flex-shrink-0">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث عن سائق..."
                className="pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <Tabs defaultValue="all" dir="rtl" className="flex-1 flex flex-col">
            <TabsList className="mx-4 mt-3 flex-shrink-0">
              <TabsTrigger value="all" className="text-sm">
                الكل <Badge variant="secondary" className="mr-1 text-xs">{filteredDrivers.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="active" className="text-sm">
                نشط <Badge variant="secondary" className="mr-1 text-xs">{activeDrivers.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="inactive" className="text-sm">
                غير نشط <Badge variant="secondary" className="mr-1 text-xs">{inactiveDrivers.length}</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="flex-1 mt-2">
              <ScrollArea className="h-[500px] px-3">
                <div className="space-y-2 pb-4">
                  {filteredDrivers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">لا يوجد سائقين</p>
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
                      />
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="active" className="flex-1 mt-2">
              <ScrollArea className="h-[500px] px-3">
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
                    />
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="inactive" className="flex-1 mt-2">
              <ScrollArea className="h-[500px] px-3">
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
                    />
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Map */}
        <Card className="lg:col-span-2 flex flex-col overflow-hidden relative z-0">
          <CardHeader className="py-3 flex-shrink-0">
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <Navigation className="h-5 w-5 text-primary" />
              الخريطة التفاعلية
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 h-[600px] relative z-0">
            <DriversMapComponent
              drivers={drivers}
              orders={orders}
              initialSelectedDriverId={selectedDriverId}
              highlightedOrder={highlightedOrder}
              onSelectDriverInMap={setSelectedDriverId}
              onDriverPositionChange={handleDriverPositionChange}
              onOrderPositionSelect={handleOrderSelect}
            />
          </CardContent>
        </Card>
      </div>
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
}

function DriverCard({ driver, driverOrders, isSelected, onSelect, onOrderSelect, formatCurrency }: DriverCardProps) {
  const outForDeliveryOrders = driverOrders.filter(o => o.status === 'جاري التوصيل');
  const totalCOD = outForDeliveryOrders.reduce((sum, order) => sum + order.cod, 0);

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
                  {driver.parcels} طلبات
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
              <p className="font-bold text-base">{driverOrders.length}</p>
              <p className="text-muted-foreground text-xs">الإجمالي</p>
            </div>
            <div className="p-2 bg-background rounded text-center">
              <p className="font-bold text-base text-green-600">{outForDeliveryOrders.length}</p>
              <p className="text-muted-foreground text-xs">قيد التوصيل</p>
            </div>
            <div className="p-2 bg-background rounded text-center">
              <p className="font-bold text-base text-purple-600">{formatCurrency(totalCOD)}</p>
              <p className="text-muted-foreground text-xs">المبلغ</p>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Clock className="h-3 w-3" />
              طلبات قيد التوصيل
            </h4>
            <Badge variant="secondary" className="text-xs">{outForDeliveryOrders.length}</Badge>
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
