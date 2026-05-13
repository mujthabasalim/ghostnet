"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Map as MapIcon, 
  PlusCircle, 
  History, 
  Settings, 
  ShieldCheck 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function MobileNav() {
  const pathname = usePathname();
  
  const navItems = [
    { href: '/report', icon: PlusCircle, label: 'Report' },
    { href: '/retrievals', icon: ShieldCheck, label: 'Mission' },
    { href: '/dashboard', icon: MapIcon, label: 'Home' },
    { href: '/archive', icon: History, label: 'Archive' },
    { href: '/settings', icon: Settings, label: 'Settings' },
  ];

  // Find the index of the active item
  const activeIndex = navItems.findIndex(item => pathname === item.href);
  const activeIdx = activeIndex === -1 ? 2 : activeIndex; // Default to Home if no match

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 lg:hidden">
      <div className="relative h-20 bg-white border-t border-slate-100 flex items-center shadow-[0_-15px_50px_rgba(0,0,0,0.08)]">
        
        {/* Animated Indicator (The Circle & Curve) */}
        <motion.div 
          className="absolute h-full flex justify-center items-center pointer-events-none"
          initial={false}
          animate={{ 
            left: `${activeIdx * 20}%`,
            width: '20%'
          }}
          transition={{ type: "spring", stiffness: 350, damping: 35 }}
        >
          {/* Floating Circle Background */}
          <div className="absolute -top-10 w-16 h-16 bg-slate-900 rounded-full shadow-2xl shadow-slate-900/40 z-20" />
          
          {/* Deep Curve Mask (SVG) */}
          <div className="absolute top-0 w-28 h-10 -translate-y-[1px] z-10">
            <svg viewBox="0 0 100 40" className="w-full h-full fill-white stroke-slate-100 stroke-[0.5]">
              <path d="M0 0 C15 0 15 0 25 0 C35 0 35 30 50 30 C65 30 65 0 75 0 C85 0 85 0 100 0" />
            </svg>
          </div>
        </motion.div>

        {/* Navigation Items */}
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = index === activeIdx;

          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className="flex-1 h-full relative z-30 flex flex-col items-center justify-center"
            >
              {/* Icon Container */}
              <motion.div
                initial={false}
                animate={{ 
                  y: isActive ? -42 : 0,
                  color: isActive ? "#ffffff" : "#94a3b8",
                  scale: isActive ? 1 : 1
                }}
                transition={{ type: "spring", stiffness: 350, damping: 35 }}
                className={cn(
                  "relative z-40 flex items-center justify-center",
                )}
              >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </motion.div>

              {/* Label */}
              <motion.span 
                initial={false}
                animate={{ 
                  opacity: isActive ? 1 : 0.6,
                  y: isActive ? 20 : 0,
                  color: isActive ? "#0ea5e9" : "#94a3b8"
                }}
                className={cn(
                  "text-[9px] font-black uppercase tracking-widest transition-colors duration-300 whitespace-nowrap"
                )}
              >
                {item.label}
              </motion.span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
