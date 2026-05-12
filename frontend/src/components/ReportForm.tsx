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
import { CldUploadWidget } from "next-cloudinary";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

const MapPicker = dynamic(() => import("./map/MapPicker"), { ssr: false });

const stepVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
};

const NET_TYPES = ["Gill Net", "Trawl Net", "Drift Net", "Other"];

export default function ReportForm() {
  const [step, setStep] = useState(1);
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
        setFormData((prev) => ({
          ...prev,
          lat: position.coords.latitude.toFixed(6),
          lng: position.coords.longitude.toFixed(6),
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
            Report Lost Net
          </h2>
          <span className="text-sm text-slate-400 font-bold uppercase tracking-widest">
            STEP {step} OF 3
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
                  Report Transmitted
                </h3>
                <p className="text-slate-500 text-lg">
                  Hazard ID generated. Nearby vessels have been notified.
                </p>
              </div>
              <button
                onClick={() => (window.location.href = "/dashboard")}
                className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
              >
                Return to Command Center
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
                    Net Type
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
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">
                    Net Length (Meters)
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
                    Float Color
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
                    Float Description
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
                  Next: Location Details{" "}
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
              <div className="bg-slate-900/5 border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center relative overflow-hidden">
                {isLocating ? (
                  <div className="py-10 flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-marine-accent/20 border-t-marine-accent rounded-full animate-spin" />
                    <p className="text-sm font-black text-slate-900 uppercase tracking-widest animate-pulse">
                      Acquiring Satellite Lock...
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-2">
                      <Compass size={32} className="animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-slate-900">GPS Locked</h4>
                      <p className="text-slate-500 text-sm font-medium">Hardware-verified coordinates from your device.</p>
                    </div>
                    <div className="flex items-center justify-center gap-8 py-4">
                      <div className="text-center">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Latitude</p>
                        <p className="text-xl font-mono font-black text-slate-900">{formData.lat || "---"}</p>
                      </div>
                      <div className="w-px h-10 bg-slate-200" />
                      <div className="text-center">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Longitude</p>
                        <p className="text-xl font-mono font-black text-slate-900">{formData.lng || "---"}</p>
                      </div>
                    </div>
                    <button 
                      onClick={getLocation}
                      className="text-xs font-black text-marine-accent uppercase tracking-widest hover:underline"
                    >
                      Refresh GPS
                    </button>
                  </div>
                )}
              </div>

              <div className="p-6 bg-amber-50 border border-amber-100 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/20 text-amber-600 rounded-lg">
                      <AlertCircle size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-amber-900 uppercase tracking-tight">Spatial Integrity</p>
                      <p className="text-xs text-amber-700 font-medium">Reporting from land is restricted in production.</p>
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
                    <span className="ml-3 text-xs font-black text-amber-900 uppercase tracking-widest">Simulation Mode</span>
                  </label>
                </div>
              </div>



              <div className="space-y-3">
                <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">
                  Sea Area Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bay of Bengal - Sector 4"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-slate-900 focus:outline-none focus:border-marine-accent focus:bg-white transition-all font-bold"
                />
              </div>

              <div className="flex justify-between pt-10">
                <button
                  onClick={prevStep}
                  className="text-slate-400 font-black px-10 py-4 rounded-2xl flex items-center gap-3 hover:bg-slate-100 transition-all"
                >
                  <ChevronLeft size={22} /> Back
                </button>
                <button
                  onClick={nextStep}
                  className="bg-marine-accent text-white font-black px-10 py-4 rounded-2xl flex items-center gap-3 hover:shadow-2xl hover:shadow-marine-accent/30 transition-all hover:scale-105 active:scale-95 group"
                >
                  Next: Additional Info{" "}
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
                    Estimated Depth (Meters)
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
                    Weather Condition
                  </label>
                  <select
                    value={formData.weather}
                    onChange={(e) =>
                      setFormData({ ...formData, weather: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-slate-900 focus:outline-none focus:border-marine-accent font-bold cursor-pointer"
                  >
                    <option>Calm</option>
                    <option>Rough</option>
                    <option>Stormy</option>
                    <option>Clear</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">
                  Evidence Capture
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageCapture}
                    className="hidden"
                    id="camera-capture"
                  />
                  <label
                    htmlFor="camera-capture"
                    className={cn(
                      "w-full py-12 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-4 transition-all duration-500 cursor-pointer group",
                      formData.imageUrl
                        ? "bg-emerald-50 border-emerald-300 shadow-lg shadow-emerald-500/10"
                        : "bg-slate-50 border-slate-200 hover:border-marine-accent/50 hover:bg-white"
                    )}
                  >
                    {formData.imageUrl ? (
                      <>
                        <div className="p-4 bg-emerald-500/20 rounded-full">
                          <CheckCircle2 className="text-emerald-500" size={40} />
                        </div>
                        <span className="text-lg font-black text-emerald-700 uppercase tracking-tight">Verified Capture</span>
                        <div className="w-32 h-20 rounded-xl overflow-hidden border border-emerald-200 shadow-sm">
                          <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Captured hazard" />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-4 bg-slate-200/50 rounded-full group-hover:bg-marine-accent/10 transition-colors">
                          <Camera
                            className="text-slate-400 group-hover:text-marine-accent transition-colors"
                            size={40}
                          />
                        </div>
                        <span className="text-lg font-bold text-slate-500 uppercase tracking-tight">Initialize Camera</span>
                        <p className="text-xs text-slate-400 font-medium">Direct hardware capture only (Gallery disabled)</p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">
                  Notes / Comments
                </label>
                <textarea
                  rows={4}
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-slate-900 focus:outline-none focus:border-marine-accent focus:bg-white transition-all font-medium"
                  placeholder="Describe surroundings, drift direction, or any other details..."
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
                  <ChevronLeft size={22} /> Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-emerald-500 text-white font-black px-12 py-4 rounded-2xl flex items-center gap-3 hover:shadow-2xl hover:shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-70 disabled:scale-100"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Transmitting...
                    </>
                  ) : (
                    <>
                      Submit Hazard Report <CheckCircle2 size={22} />
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
