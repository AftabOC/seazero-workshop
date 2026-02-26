"use client";

import { useEffect } from "react";
import { GymCardData } from "./GymCard";

interface TrackRecentViewProps {
  gym: GymCardData;
}

export default function TrackRecentView({ gym }: TrackRecentViewProps) {
  useEffect(() => {
    try {
      const stored = localStorage.getItem("recentlyViewed");
      const recent: GymCardData[] = stored ? JSON.parse(stored) : [];
      const filtered = recent.filter((g) => g.id !== gym.id);
      filtered.unshift(gym);
      localStorage.setItem("recentlyViewed", JSON.stringify(filtered.slice(0, 10)));
    } catch {
      // Ignore localStorage errors
    }
  }, [gym]);

  return null;
}
