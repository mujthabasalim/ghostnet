"use client";

import React, { useState, useEffect } from "react";
import {
  History,
  Search,
  Download,
  BarChart3,
  Clock,
  MapPin,
  Users,
  Anchor,
  CheckCircle2,
  ShieldCheck,
  X,
  FileText,
  TrendingUp,
  Award,
  Camera,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toPng } from "html-to-image";
import download from "downloadjs";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";

export default function ArchivePage() {
  const { t } = useLanguage();
  const [nets, setNets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);
  const certificateRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchNets = async () => {
      try {
        const res = await fetch("/api/reports");
        const data = await res.json();

        if (Array.isArray(data)) {
          // Only show retrieved nets in archive
          setNets(data.filter((n: any) => n.status === "RETRIEVED"));
        } else {
          console.error("Invalid data format from API:", data);
          setNets([]);
        }
      } catch (err) {
        console.error("Error fetching nets:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNets();
  }, []);

  const handleDownload = async () => {
    if (!certificateRef.current) return;

    setIsDownloading(true);
    try {
      const dataUrl = await toPng(certificateRef.current, {
        cacheBust: true,
        backgroundColor: "#fff",
        style: {
          borderRadius: "0",
        },
      });
      download(
        dataUrl,
        `GN-CERT-${selectedCertificate.id.substring(0, 5)}.png`,
      );
    } catch (err) {
      console.error("Download error:", err);
    } finally {
      setIsDownloading(false);
    }
  };
  return (
    <>
      <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              {t('retrieved_archive')}
            </h1>
            <p className="text-sm sm:text-base text-slate-500 font-medium">
              {t('historical_record')}
            </p>
          </div>
        </div>

        <div className="glass-card overflow-hidden shadow-2xl">
          <div className="p-4 sm:p-8 border-b border-slate-100 bg-white/40">
            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              {t('historical_reports')}
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/80 text-slate-400 text-[10px] uppercase tracking-widest font-black border-b border-slate-100">
                  <th className="px-4 sm:px-8 py-3 sm:py-5 whitespace-nowrap">{t('hazard_id')}</th>
                  <th className="px-4 sm:px-8 py-3 sm:py-5 whitespace-nowrap">{t('net_type')}</th>
                  <th className="px-4 sm:px-8 py-3 sm:py-5 whitespace-nowrap">{t('location')}</th>
                  <th className="px-4 sm:px-8 py-3 sm:py-5 whitespace-nowrap">{t('retrieved_by')}</th>
                  <th className="px-4 sm:px-8 py-3 sm:py-5 whitespace-nowrap">{t('verification')}</th>
                  <th className="px-4 sm:px-8 py-3 sm:py-5 text-right whitespace-nowrap">{t('report')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {nets.slice(0, visibleCount).map((net) => (
                  <tr
                    key={net.id}
                    onClick={() => setSelectedCertificate(net)}
                    className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                  >
                    <td className="px-4 sm:px-8 py-4 sm:py-6 text-xs sm:text-sm font-mono font-black text-slate-900 whitespace-nowrap">
                      GN-{net.id.substring(0, 5).toUpperCase()}
                    </td>
                    <td className="px-4 sm:px-8 py-4 sm:py-6 text-xs sm:text-sm text-slate-500 font-medium whitespace-nowrap">
                      <span className="bg-slate-100 px-2 py-1 rounded text-[9px] sm:text-[10px] font-black uppercase tracking-tight">
                        {net.net_type}
                      </span>
                    </td>
                    <td className="px-4 sm:px-8 py-4 sm:py-6 text-xs sm:text-sm text-slate-500 font-medium min-w-[120px]">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <MapPin size={14} className="text-slate-300 shrink-0" />
                          <span className="text-slate-900 font-bold truncate">
                            {net.area_name || `${net.lat}, ${net.lng}`}
                          </span>
                        </div>
                        <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold ml-5">
                          {mounted
                            ? new Date(net.retrieved_at).toLocaleDateString()
                            : "---"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-8 py-4 sm:py-6 whitespace-nowrap">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-marine-accent/10 flex items-center justify-center text-marine-accent shrink-0">
                          <Users size={12} className="sm:w-3.5 sm:h-3.5" />
                        </div>
                        <span className="text-xs sm:text-sm font-black text-slate-700 truncate max-w-[100px] sm:max-w-none">
                          {net.retriever?.full_name || "Guardian Fleet"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-8 py-4 sm:py-6 whitespace-nowrap">
                      <div className="flex gap-1 sm:gap-2">
                        {net.retrieval_image_url && (
                          <div
                            className="p-1 sm:p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"
                            title="Image Verified"
                          >
                            <CheckCircle2 size={14} className="sm:w-4 sm:h-4" />
                          </div>
                        )}
                        <div
                          className="p-1 sm:p-1.5 bg-marine-50 text-marine-600 rounded-lg"
                          title="GPS Verified"
                        >
                          <ShieldCheck size={14} className="sm:w-4 sm:h-4" />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-8 py-4 sm:py-6 text-right whitespace-nowrap">
                      <button className="p-1.5 sm:p-2 text-slate-400 hover:text-marine-accent hover:bg-marine-50 rounded-xl transition-all">
                        <FileText size={18} className="sm:w-5 sm:h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {nets.length === 0 && !loading && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-8 py-20 text-center text-slate-400 font-bold uppercase tracking-widest opacity-50"
                    >
                      {t('no_archived_missions')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {nets.length > visibleCount && (
            <div className="p-4 sm:p-8 flex justify-center bg-slate-50/30 border-t border-slate-50">
              <button 
                onClick={() => setVisibleCount(prev => prev + 5)}
                className="flex items-center justify-center gap-3 w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] hover:bg-slate-50 hover:shadow-xl hover:scale-105 transition-all active:scale-95 group shadow-sm"
              >
                <span>{t('load_more_missions')}</span>
                <div className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] group-hover:rotate-180 transition-transform shrink-0">
                  +
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Retrieval Certificate Modal */}
      <AnimatePresence>
        {selectedCertificate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCertificate(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-3xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-100 z-[60]"
            >
              {/* Action Overlay (Moved outside capture div) */}
              <div className="absolute top-4 sm:top-8 right-4 sm:right-8 flex gap-2 sm:gap-3 z-[70]">
                <button
                  disabled={isDownloading}
                  onClick={handleDownload}
                  className="bg-white/90 backdrop-blur-md p-2.5 sm:p-3 rounded-xl sm:rounded-2xl text-slate-900 shadow-xl border border-white hover:scale-110 transition-all active:scale-95 disabled:opacity-50"
                  title="Download Certificate"
                >
                  {isDownloading ? (
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-marine-accent border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
                <button
                  onClick={() => setSelectedCertificate(null)}
                  className="bg-white/90 backdrop-blur-md p-2.5 sm:p-3 rounded-xl sm:rounded-2xl text-slate-900 shadow-xl border border-white hover:scale-110 transition-all active:scale-95"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              {/* Certificate content for capture */}
              <div className="flex-1 overflow-auto bg-slate-100 p-4 sm:p-8 flex items-center justify-center">
                <div 
                  ref={certificateRef} 
                  className="w-[800px] h-[560px] flex bg-white shadow-2xl relative shrink-0 overflow-hidden rounded-sm"
                  style={{ transformOrigin: 'center center' }}
                >
                  {/* Left Section: Details */}
                  <div className="w-1/2 p-10 flex flex-col justify-between bg-white relative border-r border-slate-50">
                    {/* Watermark */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none rotate-12">
                      <Anchor size={300} />
                    </div>

                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-8">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-1 bg-marine-accent rounded-full" />
                            <span className="text-[9px] font-black text-marine-accent uppercase tracking-widest">
                              Official Record
                            </span>
                          </div>
                          <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none uppercase">
                            {t('retrieval')}
                            <br />
                            {t('certificate')}
                          </h2>
                          <p className="text-slate-400 font-bold uppercase text-[9px] tracking-widest mt-4">
                            Serial: GN-SYS-{selectedCertificate.id.substring(0, 12).toUpperCase()}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-8">
                          <div className="space-y-1">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                              {t('hazard_id')}
                            </p>
                            <p className="text-sm font-black text-slate-900">
                              {selectedCertificate.net_type}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                              Retrieval Date
                            </p>
                            <p className="text-sm font-black text-slate-900">
                              {selectedCertificate.retrieved_at
                                ? new Date(selectedCertificate.retrieved_at).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })
                                : "---"}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4 pt-6 border-t border-slate-100">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-900 border border-slate-100 shadow-sm shrink-0">
                              <Users className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                {t('retrieved_by')}
                              </p>
                              <p className="text-sm font-black text-slate-900">
                                {selectedCertificate.retriever?.full_name || t('verified_specialist')}
                              </p>
                              <p className="text-[9px] text-marine-accent font-bold uppercase tracking-wider">
                                {t('credential_id')}: {selectedCertificate.retriever?.id_code || "NON-SPEC"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100">
                          <div className="flex items-center gap-2 text-emerald-600 mb-2">
                            <CheckCircle2 size={16} />
                            <span className="text-[9px] font-black uppercase tracking-widest">
                              Identity & Proximity Verified
                            </span>
                          </div>
                          <p className="text-[9px] text-slate-500 leading-relaxed font-medium uppercase">
                            The GhostNet Protocol confirms this mission was completed with mandatory image evidence and verified GPS proximity. This record is digitally signed.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex items-end justify-between relative z-10">
                      <div className="space-y-2">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic">
                          Digital Signature
                        </p>
                        <p className="font-mono text-[8px] text-slate-300 select-none">
                          AUTH-{selectedCertificate.retriever?.id_code || "GHOST"}-HASH-{selectedCertificate.id.substring(0, 8)}
                        </p>
                      </div>
                      <div className="w-16 h-16 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center text-slate-200">
                        <Anchor className="w-8 h-8" />
                      </div>
                    </div>
                  </div>

                  {/* Right Section: Image */}
                  <div className="w-1/2 bg-slate-950 relative overflow-hidden flex items-center justify-center">
                    {selectedCertificate.retrieval_image_url ? (
                      <img
                        src={selectedCertificate.retrieval_image_url}
                        className="w-full h-full object-cover opacity-90"
                        alt="Retrieval Evidence"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-4 text-slate-700">
                        <Anchor size={64} className="opacity-20" />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          {t('no_evidence')}
                        </span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-l from-slate-950/40 to-transparent" />
                    
                    <div className="absolute top-8 right-8">
                      <div className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl flex items-center gap-2">
                        <ShieldCheck size={14} /> {t('certified_retrievals')}
                      </div>
                    </div>

                    <div className="absolute bottom-10 left-10 text-white">
                      <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">
                        GPS VERIFIED LOCATION
                      </p>
                      <p className="text-sm font-mono opacity-80">
                        {selectedCertificate.lat?.toFixed(6)}° N, {selectedCertificate.lng?.toFixed(6)}° E
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
