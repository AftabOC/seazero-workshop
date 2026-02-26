"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Heart, Share2 } from "lucide-react";
import BookingModal from "./BookingModal";

interface GymActionsProps {
  gymId: string;
  gymName: string;
  gymSlug: string;
}

export function GymBookingButtons({ gymId, gymName }: { gymId: string; gymName: string }) {
  const [modalType, setModalType] = useState<"trial" | "inquiry" | null>(null);

  return (
    <>
      <button
        onClick={() => setModalType("trial")}
        className="w-full rounded-xl gradient-primary px-4 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
      >
        Book a Trial Visit
      </button>
      <button
        onClick={() => setModalType("inquiry")}
        className="w-full rounded-xl border px-4 py-3 text-sm font-semibold text-foreground hover:bg-secondary transition-colors"
      >
        Send Inquiry
      </button>

      {modalType && (
        <BookingModal
          gymId={gymId}
          gymName={gymName}
          type={modalType}
          onClose={() => setModalType(null)}
        />
      )}
    </>
  );
}

export function GymFavoriteButton({ gymId }: { gymId: string }) {
  const { data: session } = useSession();
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleFavorite = async () => {
    if (!session) {
      window.location.href = "/auth/login";
      return;
    }

    setLoading(true);
    try {
      if (favorited) {
        await fetch(`/api/favorites?gymId=${gymId}`, { method: "DELETE" });
        setFavorited(false);
      } else {
        await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gymId }),
        });
        setFavorited(true);
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className="flex h-10 w-10 items-center justify-center rounded-full border hover:bg-secondary transition-colors disabled:opacity-50"
    >
      <Heart className={`h-5 w-5 transition-colors ${favorited ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
    </button>
  );
}

export function GymShareButton({ gymName, gymSlug }: { gymName: string; gymSlug: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = `${window.location.origin}/gyms/${gymSlug}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: `${gymName} — FindMyGym`, url });
        return;
      } catch {
        // User cancelled or share failed, fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard failed silently
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex h-10 w-10 items-center justify-center rounded-full border hover:bg-secondary transition-colors relative"
    >
      <Share2 className="h-5 w-5 text-muted-foreground" />
      {copied && (
        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 rounded bg-foreground px-2 py-1 text-xs text-white whitespace-nowrap">
          Link copied!
        </span>
      )}
    </button>
  );
}

export default function GymActions({ gymId, gymName, gymSlug }: GymActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <GymFavoriteButton gymId={gymId} />
      <GymShareButton gymName={gymName} gymSlug={gymSlug} />
    </div>
  );
}
