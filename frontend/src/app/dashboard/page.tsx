"use client";

import dynamic from 'next/dynamic';

const DashboardComponent = dynamic(() => import('./DashboardComponent'), { 
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-marine-accent/30 border-t-marine-accent rounded-full animate-spin" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Syncing Tactical Data...</p>
      </div>
    </div>
  )
});

export default function DashboardPage() {
  return <DashboardComponent />;
}
