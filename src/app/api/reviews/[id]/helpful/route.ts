import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const existing = await prisma.reviewHelpful.findFirst({
      where: { reviewId: params.id, userId },
    });

    if (existing) {
      await prisma.reviewHelpful.delete({ where: { id: existing.id } });
      await prisma.review.update({
        where: { id: params.id },
        data: { helpfulCount: { decrement: 1 } },
      });
      return NextResponse.json({ action: "removed" });
    }

    await prisma.reviewHelpful.create({
      data: { reviewId: params.id, userId },
    });
    await prisma.review.update({
      where: { id: params.id },
      data: { helpfulCount: { increment: 1 } },
    });

    return NextResponse.json({ action: "added" });
  } catch (error) {
    console.error("Failed to toggle helpful:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
