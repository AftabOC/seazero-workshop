import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const sort = searchParams.get("sort") || "rating";
    const type = searchParams.get("type");
    const priceRange = searchParams.get("priceRange");
    const q = searchParams.get("q");
    const minRating = parseFloat(searchParams.get("minRating") || "0");
    const amenities = searchParams.get("amenities");

    const where: Record<string, unknown> = { isActive: true };

    if (type) where.type = type;
    if (priceRange) where.priceRange = priceRange;
    if (q) where.name = { contains: q, mode: "insensitive" };
    if (amenities) {
      const amenityList = amenities.split(",").map((a) => a.trim()).filter(Boolean);
      if (amenityList.length > 0) {
        where.amenities = { some: { amenityName: { in: amenityList } } };
      }
    }
    if (minRating > 0) {
      // We'll filter by average rating after fetching
    }

    const orderBy: Record<string, string> = {};
    switch (sort) {
      case "name": orderBy.name = "asc"; break;
      case "newest": orderBy.createdAt = "desc"; break;
      case "price_low": orderBy.priceRange = "asc"; break;
      case "price_high": orderBy.priceRange = "desc"; break;
      default: orderBy.createdAt = "desc"; break;
    }

    const [gyms, total] = await Promise.all([
      prisma.gym.findMany({
        where,
        include: {
          amenities: { select: { amenityName: true } },
          reviews: { select: { rating: true } },
          memberships: { select: { price: true }, orderBy: { price: "asc" }, take: 1 },
          hours: true,
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.gym.count({ where }),
    ]);

    const gymsWithStats = gyms
      .map((gym) => {
        const avgRating =
          gym.reviews.length > 0
            ? gym.reviews.reduce((sum, r) => sum + r.rating, 0) / gym.reviews.length
            : 0;

        return {
          id: gym.id,
          name: gym.name,
          slug: gym.slug,
          description: gym.description,
          address: gym.address,
          lat: gym.lat,
          lng: gym.lng,
          phone: gym.phone,
          website: gym.website,
          priceRange: gym.priceRange,
          type: gym.type,
          imageUrl: gym.imageUrl,
          rating: Math.round(avgRating * 10) / 10,
          reviewCount: gym.reviews.length,
          amenities: gym.amenities.map((a) => a.amenityName),
          lowestPrice: gym.memberships[0]?.price || null,
          hours: gym.hours,
        };
      })
      .filter((g) => minRating === 0 || g.rating >= minRating);

    // Sort by rating if requested (needs post-processing since rating is computed)
    if (sort === "rating") {
      gymsWithStats.sort((a, b) => b.rating - a.rating);
    }

    return NextResponse.json({
      gyms: gymsWithStats,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Failed to fetch gyms:", error);
    return NextResponse.json({ gyms: [], total: 0, page: 1, totalPages: 0 });
  }
}
