"use client";

import { useState, useEffect } from 'react';

export interface Vessel {
  id: string;
  name: string;
  lat: number;
  lng: number;
  course: number;
  speed: number;
}

export function useAIS() {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVessels = async () => {
      try {
        const response = await fetch('/api/ais');
        const data = await response.json();
        setVessels(data);
      } catch (error) {
        console.error('Failed to fetch AIS data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVessels();
    const interval = setInterval(fetchVessels, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  return { vessels, loading };
}
