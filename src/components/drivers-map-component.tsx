'use client';

import React, { useEffect, useRef, useMemo, useState, useTransition } from 'react';
import L, { type LatLngTuple } from 'leaflet';
import 'leaflet-routing-machine';

import type { Order } from '@/store/orders-store';
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

// Helper to create an icon for orders
const orderIcon = L.divIcon({
    html: `<div style="background-color: #2563eb; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>`,
    className: 'bg-transparent border-0',
    iconSize: [16, 16],
    iconAnchor: [8, 8]
});


interface DriversMapComponentProps {
    drivers: any[];
    orders: Order[];
    initialSelectedDriverId: string | null;
    onSelectDriverInMap: (id: string | null) => void;
    onDriverPositionChange: (driverId: string, newPosition: LatLngTuple) => void;
}

export default function DriversMapComponent({ drivers, orders, initialSelectedDriverId, onSelectDriverInMap, onDriverPositionChange }: DriversMapComponentProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const driverMarkersRef = useRef<Record<string, L.Marker>>({});
    const orderMarkersRef = useRef<L.Marker[]>([]);
    const routingControlRef = useRef<L.Routing.Control | null>(null);
    const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const [selectedDriverId, setSelectedDriverId] = useState(initialSelectedDriverId);

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
        }
    }, []);

    // Effect to update the selected driver when the prop changes
    useEffect(() => {
        setSelectedDriverId(initialSelectedDriverId);
    }, [initialSelectedDriverId]);

    // Effect to update driver markers
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        const currentMarkerIds = Object.keys(driverMarkersRef.current);
        const driverIds = drivers.map(d => d.id);
        
        // Remove old markers
        currentMarkerIds.forEach(id => {
            if (!driverIds.includes(id)) {
                driverMarkersRef.current[id].remove();
                delete driverMarkersRef.current[id];
            }
        });
        
        // Add or update markers
        drivers.forEach(driver => {
            const isSelected = driver.id === selectedDriverId;
            const icon = createDriverIcon(driver, isSelected);

            if (driverMarkersRef.current[driver.id]) {
                driverMarkersRef.current[driver.id].setLatLng(driver.position).setIcon(icon);
            } else {
                const marker = L.marker(driver.position, { icon })
                    .addTo(map)
                    .bindTooltip(driver.name, { direction: 'top', offset: L.point(0, -48) })
                    .on('click', () => onSelectDriverInMap(driver.id));
                driverMarkersRef.current[driver.id] = marker;
            }
        });

    }, [drivers, selectedDriverId, onSelectDriverInMap]);


    // Effect to handle selected driver logic (panning, showing orders, routing, simulation)
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;
        
        // Clear previous state
        orderMarkersRef.current.forEach(marker => marker.remove());
        orderMarkersRef.current = [];
        if (routingControlRef.current) {
            map.removeControl(routingControlRef.current);
            routingControlRef.current = null;
        }
        if (simulationIntervalRef.current) {
            clearInterval(simulationIntervalRef.current);
            simulationIntervalRef.current = null;
        }

        const selectedDriver = drivers.find(d => d.id === selectedDriverId);
        if (!selectedDriver) return;
        
        map.flyTo(selectedDriver.position, 13, { animate: true, duration: 1 });
        
        const driverOrders = orders.filter(o => o.driver === selectedDriver.name && o.status === 'جاري التوصيل' && o.lat && o.lng);

        driverOrders.forEach(order => {
            const marker = L.marker([order.lat!, order.lng!], { icon: orderIcon })
                .addTo(map)
                .bindTooltip(order.recipient);
            orderMarkersRef.current.push(marker);
        });

        if (driverOrders.length > 0) {
            startTransition(async () => {
                toast({ title: 'جاري تحسين المسار...' });
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

                if (result.success && result.data) {
                    const optimizedAddresses = result.data.optimizedRoute;
                    const originalAddresses = result.data.originalAddresses;
                    const addressMap = new Map(originalAddresses.map(a => [a.value, {lat: a.lat, lng: a.lng}]));

                    const waypoints = [
                        L.latLng(selectedDriver.position[0], selectedDriver.position[1]),
                        ...optimizedAddresses.map(addr => {
                            const location = addressMap.get(addr);
                            return location && location.lat && location.lng ? L.latLng(location.lat, location.lng) : null;
                        }).filter((p): p is L.LatLng => p !== null)
                    ];
                    
                    if (waypoints.length > 1) {
                         const instance = L.Routing.control({
                            waypoints,
                            lineOptions: {
                                styles: [{ color: '#F96941', opacity: 0.8, weight: 5 }],
                                extendToWaypoints: false,
                                missingRouteTolerance: 100,
                            },
                            show: false,
                            addWaypoints: false,
                            routeWhileDragging: false,
                            draggableWaypoints: false,
                            fitSelectedRoutes: true,
                            createMarker: () => null,
                        }).on('routesfound', function(e) {
                             const route = e.routes[0];
                             const coordinates = route.coordinates;
                             let index = 0;
                             
                             if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
                             
                             simulationIntervalRef.current = setInterval(() => {
                                 if (index < coordinates.length) {
                                     onDriverPositionChange(selectedDriver.id, [coordinates[index].lat, coordinates[index].lng]);
                                     index += 5; // Jump more points for faster simulation
                                 } else {
                                     if(simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
                                 }
                             }, 200); // Update every 200ms
                        }).addTo(map);

                        routingControlRef.current = instance;
                    }
                     toast({ title: 'تم تحسين المسار وجاري محاكاة الحركة!' });
                } else {
                     toast({ variant: 'destructive', title: 'فشل تحسين المسار', description: result.error });
                }
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDriverId, toast]);


    return (
        <div ref={mapContainerRef} style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }} />
    );
}
