import { NextRequest, NextResponse } from "next/server";
import { TicketmasterSource } from "@/lib/sources/ticketmaster";
import { OpenMeteoSource } from "@/lib/sources/openmeteo";
import { addDays, iso } from "@/lib/date-utils";

export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  if (process.env.CRON_SECRET && request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const start = iso(new Date()); const end = addDays(start, 180);
  const results = await Promise.allSettled([new TicketmasterSource().fetch({ start, end }), new OpenMeteoSource().fetch()]);
  return NextResponse.json({ ok: true, refreshedAt: new Date().toISOString(), sources: results.map((result) => result.status) });
}
