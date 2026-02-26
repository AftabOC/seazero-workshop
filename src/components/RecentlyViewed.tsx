"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import GymCard, { GymCardData } from "./GymCard";

export default function RecentlyViewed() {
  const [gyms, setGyms] = useState<GymCardData[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("recentlyViewed");
      if (stored) {
        const parsed = JSON.parse(stored) as GymCardData[];
        setGyms(parsed.slice(0, 6));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  if (gyms.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Clock className="h-7 w-7 text-primary" />
          Recently Viewed
        </h2>
        <p className="mt-2 text-muted-foreground">Pick up where you left off</p>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {gyms.map((gym) => (
          <GymCard key={gym.id} gym={gym} />
        ))}
      </div>
    </section>
  );
}
