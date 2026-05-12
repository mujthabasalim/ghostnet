"use client";

import React, { useState } from 'react';
import { Bell, X, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New Ghost Net Reported', desc: 'Location: 7.8731° N, Sector 4. Warning issued.', type: 'alert', time: '5m ago' },
    { id: 2, title: 'Retrieval Started', desc: 'Team BlueFin initiated recovery of Net #G-1025.', type: 'info', time: '1h ago' },
    { id: 3, title: 'Mission Completed', desc: 'Hazard #G-0982 successfully removed from marine area.', type: 'success', time: '3h ago' },
  ]);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 glass rounded-lg text-slate-500 hover:text-marine-accent transition-all relative group"
      >
        <Bell size={20} />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white group-hover:animate-ping" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-4 w-80 glass-card p-4 z-50 animate-in fade-in slide-in-from-top-4 duration-200 shadow-2xl shadow-slate-200/50">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Notifications</h3>
              <button onClick={() => setIsOpen(false)}><X size={14} className="text-slate-400 hover:text-slate-900" /></button>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {notifications.map((n) => (
                <div key={n.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-marine-accent/30 transition-all cursor-pointer group">
                  <div className="flex gap-3">
                    <div className={cn(
                      "mt-0.5",
                      n.type === 'alert' ? "text-rose-500" : (n.type === 'info' ? "text-marine-accent" : "text-emerald-500")
                    )}>
                      {n.type === 'alert' ? <AlertTriangle size={18} /> : (n.type === 'info' ? <Info size={18} /> : <CheckCircle2 size={18} />)}
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900 leading-tight group-hover:text-marine-accent transition-colors">{n.title}</p>
                      <p className="text-[10px] text-slate-500 mt-1.5 leading-normal font-medium">{n.desc}</p>
                      <p className="text-[10px] text-slate-400 mt-2.5 font-bold uppercase tracking-wider">{n.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-marine-accent transition-colors">
              Clear All Notifications
            </button>
          </div>
        </>
      )}
    </div>
  );
}
