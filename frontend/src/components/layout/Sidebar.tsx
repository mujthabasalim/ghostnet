"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Anchor, 
  Map as MapIcon, 
  PlusCircle, 
  History, 
  Settings, 
  Bell, 
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(true);
  const { t } = useLanguage();

  const navItems = [
    { name: t('dashboard'), href: '/dashboard', icon: MapIcon },
    { name: t('report_net'), href: '/report', icon: PlusCircle },
    { name: t('retrievals'), href: '/retrievals', icon: ShieldCheck },
    { name: t('archive'), href: '/archive', icon: History },
  ];

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2.5 bg-white border border-slate-200 rounded-xl shadow-lg lg:hidden hover:bg-slate-50 transition-colors"
      >
        {isOpen ? <X size={20} className="text-slate-600" /> : <Menu size={20} className="text-slate-600" />}
      </button>

      <motion.aside 
        initial={false}
        animate={{ 
          width: isOpen ? 256 : 80,
          x: 0
        }}
        className={cn(
          "fixed left-0 top-0 h-screen bg-white/80 backdrop-blur-xl border-r border-slate-100 transition-all duration-500 z-40 shadow-[10px_0_30px_rgba(0,0,0,0.02)]",
          !isOpen && "hidden lg:block"
        )}
      >
        <div className="flex flex-col h-full p-5">
          <motion.div 
            className="flex items-center gap-3 mb-12 px-1"
            layout
          >
            <motion.div 
              whileHover={{ rotate: 10, scale: 1.1 }}
              className="p-2.5 bg-gradient-to-br from-marine-accent to-marine-cyan rounded-2xl shadow-lg shadow-marine-accent/30 text-white"
            >
              <Anchor size={24} />
            </motion.div>
            <AnimatePresence>
              {isOpen && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-xl font-black tracking-tighter text-slate-900"
                >
                  GHOST<span className="text-marine-accent">NET</span>
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>

          <nav className="flex-1 space-y-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 p-3.5 rounded-2xl transition-all duration-300 group relative",
                    isActive 
                      ? "bg-slate-900 text-white shadow-xl shadow-slate-900/10" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <Icon size={22} className={cn("shrink-0", isActive ? "text-white" : "group-hover:text-slate-900")} />
                  <AnimatePresence>
                    {isOpen && (
                      <motion.span 
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -5 }}
                        className="font-bold text-sm"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {isActive && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute left-0 w-1 h-6 bg-marine-accent rounded-full -translate-x-1"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="pt-6 border-t border-slate-100 space-y-3">
            <Link href="/settings" className={cn(
              "flex items-center gap-3 p-3.5 rounded-2xl transition-all duration-300 group relative",
              pathname === '/settings' ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            )}>
              <Settings size={22} />
              <AnimatePresence>
                {isOpen && (
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="font-bold text-sm"
                  >
                    {t('settings')}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
