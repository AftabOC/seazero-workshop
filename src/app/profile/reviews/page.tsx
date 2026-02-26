"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Star, Trash2, Loader2, MapPin } from "lucide-react";
import StarRating from "@/components/StarRating";

interface UserReview {
  id: string;
  rating: number;
  text: string;
  creanliness: number | null;
  equipment: number | null;
  staff: number | null;
  valueForMoney: number | null;
  helpfulCount: number;
  createdAt: string;
  gym: { name: string; slug: string; address: string };
}

export default function MyReviewsPage() {
  const { status } = useSession();
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/user/reviews")
        .then((r) => r.json())
        .then((data) => { setReviews(data.reviews || []); setLoading(false); })
        .catch(() => setLoading(false));
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    setDeleting(reviewId);
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, { method: "DELETE" });
      if (res.ok) {
        setReviews(reviews.filter((r) => r.id !== reviewId));
      }
    } catch (error) {
      console.error("Failed to delete review:", error);
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">My Reviews</h1>
        <p className="mt-1 text-muted-foreground">
          {reviews.length > 0 ? `${reviews.length} review${reviews.length > 1 ? "s" : ""} written` : "Your gym reviews"}
        </p>
      </div>

      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-2xl border bg-card p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <Link href={`/gyms/${review.gym.slug}`} className="text-lg font-semibold text-foreground hover:text-primary transition-colors">
                    {review.gym.name}
                  </Link>
                  <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{review.gym.address}</span>
                  </div>
                  <div className="mt-2">
                    <StarRating rating={review.rating} size="sm" />
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{review.text}</p>
                  <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{new Date(review.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}</span>
                    {review.helpfulCount > 0 && <span>{review.helpfulCount} found helpful</span>}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(review.id)}
                  disabled={deleting === review.id}
                  className="flex h-9 w-9 items-center justify-center rounded-full border hover:bg-red-50 hover:border-red-200 transition-colors flex-shrink-0"
                >
                  {deleting === review.id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                  ) : (
                    <Trash2 className="h-4 w-4 text-red-500" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary mb-6">
            <Star className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">No reviews yet</h3>
          <p className="mt-2 text-sm text-muted-foreground text-center max-w-md">
            Visit a gym page and write a review to help others make informed decisions.
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
