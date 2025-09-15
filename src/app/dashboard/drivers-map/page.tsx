'use client';

import { useState, useMemo, useEffect } from 'react';
import { HelpCircle, Phone, Package, Search as SearchIcon, X as XIcon, ArrowLeft } from 'lucide-react';
import dynamic from 'next/dynamic';
import type { LatLngTuple } from 'leaflet';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import Icon from '@/components/icon';
import { useUsersStore } from '@/store/user-store';
import { useOrdersStore, type Order } from '@/store/orders-store';
import Link from 'next/link';

const DriversMapComponent = dynamic(() => import('@/components/drivers-map-component'), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-full" />,
});

const DriverListPanel = ({ drivers, selectedDriverId, onSelectDriver, searchQuery, onSearchChange }: {
    drivers: any[];
    selectedDriverId: string | null;
    onSelectDriver: (id: string | null) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
}) => {
    const activeDrivers = useMemo(() => drivers.filter(d => d.status === 'نشط' && d.name.toLowerCase().includes(searchQuery.toLowerCase())), [drivers, searchQuery]);
    const inactiveDrivers = useMemo(() => drivers.filter(d => d.status === 'غير نشط' && d.name.toLowerCase().includes(searchQuery.toLowerCase())), [drivers, searchQuery]);
    const allFilteredDrivers = [...activeDrivers, ...inactiveDrivers];
    
    return (
        <Card className="col-span-1 lg:col-span-3 xl:col-span-1 flex flex-col">
            <div className="p-4">
                <h3 className="text-base font-semibold">قائمة السائقين</h3>
                <div className="relative mt-2">
                    <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="بحث..." className="pr-10" value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} />
                </div>
            </div>
            <Tabs defaultValue="all" className="flex-1 flex flex-col min-h-0">
                <TabsList className="grid w-full grid-cols-3 px-4">
                    <TabsTrigger value="all">الكل ({allFilteredDrivers.length})</TabsTrigger>
                    <TabsTrigger value="active">نشط ({activeDrivers.length})</TabsTrigger>
                    <TabsTrigger value="inactive">غير نشط ({inactiveDrivers.length})</TabsTrigger>
                </TabsList>
                <ScrollArea className="flex-1">
                    <div className="p-4 space-y-3">
                        {allFilteredDrivers.map(driver => (
                            <Card
                                key={driver.id}
                                className={`cursor-pointer transition-all ${selectedDriverId === driver.id ? 'border-primary shadow-lg' : 'hover:bg-muted/50'}`}
                                onClick={() => onSelectDriver(driver.id)}
                            >
                                <CardContent className="p-3 flex items-center gap-3">
                                    <div className={`w-1.5 h-16 rounded-full ${selectedDriverId === driver.id ? 'bg-primary' : 'bg-transparent'}`}></div>
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
    );
};

const DriverDetailsPanel = ({ driver, driverOrders, onClose }: {
    driver: any | null;
    driverOrders: Order[];
    onClose: () => void;
}) => {
    if (!driver) return null;

    const outForDeliveryOrders = driverOrders.filter(o => o.status === 'جاري التوصيل');
    const totalCOD = outForDeliveryOrders.reduce((sum, order) => sum + order.cod, 0);

    return (
        <Card className="col-span-1 lg:col-span-5 xl:col-span-2 flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between p-4">
                <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14 border-2 border-primary"><AvatarImage src={driver.avatar} /><AvatarFallback>{driver.name.charAt(0)}</AvatarFallback></Avatar>
                    <div>
                        <CardTitle>{driver.name}</CardTitle>
                        <CardDescription>ملخص المهام والأداء</CardDescription>
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}><XIcon className="h-4 w-4"/></Button>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4 p-4 min-h-0">
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-muted rounded-lg"><p className="font-bold text-lg">{driverOrders.length}</p><p className="text-xs text-muted-foreground">إجمالي الطلبات</p></div>
                    <div className="p-3 bg-muted rounded-lg"><p className="font-bold text-lg">{outForDeliveryOrders.length}</p><p className="text-xs text-muted-foreground">قيد التوصيل</p></div>
                    <div className="p-3 bg-muted rounded-lg"><p className="font-bold text-lg">{totalCOD.toFixed(2)}</p><p className="text-xs text-muted-foreground">مبلغ التحصيل</p></div>
                </div>
                <h4 className="font-semibold">قائمة الطلبات ({outForDeliveryOrders.length})</h4>
                <ScrollArea className="flex-1 border rounded-md">
                    <div className="p-2 space-y-2">
                         {outForDeliveryOrders.map(order => (
                            <div key={order.id} className="p-2 rounded-md bg-background flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="font-medium text-sm flex items-center gap-2"><Package className="h-4 w-4"/> {order.recipient}</p>
                                    <p className="text-xs text-muted-foreground">{order.address}</p>
                                </div>
                                <div className="flex flex-col items-end">
                                    <p className="font-bold text-sm text-primary">{order.cod.toFixed(2)} د.أ</p>
                                    <Button size="sm" variant="ghost" className="h-auto p-1 text-xs"><Phone className="h-3 w-3 ml-1"/>اتصال</Button>
                                </div>
                            </div>
                         ))}
                         {outForDeliveryOrders.length === 0 && <p className="text-center text-muted-foreground p-4">لا توجد طلبات قيد التوصيل لهذا السائق.</p>}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
};

export default function DriversMapPage() {
    const { users } = useUsersStore();
    const { orders } = useOrdersStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);

    const [drivers, setDrivers] = useState<any[]>([]);

    useEffect(() => {
        const initialDrivers = users.filter(u => u.roleId === 'driver').map((driver) => {
            const driverOrders = orders.filter(o => o.driver === driver.name);
            return {
                id: driver.id,
                name: driver.name,
                status: driverOrders.some(o => o.status === 'جاري التوصيل') ? 'نشط' : 'غير نشط',
                parcels: driverOrders.filter(o => o.status === 'جاري التوصيل').length,
                avatar: driver.avatar || `https://i.pravatar.cc/150?u=${driver.id}`,
                position: [31.9539 + (Math.random() - 0.5) * 0.1, 35.9106 + (Math.random() - 0.5) * 0.1] as LatLngTuple,
            };
        });
        setDrivers(initialDrivers);
        if (initialDrivers.length > 0) {
            setSelectedDriverId(initialDrivers[0].id);
        }

        const interval = setInterval(() => {
            setDrivers(prevDrivers => prevDrivers.map(d => ({
                ...d,
                position: [d.position[0] + (Math.random() - 0.5) * 0.0005, d.position[1] + (Math.random() - 0.5) * 0.0005] as LatLngTuple
            })));
        }, 5000);
        return () => clearInterval(interval);
    }, [users, orders]);

    const orderStatusCounts = useMemo(() => {
        return orders.reduce((acc, order) => {
            acc[order.status] = (acc[order.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
    }, [orders]);

    const statusDisplay = [
        { label: 'بالانتظار', color: 'bg-yellow-400', key: 'بالانتظار' },
        { label: 'جاري التوصيل', color: 'bg-blue-400', key: 'جاري التوصيل' },
        { label: 'تم التوصيل', color: 'bg-green-400', key: 'تم التوصيل' },
        { label: 'مؤجل', color: 'bg-orange-400', key: 'مؤجل' },
        { label: 'مرتجع', color: 'bg-purple-400', key: 'راجع' },
    ];
    
    const selectedDriver = useMemo(() => drivers.find(d => d.id === selectedDriverId), [drivers, selectedDriverId]);
    const driverOrders = useMemo(() => selectedDriver ? orders.filter(o => o.driver === selectedDriver.name) : [], [orders, selectedDriver]);

    return (
        <div className="flex h-[calc(100vh-8rem)] flex-col gap-4 text-sm">
            <Card>
                <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" asChild>
                                <Link href="/dashboard"><ArrowLeft className="h-4 w-4" /></Link>
                            </Button>
                            <h2 className="text-lg font-bold">خريطة السائقين</h2>
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto pb-2">
                           {statusDisplay.map(status => (
                                <div key={status.label} className="flex items-center gap-2 rounded-lg border p-2 pr-3 whitespace-nowrap">
                                    <div className="flex flex-col text-right"><span className="font-bold text-base">{orderStatusCounts[status.key] || 0}</span><span className="text-muted-foreground text-xs">{status.label}</span></div>
                                    <Separator orientation="vertical" className={`h-8 w-1 rounded-full ${status.color}`} />
                                </div>
                            ))}
                        </div>
                        <Button variant="secondary" className="bg-orange-100 text-orange-600 border-orange-300 hover:bg-orange-200"><Icon name="Bell" className="h-4 w-4 ml-2" /><span>(0) طلب تفعيل التتبع</span></Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-8 xl:grid-cols-4 min-h-0">
                <DriverListPanel
                    drivers={drivers}
                    selectedDriverId={selectedDriverId}
                    onSelectDriver={setSelectedDriverId}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                />
                
                {selectedDriverId && (
                    <DriverDetailsPanel 
                        driver={selectedDriver}
                        driverOrders={driverOrders}
                        onClose={() => setSelectedDriverId(null)}
                    />
                )}

                <Card className="col-span-1 lg:col-span-5 xl:col-span-3">
                    <CardContent className="p-2 h-full">
                       <DriversMapComponent
                           drivers={drivers}
                           orders={orders}
                           initialSelectedDriverId={selectedDriverId}
                           onSelectDriverInMap={setSelectedDriverId}
                       />
                    </CardContent>
                </Card>
            </div>
        </div>
    );

    
}