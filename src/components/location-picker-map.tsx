
'use client';

import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Button } from './ui/button';

// Fix for default icon issue with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface LocationPickerMapProps {
  onLocationSelect: (location: { lat: number; lng: number }) => void;
}

const LocationMarker = ({ position, setPosition }: { position: L.LatLng | null, setPosition: (pos: L.LatLng) => void }) => {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
};

export default function LocationPickerMap({ onLocationSelect }: LocationPickerMapProps) {
    const defaultPosition: L.LatLngTuple = [31.9539, 35.9106]; // Amman, Jordan
    const [position, setPosition] = useState<L.LatLng | null>(null);

    return (
        <div className="w-full h-full flex flex-col">
            <div className="flex-grow relative">
                <MapContainer
                    center={defaultPosition}
                    zoom={13}
                    scrollWheelZoom={true}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker position={position} setPosition={setPosition} />
                </MapContainer>
            </div>
            <div className="flex-none p-4 bg-background border-t">
                <Button 
                    onClick={() => position && onLocationSelect(position)} 
                    disabled={!position}
                    className="w-full"
                >
                    تأكيد الموقع
                </Button>
            </div>
        </div>
    );
}

