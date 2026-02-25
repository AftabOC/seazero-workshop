import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const gym = await prisma.gym.findUnique({
      where: { slug: params.slug },
      include: {
        hours: { orderBy: { dayOfWeek: "asc" } },
        amenities: true,
        photos: { orderBy: { order: "asc" } },
        memberships: { orderBy: { price: "asc" } },
        reviews: {
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        classes: { orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }] },
      },
    });

    if (!gym) {
      return NextResponse.json({ error: "Gym not found" }, { status: 404 });
    }

    const avgRating =
      gym.reviews.length > 0
        ? gym.reviews.reduce((sum, r) => sum + r.rating, 0) / gym.reviews.length
        : 0;

    const categoryRatings = {
      cleanliness: 0,
      equipment: 0,
      staff: 0,
      valueForMoney: 0,
    };

    let ratedCount = 0;
    for (const r of gym.reviews) {
      if (r.cleanliness && r.equipment && r.staff && r.valueForMoney) {
        categoryRatings.cleanliness += r.cleanliness;
        categoryRatings.equipment += r.equipment;
        categoryRatings.staff += r.staff;
        categoryRatings.valueForMoney += r.valueForMoney;
        ratedCount++;
      }
    }

    if (ratedCount > 0) {
      categoryRatings.cleanliness = Math.round((categoryRatings.cleanliness / ratedCount) * 10) / 10;
      categoryRatings.equipment = Math.round((categoryRatings.equipment / ratedCount) * 10) / 10;
      categoryRatings.staff = Math.round((categoryRatings.staff / ratedCount) * 10) / 10;
      categoryRatings.valueForMoney = Math.round((categoryRatings.valueForMoney / ratedCount) * 10) / 10;
    }

    // Rating distribution
    const ratingDistribution = [0, 0, 0, 0, 0];
    for (const r of gym.reviews) {
      const bucket = Math.min(Math.floor(r.rating), 5) - 1;
      if (bucket >= 0) ratingDistribution[bucket]++;
    }

    return NextResponse.json({
      ...gym,
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: gym.reviews.length,
      categoryRatings,
      ratingDistribution,
    });
  } catch (error) {
    console.error("Failed to fetch gym detail:", error);
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}
