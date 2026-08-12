import { addDays } from "@/lib/date-utils";
import type { DataSourceAdapter, HolidaySignal, SourceResult } from "@/lib/types";

const COUNTRIES = ["ES", "FR", "GB", "IE", "DE", "NL", "BE"] as const;
const SPANISH_SUBDIVISIONS = new Set(["ES-CT", "ES-AR", "ES-MD", "ES-PV", "ES-NC"]);

interface NagerV3Holiday {
  date: string;
  localName: string;
  name: string;
  countryCode: string;
  global: boolean;
  counties?: string[] | null;
}

export function mapNagerHoliday(raw: NagerV3Holiday): HolidaySignal[] {
  const counties = raw.counties?.length ? raw.counties : [undefined];
  return counties
    .filter((county) => raw.countryCode !== "ES" || !county || SPANISH_SUBDIVISIONS.has(county))
    .map((county) => ({
      id: `nager:${raw.countryCode}:${raw.date}:${county ?? "national"}:${raw.name}`,
      date: raw.date,
      countryCode: raw.countryCode,
      subdivisionCode: county,
      localName: raw.localName,
      name: raw.name,
      isNational: raw.global || !county,
      isBridge: false,
      sourceUrl: `https://date.nager.at/api/v3/PublicHolidays/${raw.date.slice(0, 4)}/${raw.countryCode}`,
    }));
}

export function detectBridges(holidays: HolidaySignal[]) {
  const bridges: HolidaySignal[] = [];
  for (const holiday of holidays) {
    const weekday = new Date(`${holiday.date}T12:00:00Z`).getUTCDay();
    const bridgeDate = weekday === 2 ? addDays(holiday.date, -1) : weekday === 4 ? addDays(holiday.date, 1) : null;
    if (!bridgeDate) continue;
    bridges.push({
      ...holiday,
      id: `${holiday.id}:bridge`,
      date: bridgeDate,
      localName: `Puente probable · ${holiday.localName}`,
      name: `Probable bridge · ${holiday.name}`,
      isNational: false,
      isBridge: true,
    });
  }
  return [...holidays, ...bridges];
}

export class NagerDateSource implements DataSourceAdapter<HolidaySignal> {
  readonly id = "nager" as const;

  async fetch(range: { start: string; end: string }): Promise<SourceResult<HolidaySignal>> {
    const years = Array.from({ length: Number(range.end.slice(0, 4)) - Number(range.start.slice(0, 4)) + 1 }, (_, i) => Number(range.start.slice(0, 4)) + i);
    const responses = await Promise.all(
      years.flatMap((year) => COUNTRIES.map(async (country) => {
        const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${country}`, { headers: { accept: "application/json" } });
        if (!response.ok) throw new Error(`Nager.Date ${country}/${year}: HTTP ${response.status}`);
        return (await response.json()) as NagerV3Holiday[];
      })),
    );
    const records = detectBridges(responses.flatMap((items) => items.flatMap(mapNagerHoliday)))
      .filter((holiday) => holiday.date >= range.start && holiday.date <= range.end);
    return { source: this.id, fetchedAt: new Date().toISOString(), records, stale: false };
  }
}
