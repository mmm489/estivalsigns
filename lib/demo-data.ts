import { addDays, iso } from "@/lib/date-utils";
import type { CalendarDataset, CompRate, EventSignal, HolidaySignal, SchoolBreakSignal, WeatherSignal } from "@/lib/types";

const today = new Date();
const year = today.getFullYear();
const current = iso(today);

const dateAt = (month: number, day: number, targetYear = year) => `${targetYear}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

export const demoHolidays: HolidaySignal[] = [
  { id: "es-assumption", date: dateAt(8, 15), countryCode: "ES", localName: "Asunción de la Virgen", name: "Assumption", isNational: true, isBridge: false, sourceUrl: "https://date.nager.at" },
  { id: "fr-assumption", date: dateAt(8, 15), countryCode: "FR", localName: "Assomption", name: "Assumption", isNational: true, isBridge: false, sourceUrl: "https://date.nager.at" },
  { id: "regional-holiday", date: dateAt(9, 11), countryCode: "ES", subdivisionCode: "ES-CT", localName: "Festivo autonómico", name: "Regional Holiday", isNational: false, isBridge: false, sourceUrl: "https://date.nager.at" },
  { id: "es-hispanic", date: dateAt(10, 12), countryCode: "ES", localName: "Fiesta Nacional de España", name: "National Day", isNational: true, isBridge: false, sourceUrl: "https://date.nager.at" },
  { id: "fr-all-saints", date: dateAt(11, 1), countryCode: "FR", localName: "Toussaint", name: "All Saints", isNational: true, isBridge: false, sourceUrl: "https://date.nager.at" },
];

export const demoSchoolBreaks: SchoolBreakSignal[] = [
  { id: "fr-a-summer", countryCode: "FR", zone: "Zona A", name: "Vacances d'été", startDate: dateAt(7, 4), endDate: dateAt(8, 31), confirmed: true, source: "OpenHolidays" },
  { id: "fr-b-summer", countryCode: "FR", zone: "Zona B", name: "Vacances d'été", startDate: dateAt(7, 4), endDate: dateAt(8, 31), confirmed: true, source: "OpenHolidays" },
  { id: "fr-c-summer", countryCode: "FR", zone: "Zona C", name: "Vacances d'été", startDate: dateAt(7, 4), endDate: dateAt(8, 31), confirmed: true, source: "OpenHolidays" },
  { id: "fr-a-autumn", countryCode: "FR", zone: "Zona A", name: "Vacances de la Toussaint", startDate: dateAt(10, 17), endDate: dateAt(11, 2), confirmed: true, source: "OpenHolidays" },
  { id: "fr-b-autumn", countryCode: "FR", zone: "Zona B", name: "Vacances de la Toussaint", startDate: dateAt(10, 17), endDate: dateAt(11, 2), confirmed: true, source: "OpenHolidays" },
  { id: "fr-c-autumn", countryCode: "FR", zone: "Zona C", name: "Vacances de la Toussaint", startDate: dateAt(10, 17), endDate: dateAt(11, 2), confirmed: true, source: "OpenHolidays" },
  { id: "uk-october", countryCode: "GB", zone: "Councils prioritarios", name: "Half-term de octubre", startDate: dateAt(10, 26), endDate: dateAt(11, 1), confirmed: false, source: "manual" },
];

export const demoEvents: EventSignal[] = [
  { id: "festival-regional", name: "Festival regional", startDate: dateAt(9, 15), endDate: dateAt(9, 24), category: "festival", impact: 4, city: "Ciudad costera", confirmed: false, source: "Dato ficticio · presentación" },
  { id: "evento-deportivo", name: "Evento deportivo nacional", startDate: dateAt(10, 3), endDate: dateAt(10, 4), category: "deporte", impact: 5, city: "Ciudad costera", venue: "Recinto de eventos", confirmed: false, source: "Dato ficticio · presentación" },
  { id: "temporada-parque", name: "Temporada especial del parque", startDate: dateAt(10, 1), endDate: dateAt(10, 31), category: "parque", impact: 4, city: "Destino costero", confirmed: false, source: "Dato ficticio · presentación" },
  { id: "congress", name: "Congreso tecnológico", startDate: addDays(current, 18), endDate: addDays(current, 20), category: "congreso", impact: 4, city: "Destino costero", venue: "Centro de convenciones", confirmed: false, source: "Dato ficticio · presentación" },
];

export const demoWeather: WeatherSignal[] = Array.from({ length: 14 }, (_, index) => ({
  date: addDays(current, index),
  temperatureMax: 27 + (index % 4),
  precipitationChance: [5, 10, 15, 45, 25, 10, 5][index % 7],
  weatherCode: [0, 1, 2, 61][index % 4],
}));

const compHotels = ["Competidor A", "Competidor B", "Competidor C", "Competidor D", "Competidor E", "Competidor F"];
export const demoCompRates: CompRate[] = Array.from({ length: 16 }, (_, dayIndex) => addDays(current, dayIndex * 4)).flatMap((stayDate, dateIndex) =>
  compHotels.map((hotel, hotelIndex) => ({
    id: `${hotel}-${stayDate}`,
    hotel,
    stayDate,
    queriedAt: addDays(current, -7),
    price: 148 + dateIndex * 6 + hotelIndex * 7,
    mealPlan: hotelIndex % 2 ? "AD" : "MP",
  })),
);

export const sourceStatuses = [
  { name: "Festivos · Nager.Date", updated: "Hoy, 03:17", state: "al día", tone: "ok" },
  { name: "Vacaciones · OpenHolidays", updated: "Hoy, 03:22", state: "al día", tone: "ok" },
  { name: "Eventos · Ticketmaster", updated: "Sin clave API", state: "pendiente", tone: "warn" },
  { name: "Tiempo · Open-Meteo", updated: "Hoy, 04:37", state: "al día", tone: "ok" },
];

export const demoDataset: CalendarDataset = { holidays: demoHolidays, schoolBreaks: demoSchoolBreaks, events: demoEvents, weather: demoWeather, compRates: demoCompRates, competitorHotels: compHotels, activeMarkets: ["FR", "ES", "GB", "IE", "DE", "NL", "BE"] };

/** Masks any names that may arrive from a previously populated database. */
export function anonymizeCalendarDataset(data: CalendarDataset): CalendarDataset {
  const eventCounts = new Map<string, number>();
  const eventNames: Record<EventSignal["category"], string> = {
    festival: "Festival regional",
    deporte: "Evento deportivo",
    congreso: "Congreso profesional",
    parque: "Evento de parque temático",
    otro: "Evento externo",
  };
  const competitorNames = [...new Set([
    ...(data.competitorHotels ?? []),
    ...data.compRates.map((rate) => rate.hotel),
  ])].sort().map((name, index) => [name, `Competidor ${String.fromCharCode(65 + index)}`] as const);
  const competitorMap = new Map(competitorNames);

  return {
    ...data,
    events: data.events.map((event) => {
      const count = (eventCounts.get(event.category) ?? 0) + 1;
      eventCounts.set(event.category, count);
      return {
        ...event,
        name: `${eventNames[event.category]} ${String(count).padStart(2, "0")}`,
        city: event.city ? "Destino piloto" : undefined,
        venue: event.venue ? "Recinto local" : undefined,
        source: "Fuente externa anonimizada",
      };
    }),
    compRates: data.compRates.map((rate) => ({ ...rate, hotel: competitorMap.get(rate.hotel) ?? "Competidor" })),
    competitorHotels: (data.competitorHotels ?? []).map((name) => competitorMap.get(name) ?? "Competidor"),
  };
}
