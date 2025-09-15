'use client';

import React, { useEffect, useRef, useState, useTransition } from 'react';
import L, { type LatLngTuple } from 'leaflet';
import 'leaflet-routing-machine';

import type { Order } from '@/store/orders-store';
import { useStatusesStore } from '@/store/statuses-store';
import { optimizeRouteAction } from '@/app/actions/optimize-route';
import { useToast } from '@/hooks/use-toast';

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
        html: `<div style="background-color: ${color}; width: ${isHighlighted ? '16px' : '12px'}; height: ${isHighlighted ? '16px' : '12px'}; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3); transform: ${isHighlighted ? 'scale(1.2)' : 'scale(1)'}; transition: all 0.2s ease-in-out;"></div>`,
        className: 'bg-transparent border-0',
        iconSize: [isHighlighted ? 20 : 16, isHighlighted ? 20 : 16],
        iconAnchor: [isHighlighted ? 10 : 8, isHighlighted ? 10 : 8]
    });
};


interface DriversMapComponentProps {
    drivers: any[];
    orders: Order[];
    initialSelectedDriverId: string | null;
    highlightedOrder: Order | null;
    onSelectDriverInMap: (id: string | null) => void;
    onDriverPositionChange: (driverId: string, newPosition: LatLngTuple) => void;
}

export default function DriversMapComponent({ drivers, orders, initialSelectedDriverId, highlightedOrder, onSelectDriverInMap, onDriverPositionChange }: DriversMapComponentProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const driverMarkersRef = useRef<Record<string, L.Marker>>({});
    const orderMarkersRef = useRef<Record<string, L.Marker>>({});
    const routingControlRef = useRef<L.Routing.Control | null>(null);
    const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const { toast } = useToast();
    const { statuses } = useStatusesStore();
    const [isPending, startTransition] = useTransition();

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

            routingControlRef.current = L.Routing.control({
                waypoints: [],
                lineOptions: {
                    styles: [{ color: '#F96941', opacity: 0.8, weight: 6 }],
                    extendToWaypoints: true,
                    missingRouteTolerance: 100,
                },
                addWaypoints: false,
                createMarker: () => null,
                show: true,
            }).addTo(map);
            
            mapRef.current = map;
        }
    }, []);

    // Effect to update the selected driver when the prop changes
    useEffect(() => {
        setSelectedDriverId(initialSelectedDriverId);
    }, [initialSelectedDriverId]);
    
    // Effect to handle highlighted order
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !highlightedOrder) return;

        Object.values(orderMarkersRef.current).forEach(marker => {
            const isHighlighted = marker.options.title === highlightedOrder.id;
            const order = orders.find(o => o.id === marker.options.title);
            marker.setIcon(createOrderIcon(getStatusColor(order?.status || ''), isHighlighted));
            if (isHighlighted) {
                marker.setZIndexOffset(1000);
            } else {
                marker.setZIndexOffset(0);
            }
        });

        if (highlightedOrder.lat && highlightedOrder.lng) {
            map.flyTo([highlightedOrder.lat, highlightedOrder.lng], 15);
        }

    }, [highlightedOrder, orders, statuses])

    // Effect to update driver markers
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        const currentMarkerIds = Object.keys(driverMarkersRef.current);
        const driverIds = drivers.map(d => d.id);
        
        currentMarkerIds.forEach(id => {
            if (!driverIds.includes(id)) {
                driverMarkersRef.current[id].remove();
                delete driverMarkersRef.current[id];
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
        const map = mapRef.current;
        if (!map) return;

        const currentOrderMarkerIds = Object.keys(orderMarkersRef.current);
        const orderIds = orders.map(o => o.id);

        currentOrderMarkerIds.forEach(id => {
            if (!orderIds.includes(id)) {
                if (orderMarkersRef.current[id]) {
                    orderMarkersRef.current[id].remove();
                    delete orderMarkersRef.current[id];
                }
            }
        });

        orders.forEach(order => {
            if (!order.lat || !order.lng) return;

            const isHighlighted = highlightedOrder?.id === order.id;
            const icon = createOrderIcon(getStatusColor(order.status), isHighlighted);

            if (orderMarkersRef.current[order.id]) {
                orderMarkersRef.current[order.id].setLatLng([order.lat, order.lng]).setIcon(icon);
            } else {
                const marker = L.marker([order.lat, order.lng], { icon, title: order.id, zIndexOffset: isHighlighted ? 1000 : 0 })
                    .addTo(map)
                    .bindTooltip(order.recipient);
                orderMarkersRef.current[order.id] = marker;
            }
        });

    }, [orders, highlightedOrder, statuses]);

    // Effect to handle selected driver logic (panning, routing, simulation)
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;
        
        if (simulationIntervalRef.current) {
            clearInterval(simulationIntervalRef.current);
            simulationIntervalRef.current = null;
        }
        
        if (routingControlRef.current) {
            routingControlRef.current.setWaypoints([]);
        }

        const selectedDriver = drivers.find(d => d.id === selectedDriverId);
        if (!selectedDriver) return;
        
        map.flyTo(selectedDriver.position, 13, { animate: true, duration: 1 });
        
        const driverOrders = orders.filter(o => o.driver === selectedDriver.name && o.status === 'جاري التوصيل' && o.lat && o.lng);

        if (driverOrders.length > 0) {
            startTransition(async () => {
                toast({ title: 'جاري تحسين المسار للسائق المحدد...' });
                const addressesToOptimize = driverOrders.map(o => ({
                    value: o.address,
                    lat: o.lat,
                    lng: o.lng
                }));

                const result = await optimizeRouteAction({
                    driverId: selectedDriver.id,
                    startLocation: 'Current Location', 
                    addresses: addressesToOptimize
                });

                if (result.success && result.data?.optimizedRoute.length) {
                    const optimizedAddresses = result.data.optimizedRoute;
                    const originalAddresses = result.data.originalAddresses;
                    const addressMap = new Map(originalAddresses.map(a => [a.value, {lat: a.lat, lng: a.lng}]));

                     const waypoints: LatLngTuple[] = [
                        selectedDriver.position,
                        ...optimizedAddresses.map(addr => {
                            const location = addressMap.get(addr);
                            return location && location.lat && location.lng ? [location.lat, location.lng] as LatLngTuple : null;
                        }).filter((p): p is LatLngTuple => p !== null)
                    ];
                    
                    if (waypoints.length > 1 && routingControlRef.current) {
                        routingControlRef.current.setWaypoints(waypoints.map(wp => L.latLng(wp[0], wp[1])));

                        routingControlRef.current.on('routesfound', function(e) {
                             const route = e.routes[0];
                             const coordinates = route.coordinates;
                             let index = 0;
                             
                             if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
                             
                             simulationIntervalRef.current = setInterval(() => {
                                 if (index < coordinates.length) {
                                     onDriverPositionChange(selectedDriver.id, [coordinates[index].lat, coordinates[index].lng]);
                                     index += 5;
                                 } else {
                                     if(simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
                                 }
                             }, 200);
                        });
                        toast({ title: 'تم تحسين المسار وجاري محاكاة الحركة!' });
                    }
                } else {
                     toast({ variant: 'destructive', title: 'فشل تحسين المسار', description: result.error || 'لم يتمكن الذكاء الاصطناعي من إنشاء مسار.' });
                }
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDriverId]);


    return (
        <div ref={mapContainerRef} style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }} />
    );
}
