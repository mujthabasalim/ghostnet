"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Hero } from "@/components/home/Hero";
import { FeatureSection } from "@/components/home/FeatureSection";
import { StatsSection } from "@/components/home/StatsSection";
import { CtaSection } from "@/components/home/CtaSection";
import { Anchor } from "lucide-react";

/**
 * GhostNet Landing Page
 * Redesigned with a mobile-first, premium UI approach.
 * Uses modular components for better maintainability and type safety.
 */
export default function LandingPage() {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Check for existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 selection:bg-marine-accent/30 selection:text-marine-accent">
      {/* Hero Section - Mobile First & Animated */}
      <Hero session={session} />

      {/* Feature Section - Intelligent Grid */}
      <FeatureSection />

      {/* Stats Section - Social Proof & Impact */}
      <StatsSection />

      {/* CTA Section - Conversion Focus */}
      <CtaSection session={session} />

      {/* Minimal Footer */}
      <footer className="py-12 px-4 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Anchor size={24} className="text-marine-accent" />
            <span className="font-black text-xl tracking-tighter">
              GHOSTNET
            </span>
          </div>
          <p className="text-slate-500 font-medium text-sm">
            © {new Date().getFullYear()} GhostNet Marine Conservation. All
            rights reserved.
          </p>
          <div className="flex gap-8">
            <a
              href="#"
              className="text-slate-400 hover:text-marine-accent transition-colors font-semibold text-sm"
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-slate-400 hover:text-marine-accent transition-colors font-semibold text-sm"
            >
              Terms
            </a>
            <a
              href="#"
              className="text-slate-400 hover:text-marine-accent transition-colors font-semibold text-sm"
            >
              Contact
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
