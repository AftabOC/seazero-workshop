"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { User, Mail, Target, Dumbbell, Wallet, Star, Heart, Calendar, Save, Loader2, CheckCircle2 } from "lucide-react";

const FITNESS_GOALS = ["weight_loss", "muscle_gain", "flexibility", "endurance", "general_fitness", "strength", "mental_health", "toning"];
const WORKOUT_TYPES = ["weightlifting", "cardio", "yoga", "crossfit", "hiit", "pilates", "swimming", "dance", "martial_arts", "bodybuilding"];
const BUDGET_OPTIONS = ["low", "medium", "high"];

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  fitnessGoals: string | null;
  preferredWorkouts: string | null;
  budgetRange: string | null;
  createdAt: string;
  _count: { reviews: number; favorites: number; bookings: number };
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [name, setName] = useState("");
  const [fitnessGoals, setFitnessGoals] = useState<string[]>([]);
  const [preferredWorkouts, setPreferredWorkouts] = useState<string[]>([]);
  const [budgetRange, setBudgetRange] = useState("");

  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.id) {
          setProfile(data);
          setName(data.name);
          setFitnessGoals(data.fitnessGoals ? JSON.parse(data.fitnessGoals) : []);
          setPreferredWorkouts(data.preferredWorkouts ? JSON.parse(data.preferredWorkouts) : []);
          setBudgetRange(data.budgetRange || "");
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const toggleItem = (arr: string[], item: string, setter: (v: string[]) => void) => {
    setter(arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item]);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          fitnessGoals: JSON.stringify(fitnessGoals),
          preferredWorkouts: JSON.stringify(preferredWorkouts),
          budgetRange: budgetRange || null,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setProfile((prev) => prev ? { ...prev, ...updated } : prev);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error("Failed to save profile:", error);
    } finally {
      setSaving(false);
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
        <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
        <p className="mt-1 text-muted-foreground">Manage your account and fitness preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar Stats */}
        <div className="space-y-6">
          <div className="rounded-2xl border bg-card p-6 shadow-sm text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 text-white text-2xl font-bold mb-4">
              {session?.user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <h2 className="text-lg font-bold text-foreground">{profile?.name || session?.user?.name}</h2>
            <p className="text-sm text-muted-foreground">{profile?.email || session?.user?.email}</p>
            {profile?.createdAt && (
              <p className="mt-2 text-xs text-muted-foreground">
                Member since {new Date(profile.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
              </p>
            )}
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h3 className="font-semibold text-foreground mb-4">Activity</h3>
            <div className="space-y-3">
              <Link href="/profile/reviews" className="flex items-center justify-between py-2 hover:text-primary transition-colors">
                <div className="flex items-center gap-2 text-sm">
                  <Star className="h-4 w-4 text-amber-500" />
                  <span>My Reviews</span>
                </div>
                <span className="text-sm font-semibold text-foreground">{profile?._count.reviews || 0}</span>
              </Link>
              <Link href="/favorites" className="flex items-center justify-between py-2 hover:text-primary transition-colors">
                <div className="flex items-center gap-2 text-sm">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span>Favorites</span>
                </div>
                <span className="text-sm font-semibold text-foreground">{profile?._count.favorites || 0}</span>
              </Link>
              <Link href="/bookings" className="flex items-center justify-between py-2 hover:text-primary transition-colors">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span>Bookings</span>
                </div>
                <span className="text-sm font-semibold text-foreground">{profile?._count.bookings || 0}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Basic Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                <div className="flex items-center gap-2 rounded-lg border bg-secondary/50 px-4 py-2.5 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {profile?.email}
                </div>
              </div>
            </div>
          </div>

          {/* Fitness Goals */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Fitness Goals
            </h3>
            <div className="flex flex-wrap gap-2">
              {FITNESS_GOALS.map((goal) => (
                <button
                  key={goal}
                  onClick={() => toggleItem(fitnessGoals, goal, setFitnessGoals)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                    fitnessGoals.includes(goal)
                      ? "bg-primary text-white"
                      : "bg-secondary text-secondary-foreground hover:bg-primary/10"
                  }`}
                >
                  {goal.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </button>
              ))}
            </div>
          </div>

          {/* Preferred Workouts */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-primary" />
              Preferred Workouts
            </h3>
            <div className="flex flex-wrap gap-2">
              {WORKOUT_TYPES.map((workout) => (
                <button
                  key={workout}
                  onClick={() => toggleItem(preferredWorkouts, workout, setPreferredWorkouts)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                    preferredWorkouts.includes(workout)
                      ? "bg-primary text-white"
                      : "bg-secondary text-secondary-foreground hover:bg-primary/10"
                  }`}
                >
                  {workout.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </button>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              Budget Preference
            </h3>
            <div className="flex gap-3">
              {BUDGET_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setBudgetRange(budgetRange === opt ? "" : opt)}
                  className={`flex-1 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-colors ${
                    budgetRange === opt
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-transparent bg-secondary text-secondary-foreground hover:border-primary/20"
                  }`}
                >
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl gradient-primary px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Saving..." : "Save Changes"}
            </button>
            {saved && (
              <span className="flex items-center gap-1 text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                Saved successfully
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
