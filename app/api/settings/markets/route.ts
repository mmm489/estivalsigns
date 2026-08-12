import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest) {
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: "DATABASE_URL no configurada" }, { status: 503 });
  const { code, active } = await request.json() as { code?: string; active?: boolean };
  if (!code || typeof active !== "boolean") return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  await prisma.emitterMarket.update({ where: { code }, data: { active } });
  return NextResponse.json({ updated: true });
}
