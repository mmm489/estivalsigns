import { NextRequest, NextResponse } from "next/server";
import { NagerDateSource } from "@/lib/sources/nager";
import { OpenHolidaysSource } from "@/lib/sources/openholidays";
import { addDays, iso } from "@/lib/date-utils";
import { saveHolidays, saveSchoolBreaks, updateSourceState } from "@/lib/persistence";

export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  if (process.env.CRON_SECRET && request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const start = iso(new Date()); const end = addDays(start, 548);
  const results = await Promise.allSettled([new NagerDateSource().fetch({ start, end }), new OpenHolidaysSource().fetch({ start, end })]);
  if (process.env.DATABASE_URL) {
    if (results[0].status === "fulfilled") { await saveHolidays(results[0].value); await updateSourceState("NAGER", true, results[0].value.records.length); } else await updateSourceState("NAGER", false, 0, String(results[0].reason));
    if (results[1].status === "fulfilled") { await saveSchoolBreaks(results[1].value); await updateSourceState("OPEN_HOLIDAYS", true, results[1].value.records.length); } else await updateSourceState("OPEN_HOLIDAYS", false, 0, String(results[1].reason));
  }
  return NextResponse.json({ ok: true, refreshedAt: new Date().toISOString(), sources: results.map((result) => result.status) });
}
