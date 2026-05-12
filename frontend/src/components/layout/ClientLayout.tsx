"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import PageTransition from "@/components/ui/PageTransition";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);

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
    <div className="flex h-screen w-screen bg-marine-900 overflow-hidden">
      {!isLandingPage && <Sidebar />}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${!isLandingPage ? "lg:ml-64" : ""}`}>
        {!isLandingPage && <TopBar />}
        <main className="flex-1 overflow-y-auto">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
