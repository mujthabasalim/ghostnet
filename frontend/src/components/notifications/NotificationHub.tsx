"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Bell, BellRing, X, Trash2, ShieldAlert, CheckCircle2, Anchor } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'REPORT_CREATED' | 'RETRIEVAL_START' | 'RETRIEVAL_COMPLETE';
  is_read: boolean;
  created_at: string;
}

export default function NotificationHub() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load notifications from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('maritime_notifications');
    if (saved) {
      setNotifications(JSON.parse(saved));
    } else {
      // Optional: Seed with some "recent" data from DB if empty
      fetchInitialRecentEvents();
    }
  }, []);

  const fetchInitialRecentEvents = async () => {
    // Fetch latest 5 nets to show some initial history
    const { data, error } = await supabase
      .from('ghost_nets')
      .select('id, net_type, area_name, status, reported_at, retrieved_at')
      .order('reported_at', { ascending: false })
      .limit(5);

    if (!error && data) {
      const initialNotifs = data.map(net => ({
        id: net.id,
        title: net.status === 'RETRIEVED' ? 'Hazard Recovered' : 'New Hazard Reported',
        message: net.status === 'RETRIEVED' 
          ? `The ${net.net_type} in ${net.area_name} was cleared.`
          : `A ${net.net_type} spotted in ${net.area_name}.`,
        type: net.status === 'RETRIEVED' ? 'RETRIEVAL_COMPLETE' : 'REPORT_CREATED',
        is_read: true,
        created_at: net.retrieved_at || net.reported_at
      })) as Notification[];
      
      setNotifications(initialNotifs);
      localStorage.setItem('maritime_notifications', JSON.stringify(initialNotifs));
    }
  };

  // Real-time Subscription for Broadcasts
  useEffect(() => {
    const channel = supabase.channel('maritime-alerts')
      .on('broadcast', { event: 'new-hazard' }, ({ payload }) => {
        const newNotif: Notification = {
          ...payload,
          id: Math.random().toString(36).substring(7),
          is_read: false,
          created_at: new Date().toISOString(),
        };
        
        setNotifications(prev => {
          const updated = [newNotif, ...prev].slice(0, 5);
          localStorage.setItem('maritime_notifications', JSON.stringify(updated));
          return updated;
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const clearAll = () => {
    localStorage.removeItem('maritime_notifications');
    setNotifications([]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, is_read: true } : n);
      localStorage.setItem('maritime_notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all active:scale-95 group shadow-sm"
      >
        {unreadCount > 0 ? (
          <BellRing className="text-marine-accent animate-pulse" size={20} />
        ) : (
          <Bell className="text-slate-400 group-hover:text-slate-600" size={20} />
        )}
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-lg">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-4 w-80 bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden z-50"
          >
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Public Alerts</span>
                <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-[9px] font-black">{notifications.length}</span>
              </div>
              {notifications.length > 0 && (
                <button 
                  onClick={clearAll}
                  className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:bg-rose-50 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-2"
                >
                  <Trash2 size={12} /> Clear
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length > 0 ? (
                <div className="divide-y divide-slate-50">
                  {notifications.map((n) => (
                    <div 
                      key={n.id} 
                      onClick={() => markAsRead(n.id)}
                      className={cn(
                        "p-5 hover:bg-slate-50 transition-colors cursor-pointer group relative",
                        !n.is_read && "bg-marine-accent/5"
                      )}
                    >
                      {!n.is_read && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-marine-accent" />
                      )}
                      
                      <div className="flex gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                          n.type === 'REPORT_CREATED' ? "bg-rose-100 text-rose-600" :
                          n.type === 'RETRIEVAL_START' ? "bg-amber-100 text-amber-600" :
                          "bg-emerald-100 text-emerald-600"
                        )}>
                          {n.type === 'REPORT_CREATED' ? <ShieldAlert size={20} /> :
                           n.type === 'RETRIEVAL_START' ? <Anchor size={20} /> :
                           <CheckCircle2 size={20} />}
                        </div>
                        
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-wider">{n.title}</h4>
                            <span className="text-[9px] font-bold text-slate-400">
                              {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium leading-relaxed">{n.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-4">
                    <Bell size={32} />
                  </div>
                  <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest">Quiet Seas</h5>
                  <p className="text-[10px] text-slate-400 mt-2 font-medium">No alerts currently active in your area.</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50/50 text-center border-t border-slate-100">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Global Maritime Feed</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
