
'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { Map } from 'leaflet';
import { useEffect, useState } from 'react';

// Fix for default icon issue with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface Driver {
    id: number;
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

// Custom component to handle map view changes
const ChangeView = ({ center, zoom }: { center: [number, number]; zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

const MapContent = ({ drivers, selectedDriver, setMap }: { drivers: Driver[], selectedDriver: Driver | null, setMap: (map: Map) => void }) => {
    const defaultPosition: [number, number] = [31.9539, 35.9106]; // Amman, Jordan
    return (
         <MapContainer
            center={selectedDriver ? selectedDriver.position : defaultPosition}
            zoom={12}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
            whenCreated={setMap}
        >
            <ChangeView center={selectedDriver ? selectedDriver.position : defaultPosition} zoom={selectedDriver ? 14 : 12} />
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
};


export default function DriversMap({ drivers, selectedDriver }: DriversMapProps) {
  const [map, setMap] = useState<Map | null>(null);

  useEffect(() => {
    return () => {
      map?.remove();
    };
  }, [map]);


  return (
    <>
      <div id="map-placeholder" style={{ display: 'none' }} />
      <MapContent drivers={drivers} selectedDriver={selectedDriver} setMap={setMap} />
    </>
  );
}
