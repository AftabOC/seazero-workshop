import Link from "next/link";
import { Search, MapPin, Dumbbell, Heart, Zap, Users, Clock, Shield, ArrowRight, TrendingUp } from "lucide-react";
import GymCard, { GymCardData } from "@/components/GymCard";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getFeaturedGyms(): Promise<GymCardData[]> {
  try {
    const gyms = await prisma.gym.findMany({
      where: { isActive: true },
      include: {
        amenities: { select: { amenityName: true } },
        reviews: { select: { rating: true } },
        memberships: { select: { price: true }, orderBy: { price: "asc" }, take: 1 },
      },
    });

    return gyms
      .map((gym) => {
        const avgRating =
          gym.reviews.length > 0
            ? gym.reviews.reduce((sum, r) => sum + r.rating, 0) / gym.reviews.length
            : 0;
        return {
          id: gym.id,
          name: gym.name,
          slug: gym.slug,
          address: gym.address,
          imageUrl: gym.imageUrl,
          priceRange: gym.priceRange,
          type: gym.type,
          rating: Math.round(avgRating * 10) / 10,
          reviewCount: gym.reviews.length,
          amenities: gym.amenities.map((a) => a.amenityName),
          lowestPrice: gym.memberships[0]?.price || undefined,
        };
      })
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 6);
  } catch (error) {
    console.error("Failed to fetch featured gyms:", error);
    return [];
  }
}

const CATEGORIES = [
  { label: "Bodybuilding", icon: Dumbbell, type: "commercial", color: "from-orange-500 to-red-500" },
  { label: "Yoga", icon: Heart, type: "yoga", color: "from-pink-500 to-rose-500" },
  { label: "CrossFit", icon: Zap, type: "crossfit", color: "from-yellow-500 to-orange-500" },
  { label: "Women Only", icon: Shield, type: "women_only", color: "from-purple-500 to-pink-500" },
  { label: "24/7 Access", icon: Clock, type: "24x7", color: "from-blue-500 to-indigo-500" },
  { label: "Budget", icon: TrendingUp, type: "budget", color: "from-green-500 to-emerald-500" },
];

const STATS = [
  { value: "20+", label: "Gyms Listed" },
  { value: "100+", label: "Reviews" },
  { value: "6", label: "Categories" },
  { value: "4.5★", label: "Avg Rating" },
];

export default async function HomePage() {
  const featuredGyms = await getFeaturedGyms();

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE4YzEuNjU3IDAgMy0xLjM0MyAzLTNzLTEuMzQzLTMtMy0zLTMgMS4zNDMtMyAzIDEuMzQzIDMgMyAzem0wIDM2YzEuNjU3IDAgMy0xLjM0MyAzLTNzLTEuMzQzLTMtMy0zLTMgMS4zNDMtMyAzIDEuMzQzIDMgMyAzeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Find Your Perfect
              <span className="block text-yellow-300">Gym</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-purple-100">
              Discover top-rated gyms near you. Compare prices, read reviews, and book trial visits — all in one place.
            </p>

            {/* Search Bar */}
            <div className="mx-auto mt-10 max-w-2xl">
              <form action="/gyms" method="get">
                <div className="flex rounded-2xl bg-white p-2 shadow-2xl">
                  <div className="flex flex-1 items-center gap-2 px-4">
                    <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <input
                      type="text"
                      name="q"
                      placeholder="Search gyms by name or location..."
                      className="w-full py-3 text-sm outline-none placeholder:text-muted-foreground"
                    />
                  </div>
                  <button
                    type="submit"
                    className="flex items-center gap-2 rounded-xl gradient-primary px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    <Search className="h-4 w-4" />
                    <span className="hidden sm:inline">Search</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Stats */}
            <div className="mx-auto mt-12 grid max-w-lg grid-cols-4 gap-6">
              {STATS.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="mt-1 text-xs text-purple-200">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(0, 0%, 100%)" />
          </svg>
        </div>
      </section>

      {/* Categories Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-foreground">Browse by Category</h2>
          <p className="mt-2 text-muted-foreground">Find the perfect gym that matches your fitness style</p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.type}
                href={`/gyms?type=${cat.type}`}
                className="group flex flex-col items-center gap-3 rounded-2xl border bg-card p-6 transition-all hover:shadow-lg hover:-translate-y-1"
              >
                <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${cat.color} shadow-lg transition-transform group-hover:scale-110`}>
                  <Icon className="h-7 w-7 text-white" />
                </div>
                <span className="text-sm font-semibold text-foreground">{cat.label}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Gyms Section */}
      <section className="bg-secondary/50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Top Rated Gyms</h2>
              <p className="mt-2 text-muted-foreground">Highest rated gyms loved by the community</p>
            </div>
            <Link
              href="/gyms"
              className="hidden sm:flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredGyms.map((gym) => (
              <GymCard key={gym.id} gym={gym} />
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/gyms"
              className="inline-flex items-center gap-2 rounded-xl gradient-primary px-6 py-3 text-sm font-semibold text-white"
            >
              View All Gyms <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground">How It Works</h2>
          <p className="mt-2 text-muted-foreground">Finding your perfect gym is easy</p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {[
            { step: "1", title: "Search", desc: "Enter your location or browse by category to find gyms near you.", icon: Search },
            { step: "2", title: "Compare", desc: "Compare prices, amenities, ratings, and reviews side by side.", icon: Users },
            { step: "3", title: "Join", desc: "Book a trial visit or sign up directly with your chosen gym.", icon: Dumbbell },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.step} className="relative text-center p-6">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-lg">
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <div className="absolute top-4 right-4 text-6xl font-black text-primary/5">{item.step}</div>
                <h3 className="text-lg font-bold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="gradient-primary py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white">Ready to Find Your Gym?</h2>
          <p className="mt-4 text-lg text-purple-100">
            Join thousands of fitness enthusiasts who found their perfect gym through FindMyGym.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/gyms"
              className="rounded-xl bg-white px-8 py-3 text-sm font-semibold text-purple-600 shadow-lg hover:bg-purple-50 transition-colors"
            >
              Explore Gyms
            </Link>
            <Link
              href="/auth/signup"
              className="rounded-xl border-2 border-white/30 px-8 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
