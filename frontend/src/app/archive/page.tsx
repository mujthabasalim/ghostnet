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
  Anchor
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ArchivePage() {
  const [nets, setNets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchNets = async () => {
      try {
        const res = await fetch('/api/reports');
        const data = await res.json();
        // Only show retrieved nets in archive
        setNets(data.filter((n: any) => n.status === 'RETRIEVED'));
      } catch (err) {
        console.error('Error fetching nets:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNets();
  }, []);
  return (
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
        <div className="glass-card p-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl">
              <Anchor size={24} />
            </div>
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Retrieved</h4>
          </div>
          <p className="text-4xl font-black text-slate-900 tracking-tight">1,284 <span className="text-sm text-emerald-500 font-black">meters</span></p>
        </div>
        <div className="glass-card p-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-2.5 bg-marine-accent/10 text-marine-accent rounded-xl">
              <Users size={24} />
            </div>
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Teams</h4>
          </div>
          <p className="text-4xl font-black text-slate-900 tracking-tight">42</p>
        </div>
        <div className="glass-card p-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl">
              <Clock size={24} />
            </div>
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Avg. Recovery</h4>
          </div>
          <p className="text-4xl font-black text-slate-900 tracking-tight">6.5 <span className="text-sm text-amber-500 font-black">hours</span></p>
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
                <th className="px-8 py-5">Type</th>
                <th className="px-8 py-5">Location</th>
                <th className="px-8 py-5">Retrieved At</th>
                <th className="px-8 py-5">Recovery Team</th>
                <th className="px-8 py-5">Duration</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {nets.map((net) => (
                <tr key={net.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6 text-sm font-mono font-black text-slate-900">GN-{net.id.substring(0, 5).toUpperCase()}</td>
                  <td className="px-8 py-6 text-sm text-slate-500 font-medium">{net.net_type}</td>
                  <td className="px-8 py-6 text-sm text-slate-500 font-medium">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-slate-300" />
                      {net.area_name || `${net.lat}, ${net.lng}`}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm text-slate-500 font-medium">{mounted ? new Date(net.retrieved_at || net.reported_at).toLocaleDateString() : '---'}</td>
                  <td className="px-8 py-6 text-sm font-black text-slate-700">{net.team || 'Standard Team'}</td>
                  <td className="px-8 py-6 text-sm text-slate-500 font-medium">--</td>
                  <td className="px-8 py-6 text-right">
                    <button className="text-marine-accent opacity-0 group-hover:opacity-100 transition-all text-xs font-black uppercase tracking-widest hover:underline underline-offset-4">Details</button>
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
  );
}
