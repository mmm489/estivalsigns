import { NextRequest, NextResponse } from "next/server";
import { NagerDateSource } from "@/lib/sources/nager";
import { OpenHolidaysSource } from "@/lib/sources/openholidays";
import { OpenMeteoSource } from "@/lib/sources/openmeteo";
import { TicketmasterSource } from "@/lib/sources/ticketmaster";
import { addDays, iso } from "@/lib/date-utils";

export const dynamic = "force-dynamic";

const authorized = (request: NextRequest) => {
  const secret = process.env.CRON_SECRET;
  return !secret || request.headers.get("authorization") === `Bearer ${secret}`;
};

export async function POST(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const start = iso(new Date()); const end = addDays(start, 548);
  const sources = [new NagerDateSource(), new OpenHolidaysSource(), new TicketmasterSource(), new OpenMeteoSource()];
  const results = await Promise.allSettled(sources.map((source) => source instanceof OpenMeteoSource ? source.fetch() : source.fetch({ start, end })));
  return NextResponse.json({ refreshedAt: new Date().toISOString(), results: results.map((result, index) => result.status === "fulfilled" ? { source: sources[index].id, ok: true, records: result.value.records.length, warning: result.value.warning } : { source: sources[index].id, ok: false, error: String(result.reason) }) });
}
