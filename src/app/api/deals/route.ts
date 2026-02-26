import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    const deals = await prisma.deal.findMany({
      where: {
        isActive: true,
        validFrom: { lte: now },
        validUntil: { gte: now },
      },
      include: {
        gym: { select: { name: true, slug: true, imageUrl: true, address: true } },
      },
      orderBy: { discount: "desc" },
      take: 6,
    });

    return NextResponse.json({ deals });
  } catch (error) {
    console.error("Failed to fetch deals:", error);
    return NextResponse.json({ deals: [] });
  }
}
