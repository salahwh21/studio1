
'use client';

import { useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L, { type LatLngTuple, type Map } from 'leaflet';
import 'leaflet-routing-machine';
import MarkerClusterGroup from '@changey/react-leaflet-markercluster';


import type { Order } from '@/store/orders-store';

const defaultPosition: LatLngTuple = [31.9539, 35.9106]; // Amman, Jordan

const createDriverIcon = (driver: any, isSelected: boolean) => {
    return L.divIcon({
        html: `
            <div style="position: relative; width: 48px; height: 48px;">
                <img src="${driver.avatar}" style="width: 40px; height: 40px; border-radius: 50%; border: ${isSelected ? '3px solid #F96941' : '3px solid #ccc'}; object-fit: cover; position: absolute; top: 0; left: 0; background: #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">
                <div style="position: absolute; bottom: 0; left: 16px; width: 0; height: 0; border-left: 8px solid transparent; border-right: 8px solid transparent; border-top: 12px solid ${isSelected ? '#F96941' : '#ccc'};"></div>
            </div>
        `,
        className: '',
        iconSize: [48, 48],
        iconAnchor: [24, 48]
    });
};

const orderIcon = L.divIcon({
    html: `<div style="background-color: #2563eb; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
    className: 'bg-transparent border-0',
    iconSize: [16, 16],
    iconAnchor: [8, 8]
});

const RoutingMachine = ({ waypoints }: { waypoints: L.LatLng[] }) => {
    const map = useMap();
    const routingControlRef = useRef<L.Routing.Control | null>(null);

    useEffect(() => {
        if (routingControlRef.current) {
            map.removeControl(routingControlRef.current);
            routingControlRef.current = null;
        }

        if (waypoints.length > 1) {
            const routingControl = L.Routing.control({
                waypoints,
                lineOptions: {
                    styles: [{ color: '#F96941', opacity: 0.8, weight: 5 }],
                    extendToWaypoints: false,
                    missingRouteTolerance: 10,
                },
                show: false,
                addWaypoints: false,
                routeWhileDragging: false,
                draggableWaypoints: false,
                fitSelectedRoutes: true,
                createMarker: () => null,
            }).addTo(map);
            routingControlRef.current = routingControl;
        }
    }, [map, waypoints]);

    return null;
};

const MapController = ({ selectedDriver }: { selectedDriver: any | null }) => {
    const map = useMap();
    useEffect(() => {
        if (selectedDriver) {
            map.flyTo(selectedDriver.position, 13, { animate: true, duration: 1 });
        }
    }, [selectedDriver, map]);
    return null;
}

interface DriversMapComponentProps {
    drivers: any[];
    selectedDriver: any | null;
    driverOrders: Order[];
    onSelectDriver: (id: string | null) => void;
}

export default function DriversMapComponent({ drivers, selectedDriver, driverOrders, onSelectDriver }: DriversMapComponentProps) {

    const waypoints = useMemo(() => {
        if (!selectedDriver) return [];
        const driverWp = L.latLng(selectedDriver.position[0], selectedDriver.position[1]);
        const orderWps = driverOrders
            .filter(o => o.status === 'جاري التوصيل' && o.lat && o.lng)
            .map(o => L.latLng(o.lat!, o.lng!));
        return [driverWp, ...orderWps];
    }, [selectedDriver, driverOrders]);

    return (
        <MapContainer
            center={defaultPosition}
            zoom={11}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MarkerClusterGroup chunkedLoading>
                {drivers.map(driver => (
                    <Marker
                        key={driver.id}
                        position={driver.position}
                        icon={createDriverIcon(driver, driver.id === selectedDriver?.id)}
                        eventHandlers={{ click: () => onSelectDriver(driver.id) }}
                    />
                ))}
                {selectedDriver && driverOrders.filter(o => o.lat && o.lng).map(order => (
                    <Marker key={order.id} position={[order.lat!, order.lng!]} icon={orderIcon} />
                ))}
            </MarkerClusterGroup>
            <RoutingMachine waypoints={waypoints} />
            <MapController selectedDriver={selectedDriver} />
        </MapContainer>
    );

    
}
