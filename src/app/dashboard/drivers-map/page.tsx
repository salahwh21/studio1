
'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { HelpCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import Icon from '@/components/icon';
import { useUsersStore } from '@/store/user-store';
import { useOrdersStore } from '@/store/orders-store';

const DriversMap = dynamic(() => import('@/components/drivers-map'), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-lg" />,
});

const statuses = [
  { label: 'بالانتظار', count: 2, color: 'bg-yellow-400' },
  { label: 'جاري التوصيل', count: 4, color: 'bg-blue-400' },
  { label: 'تم التوصيل', count: 3, color: 'bg-green-400' },
  { label: 'مؤجل', count: 1, color: 'bg-orange-400' },
  { label: 'مرتجع', count: 1, color: 'bg-purple-400' },
  { label: 'ملغي', count: 1, color: 'bg-red-400' },
  { label: 'تم استلام المال في الشركة', count: 2, color: 'bg-teal-400' },
];

export default function DriversMapPage() {
    const { users } = useUsersStore();
    const { orders } = useOrdersStore();
    
    const drivers = users.filter(u => u.roleId === 'driver').map((driver, index) => {
        const driverOrders = orders.filter(o => o.driver === driver.name);
        return {
            id: driver.id,
            name: driver.name,
            status: driverOrders.some(o => o.status === 'جاري التوصيل') ? 'نشط' : 'غير نشط',
            parcels: driverOrders.filter(o => o.status === 'جاري التوصيل').length,
            avatar: driver.avatar,
            position: [31.9539 + (Math.random() - 0.5) * 0.1, 35.9106 + (Math.random() - 0.5) * 0.1] as [number, number],
        };
    });

    const [selectedDriver, setSelectedDriver] = useState(drivers.length > 0 ? drivers[0] : null);
    const activeDrivers = drivers.filter(d => d.status === 'نشط');
    const inactiveDrivers = drivers.filter(d => d.status === 'غير نشط');

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-4 text-sm">
      {/* Top Bar */}
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon">
                <Icon name="ArrowLeft" className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-bold">خريطة السائقين</h2>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {statuses.map(status => (
                <div key={status.label} className="flex items-center gap-2 rounded-lg border p-2 pr-3 whitespace-nowrap">
                   <div className="flex flex-col text-right">
                        <span className="font-bold text-base">{status.count}</span>
                        <span className="text-muted-foreground text-xs">{status.label}</span>
                   </div>
                  <Separator orientation="vertical" className={`h-8 w-1 rounded-full ${status.color}`} />
                </div>
              ))}
            </div>
            <Button variant="secondary" className="bg-orange-100 text-orange-600 border-orange-300 hover:bg-orange-200">
              <Icon name="Bell" className="h-4 w-4 ml-2" />
              <span>(0) طلب تفعيل التتبع</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-4">
        {/* Left Panel: Drivers List */}
        <Card className="col-span-1 flex flex-col">
          <div className="p-4">
            <h3 className="text-base font-semibold">قائمة السائقين</h3>
             <div className="relative mt-2">
                <Icon name="Search" className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="بحث..." className="pr-10" />
            </div>
          </div>
          <Tabs defaultValue="all" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3 px-4">
              <TabsTrigger value="all">الكل ({drivers.length})</TabsTrigger>
              <TabsTrigger value="active">نشط ({activeDrivers.length})</TabsTrigger>
              <TabsTrigger value="inactive">غير نشط ({inactiveDrivers.length})</TabsTrigger>
            </TabsList>
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-3">
                 {[...activeDrivers, ...inactiveDrivers].map(driver => (
                    <Card
                      key={driver.id}
                      className={`cursor-pointer transition-all ${selectedDriver?.id === driver.id ? 'border-primary shadow-lg' : 'hover:bg-muted/50'}`}
                      onClick={() => setSelectedDriver(driver)}
                    >
                      <CardContent className="p-3 flex items-center gap-3">
                         <div className={`w-1.5 h-16 rounded-full ${selectedDriver?.id === driver.id ? 'bg-primary' : 'bg-transparent'}`}></div>
                         <div className="flex-1 flex items-center gap-3">
                            <Avatar className="h-12 w-12 border">
                                <AvatarImage src={driver.avatar} alt={driver.name} />
                                <AvatarFallback><HelpCircle className="text-muted-foreground"/></AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <h4 className="font-semibold">{driver.name}</h4>
                                <p className="text-xs text-muted-foreground">{driver.parcels} طرود</p>
                            </div>
                         </div>
                        <Badge variant={driver.status === 'نشط' ? 'default' : 'secondary'} className={driver.status === 'نشط' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}>
                          {driver.status}
                        </Badge>
                      </CardContent>
                    </Card>
                 ))}
              </div>
            </ScrollArea>
          </Tabs>
        </Card>

        {/* Right Panel: Map */}
        <Card className="col-span-1 lg:col-span-3">
          <CardContent className="p-2 h-full">
            <DriversMap drivers={drivers} selectedDriver={selectedDriver} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
