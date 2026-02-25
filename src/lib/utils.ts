import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

export function getDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function getStarArray(rating: number): ("full" | "half" | "empty")[] {
  const stars: ("full" | "half" | "empty")[] = [];
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) stars.push("full");
    else if (rating >= i - 0.5) stars.push("half");
    else stars.push("empty");
  }
  return stars;
}

export function isGymOpen(
  hours: { dayOfWeek: number; openTime: string; closeTime: string; isClosed: boolean }[]
): { isOpen: boolean; closesAt?: string; opensAt?: string } {
  const now = new Date();
  const day = now.getDay();
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  const todayHours = hours.find((h) => h.dayOfWeek === day);
  if (!todayHours || todayHours.isClosed) {
    const nextDay = hours.find((h) => h.dayOfWeek === (day + 1) % 7 && !h.isClosed);
    return { isOpen: false, opensAt: nextDay?.openTime };
  }

  const isOpen = currentTime >= todayHours.openTime && currentTime < todayHours.closeTime;
  return {
    isOpen,
    closesAt: isOpen ? todayHours.closeTime : undefined,
    opensAt: !isOpen ? todayHours.openTime : undefined,
  };
}

export const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const AMENITY_ICONS: Record<string, string> = {
  "Swimming Pool": "waves",
  "Sauna": "thermometer",
  "Steam Room": "cloud",
  "Parking": "car",
  "Wi-Fi": "wifi",
  "Locker Room": "lock",
  "Showers": "shower-head",
  "Air Conditioning": "air-vent",
  "Personal Trainer": "user-check",
  "Group Classes": "users",
  "Cardio Zone": "heart-pulse",
  "Free Weights": "dumbbell",
  "Functional Training": "zap",
  "Smoothie Bar": "cup-soda",
  "Towel Service": "shirt",
  "Body Composition Analysis": "scan",
  "Physiotherapy": "stethoscope",
  "Kids Play Area": "baby",
};

export const GYM_TYPE_LABELS: Record<string, string> = {
  commercial: "Commercial Gym",
  crossfit: "CrossFit Box",
  yoga: "Yoga Studio",
  women_only: "Women Only",
  "24x7": "24/7 Access",
  budget: "Budget Friendly",
};

export const PRICE_RANGE_LABELS: Record<string, string> = {
  budget: "Budget",
  mid: "Mid-Range",
  premium: "Premium",
};
