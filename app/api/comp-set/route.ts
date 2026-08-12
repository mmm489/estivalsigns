import { NextRequest, NextResponse } from "next/server";
import { saveCompRates } from "@/lib/persistence";

export async function POST(request: NextRequest) {
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: "DATABASE_URL no configurada" }, { status: 503 });
  const row = await request.json() as { hotel?: string; stayDate?: string; queriedAt?: string; price?: number; mealPlan?: "SA" | "AD" | "MP" | "TI"; notes?: string };
  if (!row.hotel || !row.stayDate || !row.queriedAt || !Number.isFinite(row.price) || Number(row.price) < 0 || !row.mealPlan) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  await saveCompRates([{ hotel: row.hotel, stayDate: row.stayDate, queriedAt: row.queriedAt, price: Number(row.price), mealPlan: row.mealPlan, notes: row.notes }]);
  return NextResponse.json({ created: true }, { status: 201 });
}
