"use client";

import React from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for Leaflet marker icons
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface LocationMapProps {
  lat: number;
  lng: number;
  zoom?: number;
}

export default function LocationMap({ lat, lng, zoom = 13 }: LocationMapProps) {
  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner group">
      <MapContainer 
        center={[lat, lng]} 
        zoom={zoom} 
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
        dragging={false}
        zoomControl={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]} />
      </MapContainer>
      
      {/* Overlay to indicate locked status */}
      <div className="absolute inset-0 z-[1000] pointer-events-none bg-marine-accent/5 flex items-end p-4">
        <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-2 shadow-sm">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Hardware Verified</span>
        </div>
      </div>
    </div>
  );
}
