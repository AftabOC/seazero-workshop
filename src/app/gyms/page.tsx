"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import GymCard, { GymCardData } from "@/components/GymCard";
import { GYM_TYPE_LABELS, PRICE_RANGE_LABELS } from "@/lib/utils";

export default function GymsPageWrapper() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="h-9 w-48 bg-muted rounded animate-pulse" />
          <div className="h-5 w-32 bg-muted rounded mt-2 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl border bg-card overflow-hidden">
              <div className="aspect-[16/10] bg-muted" />
              <div className="p-4 space-y-3">
                <div className="h-5 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    }>
      <GymsPageContent />
    </Suspense>
  );
}

const SORT_OPTIONS = [
  { value: "rating", label: "Top Rated" },
  { value: "name", label: "Name A-Z" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
  { value: "newest", label: "Newest" },
];

function GymsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [gyms, setGyms] = useState<GymCardData[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filter state
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [type, setType] = useState(searchParams.get("type") || "");
  const [priceRange, setPriceRange] = useState(searchParams.get("priceRange") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "rating");
  const [page, setPage] = useState(1);

  const fetchGyms = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (type) params.set("type", type);
    if (priceRange) params.set("priceRange", priceRange);
    if (sort) params.set("sort", sort);
    params.set("page", String(page));
    params.set("limit", "12");

    try {
      const res = await fetch(`/api/gyms?${params.toString()}`);
      const data = await res.json();
      setGyms(data.gyms);
      setTotal(data.total);
    } catch (err) {
      console.error("Failed to fetch gyms:", err);
    } finally {
      setLoading(false);
    }
  }, [query, type, priceRange, sort, page]);

  useEffect(() => {
    fetchGyms();
  }, [fetchGyms]);

  const clearFilters = () => {
    setQuery("");
    setType("");
    setPriceRange("");
    setSort("rating");
    setPage(1);
    router.push("/gyms");
  };

  const hasActiveFilters = query || type || priceRange;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Explore Gyms</h1>
        <p className="mt-1 text-muted-foreground">
          {total} gyms found {query && `for "${query}"`} {type && `in ${GYM_TYPE_LABELS[type] || type}`}
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by gym name..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            className="w-full rounded-lg border bg-card pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
            className="appearance-none rounded-lg border bg-card px-4 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
            showFilters || hasActiveFilters ? "bg-primary text-white border-primary" : "bg-card hover:bg-secondary"
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-primary text-xs font-bold">
              {[query, type, priceRange].filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="mb-6 rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Filters</h3>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-sm text-primary hover:underline flex items-center gap-1">
                <X className="h-3.5 w-3.5" /> Clear All
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Gym Type */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Gym Type</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(GYM_TYPE_LABELS).map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => { setType(type === value ? "" : value); setPage(1); }}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      type === value
                        ? "bg-primary text-white"
                        : "bg-secondary text-secondary-foreground hover:bg-primary/10"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Price Range</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(PRICE_RANGE_LABELS).map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => { setPriceRange(priceRange === value ? "" : value); setPage(1); }}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      priceRange === value
                        ? "bg-primary text-white"
                        : "bg-secondary text-secondary-foreground hover:bg-primary/10"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Filter Tags */}
      {hasActiveFilters && !showFilters && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {type && (
            <span className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {GYM_TYPE_LABELS[type]}
              <button onClick={() => setType("")}><X className="h-3 w-3" /></button>
            </span>
          )}
          {priceRange && (
            <span className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {PRICE_RANGE_LABELS[priceRange]}
              <button onClick={() => setPriceRange("")}><X className="h-3 w-3" /></button>
            </span>
          )}
          <button onClick={clearFilters} className="text-xs text-muted-foreground hover:text-foreground">
            Clear all
          </button>
        </div>
      )}

      {/* Results Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl border bg-card overflow-hidden">
              <div className="aspect-[16/10] bg-muted" />
              <div className="p-4 space-y-3">
                <div className="h-5 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : gyms.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {gyms.map((gym) => (
            <GymCard key={gym.id} gym={gym} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-6xl mb-4">🏋️</div>
          <h3 className="text-lg font-semibold text-foreground">No gyms found</h3>
          <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters or search query</p>
          <button
            onClick={clearFilters}
            className="mt-4 rounded-lg gradient-primary px-6 py-2.5 text-sm font-medium text-white"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Pagination */}
      {total > 12 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="rounded-lg border px-4 py-2 text-sm font-medium disabled:opacity-50 hover:bg-secondary transition-colors"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-muted-foreground">
            Page {page} of {Math.ceil(total / 12)}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= Math.ceil(total / 12)}
            className="rounded-lg border px-4 py-2 text-sm font-medium disabled:opacity-50 hover:bg-secondary transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
