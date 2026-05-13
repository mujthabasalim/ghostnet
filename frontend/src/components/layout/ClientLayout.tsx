"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import MobileNav from "@/components/layout/MobileNav";
import PageTransition from "@/components/ui/PageTransition";
import { cn } from "@/lib/utils";
import { LanguageProvider } from '@/context/LanguageContext';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isLandingPage = pathname === "/";

  if (!mounted) {
    return (
      <div className="flex h-screen w-screen bg-white overflow-hidden items-center justify-center">
        <div className="w-10 h-10 border-4 border-marine-accent/30 border-t-marine-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <LanguageProvider>
      <div className="flex h-screen w-screen bg-slate-50 overflow-hidden selection:bg-marine-accent/30 selection:text-marine-accent">
        {!isLandingPage && <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />}
        <div 
          className={cn(
            "flex-1 flex flex-col min-w-0 transition-all duration-500",
            !isLandingPage && (isCollapsed ? "lg:ml-20" : "lg:ml-[280px]")
          )}
        >
          {!isLandingPage && <TopBar />}
          <main className={cn(
            "flex-1 overflow-y-auto",
            !isLandingPage && "p-4 md:p-8 pb-24 lg:pb-8"
          )}>
            <PageTransition>
              {children}
            </PageTransition>
          </main>
          {!isLandingPage && <MobileNav />}
        </div>
      </div>
    </LanguageProvider>
  );
}
