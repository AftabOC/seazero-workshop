import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin, Phone, Globe, Clock, Star, ChevronRight,
  Navigation, Share2, Heart, CheckCircle2, Users,
  Dumbbell, Calendar, Tag,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import StarRating from "@/components/StarRating";
import { formatPrice, DAY_NAMES, GYM_TYPE_LABELS, PRICE_RANGE_LABELS, isGymOpen } from "@/lib/utils";

interface Props {
  params: { slug: string };
}

async function getGym(slug: string) {
  const gym = await prisma.gym.findUnique({
    where: { slug },
    include: {
      hours: { orderBy: { dayOfWeek: "asc" } },
      amenities: true,
      photos: { orderBy: { order: "asc" } },
      memberships: { orderBy: { price: "asc" } },
      reviews: {
        include: { user: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: "desc" },
      },
      classes: { orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }] },
    },
  });
  return gym;
}

export default async function GymDetailPage({ params }: Props) {
  const gym = await getGym(params.slug);
  if (!gym) notFound();

  const avgRating =
    gym.reviews.length > 0
      ? gym.reviews.reduce((sum, r) => sum + r.rating, 0) / gym.reviews.length
      : 0;
  const rating = Math.round(avgRating * 10) / 10;

  const openStatus = isGymOpen(gym.hours);

  // Rating distribution
  const ratingDist = [0, 0, 0, 0, 0];
  for (const r of gym.reviews) {
    const bucket = Math.min(Math.floor(r.rating), 5) - 1;
    if (bucket >= 0) ratingDist[bucket]++;
  }

  // Category averages
  let cleanliness = 0, equipment = 0, staff = 0, valueForMoney = 0, catCount = 0;
  for (const r of gym.reviews) {
    if (r.cleanliness && r.equipment && r.staff && r.valueForMoney) {
      cleanliness += r.cleanliness;
      equipment += r.equipment;
      staff += r.staff;
      valueForMoney += r.valueForMoney;
      catCount++;
    }
  }
  if (catCount > 0) {
    cleanliness = Math.round((cleanliness / catCount) * 10) / 10;
    equipment = Math.round((equipment / catCount) * 10) / 10;
    staff = Math.round((staff / catCount) * 10) / 10;
    valueForMoney = Math.round((valueForMoney / catCount) * 10) / 10;
  }

  const today = new Date().getDay();

  return (
    <div className="bg-secondary/30">
      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/gyms" className="hover:text-foreground">Gyms</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-medium">{gym.name}</span>
        </nav>
      </div>

      {/* Photo Gallery */}
      <div className="mx-auto max-w-7xl px-4 pt-4 pb-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 rounded-2xl overflow-hidden">
          {/* Main Image */}
          <div className="md:col-span-2 relative aspect-[16/9] bg-muted">
            {gym.imageUrl ? (
              <Image src={gym.imageUrl} alt={gym.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 66vw" priority />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-purple-100 to-indigo-100">
                <Dumbbell className="h-20 w-20 text-purple-300" />
              </div>
            )}
          </div>
          {/* Side Images */}
          <div className="hidden md:grid grid-rows-2 gap-3">
            {gym.photos.slice(1, 3).map((photo, i) => (
              <div key={photo.id} className="relative aspect-[16/9] bg-muted">
                <Image src={photo.url} alt={photo.caption || `Photo ${i + 2}`} fill className="object-cover" sizes="33vw" />
              </div>
            ))}
            {gym.photos.length <= 1 && (
              <>
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center rounded-none">
                  <span className="text-3xl">💪</span>
                </div>
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center rounded-none">
                  <span className="text-3xl">🏋️</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      {GYM_TYPE_LABELS[gym.type] || gym.type}
                    </span>
                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                      {PRICE_RANGE_LABELS[gym.priceRange]}
                    </span>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      openStatus.isOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {openStatus.isOpen ? `Open · Closes ${openStatus.closesAt}` : `Closed · Opens ${openStatus.opensAt || "tomorrow"}`}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{gym.name}</h1>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{gym.address}</span>
                  </div>
                  <StarRating rating={rating} size="lg" count={gym.reviews.length} />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button className="flex h-10 w-10 items-center justify-center rounded-full border hover:bg-secondary transition-colors">
                    <Heart className="h-5 w-5 text-muted-foreground" />
                  </button>
                  <button className="flex h-10 w-10 items-center justify-center rounded-full border hover:bg-secondary transition-colors">
                    <Share2 className="h-5 w-5 text-muted-foreground" />
                  </button>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${gym.lat},${gym.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg gradient-primary px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
                  >
                    <Navigation className="h-4 w-4" />
                    Directions
                  </a>
                </div>
              </div>

              {/* Description */}
              {gym.description && (
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed border-t pt-4">{gym.description}</p>
              )}
            </div>

            {/* Amenities */}
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-bold text-foreground mb-4">Amenities & Facilities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {gym.amenities.map((amenity) => (
                  <div key={amenity.id} className="flex items-center gap-2.5 rounded-lg bg-secondary/60 p-3">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-foreground">{amenity.amenityName}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Operating Hours */}
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Operating Hours
              </h2>
              <div className="space-y-2">
                {gym.hours.map((hour) => (
                  <div
                    key={hour.id}
                    className={`flex items-center justify-between rounded-lg px-4 py-2.5 text-sm ${
                      hour.dayOfWeek === today ? "bg-primary/10 font-semibold" : "hover:bg-secondary/60"
                    }`}
                  >
                    <span className="text-foreground">
                      {DAY_NAMES[hour.dayOfWeek]}
                      {hour.dayOfWeek === today && (
                        <span className="ml-2 text-xs font-normal text-primary">(Today)</span>
                      )}
                    </span>
                    <span className={hour.isClosed ? "text-red-500" : "text-muted-foreground"}>
                      {hour.isClosed ? "Closed" : `${hour.openTime} — ${hour.closeTime}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Classes */}
            {gym.classes.length > 0 && (
              <div className="rounded-2xl border bg-card p-6 shadow-sm">
                <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Group Classes
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="pb-3 font-medium">Class</th>
                        <th className="pb-3 font-medium">Day</th>
                        <th className="pb-3 font-medium">Time</th>
                        <th className="pb-3 font-medium">Instructor</th>
                        <th className="pb-3 font-medium text-right">Capacity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {gym.classes.map((cls) => (
                        <tr key={cls.id} className="hover:bg-secondary/40">
                          <td className="py-3 font-medium text-foreground">{cls.className}</td>
                          <td className="py-3 text-muted-foreground">{DAY_NAMES[cls.dayOfWeek]}</td>
                          <td className="py-3 text-muted-foreground">{cls.startTime} — {cls.endTime}</td>
                          <td className="py-3 text-muted-foreground">{cls.instructor || "—"}</td>
                          <td className="py-3 text-right text-muted-foreground flex items-center justify-end gap-1">
                            <Users className="h-3.5 w-3.5" /> {cls.capacity}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="rounded-2xl border bg-card p-6 shadow-sm" id="reviews">
              <h2 className="text-lg font-bold text-foreground mb-6">Reviews & Ratings</h2>

              {/* Rating Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 p-4 rounded-xl bg-secondary/40">
                <div className="text-center sm:text-left">
                  <div className="text-5xl font-bold text-foreground">{rating}</div>
                  <StarRating rating={rating} size="lg" showValue={false} />
                  <p className="mt-1 text-sm text-muted-foreground">{gym.reviews.length} reviews</p>
                </div>
                <div className="space-y-1.5">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = ratingDist[star - 1];
                    const pct = gym.reviews.length > 0 ? (count / gym.reviews.length) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-2 text-sm">
                        <span className="w-3 text-muted-foreground">{star}</span>
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-6 text-right text-muted-foreground text-xs">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Category Ratings */}
              {catCount > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: "Cleanliness", value: cleanliness },
                    { label: "Equipment", value: equipment },
                    { label: "Staff", value: staff },
                    { label: "Value", value: valueForMoney },
                  ].map((cat) => (
                    <div key={cat.label} className="text-center p-3 rounded-lg bg-secondary/40">
                      <div className="text-lg font-bold text-foreground">{cat.value}</div>
                      <div className="text-xs text-muted-foreground">{cat.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Review List */}
              <div className="space-y-4">
                {gym.reviews.map((review) => (
                  <div key={review.id} className="rounded-xl border p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 text-white font-semibold text-sm flex-shrink-0">
                        {review.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <span className="font-semibold text-foreground text-sm">{review.user.name}</span>
                            {review.isVerified && (
                              <span className="ml-2 inline-flex items-center gap-0.5 text-xs text-green-600">
                                <CheckCircle2 className="h-3 w-3" /> Verified
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            {new Date(review.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
                          </span>
                        </div>
                        <StarRating rating={review.rating} size="sm" showValue={false} />
                        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{review.text}</p>
                        {review.helpfulCount > 0 && (
                          <p className="mt-2 text-xs text-muted-foreground">
                            👍 {review.helpfulCount} found this helpful
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {gym.reviews.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="rounded-2xl border bg-card p-6 shadow-sm sticky top-24">
              <h3 className="font-bold text-foreground mb-4">Contact & Info</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground">{gym.address}</span>
                </div>
                {gym.phone && (
                  <a href={`tel:${gym.phone}`} className="flex items-center gap-3 text-sm hover:text-primary transition-colors">
                    <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">{gym.phone}</span>
                  </a>
                )}
                {gym.website && (
                  <a href={gym.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm hover:text-primary transition-colors">
                    <Globe className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground truncate">{gym.website}</span>
                  </a>
                )}
              </div>

              {/* CTA Buttons */}
              <div className="mt-6 space-y-3">
                <button className="w-full rounded-xl gradient-primary px-4 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity">
                  Book a Trial Visit
                </button>
                <button className="w-full rounded-xl border px-4 py-3 text-sm font-semibold text-foreground hover:bg-secondary transition-colors">
                  Send Inquiry
                </button>
              </div>
            </div>

            {/* Membership Plans */}
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <Tag className="h-5 w-5 text-primary" />
                Membership Plans
              </h3>
              <div className="space-y-3">
                {gym.memberships.map((plan) => {
                  const features = plan.features ? JSON.parse(plan.features) as string[] : [];
                  return (
                    <div
                      key={plan.id}
                      className={`rounded-xl border p-4 transition-all ${
                        plan.isPopular ? "border-primary bg-primary/5 shadow-sm" : "hover:border-primary/30"
                      }`}
                    >
                      {plan.isPopular && (
                        <span className="inline-block mb-2 rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-white">
                          Most Popular
                        </span>
                      )}
                      <div className="flex items-end justify-between">
                        <div>
                          <div className="font-semibold text-foreground">{plan.planName}</div>
                          <div className="text-xs text-muted-foreground">
                            {plan.durationMonths === 0 ? "Single day" : `${plan.durationMonths} month${plan.durationMonths > 1 ? "s" : ""}`}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-foreground">{formatPrice(plan.price)}</div>
                          {plan.durationMonths > 1 && (
                            <div className="text-xs text-muted-foreground">
                              {formatPrice(Math.round(plan.price / plan.durationMonths))}/mo
                            </div>
                          )}
                        </div>
                      </div>
                      {features.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {features.map((f) => (
                            <span key={f} className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
                              {f.replace(/_/g, " ")}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Map placeholder */}
            <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
              <div className="aspect-[4/3] bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col items-center justify-center gap-2 p-4">
                <MapPin className="h-8 w-8 text-primary" />
                <p className="text-sm font-medium text-foreground">{gym.name}</p>
                <p className="text-xs text-muted-foreground text-center">{gym.address}</p>
                <a
                  href={`https://www.google.com/maps?q=${gym.lat},${gym.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-white hover:opacity-90 transition-opacity"
                >
                  View on Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
