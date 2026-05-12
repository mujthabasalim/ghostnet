"use client";

import dynamic from 'next/dynamic';

const Map = dynamic(() => import('./Map'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-marine-900 animate-pulse">
      <div className="text-center text-slate-500 font-mono text-sm tracking-widest uppercase">
        Establishing Satellite Link...
      </div>
    </div>
  )
});

export default Map;
