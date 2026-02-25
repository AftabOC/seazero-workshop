"use client";

import Link from "next/link";
import { useState } from "react";
import { Dumbbell, Menu, X, Search, User, Heart } from "lucide-react";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
            <Dumbbell className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold gradient-text">FindMyGym</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/gyms" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Explore Gyms
          </Link>
          <Link href="/compare" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Compare
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/gyms" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-secondary transition-colors">
            <Search className="h-4 w-4 text-muted-foreground" />
          </Link>
          <Link href="/favorites" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-secondary transition-colors">
            <Heart className="h-4 w-4 text-muted-foreground" />
          </Link>
          <Link
            href="/auth/login"
            className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-secondary transition-colors"
          >
            <User className="h-4 w-4" />
            Sign In
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg hover:bg-secondary"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-white px-4 py-4 space-y-3">
          <Link href="/gyms" className="block py-2 text-sm font-medium hover:text-primary" onClick={() => setMobileOpen(false)}>
            Explore Gyms
          </Link>
          <Link href="/compare" className="block py-2 text-sm font-medium hover:text-primary" onClick={() => setMobileOpen(false)}>
            Compare
          </Link>
          <Link href="/favorites" className="block py-2 text-sm font-medium hover:text-primary" onClick={() => setMobileOpen(false)}>
            Favorites
          </Link>
          <Link
            href="/auth/login"
            className="block w-full text-center rounded-lg gradient-primary px-4 py-2.5 text-sm font-medium text-white"
            onClick={() => setMobileOpen(false)}
          >
            Sign In
          </Link>
        </div>
      )}
    </header>
  );
}
