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
import { useLanguage } from "@/context/LanguageContext";

export default function RetrievalsPage() {
  const { t } = useLanguage();
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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ghost_nets' }, () => {
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
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black">
          {t('retrieval_missions')}
        </h1>
        <p className="text-sm sm:text-base text-slate-400">
          {t('manage_ghost_nets')}
        </p>
      </div>

      <div className="space-y-4 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base sm:text-lg font-semibold text-black">{t('open_missions')}</h3>
          <div className="flex gap-2">
            <span className="px-2 py-1 bg-marine-100 rounded text-[10px] font-bold text-marine-700 uppercase tracking-widest">
              {t('filter_all')}
            </span>
          </div>
        </div>

        {missions.map((mission) => {
          const isSelected = selectedMission?.id === mission.id;
          return (
            <div key={mission.id} className="space-y-2">
              <div
                className={cn(
                  "glass-card p-0 cursor-pointer transition-all duration-300 group hover:border-marine-accent/50 overflow-hidden",
                  isSelected
                    ? "border-marine-accent ring-1 ring-marine-accent/20"
                    : "",
                )}
              >
                <div className="flex">
                  <div 
                    onClick={() => {
                      if (isSelected) {
                        setSelectedMission(null);
                        setRetrievalImage(null);
                      } else {
                        setSelectedMission(mission);
                        setRetrievalImage(null);
                      }
                    }}
                    className="flex-1 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0"
                  >
                    <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
                      <div
                        className={cn(
                          "p-2.5 sm:p-3 rounded-xl shrink-0 mt-0.5 sm:mt-0",
                          mission.status === "ACTIVE"
                            ? "bg-rose-500/10 text-rose-500"
                            : "bg-amber-500/10 text-amber-500",
                        )}
                      >
                        {mission.status === "ACTIVE" ? (
                          <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                        ) : (
                          <Activity className="w-5 h-5 sm:w-6 sm:h-6" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-base sm:text-lg font-bold text-black uppercase">
                            GN-{mission.id.substring(0, 5)}
                          </h4>
                          <span className="text-[10px] sm:text-xs text-slate-500 font-mono tracking-tighter bg-slate-100 px-1.5 py-0.5 rounded">
                            {mission.net_type}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1 text-slate-400 text-xs sm:text-sm">
                          <span className="flex items-center gap-1 truncate max-w-[140px] sm:max-w-[200px]">
                            <MapPin size={12} className="shrink-0" /> <span className="truncate">{mission.area_name || `${mission.lat}, ${mission.lng}`}</span>
                          </span>
                          <span className="flex items-center gap-1 shrink-0">
                            <Clock size={12} className="shrink-0" /> {mounted ? new Date(mission.reported_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className={cn(
                      "self-start sm:self-auto px-2.5 py-1 rounded text-[9px] sm:text-[10px] font-bold uppercase tracking-widest shrink-0",
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
                    className="w-14 sm:w-16 border-l border-slate-100 flex flex-col items-center justify-center gap-1 text-slate-400 hover:bg-marine-accent hover:text-white transition-all group/nav shrink-0"
                    title={t('navigate_to_hazard')}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Navigation size={18} className="group-hover/nav:animate-pulse sm:w-5 sm:h-5" />
                    <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-tighter">{t('route')}</span>
                  </a>
                </div>
              </div>

              {/* Inline Expanded Details View */}
              {isSelected && (
                <div className="glass-card p-4 sm:p-6 animate-in fade-in slide-in-from-top-2 duration-200 min-w-0 border-t-2 border-t-marine-accent bg-slate-50/30">
                  <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-black">{t('mission_brief')}</h3>
                    <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                      {/* Dev Simulation Toggle */}
                      <label className="flex items-center gap-1.5 sm:gap-2 cursor-pointer bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-sm">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={isDevMode}
                          onChange={(e) => setIsDevMode(e.target.checked)}
                        />
                        <div className="w-6 sm:w-7 h-3.5 sm:h-4 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-2.5 sm:after:h-3 after:w-2.5 sm:after:w-3 after:transition-all peer-checked:bg-amber-500"></div>
                        <span className="text-[7px] sm:text-[8px] font-black text-slate-500 uppercase tracking-tighter">SIM</span>
                      </label>
                      <button
                        onClick={() => {
                          setSelectedMission(null);
                          setRetrievalImage(null);
                        }}
                        className="text-xs sm:text-sm text-slate-500 hover:text-black transition-colors font-medium"
                      >
                        {t('close')}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 sm:space-y-6 min-w-0">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 p-3 sm:p-4 bg-marine-950/5 rounded-xl border border-marine-700/10 min-w-0">
                      <div className="min-w-0">
                        <span className="block text-[10px] text-slate-400 uppercase font-bold">{t('hazard_id')}</span>
                        <span className="text-xs sm:text-sm text-black font-mono font-semibold truncate block">
                          GN-{selectedMission.id.substring(0, 8).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <span className="block text-[10px] text-slate-400 uppercase font-bold">{t('radius')}</span>
                        <span className="text-xs sm:text-sm text-black font-medium block">
                          {selectedMission.radius}m
                        </span>
                      </div>
                      <div className="min-w-0">
                        <span className="block text-[10px] text-slate-400 uppercase font-bold">{t('location')}</span>
                        <span className="text-xs sm:text-sm text-black font-medium truncate block" title={selectedMission.area_name || `${selectedMission.lat}, ${selectedMission.lng}`}>
                          {selectedMission.area_name || `${selectedMission.lat}, ${selectedMission.lng}`}
                        </span>
                      </div>
                    </div>

                    {/* Reporter Details */}
                    <div className="space-y-2 min-w-0">
                      <h4 className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
                        {t('reporter_information')}
                      </h4>
                      <div className="p-3 sm:p-4 bg-white border border-slate-100 rounded-xl shadow-sm space-y-3 min-w-0">
                        {selectedMission.reporter ? (
                          <>
                            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-marine-accent/10 rounded-full flex items-center justify-center text-marine-accent shrink-0">
                                <User className="w-4 h-4 sm:w-4 sm:h-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs sm:text-sm font-black text-slate-900 truncate">{selectedMission.reporter.full_name}</p>
                                <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">{t('verified_guardian')}</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 pt-2 border-t border-slate-50 min-w-0">
                              <div className="min-w-0">
                                <p className="text-[8px] sm:text-[9px] text-slate-400 font-black uppercase tracking-widest mb-0.5 sm:mb-1">{t('mobile')}</p>
                                <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5 truncate">
                                  <Phone size={10} className="shrink-0" /> <span className="truncate">{selectedMission.reporter.mobile}</span>
                                </p>
                              </div>
                              <div className="min-w-0">
                                <p className="text-[8px] sm:text-[9px] text-slate-400 font-black uppercase tracking-widest mb-0.5 sm:mb-1">{t('govt_id')}</p>
                                <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5 truncate">
                                  <ShieldIcon size={10} className="shrink-0" /> <span className="truncate">{selectedMission.reporter.id_code}</span>
                                </p>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center gap-2 text-slate-400 italic py-2 min-w-0">
                            <AlertCircle size={16} className="shrink-0" />
                            <p className="text-xs truncate">{t('reporter_data_unavailable')}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Navigation Brief */}
                    {selectedMission.status === "IN_PROGRESS" && (
                      <div className="space-y-2 min-w-0">
                        <h4 className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
                          {t('navigation_brief')}
                        </h4>
                        <div className="p-3 sm:p-4 bg-slate-900 text-white rounded-2xl shadow-xl overflow-hidden relative">
                          {/* Background Decoration */}
                          <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12 pointer-events-none">
                            <Navigation size={80} className="sm:w-[100px] sm:h-[100px]" />
                          </div>

                          {currentLocation ? (
                            <div className="space-y-3 sm:space-y-4 relative z-10">
                              <div className="flex items-center justify-between gap-2 min-w-0">
                                <div className="space-y-0.5 sm:space-y-1 min-w-0">
                                  <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{t('distance_to_target')}</p>
                                  <p className="text-xl sm:text-2xl font-black truncate">
                                    {calculateDistance(
                                      currentLocation.lat, 
                                      currentLocation.lng, 
                                      selectedMission.lat, 
                                      selectedMission.lng
                                    ).toFixed(2)} <span className="text-[10px] sm:text-xs text-slate-400">NM</span>
                                  </p>
                                </div>
                                <div className="text-right space-y-0.5 sm:space-y-1 min-w-0">
                                  <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{t('bearing')}</p>
                                  <p className="text-xl sm:text-2xl font-black truncate">
                                    {calculateBearing(
                                      currentLocation.lat, 
                                      currentLocation.lng, 
                                      selectedMission.lat, 
                                      selectedMission.lng
                                    ).toFixed(0)}° <span className="text-[10px] sm:text-xs text-slate-400">{getCardinalDirection(
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
                                className="w-full bg-white text-slate-900 py-2.5 sm:py-3 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-100 transition-all shadow-sm"
                              >
                                <ExternalLink size={14} className="shrink-0" /> <span className="truncate">{t('open_external_maps')}</span>
                              </a>
                            </div>
                          ) : (
                            <div className="py-3 sm:py-4 flex flex-col items-center gap-2 sm:gap-3">
                              <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                              <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse text-center">{t('acquiring_intercept')}</p>
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
                          "w-full font-bold py-3 sm:py-4 px-4 rounded-xl flex items-center justify-center gap-2 transition-all text-xs sm:text-sm",
                          session 
                            ? "bg-marine-accent text-white hover:shadow-[0_0_20px_rgba(14,165,233,0.3)]" 
                            : "bg-slate-100 text-slate-400 cursor-not-allowed"
                        )}
                      >
                          <span className="truncate">{session ? t('initialize_mission') : t('sign_in_initialize')}</span> <ShieldCheck size={18} className="shrink-0" />
                      </button>
                    ) : (
                      <div className="space-y-3 sm:space-y-4 min-w-0">
                        {/* Retrieval Evidence UI */}
                        <div className="space-y-2 min-w-0">
                          <h4 className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
                            {t('retrieval_evidence')}
                          </h4>
                          <div className="relative group">
                            {retrievalImage ? (
                              <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500 aspect-video group">
                                <img src={retrievalImage} alt="Evidence" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                                  <CheckCircle2 className="text-white drop-shadow-lg w-10 h-10 sm:w-12 sm:h-12" />
                                </div>
                                <button 
                                  onClick={() => setRetrievalImage(null)}
                                  className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Camera size={14} className="sm:w-4 sm:h-4" />
                                </button>
                              </div>
                            ) : (
                              <label className="flex flex-col items-center justify-center w-full h-24 sm:h-32 border-2 border-dashed border-slate-200 rounded-2xl bg-white hover:bg-slate-50 transition-colors cursor-pointer p-4 text-center shadow-sm">
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
                                    <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-marine-accent border-t-transparent rounded-full animate-spin" />
                                    <span className="text-[9px] sm:text-[10px] font-black text-marine-accent uppercase">{t('uploading')}</span>
                                  </div>
                                ) : (
                                  <>
                                    <Camera className="text-slate-400 mb-1.5 sm:mb-2 w-6 h-6 sm:w-8 sm:h-8" />
                                    <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('capture_proof')}</span>
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
                                "w-full font-bold py-3 sm:py-4 px-3 rounded-xl flex items-center justify-center gap-1.5 sm:gap-2 transition-all text-xs sm:text-sm",
                                session && (isOnSite || isDevMode) && retrievalImage
                                  ? "bg-emerald-500 text-white hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] shadow-lg" 
                                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
                              )}
                            >
                              {!retrievalImage ? (
                                <><span className="truncate">{t('evidence_required')}</span> <Camera size={16} className="shrink-0" /></>
                              ) : (!isOnSite && !isDevMode) ? (
                                <><span className="truncate">{t('too_far')} ({dist.toFixed(1)} NM)</span> <Anchor size={16} className="shrink-0" /></>
                              ) : (
                                <><span className="truncate">{t('complete_retrieval')}</span> <CheckCircle2 size={16} className="shrink-0" /></>
                              )}
                            </button>
                          );
                        })()}
                      </div>
                    )}
                    
                    {!session && (
                      <div className="p-3 sm:p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-2 sm:gap-3">
                        <Lock size={14} className="text-amber-500 shrink-0 sm:w-4 sm:h-4" />
                        <p className="text-[9px] sm:text-[10px] font-black text-amber-700 uppercase tracking-widest leading-tight">{t('authorization_required')}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {missions.length === 0 && !loading && (
          <div className="py-12 sm:py-20 text-center glass-card border-dashed opacity-50 p-4 sm:p-8">
            <CheckCircle2 className="mx-auto mb-3 sm:mb-4 text-emerald-500 w-10 h-10 sm:w-12 sm:h-12" />
            <p className="text-xs sm:text-sm text-slate-500 font-bold uppercase tracking-widest">{t('all_hazards_cleared')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
