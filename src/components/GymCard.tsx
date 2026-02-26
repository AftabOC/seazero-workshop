"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Heart, Clock, Tag } from "lucide-react";
import StarRating from "./StarRating";
import { formatPrice, GYM_TYPE_LABELS, PRICE_RANGE_LABELS } from "@/lib/utils";

export interface GymCardData {
  id: string;
  name: string;
  slug: string;
  address: string;
  imageUrl: string | null;
  priceRange: string;
  type: string;
  rating: number;
  reviewCount: number;
  distance?: number;
  amenities: string[];
  lowestPrice?: number;
  isOpen?: boolean;
}

interface GymCardProps {
  gym: GymCardData;
}

function getBestForLabels(gym: GymCardData): string[] {
  const labels: string[] = [];
  if (gym.rating >= 4.5 && gym.reviewCount >= 3) labels.push("Top Rated");
  if (gym.priceRange === "budget") labels.push("Best Value");
  if (gym.type === "yoga") labels.push("Best for Yoga");
  if (gym.type === "crossfit") labels.push("Best for CrossFit");
  if (gym.type === "women_only") labels.push("Women Friendly");
  if (gym.type === "24x7") labels.push("24/7 Access");
  if (gym.amenities.includes("Swimming Pool")) labels.push("Has Pool");
  if (gym.amenities.includes("Personal Trainer") && gym.priceRange !== "budget") labels.push("Pro Training");
  return labels.slice(0, 2);
}

export default function GymCard({ gym }: GymCardProps) {
  const bestForLabels = getBestForLabels(gym);
  return (
    <Link href={`/gyms/${gym.slug}`} className="group block">
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          {gym.imageUrl ? (
            <Image
              src={gym.imageUrl}
              alt={gym.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-purple-100 to-indigo-100">
              <span className="text-4xl">🏋️</span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <span className="rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-1 text-xs font-medium text-foreground shadow-sm">
              {GYM_TYPE_LABELS[gym.type] || gym.type}
            </span>
            {gym.isOpen !== undefined && (
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium shadow-sm backdrop-blur-sm ${
                gym.isOpen ? "bg-green-500/90 text-white" : "bg-red-500/90 text-white"
              }`}>
                {gym.isOpen ? "Open" : "Closed"}
              </span>
            )}
          </div>

          {/* Favorite Button */}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white transition-colors"
          >
            <Heart className="h-4 w-4 text-muted-foreground hover:text-red-500 transition-colors" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-2.5">
          {/* Name & Rating */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {gym.name}
            </h3>
            <StarRating rating={gym.rating} size="sm" count={gym.reviewCount} />
          </div>

          {/* Address */}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="line-clamp-1">{gym.address}</span>
            {gym.distance !== undefined && (
              <span className="ml-auto flex-shrink-0 text-xs font-medium text-primary">
                {gym.distance} km
              </span>
            )}
          </div>

          {/* Amenities */}
          {gym.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {gym.amenities.slice(0, 3).map((amenity) => (
                <span key={amenity} className="rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                  {amenity}
                </span>
              ))}
              {gym.amenities.length > 3 && (
                <span className="rounded-md bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                  +{gym.amenities.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Best For Labels */}
          {bestForLabels.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {bestForLabels.map((label) => (
                <span key={label} className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {label}
                </span>
              ))}
            </div>
          )}

          {/* Price & Tags */}
          <div className="flex items-center justify-between pt-1 border-t">
            <div className="flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                {gym.lowestPrice ? `From ${formatPrice(gym.lowestPrice)}/mo` : PRICE_RANGE_LABELS[gym.priceRange]}
              </span>
            </div>
            {gym.isOpen !== undefined && (
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {gym.isOpen ? "Open now" : "Closed"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
