import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: user.id },
      include: {
        gym: {
          include: {
            amenities: { select: { amenityName: true } },
            reviews: { select: { rating: true } },
            memberships: { select: { price: true }, orderBy: { price: "asc" }, take: 1 },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const gyms = favorites.map((fav) => {
      const gym = fav.gym;
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
        favoriteId: fav.id,
      };
    });

    return NextResponse.json({ gyms });
  } catch (error) {
    console.error("Failed to fetch favorites:", error);
    return NextResponse.json({ gyms: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { gymId } = body;

    if (!gymId) {
      return NextResponse.json({ error: "gymId is required" }, { status: 400 });
    }

    const existing = await prisma.favorite.findUnique({
      where: { userId_gymId: { userId: user.id, gymId } },
    });

    if (existing) {
      return NextResponse.json({ error: "Already favorited" }, { status: 409 });
    }

    const favorite = await prisma.favorite.create({
      data: { userId: user.id, gymId },
    });

    return NextResponse.json(favorite, { status: 201 });
  } catch (error) {
    console.error("Failed to add favorite:", error);
    return NextResponse.json({ error: "Failed to add favorite" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const gymId = searchParams.get("gymId");

    if (!gymId) {
      return NextResponse.json({ error: "gymId is required" }, { status: 400 });
    }

    await prisma.favorite.delete({
      where: { userId_gymId: { userId: user.id, gymId } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to remove favorite:", error);
    return NextResponse.json({ error: "Failed to remove favorite" }, { status: 500 });
  }
}
