"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Clock,
  MapPin,
  ChevronRight,
  Camera,
  CheckCircle2,
  AlertCircle,
  Activity,
  User,
  Phone,
  ShieldCheck as ShieldIcon,
  Navigation,
  ExternalLink,
  Anchor
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { calculateDistance, calculateBearing, getCardinalDirection } from "@/lib/navigation-utils";

export default function RetrievalsPage() {
  const [missions, setMissions] = useState<any[]>([]);
  const [selectedMission, setSelectedMission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isDevMode, setIsDevMode] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [retrievalImage, setRetrievalImage] = useState<string | null>(null);
  const router = useRouter();

  const PROXIMITY_THRESHOLD = 0.54; // ~1000 meters in Nautical Miles

  useEffect(() => {
    setMounted(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Set up real-time subscription for missions
    const subscription = supabase
      .channel('mission-updates')
      .on('postgres_changes', { event: '*', table: 'ghost_nets' }, () => {
        fetchMissions();
      })
      .subscribe();

    // Get specialist live location
    let watchId: number | null = null;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => setCurrentLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.error("Navigation error:", err),
        { enableHighAccuracy: true }
      );
    }

    return () => {
      subscription.unsubscribe();
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  const fetchMissions = async () => {
    try {
      const res = await fetch("/api/reports");
      const data = await res.json();
      
      if (Array.isArray(data)) {
        // Only show ACTIVE and IN_PROGRESS missions
        setMissions(data.filter((n: any) => n.status !== "RETRIEVED"));
      } else {
        console.error("API error or invalid data format:", data);
        setMissions([]);
      }
    } catch (err) {
      console.error("Error fetching missions:", err);
      setMissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMissions();
  }, []);

  const updateStatus = async (id: string, status: string, additionalData: any = {}) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const res = await fetch(`/api/reports/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ status, ...additionalData }),
      });
      if (res.ok) {
        fetchMissions();
        setSelectedMission(null);
        setRetrievalImage(null);
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handleImageCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('retrieval-evidence')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('retrieval-evidence')
        .getPublicUrl(data.path);

      setRetrievalImage(publicUrl);
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-black">
          Retrieval Missions
        </h1>
        <p className="text-slate-400">
          Manage and execute ghost net recovery operations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-black">Open Missions</h3>
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-marine-100 rounded text-[10px] font-bold text-marine-700 uppercase tracking-widest">
                Filter: All
              </span>
            </div>
          </div>

          {missions.map((mission) => (
            <div
              key={mission.id}
              className={cn(
                "glass-card p-0 cursor-pointer transition-all duration-300 group hover:border-marine-accent/50 overflow-hidden",
                selectedMission?.id === mission.id
                  ? "border-marine-accent ring-1 ring-marine-accent/20"
                  : "",
              )}
            >
              <div className="flex">
                <div 
                  onClick={() => setSelectedMission(mission)}
                  className="flex-1 p-5 flex items-center justify-between"
                >
                  <div className="flex gap-4">
                    <div
                      className={cn(
                        "p-3 rounded-xl",
                        mission.status === "ACTIVE"
                          ? "bg-rose-500/10 text-rose-500"
                          : "bg-amber-500/10 text-amber-500",
                      )}
                    >
                      {mission.status === "ACTIVE" ? (
                        <AlertCircle size={24} />
                      ) : (
                        <Activity size={24} />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-bold text-black uppercase">
                          GN-{mission.id.substring(0, 5)}
                        </h4>
                        <span className="text-xs text-slate-500 font-mono tracking-tighter">
                          {mission.net_type}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-slate-400 text-sm">
                        <span className="flex items-center gap-1">
                          <MapPin size={14} /> {mission.area_name || `${mission.lat}, ${mission.lng}`}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} /> {mounted ? new Date(mission.reported_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={cn(
                    "px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest",
                    mission.status === "ACTIVE"
                      ? "bg-rose-500/20 text-rose-500"
                      : "bg-amber-500/20 text-amber-500",
                  )}>
                    {mission.status}
                  </div>
                </div>

                {/* Navigation Action */}
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${mission.lat},${mission.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-16 border-l border-slate-100 flex flex-col items-center justify-center gap-1 text-slate-400 hover:bg-marine-accent hover:text-white transition-all group/nav"
                  title="Navigate to Hazard"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Navigation size={20} className="group-hover/nav:animate-pulse" />
                  <span className="text-[8px] font-black uppercase tracking-tighter">Route</span>
                </a>
              </div>
            </div>
          ))}
          {missions.length === 0 && !loading && (
            <div className="py-20 text-center glass-card border-dashed opacity-50">
              <CheckCircle2 className="mx-auto mb-4 text-emerald-500" size={48} />
              <p className="text-slate-500 font-bold uppercase tracking-widest">All hazards cleared</p>
            </div>
          )}
        </div>

        {/* Mission Details Sidebar */}
        <div className="space-y-6">
          {selectedMission ? (
            <div className="glass-card p-6 sticky top-24 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-black">Mission Brief</h3>
                <div className="flex items-center gap-4">
                  {/* Dev Simulation Toggle */}
                  <label className="flex items-center gap-2 cursor-pointer bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={isDevMode}
                      onChange={(e) => setIsDevMode(e.target.checked)}
                    />
                    <div className="w-7 h-4 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-amber-500"></div>
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">SIM</span>
                  </label>
                  <button
                    onClick={() => {
                      setSelectedMission(null);
                      setRetrievalImage(null);
                    }}
                    className="text-slate-500 hover:text-black transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-4 bg-marine-950/50 rounded-xl border border-marine-700/30 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Hazard ID</span>
                    <span className="text-black font-mono">
                      GN-{selectedMission.id.substring(0, 8).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Radius</span>
                    <span className="text-black">
                      {selectedMission.radius}m
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Location</span>
                    <span className="text-black">
                      {selectedMission.area_name || `${selectedMission.lat}, ${selectedMission.lng}`}
                    </span>
                  </div>
                </div>

                {/* Reporter Details */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
                    Reporter Information
                  </h4>
                  <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm space-y-4">
                    {selectedMission.reporter ? (
                      <>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-marine-accent/10 rounded-full flex items-center justify-center text-marine-accent">
                            <User size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900">{selectedMission.reporter.full_name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Verified Guardian</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-50">
                          <div>
                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Mobile</p>
                            <p className="text-xs font-bold text-slate-700 flex items-center gap-1">
                              <Phone size={12} /> {selectedMission.reporter.mobile}
                            </p>
                          </div>
                          <div>
                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Govt ID</p>
                            <p className="text-xs font-bold text-slate-700 flex items-center gap-1">
                              <ShieldIcon size={12} /> {selectedMission.reporter.id_code}
                            </p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-2 text-slate-400 italic py-2">
                        <AlertCircle size={16} />
                        <p className="text-xs">Reporter data unavailable for this hazard.</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Navigation Brief */}
                {selectedMission.status === "IN_PROGRESS" && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
                      Navigation Brief
                    </h4>
                    <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-xl overflow-hidden relative">
                      {/* Background Decoration */}
                      <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12">
                        <Navigation size={100} />
                      </div>

                      {currentLocation ? (
                        <div className="space-y-4 relative z-10">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Distance to Target</p>
                              <p className="text-2xl font-black">
                                {calculateDistance(
                                  currentLocation.lat, 
                                  currentLocation.lng, 
                                  selectedMission.lat, 
                                  selectedMission.lng
                                ).toFixed(2)} <span className="text-xs text-slate-400">NM</span>
                              </p>
                            </div>
                            <div className="text-right space-y-1">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bearing</p>
                              <p className="text-2xl font-black">
                                {calculateBearing(
                                  currentLocation.lat, 
                                  currentLocation.lng, 
                                  selectedMission.lat, 
                                  selectedMission.lng
                                ).toFixed(0)}° <span className="text-xs text-slate-400">{getCardinalDirection(
                                  calculateBearing(
                                    currentLocation.lat, 
                                    currentLocation.lng, 
                                    selectedMission.lat, 
                                    selectedMission.lng
                                  )
                                )}</span>
                              </p>
                            </div>
                          </div>

                          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-marine-accent w-1/3 animate-pulse" />
                          </div>

                          <a 
                            href={`https://www.google.com/maps/dir/?api=1&destination=${selectedMission.lat},${selectedMission.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-white text-slate-900 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-100 transition-all"
                          >
                            <ExternalLink size={14} /> Open in External Maps
                          </a>
                        </div>
                      ) : (
                        <div className="py-4 flex flex-col items-center gap-3">
                          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Acquiring Intercept Coordinates...</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedMission.status === "ACTIVE" ? (
                  <button 
                    onClick={() => updateStatus(selectedMission.id, 'IN_PROGRESS')}
                    disabled={!session}
                    className={cn(
                      "w-full font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all",
                      session 
                        ? "bg-marine-accent text-white hover:shadow-[0_0_20px_rgba(14,165,233,0.3)]" 
                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    )}
                  >
                    {session ? 'Initialize Mission' : 'Sign in to Initialize'} <ShieldCheck size={20} />
                  </button>
                ) : (
                  <div className="space-y-4">
                    {/* Retrieval Evidence UI */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
                        Retrieval Evidence
                      </h4>
                      <div className="relative group">
                        {retrievalImage ? (
                          <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500 aspect-video group">
                            <img src={retrievalImage} alt="Evidence" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                              <CheckCircle2 className="text-white drop-shadow-lg" size={48} />
                            </div>
                            <button 
                              onClick={() => setRetrievalImage(null)}
                              className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Camera size={16} />
                            </button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer">
                            <input 
                              type="file" 
                              accept="image/*" 
                              capture="environment" 
                              className="hidden" 
                              onChange={handleImageCapture}
                              disabled={isUploading}
                            />
                            {isUploading ? (
                              <div className="flex flex-col items-center gap-2">
                                <div className="w-6 h-6 border-2 border-marine-accent border-t-transparent rounded-full animate-spin" />
                                <span className="text-[10px] font-black text-marine-accent uppercase">Uploading...</span>
                              </div>
                            ) : (
                              <>
                                <Camera className="text-slate-400 mb-2" size={32} />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Capture Proof of Retrieval</span>
                              </>
                            )}
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Proximity Warning */}
                    {(() => {
                      const dist = currentLocation ? calculateDistance(
                        currentLocation.lat, currentLocation.lng, 
                        selectedMission.lat, selectedMission.lng
                      ) : 999;
                      const isOnSite = dist <= PROXIMITY_THRESHOLD;

                      return (
                        <button 
                          onClick={() => updateStatus(selectedMission.id, 'RETRIEVED', {
                            retrieval_image_url: retrievalImage,
                            retrieval_lat: currentLocation?.lat,
                            retrieval_lng: currentLocation?.lng
                          })}
                          disabled={!session || (!isOnSite && !isDevMode) || !retrievalImage}
                          className={cn(
                            "w-full font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all",
                            session && (isOnSite || isDevMode) && retrievalImage
                              ? "bg-emerald-500 text-white hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] shadow-lg" 
                              : "bg-slate-100 text-slate-400 cursor-not-allowed"
                          )}
                        >
                          {!retrievalImage ? (
                            <>Evidence Required <Camera size={20} /></>
                          ) : (!isOnSite && !isDevMode) ? (
                            <>Too Far From Site ({dist.toFixed(1)} NM) <Anchor size={20} /></>
                          ) : (
                            <>Complete Retrieval <CheckCircle2 size={20} /></>
                          )}
                        </button>
                      );
                    })()}
                  </div>
                )}
                
                {!session && (
                  <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-3">
                    <Lock size={16} className="text-amber-500" />
                    <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Authorization required for field ops</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="glass-card p-10 flex flex-col items-center justify-center text-center opacity-50 border-dashed">
              <ShieldCheck size={48} className="text-marine-700 mb-4" />
              <p className="text-slate-500 text-sm font-medium">
                Select a mission to view briefing and initiate recovery.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
