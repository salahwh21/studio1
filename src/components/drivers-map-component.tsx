
'use client';

import React, { useEffect, useRef, useState } from 'react';
import L, { type LatLngTuple } from 'leaflet';

// Import marker cluster CSS
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

import type { Order } from '@/store/orders-store';
import { useStatusesStore } from '@/store/statuses-store';
import { optimizeRouteAction } from '@/app/actions/optimize-route';
import { useToast } from '@/hooks/use-toast';

// Fix for default icon issue with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});


// Helper to create a custom icon for drivers
const createDriverIcon = (driver: any, isSelected: boolean) => {
    return L.divIcon({
        html: `
            <div style="position: relative; width: 48px; height: 48px; transition: transform 0.3s ease-out;">
                <img src="${driver.avatar}" style="width: 40px; height: 40px; border-radius: 50%; border: ${isSelected ? '3px solid #F96941' : '3px solid #ccc'}; object-fit: cover; position: absolute; top: 0; left: 0; background: #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">
                <div style="position: absolute; bottom: 0; left: 16px; width: 0; height: 0; border-left: 8px solid transparent; border-right: 8px solid transparent; border-top: 12px solid ${isSelected ? '#F96941' : '#ccc'};"></div>
            </div>
        `,
        className: '',
        iconSize: [48, 48],
        iconAnchor: [24, 48]
    });
};

const createOrderIcon = (color: string, isHighlighted: boolean) => {
    return L.divIcon({
        html: `<div style="background-color: ${color}; width: ${isHighlighted ? '16px' : '12px'}; height: ${isHighlighted ? '16px' : '12px'}; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3); transform: ${isHighlighted ? 'scale(1.5)' : 'scale(1)'}; transition: all 0.2s ease-in-out;"></div>`,
        className: 'bg-transparent border-0',
        iconSize: [isHighlighted ? 24 : 16, isHighlighted ? 24 : 16],
        iconAnchor: [isHighlighted ? 12 : 8, isHighlighted ? 12 : 8]
    });
};

interface DriversMapComponentProps {
    drivers: any[];
    orders: Order[];
    initialSelectedDriverId: string | null;
    highlightedOrder: Order | null;
    onSelectDriverInMap: (id: string | null) => void;
    onDriverPositionChange: (driverId: string, newPosition: LatLngTuple) => void;
    onOrderPositionSelect: (order: Order | null) => void;
}

