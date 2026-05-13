"use client";

import React, { useState } from "react";
import {
  MapPin,
  Layers,
  Info,
  Compass,
  CloudRain,
  Maximize2,
  CheckCircle2,
  ArrowRight,
  ChevronLeft,
  Camera,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const LocationMap = dynamic(() => import("./map/LocationMap"), { ssr: false });

const stepVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
};

const NET_TYPES = ["Gill Net", "Trawl Net", "Drift Net", "Other"];

const suggestSeaArea = (lat: number, lng: number) => {
  let area = "Indian Ocean";
  if (lng < 79.8) area = "Laccadive Sea";
  else if (lng > 81.5) area = "Bay of Bengal";
  else if (lat > 8.5 && lng < 79.9) area = "Gulf of Mannar";
  
  // Create a sector based on coordinate decimals for a "pro" feel
  const sector = (Math.floor(lat * 10) % 10) + (Math.floor(lng * 10) % 10);
  return `${area} - Zone ${sector || 1}`;
};

export default function ReportForm() {
  const [step, setStep] = useState(1);
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    netType: "Gill Net",
    length: "",
    color: "",
    floatColor: "",
    floatDesc: "",
    areaName: "",
    depth: "",
    weather: "",
    notes: "",
    lat: "",
    lng: "",
    imageUrl: "",
    isDevReport: false,
  });
  const [loading, setLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [session, setSession] = useState<any>(null);
  const router = useRouter();

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const nextStep = () => {
    if (step === 1) {
      getLocation();
    }
    setStep((s) => s + 1);
  };
  const prevStep = () => setStep((s) => s - 1);

  const getLocation = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      setSubmitError("Geolocation is not supported by your browser");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setFormData((prev) => ({
          ...prev,
          lat: lat.toFixed(6),
          lng: lng.toFixed(6),
          areaName: prev.areaName || suggestSeaArea(lat, lng),
        }));
        setIsLocating(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setSubmitError("Unable to retrieve your location. Please ensure GPS is enabled.");
        setIsLocating(false);
      }
    );
  };

  const handleImageCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `reports/${fileName}`;

      const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, imageUrl: publicUrl }));
    } catch (err: any) {
      setSubmitError("Image upload failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setSubmitError("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (result.success) {
        setSubmitted(true);
      } else {
        throw new Error(result.error || "Failed to submit report");
      }
    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateRadius = (length: string) => {
    const l = parseFloat(length) || 0;
    return (l * 1.5).toFixed(0);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            {t('report_lost_net')}
          </h2>
          <span className="text-sm text-slate-400 font-bold uppercase tracking-widest">
            {t('step_1_of_3').replace('1', step.toString())}
          </span>
        </div>
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(step / 3) * 100}%` }}
            transition={{ duration: 0.5, ease: "circOut" }}
            className="h-full bg-marine-accent shadow-[0_0_15px_rgba(14,165,233,0.4)]"
          />
        </div>
      </div>

      <div className="glass-card p-10 min-h-[500px] flex flex-col relative overflow-hidden">
        {!session && (
          <div className="absolute inset-0 z-50 bg-white/60 backdrop-blur-md flex flex-col items-center justify-center p-10 text-center">
            <div className="w-20 h-20 bg-marine-accent/10 rounded-full flex items-center justify-center text-marine-accent mb-6 border border-marine-accent/20">
              <Lock size={40} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Restricted Access</h3>
            <p className="text-slate-500 mb-8 max-w-xs font-medium">Only verified Guardians can issue hazard reports. Please sign in to continue.</p>
            <div className="flex flex-col w-full gap-3">
              <button 
                onClick={() => router.push('/auth')}
                className="bg-marine-accent text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-marine-accent/30 transition-all"
              >
                Sign In
              </button>
              <button 
                onClick={() => router.push('/auth/register')}
                className="bg-white border border-slate-200 text-slate-600 font-bold py-4 rounded-xl hover:bg-slate-50 transition-all"
              >
                Register
              </button>
            </div>
          </div>
        )}
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              className="py-12 text-center space-y-8 flex-1 flex flex-col justify-center"
            >
              <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                <CheckCircle2 size={48} />
              </div>
              <div className="space-y-3">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                  {t('report_transmitted')}
                </h3>
                <p className="text-slate-500 text-lg">
                  {t('hazard_id_generated')}
                </p>
              </div>
                <button
                onClick={() => (window.location.href = "/dashboard")}
                className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
              >
                {t('return_dashboard')}
              </button>
            </motion.div>
          ) : step === 1 ? (
            <motion.div
              key="step1"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">
                    {t('net_type')}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {NET_TYPES.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, netType: type })
                        }
                        className={cn(
                          "py-4 px-4 rounded-2xl text-sm font-bold border transition-all duration-300",
                          formData.netType === type
                            ? "bg-marine-accent border-marine-accent text-white shadow-lg shadow-marine-accent/20 scale-105"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:border-marine-accent/50 hover:bg-white",
                        )}
                      >
                        {type === "Gill Net" ? t('gill_net') : 
                         type === "Trawl Net" ? t('trawl_net') : 
                         type === "Drift Net" ? t('drift_net') : t('other')}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">
                    {t('net_length')}
                  </label>
                  <input
                    type="number"
                    value={formData.length}
                    onChange={(e) =>
                      setFormData({ ...formData, length: e.target.value })
                    }
                    placeholder="e.g. 500"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-slate-900 focus:outline-none focus:border-marine-accent focus:bg-white focus:ring-4 focus:ring-marine-accent/10 transition-all font-bold"
                  />
                  {formData.length && (
                    <motion.p
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-[10px] text-marine-accent font-black uppercase tracking-widest"
                    >
                      Calculated Hazard Radius:{" "}
                      {calculateRadius(formData.length)}m
                    </motion.p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">
                    {t('float_color')}
                  </label>
                  <input
                    type="text"
                    value={formData.floatColor}
                    onChange={(e) =>
                      setFormData({ ...formData, floatColor: e.target.value })
                    }
                    placeholder="e.g. Neon Orange"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-slate-900 focus:outline-none focus:border-marine-accent focus:bg-white focus:ring-4 focus:ring-marine-accent/10 transition-all font-bold"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">
                    {t('float_description')}
                  </label>
                  <input
                    type="text"
                    value={formData.floatDesc}
                    onChange={(e) =>
                      setFormData({ ...formData, floatDesc: e.target.value })
                    }
                    placeholder="e.g. Large blue buoy with white stripe"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-slate-900 focus:outline-none focus:border-marine-accent focus:bg-white focus:ring-4 focus:ring-marine-accent/10 transition-all font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-10">
                <button
                  onClick={nextStep}
                  className="bg-marine-accent text-white font-black px-10 py-4 rounded-2xl flex items-center gap-3 hover:shadow-2xl hover:shadow-marine-accent/30 transition-all hover:scale-105 active:scale-95 group"
                >
                  {t('next_step')}: {t('location_details')}{" "}
                  <ArrowRight
                    size={22}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </button>
              </div>
            </motion.div>
          ) : step === 2 ? (
            <motion.div
              key="step2"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-8"
            >
              <div className="bg-white border border-slate-200 rounded-3xl p-2 h-[300px] relative overflow-hidden shadow-sm group">
                {isLocating ? (
                  <div className="h-full flex flex-col items-center justify-center gap-4 bg-slate-50">
                    <div className="w-12 h-12 border-4 border-marine-accent/20 border-t-marine-accent rounded-full animate-spin" />
                    <p className="text-sm font-black text-slate-900 uppercase tracking-widest animate-pulse">
                      {t('acquiring_gps')}
                    </p>
                  </div>
                ) : formData.lat && formData.lng ? (
                  <div className="h-full relative">
                    <LocationMap 
                      lat={parseFloat(formData.lat)} 
                      lng={parseFloat(formData.lng)} 
                    />
                    <div className="absolute top-4 right-4 z-[1001]">
                      <button 
                        onClick={getLocation}
                        className="bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-slate-200 text-marine-accent hover:scale-105 active:scale-95 transition-all"
                        title={t('refresh_location')}
                      >
                        <Compass size={20} className="animate-pulse" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center gap-4 bg-slate-50">
                    <MapPin size={40} className="text-slate-300" />
                    <button 
                      onClick={getLocation}
                      className="bg-marine-accent text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
                    >
                      {t('gps_initialize')}
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center gap-8 py-2">
                <div className="text-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">{t('latitude')}</p>
                  <p className="text-lg font-mono font-black text-slate-900">{formData.lat || "---"}</p>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div className="text-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">{t('longitude')}</p>
                  <p className="text-lg font-mono font-black text-slate-900">{formData.lng || "---"}</p>
                </div>
              </div>

              <div className="p-6 bg-amber-50 border border-amber-100 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/20 text-amber-600 rounded-lg">
                      <AlertCircle size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-amber-900 uppercase tracking-tight">{t('spatial_integrity')}</p>
                      <p className="text-xs text-amber-700 font-medium">{t('spatial_integrity_msg')}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={formData.isDevReport}
                      onChange={(e) => setFormData({...formData, isDevReport: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                    <span className="ml-3 text-xs font-black text-amber-900 uppercase tracking-widest">{t('simulation_mode')}</span>
                  </label>
                </div>
              </div>



              <div className="space-y-3">
                <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">
                  {t('sea_area_name')}
                </label>
                <input
                  type="text"
                  value={formData.areaName}
                  onChange={(e) => setFormData({ ...formData, areaName: e.target.value })}
                  placeholder={t('eg_bay_of_bengal')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-slate-900 focus:outline-none focus:border-marine-accent focus:bg-white transition-all font-bold"
                />
              </div>

              <div className="flex justify-between pt-10">
                <button
                  onClick={prevStep}
                  className="text-slate-400 font-black px-10 py-4 rounded-2xl flex items-center gap-3 hover:bg-slate-100 transition-all"
                >
                  <ChevronLeft size={22} /> {t('back')}
                </button>
                <button
                  onClick={nextStep}
                  className="bg-marine-accent text-white font-black px-10 py-4 rounded-2xl flex items-center gap-3 hover:shadow-2xl hover:shadow-marine-accent/30 transition-all hover:scale-105 active:scale-95 group"
                >
                  {t('next_step')}: {t('additional_info')}{" "}
                  <ArrowRight
                    size={22}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step3"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">
                    {t('estimated_depth')}
                  </label>
                  <input
                    type="number"
                    value={formData.depth}
                    onChange={(e) =>
                      setFormData({ ...formData, depth: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-slate-900 focus:outline-none focus:border-marine-accent font-bold"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">
                    {t('weather_condition')}
                  </label>
                  <select
                    value={formData.weather}
                    onChange={(e) =>
                      setFormData({ ...formData, weather: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-slate-900 focus:outline-none focus:border-marine-accent font-bold cursor-pointer"
                  >
                    <option>{t('calm')}</option>
                    <option>{t('rough')}</option>
                    <option>{t('stormy')}</option>
                    <option>{t('clear')}</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">
                  {t('evidence_capture')}
                </label>
                <div className="flex flex-col gap-6">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageCapture}
                    className="hidden"
                    id="camera-capture"
                  />
                  {formData.imageUrl ? (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="relative w-full aspect-video rounded-3xl overflow-hidden border-4 border-white shadow-2xl group"
                    >
                      <img 
                        src={formData.imageUrl} 
                        className="w-full h-full object-cover" 
                        alt="Captured hazard" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg">
                            <CheckCircle2 size={24} />
                          </div>
                          <div>
                            <p className="text-white font-black uppercase tracking-widest text-xs">{t('image_verified')}</p>
                            <p className="text-white/70 text-[10px] font-medium">{t('metadata_attached')}</p>
                          </div>
                        </div>
                      </div>
                      <label 
                        htmlFor="camera-capture"
                        className="absolute top-4 right-4 bg-white/20 backdrop-blur-md hover:bg-white/40 text-white p-3 rounded-2xl cursor-pointer transition-all border border-white/30"
                      >
                        <Maximize2 size={20} />
                      </label>
                    </motion.div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl gap-4">
                      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100">
                        <Camera className="text-slate-300" size={32} />
                      </div>
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{t('no_evidence')}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-center">
                    <label
                      htmlFor="camera-capture"
                      className={cn(
                        "flex items-center gap-4 px-8 py-4 rounded-2xl font-black uppercase tracking-widest transition-all cursor-pointer shadow-lg active:scale-95",
                        formData.imageUrl
                          ? "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                          : "bg-marine-accent text-white hover:shadow-marine-accent/30"
                      )}
                    >
                      <Camera size={24} />
                      {formData.imageUrl ? t('retake_photo') : t('open_camera')}
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">
                  {t('notes_comments')}
                </label>
                <textarea
                  rows={4}
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-slate-900 focus:outline-none focus:border-marine-accent focus:bg-white transition-all font-medium"
                  placeholder={t('notes_placeholder')}
                />
              </div>

              {submitError && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-rose-500 text-sm font-bold flex items-center gap-2 p-4 bg-rose-50 rounded-2xl border border-rose-100"
                >
                  <AlertCircle size={20} /> {submitError}
                </motion.p>
              )}

              <div className="flex justify-between pt-10">
                <button
                  onClick={prevStep}
                  disabled={loading}
                  className="text-slate-400 font-black px-10 py-4 rounded-2xl flex items-center gap-3 hover:bg-slate-100 transition-all disabled:opacity-50"
                >
                  <ChevronLeft size={22} /> {t('back')}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-emerald-500 text-white font-black px-12 py-4 rounded-2xl flex items-center gap-3 hover:shadow-2xl hover:shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-70 disabled:scale-100"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {t('transmitting')}
                    </>
                  ) : (
                    <>
                      {t('submit_hazard_report')} <CheckCircle2 size={22} />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
