import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { userId, reason } = body;

    if (!userId || !reason) {
      return NextResponse.json({ error: "userId and reason required" }, { status: 400 });
    }

    const existing = await prisma.reviewReport.findFirst({
      where: { reviewId: params.id, userId },
    });

    if (existing) {
      return NextResponse.json({ error: "Already reported" }, { status: 409 });
    }

    await prisma.reviewReport.create({
      data: { reviewId: params.id, userId, reason },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Failed to report review:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
