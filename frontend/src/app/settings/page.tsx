"use client";

import React, { useState, useEffect } from 'react';
import { User, Phone, Globe, Save, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { language, setLanguage, t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: ''
  });

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        setFormData({
          fullName: session.user.user_metadata?.full_name || '',
          mobile: session.user.user_metadata?.mobile || ''
        });
      }
    };
    fetchUser();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Update Auth Metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { 
          full_name: formData.fullName,
          mobile: formData.mobile
        }
      });

      if (authError) throw authError;

      // 2. Update Public Profiles Table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          full_name: formData.fullName,
          mobile: formData.mobile
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      toast.success(t('profile_updated'));
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const languages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4">
      <div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
          {t('settings')}
        </h1>
        <p className="text-slate-500 font-medium">
          {t('manage_account_prefs')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Info & Security */}
        <div className="md:col-span-1 space-y-6">
          <div className="p-6 bg-slate-900 rounded-[2rem] text-white overflow-hidden relative group">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
               <ShieldCheck size={80} />
             </div>
             <h4 className="text-xs font-black text-marine-accent uppercase tracking-widest mb-2">{t('security_note')}</h4>
             <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
               {t('security_msg')}
             </p>
          </div>

          <div className="glass-card p-6 border-slate-100 bg-slate-50/50">
             <div className="flex items-center gap-3 mb-4">
               <div className="p-2 bg-marine-accent/10 text-marine-accent rounded-xl">
                 <Globe size={18} />
               </div>
               <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{t('localized_access')}</h4>
             </div>
             <p className="text-[10px] text-slate-500 font-medium leading-relaxed uppercase">
               {t('localized_access_msg')}
             </p>
          </div>
        </div>

        {/* Right Column: Profile Editing */}
        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handleUpdateProfile} className="glass-card p-8 space-y-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
                <User size={20} />
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                {t('edit_profile')}
              </h3>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    {t('full_name')}
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold focus:outline-none focus:border-marine-accent focus:bg-white transition-all"
                      placeholder="e.g. Salim Mujthaba"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    {t('mobile_number')}
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold focus:outline-none focus:border-marine-accent focus:bg-white transition-all"
                      placeholder="e.g. +91 9876543210"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-2">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('email_address')}</p>
                 <p className="text-sm font-bold text-slate-900 opacity-60">{user?.email}</p>
                 <p className="text-[9px] text-slate-400 font-medium italic mt-2">{t('email_change_note')}</p>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-10 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:shadow-2xl hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save size={18} />
                    {t('save_changes')}
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Account Status / Stats */}
          <div className="glass-card p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
             <div className="flex items-center gap-4">
               <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                  <ShieldCheck size={32} />
               </div>
               <div>
                  <h4 className="text-lg font-black text-slate-900 tracking-tight">{t('verified_specialist')}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('auth_id')}: {user?.user_metadata?.id_code || 'GUEST-001'}</p>
               </div>
             </div>
             <div className="flex gap-2">
                <span className="px-4 py-1.5 bg-emerald-100 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">{t('active')}</span>
                <span className="px-4 py-1.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest">V-Level 1</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper for class names
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
