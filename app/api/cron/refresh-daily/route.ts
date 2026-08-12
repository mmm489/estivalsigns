import { NextRequest, NextResponse } from "next/server";
import { TicketmasterSource } from "@/lib/sources/ticketmaster";
import { OpenMeteoSource } from "@/lib/sources/openmeteo";
import { addDays, iso } from "@/lib/date-utils";
import { saveEvents, saveWeather, updateSourceState } from "@/lib/persistence";

export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  if (process.env.CRON_SECRET && request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const start = iso(new Date()); const end = addDays(start, 180);
  const results = await Promise.allSettled([new TicketmasterSource().fetch({ start, end }), new OpenMeteoSource().fetch()]);
  if (process.env.DATABASE_URL) {
    if (results[0].status === "fulfilled") { await saveEvents(results[0].value); await updateSourceState("TICKETMASTER", true, results[0].value.records.length); } else await updateSourceState("TICKETMASTER", false, 0, String(results[0].reason));
    if (results[1].status === "fulfilled") { await saveWeather(results[1].value); await updateSourceState("OPEN_METEO", true, results[1].value.records.length); } else await updateSourceState("OPEN_METEO", false, 0, String(results[1].reason));
  }
  return NextResponse.json({ ok: true, refreshedAt: new Date().toISOString(), sources: results.map((result) => result.status) });
}
