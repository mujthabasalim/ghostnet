"use client";

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { cn } from "@/lib/utils";

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

const NetIcon = L.divIcon({
  html: `<div class="text-rose-500 drop-shadow-md">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 3v18M3 12h18M5.5 5.5l13 13M18.5 5.5l-13 13" opacity="0.3"/>
            <circle cx="12" cy="12" r="9" stroke-width="2" />
            <path d="M12 8v4M12 16h.01" stroke-width="3" />
          </svg>
        </div>`,
  className: 'net-marker',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
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
      
      {nets
        .filter(net => {
          const lat = Number(net.lat);
          const lng = Number(net.lng);
          const isValidCoords = !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
          const isNotRetrieved = net.status !== 'RETRIEVED';
          return isValidCoords && isNotRetrieved;
        })
        .map((net) => (
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
            <Marker 
              position={[Number(net.lat), Number(net.lng)]}
              icon={NetIcon}
            >
            <Popup className="marine-popup">
              <div className="p-1 min-w-[140px]">
                <h4 className="font-bold text-slate-900 mb-0.5">{net.net_type || net.type}</h4>
                <p className="text-[10px] text-slate-500 font-medium mb-2">Area: {net.area_name || 'N/A'}</p>
                
                <div className="flex flex-col gap-2">
                  <div className={cn(
                    "px-2 py-0.5 text-[9px] font-black rounded uppercase tracking-wider text-center",
                    net.status === 'ACTIVE' ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                  )}>
                    {net.status}
                  </div>
                  
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${net.lat},${net.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-2 bg-marine-accent text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-marine-700 transition-colors shadow-sm"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
                    Launch Navigation
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        </React.Fragment>
      ))}

      {vessels
        .filter(v => {
          const lat = Number(v.lat);
          const lng = Number(v.lng);
          return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
        })
        .map((vessel) => (
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
