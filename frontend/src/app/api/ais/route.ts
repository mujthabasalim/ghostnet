import { NextResponse } from 'next/server';

export async function GET() {
  // Simulate Real-time AIS Movement
  // We use the current minute/second to create a deterministic but moving offset
  const now = Date.now();
  const timeOffset = (now % 60000) / 60000; // 0 to 1 loop every minute

  const vessels = [
    { 
      id: 'v1', 
      name: 'Ocean Guard', 
      lat: 7.8731 + (Math.sin(now / 20000) * 0.01), 
      lng: 80.7718 + (Math.cos(now / 20000) * 0.01), 
      course: 120, 
      speed: 12 
    },
    { 
      id: 'v2', 
      name: 'Blue Fin', 
      lat: 7.9 + (Math.cos(now / 25000) * 0.015), 
      lng: 80.8 + (Math.sin(now / 25000) * 0.015), 
      course: 45, 
      speed: 15 
    },
    { 
      id: 'v3', 
      name: 'Poseidon', 
      lat: 7.85 + (Math.sin(now / 15000) * 0.008), 
      lng: 80.7 + (Math.sin(now / 15000) * 0.008), 
      course: 270, 
      speed: 8 
    },
    { 
      id: 'v4', 
      name: 'Sea Ranger', 
      lat: 7.865 + (Math.cos(now / 30000) * 0.02), 
      lng: 80.75 + (Math.sin(now / 30000) * 0.02), 
      course: 310, 
      speed: 18 
    },
  ];
  
  return NextResponse.json(vessels);
}
