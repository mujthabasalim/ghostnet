"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Map as MapIcon, 
  PlusCircle, 
  History, 
  Settings, 
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

export default function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navItems = [
    { name: t('dashboard'), href: '/dashboard', icon: MapIcon },
    { name: t('report_net'), href: '/report', icon: PlusCircle },
    { name: t('retrievals'), href: '/retrievals', icon: ShieldCheck },
    { name: t('archive'), href: '/archive', icon: History },
  ];

  return (
    <motion.aside 
      initial={false}
      animate={{ 
        width: isCollapsed ? 80 : 280,
      }}
      className={cn(
        "fixed left-0 top-0 h-screen bg-white border-r border-slate-100 transition-all duration-500 z-40 shadow-[10px_0_40px_rgba(0,0,0,0.03)] hidden lg:block overflow-hidden",
      )}
    >
      <div className="flex flex-col h-full">
        {/* Sidebar Toggle */}
        <div className="h-20 flex items-center justify-end px-6 relative">
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "p-2 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all duration-300",
              isCollapsed ? "mx-auto" : ""
            )}
          >
            {isCollapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>

        <div className="flex-1 px-4 py-6 space-y-2">
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
                    ? "bg-slate-900 text-white shadow-xl shadow-slate-900/20" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon size={22} className={cn("shrink-0", isActive ? "text-white" : "group-hover:text-slate-900")} />
                {!isCollapsed && (
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-bold text-sm whitespace-nowrap"
                  >
                    {item.name}
                  </motion.span>
                )}
                {isActive && (
                  <motion.div 
                    layoutId="sidebarActive"
                    className="absolute left-0 w-1 h-6 bg-marine-accent rounded-full -translate-x-1"
                  />
                )}
              </Link>
            );
          })}
        </div>

        <div className="px-4 py-6 border-t border-slate-50 space-y-2">
          <Link href="/settings" className={cn(
            "flex items-center gap-3 p-3.5 rounded-2xl transition-all duration-300 group relative",
            pathname === '/settings' ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
          )}>
            <Settings size={22} />
            {!isCollapsed && (
              <span className="font-bold text-sm whitespace-nowrap">{t('settings')}</span>
            )}
          </Link>
        </div>
      </div>
    </motion.aside>
  );
}
