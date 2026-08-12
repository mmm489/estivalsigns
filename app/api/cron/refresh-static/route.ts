import { NextRequest, NextResponse } from "next/server";
import { NagerDateSource } from "@/lib/sources/nager";
import { OpenHolidaysSource } from "@/lib/sources/openholidays";
import { addDays, iso } from "@/lib/date-utils";

export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  if (process.env.CRON_SECRET && request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const start = iso(new Date()); const end = addDays(start, 548);
  const results = await Promise.allSettled([new NagerDateSource().fetch({ start, end }), new OpenHolidaysSource().fetch({ start, end })]);
  return NextResponse.json({ ok: true, refreshedAt: new Date().toISOString(), sources: results.map((result) => result.status) });
}
