"use client";

import React, { useState, useEffect } from 'react';
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
  Award
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function ArchivePage() {
  const [nets, setNets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchNets = async () => {
      try {
        const res = await fetch('/api/reports');
        const data = await res.json();
        
        if (Array.isArray(data)) {
          // Only show retrieved nets in archive
          setNets(data.filter((n: any) => n.status === 'RETRIEVED'));
        } else {
          console.error('Invalid data format from API:', data);
          setNets([]);
        }
      } catch (err) {
        console.error('Error fetching nets:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNets();
  }, []);
  return (
    <>
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Retrieved Archive</h1>
          <p className="text-slate-500 font-medium">Historical record of successful recovery missions.</p>
        </div>
        <button className="flex items-center gap-3 px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-black hover:shadow-2xl hover:scale-105 transition-all group">
          <Download size={18} className="group-hover:-translate-y-1 transition-transform" /> Export Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-card p-8 relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
            <Anchor size={80} />
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
              <TrendingUp size={20} />
            </div>
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Recovery</h4>
          </div>
          <p className="text-4xl font-black text-slate-900 tracking-tight">{nets.length} <span className="text-sm text-emerald-500 font-black uppercase tracking-widest">Missions</span></p>
        </div>

        <div className="glass-card p-8 relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
            <ShieldCheck size={80} />
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-marine-accent/10 text-marine-accent rounded-xl">
              <Award size={20} />
            </div>
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Verified Assets</h4>
          </div>
          <p className="text-4xl font-black text-slate-900 tracking-tight">{nets.filter(n => n.retrieval_image_url).length} <span className="text-sm text-marine-accent font-black uppercase tracking-widest">Audited</span></p>
        </div>

        <div className="glass-card p-8 relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
            <Users size={80} />
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
              <Users size={20} />
            </div>
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Guardians</h4>
          </div>
          <p className="text-4xl font-black text-slate-900 tracking-tight">
            {new Set(nets.map(n => n.retriever?.full_name).filter(Boolean)).size || 1}
            <span className="text-sm text-amber-500 font-black uppercase tracking-widest ml-2">Specialists</span>
          </p>
        </div>
      </div>

      <div className="glass-card overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/40">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Historical Reports</h3>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Filter by ID, Team, or Area..." 
              className="bg-slate-50 border border-slate-200 rounded-full py-3 pl-11 pr-6 text-sm focus:outline-none focus:border-marine-accent focus:bg-white focus:ring-4 focus:ring-marine-accent/10 w-full font-medium transition-all"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/80 text-slate-400 text-[10px] uppercase tracking-widest font-black border-b border-slate-100">
                <th className="px-8 py-5">Hazard ID</th>
                <th className="px-8 py-5">Evidence (Before/After)</th>
                <th className="px-8 py-5">Type</th>
                <th className="px-8 py-5">Location</th>
                <th className="px-8 py-5">Retrieved By</th>
                <th className="px-8 py-5">Verification</th>
                <th className="px-8 py-5 text-right">Certificate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
               {nets.map((net) => (
                <tr 
                  key={net.id} 
                  onClick={() => setSelectedCertificate(net)}
                  className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                >
                  <td className="px-8 py-6 text-sm font-mono font-black text-slate-900">
                    GN-{net.id.substring(0, 5).toUpperCase()}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex -space-x-3 group-hover:space-x-1 transition-all duration-300">
                      <div className="w-10 h-10 rounded-lg border-2 border-white bg-slate-100 overflow-hidden shadow-sm">
                        {net.image_url && <img src={net.image_url} className="w-full h-full object-cover" />}
                      </div>
                      <div className="w-10 h-10 rounded-lg border-2 border-white bg-slate-100 overflow-hidden shadow-sm">
                        {net.retrieval_image_url && <img src={net.retrieval_image_url} className="w-full h-full object-cover" />}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm text-slate-500 font-medium">
                    <span className="bg-slate-100 px-2 py-1 rounded text-[10px] font-black uppercase tracking-tight">{net.net_type}</span>
                  </td>
                  <td className="px-8 py-6 text-sm text-slate-500 font-medium">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-slate-300" />
                        <span className="text-slate-900 font-bold">{net.area_name || "Unknown Area"}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold ml-5">
                        {mounted ? new Date(net.retrieved_at).toLocaleDateString() : '---'}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-marine-accent/10 flex items-center justify-center text-marine-accent">
                        <Users size={14} />
                      </div>
                      <span className="text-sm font-black text-slate-700">{net.retriever?.full_name || 'Guardian Fleet'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex gap-2">
                      {net.retrieval_image_url && (
                        <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg" title="Image Verified">
                          <CheckCircle2 size={16} />
                        </div>
                      )}
                      <div className="p-1.5 bg-marine-50 text-marine-600 rounded-lg" title="GPS Verified">
                        <ShieldCheck size={16} />
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="p-2 text-slate-400 hover:text-marine-accent hover:bg-marine-50 rounded-xl transition-all">
                      <FileText size={20} />
                    </button>
                  </td>
                </tr>
              ))}
              {nets.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="px-8 py-20 text-center text-slate-400 font-bold uppercase tracking-widest opacity-50">
                    No archived missions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-6 bg-slate-50/30 text-center border-t border-slate-50">
          <button className="text-slate-400 text-xs font-black uppercase tracking-widest hover:text-slate-900 transition-colors py-2 px-6 rounded-full hover:bg-white shadow-sm border border-transparent hover:border-slate-200">Load More History</button>
        </div>
      </div>
    </div>

      {/* Retrieval Certificate Modal */}
      <AnimatePresence>
        {selectedCertificate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
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
              className="relative w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row"
            >
              {/* Image Comparison Side */}
              <div className="w-full md:w-1/2 bg-slate-100 p-8 space-y-6 overflow-y-auto max-h-[40vh] md:max-h-full">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Initial Report</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase">{new Date(selectedCertificate.reported_at).toLocaleDateString()}</span>
                  </div>
                  <div className="aspect-video bg-white rounded-3xl overflow-hidden border-2 border-white shadow-lg">
                    {selectedCertificate.image_url ? (
                      <img src={selectedCertificate.image_url} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                        <FileText size={48} />
                        <span className="text-xs font-bold uppercase mt-2">No Report Image</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Verified Recovery</span>
                    <span className="text-[10px] font-black text-emerald-500 uppercase">{selectedCertificate.retrieved_at ? new Date(selectedCertificate.retrieved_at).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div className="aspect-video bg-white rounded-3xl overflow-hidden border-2 border-emerald-500 shadow-lg relative group">
                    {selectedCertificate.retrieval_image_url ? (
                      <img src={selectedCertificate.retrieval_image_url} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                        <FileText size={48} />
                        <span className="text-xs font-bold uppercase mt-2">No Retrieval Evidence</span>
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-emerald-500 text-white p-2 rounded-xl shadow-lg">
                      <CheckCircle2 size={20} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Details Side */}
              <div className="w-full md:w-1/2 p-10 flex flex-col bg-white overflow-y-auto">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Retrieval Certificate</h2>
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Hazard Tracking GN-{selectedCertificate.id.substring(0, 8).toUpperCase()}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedCertificate(null)}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <X size={24} className="text-slate-400" />
                  </button>
                </div>

                <div className="space-y-8 flex-1">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Type</p>
                      <p className="text-lg font-black text-slate-900">{selectedCertificate.net_type}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sea Area</p>
                      <p className="text-lg font-black text-slate-900">{selectedCertificate.area_name || "Unknown"}</p>
                    </div>
                  </div>

                  <div className="p-6 bg-slate-50 rounded-3xl space-y-4 border border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-marine-accent shadow-sm">
                        <Users size={24} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Retrieval Specialist</p>
                        <p className="text-sm font-black text-slate-900">{selectedCertificate.retriever?.full_name || "Verified Guardian"}</p>
                        <p className="text-[10px] text-marine-accent font-bold uppercase tracking-wider">ID: {selectedCertificate.retriever?.id_code || "---"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-emerald-500">
                      <ShieldCheck size={20} />
                      <span className="text-xs font-black uppercase tracking-widest">Protocol Verified</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      This recovery operation has been verified via the GhostNet Maritime Protocol. Hardware-locked GPS coordinates and image evidence have been audited and archived for government compliance.
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => window.print()}
                  className="mt-10 w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:shadow-2xl transition-all active:scale-95"
                >
                  <Download size={18} /> Download Official Record
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
