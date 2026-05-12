import { NextResponse } from 'next/server';

export async function GET() {
  // Mock AIS Data
  const vessels = [
    { id: 'v1', name: 'Ocean Guard', lat: 7.8731, lng: 80.7718, course: 120, speed: 12 },
    { id: 'v2', name: 'Blue Fin', lat: 7.9, lng: 80.8, course: 45, speed: 15 },
    { id: 'v3', name: 'Poseidon', lat: 7.85, lng: 80.7, course: 270, speed: 8 },
  ];
  
  return NextResponse.json(vessels);
}
