"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Globe, CheckCircle2, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'en', name: 'English', native: 'English', flag: '🇺🇸' },
    { code: 'ml', name: 'Malayalam', native: 'മലയാളം', flag: '🇮🇳' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' }
  ];

  const currentLang = languages.find(l => l.code === language);

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
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 active:scale-95 group shadow-sm",
          isOpen 
            ? "bg-slate-900 border-slate-900 text-white shadow-slate-200" 
            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
        )}
      >
        <Globe 
          size={18} 
          className={cn(
            "transition-colors duration-300",
            isOpen ? "text-marine-accent" : "text-slate-400 group-hover:text-marine-accent"
          )} 
        />
        <span className="text-xs font-black uppercase tracking-widest hidden sm:block">
          {currentLang?.code}
        </span>
        <ChevronDown 
          size={14} 
          className={cn(
            "transition-transform duration-500 hidden sm:block", 
            isOpen ? "rotate-180 text-marine-accent" : "text-slate-300"
          )} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            className="absolute right-0 mt-3 w-64 bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden z-50 p-4"
          >
            <div className="px-3 pb-3 mb-2 border-b border-slate-50">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Select Language</p>
            </div>

            <div className="space-y-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code as any);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-2xl transition-all duration-300 text-left group",
                    language === lang.code 
                      ? "bg-slate-50 text-slate-900" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm transition-all duration-300",
                      language === lang.code ? "bg-white scale-110 shadow-md" : "bg-slate-100 group-hover:bg-white group-hover:scale-105"
                    )}>
                      {lang.flag}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase tracking-widest opacity-60">
                        {lang.name}
                      </span>
                      <span className="text-sm font-bold">
                        {lang.native}
                      </span>
                    </div>
                  </div>
                  {language === lang.code && (
                    <motion.div
                      layoutId="activeLang"
                      className="w-1.5 h-1.5 bg-marine-accent rounded-full shadow-[0_0_8px_rgba(14,165,233,0.5)]"
                    />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
