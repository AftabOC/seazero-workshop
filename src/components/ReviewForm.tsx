"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Star, Loader2, LogIn } from "lucide-react";

interface ReviewFormProps {
  gymId: string;
  onReviewSubmitted?: () => void;
}

const CATEGORIES = [
  { key: "cleanliness", label: "Cleanliness" },
  { key: "equipment", label: "Equipment" },
  { key: "staff", label: "Staff" },
  { key: "valueForMoney", label: "Value for Money" },
];

function StarInput({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-foreground">{label}</span>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(star)}
            className="p-0.5"
          >
            <Star
              className={`h-5 w-5 transition-colors ${
                star <= (hover || value)
                  ? "fill-amber-400 text-amber-400"
                  : "text-gray-200"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ReviewForm({ gymId, onReviewSubmitted }: ReviewFormProps) {
  const { data: session, status } = useSession();
  const [rating, setRating] = useState(0);
  const [cleanliness, setCleanliness] = useState(0);
  const [equipment, setEquipment] = useState(0);
  const [staff, setStaff] = useState(0);
  const [valueForMoney, setValueForMoney] = useState(0);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (status === "loading") return null;

  if (!session) {
    return (
      <div className="rounded-xl border-2 border-dashed border-muted-foreground/20 p-6 text-center">
        <p className="text-sm text-muted-foreground mb-3">Sign in to write a review</p>
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 rounded-lg gradient-primary px-4 py-2 text-sm font-medium text-white"
        >
          <LogIn className="h-4 w-4" />
          Sign In
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
        <p className="text-sm font-medium text-green-700">Your review has been submitted! Thank you.</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (rating === 0) {
      setError("Please select an overall rating");
      return;
    }
    if (!text.trim()) {
      setError("Please write a review");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gymId,
          userId: (session.user as { id: string }).id,
          rating,
          cleanliness: cleanliness || null,
          equipment: equipment || null,
          staff: staff || null,
          valueForMoney: valueForMoney || null,
          text: text.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to submit review");
        return;
      }

      setSuccess(true);
      onReviewSubmitted?.();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border bg-card p-6 shadow-sm space-y-5">
      <h3 className="font-bold text-foreground">Write a Review</h3>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Overall Rating */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Overall Rating *</label>
        <StarInput value={rating} onChange={setRating} label="" />
      </div>

      {/* Category Ratings */}
      <div className="space-y-3 rounded-lg bg-secondary/40 p-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Rate by category (optional)</p>
        {CATEGORIES.map((cat) => {
          const setters: Record<string, (v: number) => void> = {
            cleanliness: setCleanliness,
            equipment: setEquipment,
            staff: setStaff,
            valueForMoney: setValueForMoney,
          };
          const values: Record<string, number> = { cleanliness, equipment, staff, valueForMoney };
          return (
            <StarInput
              key={cat.key}
              value={values[cat.key]}
              onChange={setters[cat.key]}
              label={cat.label}
            />
          );
        })}
      </div>

      {/* Review Text */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Your Review *</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Share your experience at this gym..."
          rows={4}
          className="w-full rounded-lg border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl gradient-primary px-4 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
