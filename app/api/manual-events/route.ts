import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const categories = { festival: "FESTIVAL", deporte: "SPORT", congreso: "CONGRESS", parque: "THEME_PARK", otro: "OTHER" } as const;

export async function POST(request: NextRequest) {
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: "DATABASE_URL no configurada" }, { status: 503 });
  const body = await request.json() as { name?: string; startDate?: string; endDate?: string; category?: keyof typeof categories; impact?: number; confirmed?: boolean; notes?: string };
  if (!body.name || !body.startDate || !body.category || !categories[body.category] || !Number.isInteger(body.impact) || Number(body.impact) < 1 || Number(body.impact) > 5) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  const event = await prisma.manualEvent.create({ data: { name: body.name, startDate: new Date(body.startDate), endDate: new Date(body.endDate ?? body.startDate), category: categories[body.category], impact: Number(body.impact), confirmed: Boolean(body.confirmed), notes: body.notes, source: "Entrada manual" } });
  return NextResponse.json({ id: event.id }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: "DATABASE_URL no configurada" }, { status: 503 });
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Falta id" }, { status: 400 });
  await prisma.manualEvent.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
