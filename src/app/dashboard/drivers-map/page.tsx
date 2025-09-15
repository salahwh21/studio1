
'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { HelpCircle } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/icon';
import { useUsersStore } from '@/store/user-store';
import { useOrdersStore } from '@/store/orders-store';

import 'leaflet/dist/leaflet.css';

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

    const mapRef = useRef<import('leaflet').Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const markersRef = useRef<import('leaflet').Marker[]>([]);

    const drivers = useMemo(() => {
        return users.filter(u => u.roleId === 'driver').map(driver => {
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
    }, [users, orders]);

    const [selectedDriverId, setSelectedDriverId] = useState<string | null>(drivers.length > 0 ? drivers[0].id : null);
    const activeDrivers = useMemo(() => drivers.filter(d => d.status === 'نشط'), [drivers]);
    const inactiveDrivers = useMemo(() => drivers.filter(d => d.status === 'غير نشط'), [drivers]);
    const selectedDriver = useMemo(() => drivers.find(d => d.id === selectedDriverId), [drivers, selectedDriverId]);

    useEffect(() => {
        if (!mapContainerRef.current) return;

        import('leaflet').then(L => {
             // Create a custom SVG icon, this avoids all image path issues.
            const customIcon = L.divIcon({
                html: `
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="#3B82F6">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                        <circle cx="12" cy="9.5" r="2.5" fill="white" />
                    </svg>`,
                className: '', // important to clear default styling
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -32]
            });
            
            // Initialize map only once
            if (!mapRef.current) {
                mapRef.current = L.map(mapContainerRef.current!, {
                    center: [31.9539, 35.9106],
                    zoom: 11,
                    scrollWheelZoom: true,
                });

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                }).addTo(mapRef.current);
            }

            const map = mapRef.current;

            // Clear existing markers
            markersRef.current.forEach(marker => marker.remove());
            markersRef.current = [];

            // Add new markers for all drivers
            drivers.forEach(driver => {
                const marker = L.marker(driver.position, { icon: customIcon }).addTo(map);
                marker.bindPopup(`<b>${driver.name}</b>`);
                markersRef.current.push(marker);
            });

            // Fly to selected driver
            if (selectedDriver) {
                map.flyTo(selectedDriver.position, 14, {
                    animate: true,
                    duration: 1,
                });
            }
        });
        
        // Cleanup function to destroy the map instance on component unmount
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [drivers, selectedDriver]);


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
                                        className={`cursor-pointer transition-all ${selectedDriverId === driver.id ? 'border-primary shadow-lg' : 'hover:bg-muted/50'}`}
                                        onClick={() => setSelectedDriverId(driver.id)}
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

                {/* Right Panel: Map */}
                <Card className="col-span-1 lg:col-span-3">
                    <CardContent className="p-2 h-full">
                       <div ref={mapContainerRef} id="map" className="w-full h-full rounded-md" />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
