"use client";

import { useEffect, useState } from "react";
import { Search, X, Plus, Star, CheckCircle2, XCircle } from "lucide-react";
import Image from "next/image";
import StarRating from "@/components/StarRating";
import { formatPrice, GYM_TYPE_LABELS } from "@/lib/utils";

interface GymCompare {
  id: string;
  name: string;
  slug: string;
  address: string;
  imageUrl: string | null;
  priceRange: string;
  type: string;
  rating: number;
  reviewCount: number;
  amenities: string[];
  lowestPrice?: number | null;
}

export default function ComparePage() {
  const [allGyms, setAllGyms] = useState<GymCompare[]>([]);
  const [selected, setSelected] = useState<GymCompare[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/gyms?limit=50")
      .then((r) => r.json())
      .then((data) => { setAllGyms(data.gyms); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filteredGyms = allGyms.filter(
    (g) =>
      !selected.find((s) => s.id === g.id) &&
      g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addGym = (gym: GymCompare) => {
    if (selected.length < 3) {
      setSelected([...selected, gym]);
      setShowSearch(false);
      setSearchQuery("");
    }
  };

  const removeGym = (id: string) => {
    setSelected(selected.filter((g) => g.id !== id));
  };

  // Collect all unique amenities from selected gyms
  const allAmenities = Array.from(new Set(selected.flatMap((g) => g.amenities))).sort();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Compare Gyms</h1>
        <p className="mt-1 text-muted-foreground">Select up to 3 gyms to compare side by side</p>
      </div>

      {/* Selection Slots */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[0, 1, 2].map((slot) => {
          const gym = selected[slot];
          if (gym) {
            return (
              <div key={gym.id} className="relative rounded-xl border bg-card p-4 shadow-sm">
                <button
                  onClick={() => removeGym(gym.id)}
                  className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-100 hover:bg-red-200 transition-colors"
                >
                  <X className="h-4 w-4 text-red-600" />
                </button>
                <div className="relative aspect-[16/9] rounded-lg overflow-hidden bg-muted mb-3">
                  {gym.imageUrl ? (
                    <Image src={gym.imageUrl} alt={gym.name} fill className="object-cover" sizes="33vw" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-3xl">🏋️</div>
                  )}
                </div>
                <h3 className="font-semibold text-foreground text-sm">{gym.name}</h3>
                <StarRating rating={gym.rating} size="sm" count={gym.reviewCount} />
              </div>
            );
          }
          return (
            <button
              key={slot}
              onClick={() => setShowSearch(true)}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted-foreground/20 p-8 hover:border-primary/40 hover:bg-primary/5 transition-colors"
            >
              <Plus className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Add Gym</span>
            </button>
          );
        })}
      </div>

      {/* Search Modal */}
      {showSearch && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/50" onClick={() => setShowSearch(false)}>
          <div className="w-full max-w-lg rounded-2xl border bg-card p-6 shadow-2xl mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground">Select a Gym</h3>
              <button onClick={() => setShowSearch(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
            </div>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search gyms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                autoFocus
              />
            </div>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {loading ? (
                <p className="text-sm text-muted-foreground py-4 text-center">Loading...</p>
              ) : filteredGyms.length > 0 ? (
                filteredGyms.map((gym) => (
                  <button
                    key={gym.id}
                    onClick={() => addGym(gym)}
                    className="flex w-full items-center gap-3 rounded-lg p-3 hover:bg-secondary transition-colors text-left"
                  >
                    <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {gym.imageUrl ? (
                        <Image src={gym.imageUrl} alt={gym.name} fill className="object-cover" sizes="40px" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm">🏋️</div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-sm text-foreground">{gym.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {gym.rating} · {GYM_TYPE_LABELS[gym.type]}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">No gyms found</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Comparison Table */}
      {selected.length >= 2 && (
        <div className="rounded-2xl border bg-card shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-secondary/40">
                <th className="p-4 text-left font-semibold text-foreground w-40">Feature</th>
                {selected.map((gym) => (
                  <th key={gym.id} className="p-4 text-center font-semibold text-foreground">{gym.name}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {/* Type */}
              <tr className="hover:bg-secondary/20">
                <td className="p-4 font-medium text-foreground">Type</td>
                {selected.map((gym) => (
                  <td key={gym.id} className="p-4 text-center text-muted-foreground">{GYM_TYPE_LABELS[gym.type]}</td>
                ))}
              </tr>

              {/* Rating */}
              <tr className="hover:bg-secondary/20">
                <td className="p-4 font-medium text-foreground">Rating</td>
                {selected.map((gym) => {
                  const isBest = gym.rating === Math.max(...selected.map((g) => g.rating));
                  return (
                    <td key={gym.id} className={`p-4 text-center ${isBest ? "font-bold text-green-600" : "text-muted-foreground"}`}>
                      <div className="flex items-center justify-center gap-1">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        {gym.rating} ({gym.reviewCount})
                      </div>
                    </td>
                  );
                })}
              </tr>

              {/* Price */}
              <tr className="hover:bg-secondary/20">
                <td className="p-4 font-medium text-foreground">Starting Price</td>
                {selected.map((gym) => {
                  const prices = selected.map((g) => g.lowestPrice || Infinity);
                  const isBest = (gym.lowestPrice || Infinity) === Math.min(...prices);
                  return (
                    <td key={gym.id} className={`p-4 text-center ${isBest ? "font-bold text-green-600" : "text-muted-foreground"}`}>
                      {gym.lowestPrice ? formatPrice(gym.lowestPrice) + "/mo" : "N/A"}
                    </td>
                  );
                })}
              </tr>

              {/* Address */}
              <tr className="hover:bg-secondary/20">
                <td className="p-4 font-medium text-foreground">Location</td>
                {selected.map((gym) => (
                  <td key={gym.id} className="p-4 text-center text-muted-foreground text-xs">{gym.address}</td>
                ))}
              </tr>

              {/* Amenities */}
              {allAmenities.map((amenity) => (
                <tr key={amenity} className="hover:bg-secondary/20">
                  <td className="p-4 font-medium text-foreground text-xs">{amenity}</td>
                  {selected.map((gym) => (
                    <td key={gym.id} className="p-4 text-center">
                      {gym.amenities.includes(amenity) ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-300 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected.length < 2 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-6xl mb-4">⚖️</div>
          <h3 className="text-lg font-semibold text-foreground">Select at least 2 gyms to compare</h3>
          <p className="mt-1 text-sm text-muted-foreground">Click the + buttons above to add gyms for comparison</p>
        </div>
      )}
    </div>
  );
}
