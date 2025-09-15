'use client';

import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { type LatLngTuple } from 'leaflet';

import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Setup Leaflet's default icon path
// This needs to be done once per application
if (typeof window !== 'undefined') {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: iconRetinaUrl.src,
        iconUrl: iconUrl.src,
        shadowUrl: shadowUrl.src,
    });
}

type Driver = {
    id: string;
    name: string;
    position: [number, number];
};

type MapUpdaterProps = {
    selectedDriver: Driver | null;
};

// This component will handle map view changes
function MapUpdater({ selectedDriver }: MapUpdaterProps) {
    const map = useMap();
    useEffect(() => {
        if (selectedDriver) {
            map.flyTo(selectedDriver.position, 14, {
                animate: true,
                duration: 1,
            });
        }
    }, [selectedDriver, map]);
    return null;
}

type DriversMapProps = {
    drivers: Driver[];
    selectedDriver: Driver | null;
};

const defaultPosition: LatLngTuple = [31.9539, 35.9106]; // Amman, Jordan

const DriversMap = ({ drivers, selectedDriver }: DriversMapProps) => {
    // Memoize the map component to prevent re-initialization
    const memoizedMap = useMemo(() => {
        return (
            <MapContainer
                center={defaultPosition}
                zoom={11}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
                // Using a static key helps prevent re-renders in some edge cases
                key="drivers-map-container"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapUpdater selectedDriver={selectedDriver} />
                {drivers.map(driver => (
                    <Marker key={driver.id} position={driver.position}>
                        <Popup><b>{driver.name}</b></Popup>
                    </Marker>
                ))}
            </MapContainer>
        );
    }, [drivers, selectedDriver]);

    return memoizedMap;
};

export default DriversMap;
