"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Anchor, MousePointer2 } from "lucide-react";
import Image from "next/image";

interface HeroProps {
  session: any;
}

export const Hero: React.FC<HeroProps> = ({ session }) => {
  return (
    <section className="relative min-h-svh flex flex-col items-center justify-center overflow-hidden mesh-gradient pt-20 px-4">
      {/* Decorative SVG Waves */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-0 translate-y-1">
        <svg
          className="relative block w-[calc(134%+1.3px)] h-[150px] md:h-[200px]"
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.44,35.26,113.15,29.35,239.11,54.62,376.7,22.84,14.28-3.3,28.41-7.11,42.42-11.29V0Z"
            className="fill-white"
          ></path>
        </svg>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-[15%] left-[10%] w-64 h-64 bg-marine-accent/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            y: [0, 20, 0],
            rotate: [0, -5, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-[20%] right-[5%] w-96 h-96 bg-marine-cyan/5 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-marine-accent/10 border border-marine-accent/20 text-marine-accent font-semibold text-sm mb-8 backdrop-blur-sm"
        >
          <Anchor size={16} />
          <span>Next-Gen Marine Protection</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="text-5xl md:text-8xl lg:text-9xl font-black text-slate-950 mb-6 tracking-tight leading-[0.9]"
        >
          PRESERVING <br />
          <span className="text-gradient">OUR OCEANS.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-lg md:text-2xl text-slate-600 max-w-2xl mb-12 leading-relaxed font-medium px-4"
        >
          Advanced ghost net detection and retrieval coordination. Empowering
          the global community to protect marine life through real-time data.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-4 px-4 w-full sm:w-auto"
        >
          {session ? (
            <Link
              href="/dashboard"
              className="group relative flex items-center justify-center gap-2 bg-slate-950 text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all hover:bg-marine-accent hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-slate-200"
            >
              Enter Command Center
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          ) : (
            <>
              <Link
                href="/dashboard"
                className="group relative flex items-center justify-center gap-2 bg-slate-950 text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all hover:bg-marine-accent hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-slate-200"
              >
                Launch Dashboard
                <ArrowRight
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
              <Link
                href="/auth"
                className="flex items-center justify-center gap-2 bg-white text-slate-900 px-10 py-5 rounded-2xl font-bold text-lg border border-slate-200 transition-all hover:bg-slate-50 hover:border-slate-300"
              >
                Sign In
              </Link>
            </>
          )}
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-24 hidden md:flex flex-col items-center gap-2 text-slate-400"
        >
          <span className="text-xs font-bold tracking-widest uppercase">
            Discover More
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <MousePointer2 size={20} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
