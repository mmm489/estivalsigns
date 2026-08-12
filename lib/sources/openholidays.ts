import type { DataSourceAdapter, SchoolBreakSignal, SourceResult } from "@/lib/types";

interface OpenHolidayItem {
  id: string;
  startDate: string;
  endDate: string;
  name: Array<{ language: string; text: string }>;
  subdivisions?: Array<{ code: string; shortName: string }>;
}

const configs = [
  { country: "FR", language: "FR", subdivisions: ["FR-A", "FR-B", "FR-C"] },
  { country: "DE", language: "DE" },
  { country: "ES", language: "ES" },
];

const textName = (item: OpenHolidayItem) => item.name.find((name) => name.language.toLowerCase().startsWith("es"))?.text ?? item.name[0]?.text ?? "Vacaciones escolares";

export class OpenHolidaysSource implements DataSourceAdapter<SchoolBreakSignal> {
  readonly id = "openholidays" as const;

  async fetch(range: { start: string; end: string }): Promise<SourceResult<SchoolBreakSignal>> {
    const records: SchoolBreakSignal[] = [];
    for (const config of configs) {
      const url = new URL("https://openholidaysapi.org/SchoolHolidays");
      url.searchParams.set("countryIsoCode", config.country);
      url.searchParams.set("languageIsoCode", config.language);
      url.searchParams.set("validFrom", range.start);
      url.searchParams.set("validTo", range.end);
      const response = await fetch(url, { headers: { accept: "application/json" } });
      if (!response.ok) throw new Error(`OpenHolidays ${config.country}: HTTP ${response.status}`);
      const items = (await response.json()) as OpenHolidayItem[];
      for (const item of items) {
        const subdivisions = item.subdivisions?.length ? item.subdivisions : [undefined];
        for (const subdivision of subdivisions) {
          records.push({
            id: `openholidays:${config.country}:${item.id}:${subdivision?.code ?? "all"}`,
            countryCode: config.country,
            zone: subdivision?.shortName ?? subdivision?.code,
            name: textName(item),
            startDate: item.startDate,
            endDate: item.endDate,
            confirmed: true,
            source: "OpenHolidays",
          });
        }
      }
    }
    return { source: this.id, fetchedAt: new Date().toISOString(), records, stale: false };
  }
}

export function defaultUkHalfTerms(year: number): SchoolBreakSignal[] {
  return [
    { id: `uk-may-${year}`, countryCode: "GB", zone: "Councils prioritarios", name: "Half-term de mayo", startDate: `${year}-05-25`, endDate: `${year}-05-31`, confirmed: false, source: "manual" },
    { id: `uk-oct-${year}`, countryCode: "GB", zone: "Councils prioritarios", name: "Half-term de octubre", startDate: `${year}-10-26`, endDate: `${year}-11-01`, confirmed: false, source: "manual" },
  ];
}
