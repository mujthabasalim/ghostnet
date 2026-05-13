"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Anchor, User, Compass, LogOut, AlertTriangle, X } from "lucide-react";
import NotificationHub from "../notifications/NotificationHub";
import LanguageSwitcher from "./LanguageSwitcher";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLanguage } from '@/context/LanguageContext';

const suggestSeaArea = (lat: number, lng: number) => {
  let area = "Indian Ocean";
  if (lng < 79.8) area = "Laccadive Sea";
  else if (lng > 81.5) area = "Bay of Bengal";
  else if (lat > 8.5 && lng < 79.9) area = "Gulf of Mannar";
  const sector = (Math.floor(lat * 10) % 10) + (Math.floor(lng * 10) % 10);
  return `${area} - Zone ${sector || 1}`;
};

export default function TopBar() {
  const { t } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [areaName, setAreaName] = useState<string>(t('detecting_location'));
  const router = useRouter();
  const menuRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserMenu]);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };

    getUser();

    // Get live location for TopBar
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });
        setAreaName(suggestSeaArea(latitude, longitude));
      }, (err) => {
        console.error("TopBar location error:", err);
        setAreaName(t('maritime_zone_unknown'));
      });
    }

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
    setShowUserMenu(false);
    router.push("/");
  };

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 shadow-sm"
      >
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-gradient-to-br from-marine-accent to-marine-cyan rounded-xl shadow-lg shadow-marine-accent/20 text-white group-hover:scale-110 transition-transform">
              <Anchor size={20} />
            </div>
            <span className="text-lg font-black tracking-tighter text-slate-900">
              GHOST<span className="text-marine-accent">NET</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden md:flex items-center gap-3 px-4 py-1.5 bg-slate-100 rounded-full border border-slate-200 text-[10px] font-black tracking-wider text-slate-600 shadow-sm">
            <Compass
              size={14}
              className={cn("text-marine-accent", currentLocation ? "animate-pulse" : "animate-spin")}
            />
            <div className="flex flex-col items-start leading-none gap-0.5">
              <span className="text-slate-900 uppercase">{areaName}</span>
              {currentLocation && (
                <span className="text-slate-400 font-bold opacity-70">
                  {currentLocation.lat.toFixed(4)}° N, {currentLocation.lng.toFixed(4)}° E
                </span>
              )}
            </div>
          </div>

          <LanguageSwitcher />
          <NotificationHub />

          <div className="flex items-center gap-2 md:gap-4 pl-2 md:pl-6 border-l border-slate-100 relative" ref={menuRef}>
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden lg:block">
                  <p className="text-sm font-black text-slate-900 leading-none">
                    {user.user_metadata?.full_name || t('welcome_back')}
                  </p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">
                    {user.user_metadata?.user_type?.replace("_", " ") ||
                      t('registered_user')}
                  </p>
                </div>
                
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-10 h-10 rounded-2xl bg-gradient-to-br from-marine-accent to-marine-cyan flex items-center justify-center text-white shadow-lg shadow-marine-accent/20 hover:scale-105 active:scale-95 transition-all"
                >
                  <User size={20} />
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-full mt-3 w-64 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-50 p-4"
                    >
                      <div className="mb-4 pb-4 border-b border-slate-50">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">User Account</p>
                        <p className="text-base font-black text-slate-900 truncate">
                          {user.user_metadata?.full_name || user.email}
                        </p>
                        <p className="text-[10px] text-marine-accent font-bold uppercase tracking-wider">
                          {user.user_metadata?.user_type?.replace("_", " ") || "Member"} • {user.user_metadata?.id_code || "N/A"}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setShowLogoutConfirm(true);
                        }}
                        className="w-full flex items-center justify-between px-4 py-3 bg-rose-50 text-rose-500 hover:bg-rose-100 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors group"
                      >
                        <span className="flex items-center gap-2">
                          <LogOut size={16} /> Logout
                        </span>
                        <X size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                <User size={20} />
              </div>
            )}
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
                  {t('confirm_disconnect')}
                </h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  {t('logout_warning')}
                </p>
              </div>

              <div className="p-4 bg-slate-50 flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-200 transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {t('disconnect')}
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
