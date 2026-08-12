import { addDays, iso } from "@/lib/date-utils";
import type { CompRate, EventSignal, HolidaySignal, SchoolBreakSignal, WeatherSignal } from "@/lib/types";

const today = new Date();
const year = today.getFullYear();
const current = iso(today);

const dateAt = (month: number, day: number, targetYear = year) => `${targetYear}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

export const demoHolidays: HolidaySignal[] = [
  { id: "es-assumption", date: dateAt(8, 15), countryCode: "ES", localName: "Asunción de la Virgen", name: "Assumption", isNational: true, isBridge: false, sourceUrl: "https://date.nager.at" },
  { id: "fr-assumption", date: dateAt(8, 15), countryCode: "FR", localName: "Assomption", name: "Assumption", isNational: true, isBridge: false, sourceUrl: "https://date.nager.at" },
  { id: "cat-national", date: dateAt(9, 11), countryCode: "ES", subdivisionCode: "ES-CT", localName: "Diada Nacional de Catalunya", name: "National Day of Catalonia", isNational: false, isBridge: false, sourceUrl: "https://date.nager.at" },
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
  { id: "santa-tecla", name: "Santa Tecla", startDate: dateAt(9, 15), endDate: dateAt(9, 24), category: "festival", impact: 4, city: "Tarragona", confirmed: false, source: "Fecha orientativa · confirmar" },
  { id: "castells", name: "Concurs de Castells", startDate: dateAt(10, 3), endDate: dateAt(10, 4), category: "festival", impact: 5, city: "Tarragona", venue: "Tarraco Arena", confirmed: false, source: "Recurrente bienal · confirmar" },
  { id: "halloween", name: "Halloween en PortAventura", startDate: dateAt(10, 1), endDate: dateAt(10, 31), category: "parque", impact: 4, city: "Vila-seca", confirmed: false, source: "Temporada recurrente · confirmar calendario" },
  { id: "congress", name: "Congreso tecnológico mediterráneo", startDate: addDays(current, 18), endDate: addDays(current, 20), category: "congreso", impact: 4, city: "Vila-seca", venue: "PortAventura Convention Centre", confirmed: false, source: "Ejemplo manual · sustituir" },
];

export const demoWeather: WeatherSignal[] = Array.from({ length: 14 }, (_, index) => ({
  date: addDays(current, index),
  temperatureMax: 27 + (index % 4),
  precipitationChance: [5, 10, 15, 45, 25, 10, 5][index % 7],
  weatherCode: [0, 1, 2, 61][index % 4],
}));

const compHotels = ["Golden Costa", "H10 Salauris", "Ohtels Vila Romana", "Blaumar", "Magnolia", "Best Negresco"];
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
