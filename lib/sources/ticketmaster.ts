import type { DataSourceAdapter, EventSignal, SourceResult } from "@/lib/types";

export class TicketmasterSource implements DataSourceAdapter<EventSignal> {
  readonly id = "ticketmaster" as const;

  constructor(private readonly apiKey = process.env.TICKETMASTER_API_KEY) {}

  async fetch(range: { start: string; end: string }): Promise<SourceResult<EventSignal>> {
    if (!this.apiKey) return { source: this.id, fetchedAt: new Date().toISOString(), records: [], stale: true, warning: "TICKETMASTER_API_KEY no configurada" };
    const url = new URL("https://app.ticketmaster.com/discovery/v2/events.json");
    url.searchParams.set("apikey", this.apiKey);
    url.searchParams.set("latlong", "41.076,1.183");
    url.searchParams.set("radius", "50");
    url.searchParams.set("unit", "km");
    url.searchParams.set("startDateTime", `${range.start}T00:00:00Z`);
    url.searchParams.set("endDateTime", `${range.end}T23:59:59Z`);
    url.searchParams.set("locale", "es-es");
    url.searchParams.set("size", "200");
    const response = await fetch(url, { headers: { accept: "application/json" } });
    if (!response.ok) throw new Error(`Ticketmaster: HTTP ${response.status}`);
    const body = await response.json() as { _embedded?: { events?: TicketmasterEvent[] } };
    const records = (body._embedded?.events ?? []).flatMap((event): EventSignal[] => {
      const venue = event._embedded?.venues?.[0];
      const startDate = event.dates?.start?.localDate;
      if (!startDate) return [];
      return [{
        id: `ticketmaster:${event.id}`,
        name: event.name,
        startDate,
        endDate: event.dates?.end?.localDate ?? startDate,
        category: "otro",
        impact: venue?.capacity && venue.capacity >= 5000 ? 4 : 2,
        city: venue?.city?.name,
        venue: venue?.name,
        confirmed: true,
        source: event.url ?? "Ticketmaster Discovery API",
      }];
    });
    return { source: this.id, fetchedAt: new Date().toISOString(), records, stale: false };
  }
}

interface TicketmasterEvent {
  id: string;
  name: string;
  url?: string;
  dates?: { start?: { localDate?: string }; end?: { localDate?: string } };
  _embedded?: { venues?: Array<{ name?: string; capacity?: number; city?: { name?: string } }> };
}
