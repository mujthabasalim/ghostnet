"use client";

import React, { useEffect, useState } from "react";
import { Search, User, Compass, LogOut, AlertTriangle, X } from "lucide-react";
import NotificationCenter from "./NotificationCenter";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function TopBar() {
  const [user, setUser] = useState<any>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowLogoutConfirm(false);
    router.push("/");
  };

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-30 shadow-sm"
      >
        <div className="flex items-center gap-4 flex-1">
          <div className="relative max-w-md w-full">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search coordinates, vessels, or IDs..."
              className="w-full bg-slate-50 border border-slate-200 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-marine-accent focus:ring-4 focus:ring-marine-accent/10 focus:bg-white transition-all font-medium"
            />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <NotificationCenter />

          <div className="hidden lg:flex items-center gap-2 px-4 py-1.5 bg-slate-100 rounded-full border border-slate-200 text-[10px] font-black tracking-wider text-slate-600">
            <Compass
              size={14}
              className="animate-spin duration-4000 text-marine-accent"
            />
            <span>7.8731° N, 80.7718° E</span>
          </div>

          <div className="flex items-center gap-4 pl-6 border-l border-slate-100">
            {user ? (
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-slate-900 leading-none">
                  {user.user_metadata?.full_name || "Guardian"}
                </p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">
                  {user.user_metadata?.user_type?.replace("_", " ") ||
                    "Registered User"}{" "}
                  • {user.user_metadata?.id_code || "N/A"}
                </p>
              </div>
            ) : (
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-slate-400 leading-none italic">
                  Guest Guardian
                </p>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">
                  View-Only Access
                </p>
              </div>
            )}

            <div className="group relative">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-2xl bg-gradient-to-br from-marine-accent to-marine-cyan flex items-center justify-center text-white shadow-lg shadow-marine-accent/20 cursor-pointer"
              >
                <User size={20} />
              </motion.div>

              {user && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-2xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 p-2">
                  <button
                    onClick={() => setShowLogoutConfirm(true)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-rose-500 hover:bg-rose-50 rounded-lg text-xs font-black uppercase tracking-widest transition-colors"
                  >
                    <LogOut size={16} /> Disconnect
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-rose-500" />

              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mx-auto mb-6">
                  <AlertTriangle size={32} />
                </div>

                <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                  Confirm Disconnect
                </h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  Are you sure you want to terminate your current session? You
                  will need to re-authenticate for field operations.
                </p>
              </div>

              <div className="p-4 bg-slate-50 flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Disconnect
                </button>
              </div>

              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
