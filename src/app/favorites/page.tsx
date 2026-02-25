"use client";

import Link from "next/link";
import { Heart, LogIn } from "lucide-react";

export default function FavoritesPage() {
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
