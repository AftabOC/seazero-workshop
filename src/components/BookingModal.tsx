"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { X, Calendar, Clock, FileText, Loader2, LogIn, CheckCircle2 } from "lucide-react";

interface BookingModalProps {
  gymId: string;
  gymName: string;
  type: "trial" | "inquiry";
  onClose: () => void;
}

const TIME_SLOTS = [
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
  "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00", "21:00",
];

export default function BookingModal({ gymId, gymName, type, onClose }: BookingModalProps) {
  const { data: session } = useSession();
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!date) {
      setError("Please select a date");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gymId,
          bookingType: type,
          date,
          timeSlot: timeSlot || null,
          notes: notes.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create booking");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h3 className="font-bold text-foreground">
              {type === "trial" ? "Book a Trial Visit" : "Send Inquiry"}
            </h3>
            <p className="text-sm text-muted-foreground">{gymName}</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-secondary">
            <X className="h-4 w-4" />
          </button>
        </div>

        {!session ? (
          <div className="p-6 text-center">
            <p className="text-sm text-muted-foreground mb-4">Sign in to book a visit</p>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 rounded-lg gradient-primary px-4 py-2.5 text-sm font-medium text-white"
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </Link>
          </div>
        ) : success ? (
          <div className="p-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-foreground">
              {type === "trial" ? "Trial Visit Booked!" : "Inquiry Sent!"}
            </h4>
            <p className="mt-2 text-sm text-muted-foreground">
              {type === "trial"
                ? "We'll confirm your trial visit shortly. Check your bookings for updates."
                : "The gym will get back to you soon. Check your bookings for updates."}
            </p>
            <div className="mt-6 flex gap-3 justify-center">
              <Link
                href="/bookings"
                className="rounded-lg gradient-primary px-4 py-2.5 text-sm font-medium text-white"
              >
                View Bookings
              </Link>
              <button onClick={onClose} className="rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-secondary">
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Date */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-1.5">
                <Calendar className="h-4 w-4 text-primary" />
                Preferred Date *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={today}
                className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>

            {/* Time Slot */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-1.5">
                <Clock className="h-4 w-4 text-primary" />
                Preferred Time
              </label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">Any time</option>
                {TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-1.5">
                <FileText className="h-4 w-4 text-primary" />
                {type === "trial" ? "Special Requests" : "Your Message"}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={type === "trial" ? "Any specific requirements or questions..." : "Tell the gym what you're looking for..."}
                rows={3}
                className="w-full rounded-lg border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl gradient-primary px-4 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Submitting..." : type === "trial" ? "Book Trial Visit" : "Send Inquiry"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
