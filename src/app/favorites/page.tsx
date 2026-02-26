"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Heart, LogIn, Loader2 } from "lucide-react";
import GymCard, { GymCardData } from "@/components/GymCard";

export default function FavoritesPage() {
  const { data: session, status } = useSession();
  const [gyms, setGyms] = useState<GymCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/favorites")
        .then((r) => r.json())
        .then((data) => { setGyms(data.gyms || []); setLoading(false); })
        .catch(() => setLoading(false));
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">My Favorites</h1>
          <p className="mt-1 text-muted-foreground">Your saved gyms in one place</p>
        </div>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary mb-6">
            <Heart className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Sign in to see your favorites</h3>
          <p className="mt-2 text-sm text-muted-foreground text-center max-w-md">
            Create an account or sign in to save your favorite gyms and access them from any device.
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              href="/auth/login"
              className="flex items-center gap-2 rounded-xl gradient-primary px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </Link>
            <Link
              href="/gyms"
              className="rounded-xl border px-6 py-3 text-sm font-semibold text-foreground hover:bg-secondary transition-colors"
            >
              Browse Gyms
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">My Favorites</h1>
        <p className="mt-1 text-muted-foreground">
          {gyms.length > 0 ? `${gyms.length} saved gym${gyms.length > 1 ? "s" : ""}` : "Your saved gyms in one place"}
        </p>
      </div>

      {gyms.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {gyms.map((gym) => (
            <GymCard key={gym.id} gym={gym} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary mb-6">
            <Heart className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">No favorites yet</h3>
          <p className="mt-2 text-sm text-muted-foreground text-center max-w-md">
            Browse gyms and tap the heart icon to save your favorites here.
          </p>
          <Link
            href="/gyms"
            className="mt-6 rounded-xl gradient-primary px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
          >
            Browse Gyms
          </Link>
        </div>
      )}
    </div>
  );
}
