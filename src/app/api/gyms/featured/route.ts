import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const gyms = await prisma.gym.findMany({
    where: { isActive: true },
    include: {
      amenities: { select: { amenityName: true } },
      reviews: { select: { rating: true } },
      memberships: { select: { price: true }, orderBy: { price: "asc" }, take: 1 },
      hours: true,
    },
  });

  const gymsWithRating = gyms
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
        lowestPrice: gym.memberships[0]?.price || null,
        hours: gym.hours,
      };
    })
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6);

  return NextResponse.json({ gyms: gymsWithRating });
}
