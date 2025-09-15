
'use client';

import { useState, useMemo, useEffect } from 'react';
import { HelpCircle, Phone, Package, Search as SearchIcon, ArrowLeft, ChevronDown } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useStatusesStore } from '@/store/statuses-store';


const DriversMapComponent = dynamic(() => import('@/components/drivers-map-component'), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-full" />,
});

const DriverDetailsContent = ({ driver, driverOrders, onOrderSelect }: { driver: any; driverOrders: Order[], onOrderSelect: (order: Order) => void; }) => {
    const outForDeliveryOrders = driverOrders.filter(o => o.status === 'جاري التوصيل');
    const totalCOD = outForDeliveryOrders.reduce((sum, order) => sum + order.cod, 0);

    return (
        <div className="flex flex-col gap-4 p-4 pt-0">
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 bg-muted rounded-md"><p className="font-bold text-sm">{driverOrders.length}</p><p className="text-muted-foreground">الإجمالي</p></div>
                <div className="p-2 bg-muted rounded-md"><p className="font-bold text-sm">{outForDeliveryOrders.length}</p><p className="text-muted-foreground">قيد التوصيل</p></div>
                <div className="p-2 bg-muted rounded-md"><p className="font-bold text-sm">{totalCOD.toFixed(2)}</p><p className="text-muted-foreground">التحصيل</p></div>
            </div>
            <h4 className="font-semibold text-xs">طلبات قيد التوصيل ({outForDeliveryOrders.length})</h4>
            <ScrollArea className="h-48 border rounded-md">
                <div className="p-2 space-y-2">
                     {outForDeliveryOrders.map(order => (
                        <div key={order.id} className="p-2 rounded-md bg-background flex items-center justify-between cursor-pointer hover:bg-muted" onClick={() => onOrderSelect(order)}>
                            <div className="space-y-1">
                                <p className="font-medium text-sm flex items-center gap-2"><Package className="h-4 w-4 text-muted-foreground"/> {order.recipient}</p>
                                <p className="text-xs text-muted-foreground">{order.address}</p>
                            </div>
                            <div className="flex flex-col items-end">
                                <p className="font-bold text-sm text-primary">{order.cod.toFixed(2)} د.أ</p>
                                <Button size="sm" variant="ghost" className="h-auto p-1 text-xs"><Phone className="h-3 w-3 ml-1"/>اتصال</Button>
                            </div>
                        </div>
                     ))}
                     {outForDeliveryOrders.length === 0 && <p className="text-center text-muted-foreground p-4 text-xs">لا توجد طلبات قيد التوصيل لهذا السائق.</p>}
                </div>
            </ScrollArea>
        </div>
    );
};


const DriverListPanel = ({ drivers, driverOrders, selectedDriverId, onSelectDriver, searchQuery, onSearchChange, onOrderSelect }: {
    drivers: any[];
    driverOrders: (driverId: string) => Order[];
    selectedDriverId: string | null;
    onSelectDriver: (id: string | null) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onOrderSelect: (order: Order) => void;
}) => {
    const activeDrivers = useMemo(() => drivers.filter(d => d.status === 'نشط' && d.name.toLowerCase().includes(searchQuery.toLowerCase())), [drivers, searchQuery]);
    const inactiveDrivers = useMemo(() => drivers.filter(d => d.status === 'غير نشط' && d.name.toLowerCase().includes(searchQuery.toLowerCase())), [drivers, searchQuery]);
    const allFilteredDrivers = [...activeDrivers, ...inactiveDrivers];
    
    return (
        <Card className="col-span-1 flex flex-col h-full">
            <div className="p-4">
                <h3 className="text-base font-semibold">قائمة السائقين</h3>
                <div className="relative mt-2">
                    <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="بحث عن سائق..." className="pr-10" value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} />
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
                             <Collapsible key={driver.id} open={selectedDriverId === driver.id} onOpenChange={(isOpen) => onSelectDriver(isOpen ? driver.id : null)}>
                                <CollapsibleTrigger asChild>
                                    <Card className={`cursor-pointer transition-all hover:bg-muted/50 ${selectedDriverId === driver.id ? 'border-primary shadow-lg' : ''}`}>
                                        <CardContent className="p-3 flex items-center gap-3">
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
                                             <div className="flex items-center gap-2">
                                                <Badge variant={driver.status === 'نشط' ? 'default' : 'secondary'} className={driver.status === 'نشط' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}>
                                                    {driver.status}
                                                </Badge>
                                                 <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", selectedDriverId === driver.id && "rotate-180")} />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                     <DriverDetailsContent driver={driver} driverOrders={driverOrders(driver.id)} onOrderSelect={onOrderSelect} />
                                </CollapsibleContent>
                            </Collapsible>
                        ))}
                    </div>
                </ScrollArea>
            </Tabs>
        </Card>
    );
};


