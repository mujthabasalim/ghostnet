"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Anchor, ArrowRight, AlertCircle, Eye, EyeOff, Key } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) throw loginError;
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid login credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-10 max-w-md w-full relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-marine-accent to-marine-cyan" />
        
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-marine-accent/10 rounded-3xl flex items-center justify-center text-marine-accent mx-auto mb-6 border border-marine-accent/20 shadow-inner">
            <Key size={36} />
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Access Terminal</h2>
          <p className="text-slate-500 text-sm mt-3 font-medium">Verify your identity to engage in operations.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Guardian Email</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="guardian@ocean.com"
                className="w-full bg-white border border-slate-200 rounded-xl py-4 px-5 text-slate-900 focus:outline-none focus:border-marine-accent focus:ring-4 focus:ring-marine-accent/10 transition-all font-bold"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Security Key</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-slate-200 rounded-xl py-4 px-5 text-slate-900 focus:outline-none focus:border-marine-accent focus:ring-4 focus:ring-marine-accent/10 transition-all font-bold"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-600 text-xs font-bold"
            >
              <AlertCircle size={18} />
              {error}
            </motion.div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-marine-accent text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:shadow-[0_0_30px_rgba(14,165,233,0.4)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>Initiate Link <ArrowRight size={22} /></>
            )}
          </button>
        </form>

        <div className="mt-12 pt-8 border-t border-slate-100 text-center">
          <p className="text-slate-500 font-medium text-sm">
            Not yet a guardian? <br />
            <button 
              onClick={() => router.push('/auth/register')} 
              className="mt-2 text-marine-accent font-black hover:underline underline-offset-4 uppercase tracking-wider text-xs"
            >
              Register for deployment
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
