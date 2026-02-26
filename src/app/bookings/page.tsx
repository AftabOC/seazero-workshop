"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Calendar, MapPin, Clock, Loader2, XCircle, CheckCircle2, AlertCircle } from "lucide-react";

interface Booking {
  id: string;
  bookingType: string;
  date: string;
  timeSlot: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  gym: { name: string; slug: string; address: string; imageUrl: string | null; phone: string | null };
}

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  pending: { bg: "bg-yellow-50 border-yellow-200", text: "text-yellow-700", icon: AlertCircle },
  confirmed: { bg: "bg-green-50 border-green-200", text: "text-green-700", icon: CheckCircle2 },
  cancelled: { bg: "bg-red-50 border-red-200", text: "text-red-700", icon: XCircle },
  completed: { bg: "bg-blue-50 border-blue-200", text: "text-blue-700", icon: CheckCircle2 },
};

const TYPE_LABELS: Record<string, string> = {
  trial: "Trial Visit",
  inquiry: "Inquiry",
  class: "Class Booking",
};

export default function BookingsPage() {
  const { status } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/bookings")
        .then((r) => r.json())
        .then((data) => { setBookings(data.bookings || []); setLoading(false); })
        .catch(() => setLoading(false));
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  const handleCancel = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    setCancelling(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      if (res.ok) {
        setBookings(bookings.map((b) => b.id === bookingId ? { ...b, status: "cancelled" } : b));
      }
    } catch (error) {
      console.error("Failed to cancel booking:", error);
    } finally {
      setCancelling(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const upcoming = bookings.filter((b) => b.status === "pending" || b.status === "confirmed");
  const past = bookings.filter((b) => b.status === "cancelled" || b.status === "completed");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">My Bookings</h1>
        <p className="mt-1 text-muted-foreground">Manage your gym trial visits and inquiries</p>
      </div>

      {bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary mb-6">
            <Calendar className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">No bookings yet</h3>
          <p className="mt-2 text-sm text-muted-foreground text-center max-w-md">
            Browse gyms and book a trial visit to get started on your fitness journey.
          </p>
          <Link
            href="/gyms"
            className="mt-6 rounded-xl gradient-primary px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
          >
            Browse Gyms
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {upcoming.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-foreground mb-4">Upcoming</h2>
              <div className="space-y-4">
                {upcoming.map((booking) => {
                  const style = STATUS_STYLES[booking.status] || STATUS_STYLES.pending;
                  const StatusIcon = style.icon;
                  return (
                    <div key={booking.id} className="rounded-2xl border bg-card p-6 shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link href={`/gyms/${booking.gym.slug}`} className="text-lg font-semibold text-foreground hover:text-primary transition-colors">
                              {booking.gym.name}
                            </Link>
                            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${style.bg} ${style.text}`}>
                              <StatusIcon className="h-3 w-3" />
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            {booking.gym.address}
                          </div>
                          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                            <span className="flex items-center gap-1.5 text-muted-foreground">
                              <Calendar className="h-4 w-4 text-primary" />
                              {new Date(booking.date + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
                            </span>
                            {booking.timeSlot && (
                              <span className="flex items-center gap-1.5 text-muted-foreground">
                                <Clock className="h-4 w-4 text-primary" />
                                {booking.timeSlot}
                              </span>
                            )}
                            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">
                              {TYPE_LABELS[booking.bookingType] || booking.bookingType}
                            </span>
                          </div>
                          {booking.notes && (
                            <p className="mt-2 text-sm text-muted-foreground italic">&ldquo;{booking.notes}&rdquo;</p>
                          )}
                        </div>
                        {booking.status !== "cancelled" && (
                          <button
                            onClick={() => handleCancel(booking.id)}
                            disabled={cancelling === booking.id}
                            className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 flex-shrink-0"
                          >
                            {cancelling === booking.id ? "Cancelling..." : "Cancel"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-foreground mb-4">Past</h2>
              <div className="space-y-4">
                {past.map((booking) => {
                  const style = STATUS_STYLES[booking.status] || STATUS_STYLES.pending;
                  const StatusIcon = style.icon;
                  return (
                    <div key={booking.id} className="rounded-2xl border bg-card p-6 shadow-sm opacity-75">
                      <div className="flex items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link href={`/gyms/${booking.gym.slug}`} className="font-semibold text-foreground hover:text-primary transition-colors">
                              {booking.gym.name}
                            </Link>
                            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${style.bg} ${style.text}`}>
                              <StatusIcon className="h-3 w-3" />
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </span>
                          </div>
                          <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{new Date(booking.date + "T00:00:00").toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</span>
                            <span>{TYPE_LABELS[booking.bookingType] || booking.bookingType}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