export default function DriversMapComponent({ drivers, orders, initialSelectedDriverId, highlightedOrder, onSelectDriverInMap, onDriverPositionChange, onOrderPositionSelect }: DriversMapComponentProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const driverMarkersRef = useRef<Record<string, L.Marker>>({});
    const routingControlRef = useRef<L.Routing.Control | null>(null);
    const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const orderClusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
    const { toast } = useToast();
    const { statuses } = useStatusesStore();
    
    const [selectedDriverId, setSelectedDriverId] = useState(initialSelectedDriverId);
    
    const getStatusColor = (statusName: string) => {
        return statuses.find(s => s.name === statusName)?.color || '#808080';
    }

    // Effect to initialize the map
    useEffect(() => {
        if (mapContainerRef.current && !mapRef.current) {
            const map = L.map(mapContainerRef.current, {
                center: [31.9539, 35.9106], // Amman, Jordan
                zoom: 11,
                scrollWheelZoom: true,
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(map);
            
            mapRef.current = map;
            
            Promise.all([
                import('leaflet.markercluster'),
                import('leaflet-routing-machine')
            ]).then(() => {
                orderClusterGroupRef.current = L.markerClusterGroup();
                map.addLayer(orderClusterGroupRef.current);
                
                routingControlRef.current = L.Routing.control({
                    waypoints: [],
                    routeWhileDragging: false,
                    lineOptions: {
                        styles: [{ color: '#F96941', opacity: 0.8, weight: 6 }],
                    },
                    show: false, // This is the fix to hide the white container
                    addWaypoints: false,
                    createMarker: () => null,
                }).addTo(map);

                // Trigger a re-render or data fetch now that libs are loaded
                fetchData(); 
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    const fetchData = () => {
         // This function can be used to re-trigger effects that depend on the map objects
         // For now, we can just re-set a state to trigger updates.
    };

    useEffect(() => {
        setSelectedDriverId(initialSelectedDriverId);
    }, [initialSelectedDriverId]);

    // Effect to update driver markers
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        const currentMarkerIds = Object.keys(driverMarkersRef.current);
        const driverIds = drivers.map(d => d.id);
        
        currentMarkerIds.forEach(id => {
            if (!driverIds.includes(id)) {
                if (driverMarkersRef.current[id]) {
                    driverMarkersRef.current[id].remove();
                    delete driverMarkersRef.current[id];
                }
            }
        });
        
        drivers.forEach(driver => {
            const isSelected = driver.id === selectedDriverId;
            const icon = createDriverIcon(driver, isSelected);

            if (driverMarkersRef.current[driver.id]) {
                driverMarkersRef.current[driver.id].setLatLng(driver.position).setIcon(icon);
            } else {
                const marker = L.marker(driver.position, { icon, zIndexOffset: isSelected ? 2000 : 0 })
                    .addTo(map)
                    .bindTooltip(driver.name, { direction: 'top', offset: L.point(0, -48) })
                    .on('click', () => onSelectDriverInMap(driver.id));
                driverMarkersRef.current[driver.id] = marker;
            }
        });

    }, [drivers, selectedDriverId, onSelectDriverInMap]);


     // Effect to update order markers
    useEffect(() => {
        const clusterGroup = orderClusterGroupRef.current;
        if (!clusterGroup) return;
        
        clusterGroup.clearLayers();

        orders.forEach(order => {
            if (!order.lat || !order.lng) return;

            const isHighlighted = highlightedOrder?.id === order.id;
            const icon = createOrderIcon(getStatusColor(order.status), isHighlighted);

            const marker = L.marker([order.lat, order.lng], { icon, title: order.id, zIndexOffset: isHighlighted ? 1000 : 0 })
                .bindTooltip(`${order.recipient} - ${order.id}`)
                .on('click', () => onOrderPositionSelect(order));

            clusterGroup.addLayer(marker);
        });
        
        if (highlightedOrder?.lat && highlightedOrder?.lng && mapRef.current) {
            mapRef.current.flyTo([highlightedOrder.lat, highlightedOrder.lng], 15);
             const markerToAnimate = (clusterGroup.getLayers() as L.Marker[]).find(l => l.options.title === highlightedOrder.id);
             if (markerToAnimate && (markerToAnimate as any)._icon) {
                 (markerToAnimate as any)._icon.style.transition = 'transform 0.3s ease-in-out';
                 (markerToAnimate as any)._icon.style.transform = 'scale(1.8)';
                 setTimeout(() => {
                     if((markerToAnimate as any)._icon) {
                        (markerToAnimate as any)._icon.style.transform = 'scale(1.5)';
                     }
                 }, 300);
             }
        }

    }, [orders, highlightedOrder, statuses, onOrderPositionSelect]);

    // Effect to handle selected driver logic (panning, routing, simulation)
    useEffect(() => {
        const map = mapRef.current;
        const routingControl = routingControlRef.current;

        if (!map || !routingControl) return;
        
        if (simulationIntervalRef.current) {
            clearInterval(simulationIntervalRef.current);
            simulationIntervalRef.current = null;
        }

        const selectedDriver = drivers.find(d => d.id === selectedDriverId);
        
        if (!selectedDriver) {
            routingControl.setWaypoints([]);
            return;
        }
        
        map.flyTo(selectedDriver.position, 13, { animate: true, duration: 1 });
        
        const driverOrders = orders.filter(o => o.driver === selectedDriver.name && o.status === 'جاري التوصيل' && o.lat && o.lng);

        if (driverOrders.length > 0) {
            const addressesToOptimize = driverOrders.map(o => ({
                value: o.address,
                lat: o.lat,
                lng: o.lng
            }));
            
            toast({ title: 'جاري تحسين المسار للسائق المحدد...' });
            
            optimizeRouteAction({
                driverId: selectedDriver.id,
                startLocation: 'Current Location', 
                addresses: addressesToOptimize
            }).then(result => {
                if (result.success && result.data?.optimizedRoute.length) {
                    const optimizedAddresses = result.data.optimizedRoute;
                    const originalAddresses = result.data.originalAddresses;
                    const addressMap = new Map(originalAddresses.map(a => [a.value, {lat: a.lat, lng: a.lng}]));

                     const waypoints: L.LatLngTuple[] = [
                        selectedDriver.position,
                        ...optimizedAddresses.map(addr => {
                            const location = addressMap.get(addr);
                            return location && location.lat && location.lng ? [location.lat, location.lng] as LatLngTuple : null;
                        }).filter((p): p is LatLngTuple => p !== null)
                    ];
                    
                    if (waypoints.length > 1) {
                         routingControl.setWaypoints(waypoints.map(wp => L.latLng(wp[0], wp[1])));

                         const routeFoundHandler = (e: any) => {
                             const route = e.routes[0];
                             if(!route) return;
                             const coordinates = route.coordinates;
                             let index = 0;
                             
                             if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
                             
                             simulationIntervalRef.current = setInterval(() => {
                                 if (index < coordinates.length && selectedDriver.isSimulating) {
                                     onDriverPositionChange(selectedDriver.id, [coordinates[index].lat, coordinates[index].lng]);
                                     index += 5; 
                                 } else {
                                     if(simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
                                 }
                             }, 200);
                         };

                        routingControl.off('routesfound').on('routesfound', routeFoundHandler);
                        
                        toast({ title: 'تم تحسين المسار وجاري محاكاة الحركة!' });
                    }
                } else {
                    routingControl.setWaypoints([]);
                    toast({ variant: 'destructive', title: 'فشل تحسين المسار', description: result.error || 'لم يتمكن الذكاء الاصطناعي من إنشاء مسار.' });
                }
            });
        } else {
            routingControl.setWaypoints([]);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDriverId, orders]);

    return (
        <div className="relative h-full w-full">
            <div
                ref={mapContainerRef}
                className="h-full w-full rounded-md"
            />
        </div>
    );
}