export default function DriversMapPage() {
    const { users } = useUsersStore();
    const { orders } = useOrdersStore();
    const { statuses } = useStatusesStore();
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
    const [highlightedOrder, setHighlightedOrder] = useState<Order | null>(null);
    const [statusFilters, setStatusFilters] = useState<string[]>(['جاري التوصيل', 'مؤجل', 'بالانتظار']);

    const [drivers, setDrivers] = useState<any[]>([]);
    
    const [trackingRequests, setTrackingRequests] = useState([
        { id: 'req1', driverName: 'ابو العبد', time: '10:45ص' },
        { id: 'req2', driverName: 'سامر الطباخي', time: '11:02ص' },
    ]);

    const handleToggleStatusFilter = (statusName: string) => {
        setStatusFilters(prev => 
            prev.includes(statusName) 
            ? prev.filter(s => s !== statusName)
            : [...prev, statusName]
        );
    }
    
    const handleRequestAction = (requestId: string, action: 'activate' | 'reject') => {
        setTrackingRequests(prev => prev.filter(req => req.id !== requestId));
        toast({
            title: `تم ${action === 'activate' ? 'تفعيل' : 'رفض'} الطلب`,
            description: `تم تحديث حالة طلب تفعيل التتبع.`,
        });
    };

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
        if (initialDrivers.length > 0 && !selectedDriverId) {
            setSelectedDriverId(initialDrivers[0].id);
        }

        const interval = setInterval(() => {
            setDrivers(prevDrivers => prevDrivers.map(d => {
                const isSelectedAndSimulating = d.id === selectedDriverId && d.isSimulating;
                if(isSelectedAndSimulating) return d;

                return {
                    ...d,
                    position: [d.position[0] + (Math.random() - 0.5) * 0.0005, d.position[1] + (Math.random() - 0.5) * 0.0005] as LatLngTuple
                }
            }));
        }, 5000);
        return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [users, orders]);
    
    const filteredOrders = useMemo(() => {
        return orders.filter(order => statusFilters.includes(order.status) && order.lat && order.lng);
    }, [orders, statusFilters]);

    const getDriverOrders = (driverId: string): Order[] => {
        const driver = drivers.find(d => d.id === driverId);
        return driver ? orders.filter(o => o.driver === driver.name) : [];
    }

    const handleSelectDriver = (driverId: string | null) => {
        setSelectedDriverId(driverId);
        setHighlightedOrder(null);
    };

    return (
        <>
            <Dialog>
                <div className="flex h-[calc(100vh-8rem)] flex-col gap-4 text-sm">
                        <Card>
                             <CardContent className="p-3">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="icon" asChild>
                                            <Link href="/dashboard"><ArrowLeft className="h-4 w-4" /></Link>
                                        </Button>
                                        <h2 className="text-lg font-bold">خريطة السائقين</h2>
                                    </div>
                                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                                        {statuses.filter(s => ['جاري التوصيل', 'بالانتظار', 'مؤجل', 'راجع', 'لا رد'].includes(s.name)).map(status => (
                                            <Button 
                                                key={status.id}
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleToggleStatusFilter(status.name)}
                                                className={cn(
                                                    "flex items-center gap-2 whitespace-nowrap",
                                                    statusFilters.includes(status.name) ? 'border-primary ring-2 ring-primary/50' : 'opacity-60'
                                                )}
                                                style={{ '--status-color': status.color } as React.CSSProperties}
                                            >
                                                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: status.color }}></div>
                                                {status.name}
                                            </Button>
                                        ))}
                                    </div>
                                    <DialogTrigger asChild>
                                        <Button variant="secondary" className="bg-orange-100 text-orange-600 border-orange-300 hover:bg-orange-200">
                                            <Icon name="Bell" className="h-4 w-4 ml-2" />
                                            <span>({trackingRequests.length}) طلب تفعيل التتبع</span>
                                        </Button>
                                    </DialogTrigger>
                                </div>
                            </CardContent>
                        </Card>
                    <div className="flex flex-col lg:flex-row flex-1 gap-4 min-h-0">
                         <div className="w-full lg:w-1/3 lg:max-w-md h-[50vh] lg:h-full">
                            <DriverListPanel
                                drivers={drivers}
                                driverOrders={getDriverOrders}
                                selectedDriverId={selectedDriverId}
                                onSelectDriver={handleSelectDriver}
                                searchQuery={searchQuery}
                                onSearchChange={setSearchQuery}
                                onOrderSelect={setHighlightedOrder}
                            />
                        </div>
                        
                        <div className="flex-1 h-[50vh] lg:h-full z-10">
                            <Card className="h-full">
                                <CardContent className="p-2 h-full">
                                <DriversMapComponent
                                        drivers={drivers}
                                        orders={filteredOrders}
                                        initialSelectedDriverId={selectedDriverId}
                                        onSelectDriverInMap={handleSelectDriver}
                                        onOrderPositionSelect={setHighlightedOrder}
                                        onDriverPositionChange={(driverId, newPosition) => {
                                            setDrivers(prev => prev.map(d => d.id === driverId ? {...d, position: newPosition, isSimulating: true } : d))
                                        }}
                                        highlightedOrder={highlightedOrder}
                                />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
                 <DialogContent>
                    <DialogHeader>
                        <DialogTitle>طلبات تفعيل التتبع</DialogTitle>
                        <DialogDescription>
                            تظهر هنا طلبات السائقين لتفعيل التتبع لمواقعهم.
                        </DialogDescription>
                    </DialogHeader>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>السائق</TableHead>
                                <TableHead>وقت الطلب</TableHead>
                                <TableHead className="text-left">إجراء</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {trackingRequests.length > 0 ? trackingRequests.map(req => (
                                <TableRow key={req.id}>
                                    <TableCell className="font-medium">{req.driverName}</TableCell>
                                    <TableCell>{req.time}</TableCell>
                                    <TableCell className="text-left">
                                        <div className="flex gap-2 justify-end">
                                            <Button size="sm" onClick={() => handleRequestAction(req.id, 'activate')}>تفعيل</Button>
                                            <Button size="sm" variant="ghost" onClick={() => handleRequestAction(req.id, 'reject')}>رفض</Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center text-muted-foreground">لا توجد طلبات حالية.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </DialogContent>
            </Dialog>
        </>
    );
}
