import { NextRequest, NextResponse } from "next/server";
import { parseCompSetCsv } from "@/lib/csv";
import { saveCompRates } from "@/lib/persistence";

export async function POST(request: NextRequest) {
  const body = await request.text();
  if (body.length > 2_000_000) return NextResponse.json({ error: "Archivo demasiado grande" }, { status: 413 });
  const result = parseCompSetCsv(body);
  if (request.nextUrl.searchParams.get("commit") === "true" && result.errors.length === 0 && process.env.DATABASE_URL) await saveCompRates(result.rows);
  return NextResponse.json({ ...result, valid: result.errors.length === 0 });
}
