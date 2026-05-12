"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import {
  Anchor,
  Shield,
  Map as MapIcon,
  ArrowRight,
  Waves as WavesIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

export default function LandingPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mounted, setMounted] = React.useState(false);
  const [session, setSession] = React.useState<any>(null);

  useEffect(() => {
    setMounted(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.error("Video autoplay failed:", error);
      });
    }
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-white">
      {/* Background Video */}
      <div className="absolute inset-0 z-0 bg-slate-100">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="w-full object-cover opacity-80"
        >
          <source src="/video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        {/* <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px]" /> */}
        <div className="absolute inset-0 bg-linear-to-b from-white/40 via-transparent to-white/60" />
      </div>

      {/* Floating Bubbles */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {mounted &&
          [...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-marine-accent/10 rounded-full blur-[1px] animate-float"
              style={{
                width: `${Math.random() * 30 + 10}px`,
                height: `${Math.random() * 30 + 10}px`,
                left: `${Math.random() * 100}%`,
                bottom: `-50px`,
                animationDelay: `${Math.random() * 15}s`,
                animationDuration: `${Math.random() * 10 + 15}s`,
              }}
            />
          ))}
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="z-20 flex flex-col items-center justify-center text-center px-4 pt-20 pb-32 max-w-7xl mx-auto"
      >
        <motion.div
          variants={itemVariants}
          className="mb-8 p-6 bg-marine-accent/10 rounded-full border border-marine-accent/30 shadow-[0_0_50px_rgba(14,165,233,0.1)]"
        >
          <Anchor size={48} className="text-marine-accent" />
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-6xl md:text-9xl font-black text-slate-900 mb-6 tracking-tighter leading-[0.85]"
        >
          OCEAN{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-slate-800 to-marine-accent">
            PROTECTION
          </span>
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-marine-accent via-marine-cyan to-slate-900 drop-shadow-sm">
            REDESIGNED.
          </span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-xl md:text-2xl text-slate-700 max-w-3xl mb-12 leading-relaxed font-medium"
        >
          Experience the future of marine conservation. Intelligent ghost net
          tracking and retrieval coordination powered by real-time AIS data.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-6 mb-24"
        >
          <Link
            href="/dashboard"
            className="group relative flex items-center gap-3 bg-marine-accent text-white px-10 py-5 rounded-full font-bold text-xl overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-[0_0_40px_rgba(14,165,233,0.4)]"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <span className="relative z-10">Launch Dashboard</span>
            <ArrowRight
              size={24}
              className="relative z-10 group-hover:translate-x-2 transition-transform"
            />
          </Link>
          {session ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-3 glass text-slate-900 px-10 py-5 rounded-full font-bold text-xl hover:bg-white/80 transition-all duration-300 border border-slate-200"
            >
              Go to Command Center
            </Link>
          ) : (
            <Link
              href="/auth"
              className="flex items-center gap-3 glass text-slate-900 px-10 py-5 rounded-full font-bold text-xl hover:bg-white/80 transition-all duration-300 border border-slate-200"
            >
              Sign In
            </Link>
          )}
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full"
        >
          <div className="glass-card p-8 group hover:border-marine-accent/50 transition-colors">
            <div className="w-14 h-14 bg-marine-accent/10 rounded-2xl flex items-center justify-center text-marine-accent mb-6 group-hover:scale-110 transition-transform">
              <MapIcon size={28} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3 text-left">
              Ocean Intelligence
            </h3>
            <p className="text-slate-600 text-left leading-relaxed">
              Deep-sea mapping with satellite AIS integration for precise hazard
              monitoring.
            </p>
          </div>

          <div className="glass-card p-8 group hover:border-rose-500/50 transition-colors">
            <div className="w-14 h-14 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 mb-6 group-hover:scale-110 transition-transform">
              <Shield size={28} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3 text-left">
              Guardian Shield
            </h3>
            <p className="text-slate-600 text-left leading-relaxed">
              Advanced proximity alerts protecting vessels and marine wildlife
              from entanglement.
            </p>
          </div>

          <div className="glass-card p-8 group hover:border-emerald-500/50 transition-colors">
            <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mb-6 group-hover:scale-110 transition-transform">
              <WavesIcon size={28} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3 text-left">
              Wave Coordination
            </h3>
            <p className="text-slate-600 text-left leading-relaxed">
              Real-time mission management for rapid retrieval of ghost fishing
              gear.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
