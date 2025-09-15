
'use client';

import * as React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, memo, useState, useRef } from 'react';

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

export default function DriversMap({ drivers, selectedDriver }: DriversMapProps) {
    const [isClient, setIsClient] = useState(false);
    const mapRef = useRef<L.Map | null>(null);
    const defaultPosition: [number, number] = [31.9539, 35.9106]; // Amman, Jordan

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (mapRef.current && selectedDriver) {
            mapRef.current.flyTo(selectedDriver.position, 14, {
                animate: true,
                duration: 0.5,
            });
        } else if (mapRef.current) {
            mapRef.current.flyTo(defaultPosition, 11, {
                animate: true,
                duration: 0.5,
            });
        }
    }, [selectedDriver, defaultPosition]);

    if (!isClient) {
        return (
            <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">جاري تحميل الخريطة...</p>
            </div>
        );
    }

    return (
        <MapContainer
            center={selectedDriver ? selectedDriver.position : defaultPosition}
            zoom={selectedDriver ? 14 : 11}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
            whenCreated={map => { mapRef.current = map; }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
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
}

