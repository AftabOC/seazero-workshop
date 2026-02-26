import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gymId, userId, rating, cleanliness, equipment, staff, valueForMoney, text } = body;

    if (!gymId || !userId || !rating || !text) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        gymId,
        userId,
        rating: parseFloat(rating),
        cleanliness: cleanliness ? parseFloat(cleanliness) : null,
        equipment: equipment ? parseFloat(equipment) : null,
        staff: staff ? parseFloat(staff) : null,
        valueForMoney: valueForMoney ? parseFloat(valueForMoney) : null,
        text,
        isVerified: false,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("Failed to create review:", error);
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const gymId = searchParams.get("gymId");
  const userId = searchParams.get("userId");
  const sort = searchParams.get("sort") || "recent";
  const filterRating = parseInt(searchParams.get("rating") || "0");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");

  const where: Record<string, unknown> = {};
  if (gymId) where.gymId = gymId;
  if (userId) where.userId = userId;
  if (filterRating > 0) where.rating = { gte: filterRating, lt: filterRating + 1 };

  const orderBy: Record<string, string> = {};
  switch (sort) {
    case "highest": orderBy.rating = "desc"; break;
    case "lowest": orderBy.rating = "asc"; break;
    case "helpful": orderBy.helpfulCount = "desc"; break;
    default: orderBy.createdAt = "desc"; break;
  }

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.review.count({ where }),
  ]);

  return NextResponse.json({ reviews, total, page, totalPages: Math.ceil(total / limit) });
}
