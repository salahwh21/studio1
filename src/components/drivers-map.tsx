'use client';

import * as React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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

const defaultPosition: [number, number] = [31.9539, 35.9106]; // Amman, Jordan

function MapUpdater({ selectedDriver }: { selectedDriver: Driver | null }) {
    const map = useMap();
    React.useEffect(() => {
        if (selectedDriver) {
            map.flyTo(selectedDriver.position, 14, {
                animate: true,
                duration: 0.8
            });
        } else {
            map.flyTo(defaultPosition, 11, {
                animate: true,
                duration: 0.8
            });
        }
    }, [selectedDriver, map]);
    return null;
}


export default function DriversMap({ drivers, selectedDriver }: DriversMapProps) {
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
            
            <MapUpdater selectedDriver={selectedDriver} />

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
