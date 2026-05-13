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
    { code: 'en', name: 'English', native: 'English' },
    { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' }
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
        className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all active:scale-95 group shadow-sm"
      >
        <Globe size={18} className="text-slate-400 group-hover:text-marine-accent transition-colors" />
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 hidden sm:block">
          {currentLang?.native}
        </span>
        <ChevronDown size={14} className={cn("text-slate-300 transition-transform", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-3 w-48 bg-white rounded-[1.5rem] shadow-2xl border border-slate-100 overflow-hidden z-50 p-2"
          >
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code as any);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-xl transition-all text-left",
                  language === lang.code 
                    ? "bg-slate-900 text-white shadow-lg" 
                    : "text-slate-600 hover:bg-slate-50"
                )}
              >
                <div className="flex flex-col">
                  <span className="text-[8px] font-black uppercase tracking-widest opacity-60">
                    {lang.name}
                  </span>
                  <span className="text-xs font-bold">
                    {lang.native}
                  </span>
                </div>
                {language === lang.code && (
                  <CheckCircle2 size={14} className="text-marine-accent" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
