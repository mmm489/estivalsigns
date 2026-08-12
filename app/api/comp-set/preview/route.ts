import { NextRequest, NextResponse } from "next/server";
import { parseCompSetCsv } from "@/lib/csv";

export async function POST(request: NextRequest) {
  const body = await request.text();
  if (body.length > 2_000_000) return NextResponse.json({ error: "Archivo demasiado grande" }, { status: 413 });
  const result = parseCompSetCsv(body);
  return NextResponse.json({ ...result, valid: result.errors.length === 0 });
}
