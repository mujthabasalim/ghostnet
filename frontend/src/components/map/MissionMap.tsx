"use client";

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { cn } from "@/lib/utils";

// Fix for Leaflet marker icons
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const SpecialistIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div class="w-8 h-8 bg-marine-accent border-4 border-white rounded-full shadow-lg flex items-center justify-center animate-pulse">
           <div class="w-2 h-2 bg-white rounded-full"></div>
         </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const HazardIcon = (status: string) => L.divIcon({
  className: 'custom-div-icon',
  html: `<div class="w-6 h-6 ${status === 'ACTIVE' ? 'bg-rose-500' : 'bg-amber-500'} border-2 border-white rounded-lg shadow-md rotate-45 flex items-center justify-center">
           <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
         </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

interface MissionMapProps {
  missions: any[];
  currentLocation: { lat: number; lng: number } | null;
  selectedMission: any;
  onSelectMission: (mission: any) => void;
}

export default function MissionMap({ missions, currentLocation, selectedMission, onSelectMission }: MissionMapProps) {
  const center: [number, number] = currentLocation 
    ? [currentLocation.lat, currentLocation.lng] 
    : [7.8731, 80.7718];

  return (
    <div className="w-full h-full rounded-3xl overflow-hidden border border-slate-200 shadow-2xl relative">
      <MapContainer 
        center={center} 
        zoom={10} 
        style={{ height: '100%', width: '100%' }}
        className="z-10"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Current Specialist Location */}
        {currentLocation && (
          <Marker position={[currentLocation.lat, currentLocation.lng]} icon={SpecialistIcon}>
            <Popup className="custom-popup">
              <div className="p-2">
                <p className="font-black text-xs uppercase tracking-widest text-marine-accent">Your Position</p>
                <p className="text-[10px] text-slate-500 font-bold">{currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Hazard Markers */}
        {missions.map((mission) => (
          <React.Fragment key={mission.id}>
            <Marker 
              position={[mission.lat, mission.lng]} 
              icon={HazardIcon(mission.status)}
              eventHandlers={{
                click: () => onSelectMission(mission)
              }}
            >
              <Popup>
                <div className="p-2 min-w-[150px]">
                  <p className="font-black text-xs uppercase tracking-tight text-slate-900">GN-{mission.id.substring(0, 5)}</p>
                  <p className="text-[10px] font-bold text-slate-400 mb-2">{mission.net_type}</p>
                  <div className={cn(
                    "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest inline-block",
                    mission.status === 'ACTIVE' ? "bg-rose-500 text-white" : "bg-amber-500 text-white"
                  )}>
                    {mission.status}
                  </div>
                </div>
              </Popup>
            </Marker>

            {/* If mission is selected or in progress, show its impact area */}
            {(selectedMission?.id === mission.id) && (
              <Circle 
                center={[mission.lat, mission.lng]}
                radius={mission.radius || 500}
                pathOptions={{ 
                  color: mission.status === 'ACTIVE' ? '#f43f5e' : '#f59e0b',
                  fillColor: mission.status === 'ACTIVE' ? '#f43f5e' : '#f59e0b',
                  fillOpacity: 0.1,
                  dashArray: '5, 10'
                }}
              />
            )}
          </React.Fragment>
        ))}

        {/* Intercept Line for In-Progress Mission */}
        {currentLocation && selectedMission && selectedMission.status === 'IN_PROGRESS' && (
          <Polyline 
            positions={[
              [currentLocation.lat, currentLocation.lng],
              [selectedMission.lat, selectedMission.lng]
            ]}
            pathOptions={{ 
              color: '#0ea5e9', 
              weight: 3, 
              dashArray: '10, 15',
              lineCap: 'round'
            }}
          />
        )}
      </MapContainer>

      {/* Map Legend */}
      <div className="absolute bottom-6 left-6 z-[1000] bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-xl space-y-3">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fleet Legend</p>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-marine-accent rounded-full border-2 border-white shadow-sm" />
          <span className="text-[10px] font-bold text-slate-700 uppercase">You (Specialist)</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-rose-500 rounded border-2 border-white shadow-sm rotate-45" />
          <span className="text-[10px] font-bold text-slate-700 uppercase">Active Hazard</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-amber-500 rounded border-2 border-white shadow-sm rotate-45" />
          <span className="text-[10px] font-bold text-slate-700 uppercase">In Progress</span>
        </div>
      </div>
    </div>
  );
}
