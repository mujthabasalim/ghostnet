"use client";

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for Leaflet marker icons in Next.js
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const ShipIcon = L.divIcon({
  html: `<div class="text-marine-accent drop-shadow-sm">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
            <path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.2.6 4.3 1.62 6" />
            <path d="M12 10V2" />
            <path d="M12 5h3" />
          </svg>
        </div>`,
  className: 'ship-marker',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

interface GhostNet {
  id: string;
  lat: number;
  lng: number;
  type: string;
  net_type?: string;
  area_name?: string;
  floatColor: string;
  radius: number;
  status: 'ACTIVE' | 'IN_PROGRESS' | 'RETRIEVED';
}

interface MapProps {
  nets?: GhostNet[];
  vessels?: any[];
  center?: [number, number];
  zoom?: number;
}

export default function GhostMap({ 
  nets = [], 
  vessels = [],
  center = [7.8731, 80.7718], 
  zoom = 9 
}: MapProps) {
  
  return (
    <MapContainer 
      center={center} 
      zoom={zoom} 
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {nets.filter(net => net.lat && net.lng).map((net) => (
        <React.Fragment key={net.id}>
          <Circle
            center={[Number(net.lat), Number(net.lng)]}
            radius={net.radius || 500}
            pathOptions={{
              color: net.status === 'ACTIVE' ? '#f43f5e' : (net.status === 'IN_PROGRESS' ? '#f59e0b' : '#10b981'),
              fillColor: net.status === 'ACTIVE' ? '#f43f5e' : (net.status === 'IN_PROGRESS' ? '#f59e0b' : '#10b981'),
              fillOpacity: 0.2,
              weight: 2,
              dashArray: net.status === 'ACTIVE' ? '5, 10' : '0'
            }}
          />
          <Marker position={[Number(net.lat), Number(net.lng)]}>
            <Popup className="marine-popup">
              <div className="p-1">
                <h4 className="font-bold text-slate-900">{net.net_type || net.type}</h4>
                <p className="text-xs text-slate-600">Area: {net.area_name || 'N/A'}</p>
                <div className="mt-2 px-2 py-1 bg-rose-100 text-rose-700 text-[10px] font-bold rounded uppercase">
                  {net.status}
                </div>
              </div>
            </Popup>
          </Marker>
        </React.Fragment>
      ))}

      {vessels.filter(v => v.lat && v.lng).map((vessel) => (
        <Marker 
          key={vessel.id} 
          position={[Number(vessel.lat), Number(vessel.lng)]} 
          icon={ShipIcon}
        >
          <Popup className="marine-popup">
            <div className="p-1">
              <h4 className="font-bold text-slate-900">{vessel.name}</h4>
              <p className="text-xs text-slate-600">Speed: {vessel.speed} kts</p>
              <p className="text-xs text-slate-600">Course: {vessel.course}°</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
