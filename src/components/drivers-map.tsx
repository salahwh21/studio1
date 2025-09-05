
'use client';

import * as React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, memo } from 'react';

// Fix for default icon issue with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface Driver {
    id: string;
    name: string;
    status: string;
    parcels: number;
    avatar: string;
    position: [number, number];
}

interface DriversMapProps {
    drivers: Driver[];
    selectedDriver: Driver | null;
}

// Custom component to handle map view changes dynamically
const MapUpdater = ({ center, zoom }: { center: [number, number]; zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, {
        animate: true,
        pan: {
            duration: 0.5
        }
    });
  }, [center, zoom, map]);
  return null;
};

// This component will contain the map logic and will not re-render unnecessarily
const MapView = memo(function MapView({ drivers, selectedDriver }: DriversMapProps) {
    const defaultPosition: [number, number] = [31.9539, 35.9106]; // Amman, Jordan
    const displayCenter = selectedDriver ? selectedDriver.position : defaultPosition;
    const displayZoom = selectedDriver ? 14 : 11;

    return (
        <MapContainer
            center={displayCenter}
            zoom={displayZoom}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapUpdater center={displayCenter} zoom={displayZoom} />
            {drivers.map(driver => (
                <Marker key={driver.id} position={driver.position}>
                <Popup>
                    <b>{driver.name}</b><br/>
                    الحالة: {driver.status}<br/>
                    الطرود: {driver.parcels}
                </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
});


export default function DriversMap({ drivers, selectedDriver }: DriversMapProps) {
    const [isClient, setIsClient] = React.useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    return (
        <>
            {isClient ? (
                <MapView drivers={drivers} selectedDriver={selectedDriver} />
            ) : (
                <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">جاري تحميل الخريطة...</p>
                </div>
            )}
        </>
    );
}
