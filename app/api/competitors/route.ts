import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: "DATABASE_URL no configurada" }, { status: 503 });
  const { name } = await request.json() as { name?: string };
  if (!name?.trim()) return NextResponse.json({ error: "Falta nombre" }, { status: 400 });
  await prisma.competitorHotel.upsert({ where: { name: name.trim() }, update: { active: true }, create: { name: name.trim() } });
  return NextResponse.json({ created: true }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: "DATABASE_URL no configurada" }, { status: 503 });
  const name = request.nextUrl.searchParams.get("name");
  if (!name) return NextResponse.json({ error: "Falta nombre" }, { status: 400 });
  await prisma.competitorHotel.update({ where: { name }, data: { active: false } });
  return NextResponse.json({ deleted: true });
}
