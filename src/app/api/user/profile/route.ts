import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        fitnessGoals: true,
        preferredWorkouts: true,
        budgetRange: true,
        createdAt: true,
        _count: {
          select: {
            reviews: true,
            favorites: true,
            bookings: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, fitnessGoals, preferredWorkouts, budgetRange } = body;

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        ...(name && { name }),
        ...(fitnessGoals !== undefined && { fitnessGoals }),
        ...(preferredWorkouts !== undefined && { preferredWorkouts }),
        ...(budgetRange !== undefined && { budgetRange }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        fitnessGoals: true,
        preferredWorkouts: true,
        budgetRange: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Failed to update profile:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
