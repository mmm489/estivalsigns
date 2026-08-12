import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const allowed = new Set(["frenchZone", "holiday", "bridge", "highImpactEvent", "themeParkSpecial", "weekend"]);

export async function PUT(request: NextRequest) {
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: "DATABASE_URL no configurada" }, { status: 503 });
  const body = await request.json() as Record<string, number>;
  const entries = Object.entries(body).filter(([key, value]) => allowed.has(key) && Number.isInteger(value) && value >= 0 && value <= 25);
  await prisma.$transaction(entries.map(([key, value]) => prisma.scoreWeight.upsert({ where: { key }, update: { value }, create: { key, label: key, value } })));
  return NextResponse.json({ updated: entries.length });
}
