import type { CompRate, EventSignal, HolidaySignal, SchoolBreakSignal, SourceResult, WeatherSignal } from "@/lib/types";
import { prisma } from "@/lib/prisma";

export async function saveHolidays(result: SourceResult<HolidaySignal>) {
  await prisma.$transaction(result.records.map((row) => prisma.publicHoliday.upsert({ where: { externalId: row.id }, update: { date: new Date(row.date), countryCode: row.countryCode, subdivisionCode: row.subdivisionCode, localName: row.localName, name: row.name, isNational: row.isNational, isBridge: row.isBridge, sourceUrl: row.sourceUrl, fetchedAt: new Date(result.fetchedAt) }, create: { externalId: row.id, date: new Date(row.date), countryCode: row.countryCode, subdivisionCode: row.subdivisionCode, localName: row.localName, name: row.name, isNational: row.isNational, isBridge: row.isBridge, sourceUrl: row.sourceUrl, fetchedAt: new Date(result.fetchedAt) } })));
}

export async function saveSchoolBreaks(result: SourceResult<SchoolBreakSignal>) {
  await prisma.$transaction(result.records.map((row) => prisma.schoolHoliday.upsert({ where: { externalId: row.id }, update: { countryCode: row.countryCode, zone: row.zone, name: row.name, startDate: new Date(row.startDate), endDate: new Date(row.endDate), confirmed: row.confirmed, source: row.source === "manual" ? "MANUAL" : row.source === "data.gouv.fr" ? "DATA_GOUV_FR" : "OPEN_HOLIDAYS", fetchedAt: new Date(result.fetchedAt) }, create: { externalId: row.id, countryCode: row.countryCode, zone: row.zone, name: row.name, startDate: new Date(row.startDate), endDate: new Date(row.endDate), confirmed: row.confirmed, source: row.source === "manual" ? "MANUAL" : row.source === "data.gouv.fr" ? "DATA_GOUV_FR" : "OPEN_HOLIDAYS", fetchedAt: new Date(result.fetchedAt) } })));
}

export async function saveEvents(result: SourceResult<EventSignal>) {
  await prisma.$transaction(result.records.map((row) => prisma.externalEvent.upsert({ where: { externalId: row.id }, update: { name: row.name, startDate: new Date(row.startDate), endDate: new Date(row.endDate), venue: row.venue, city: row.city, impact: row.impact, sourceUrl: row.source, fetchedAt: new Date(result.fetchedAt) }, create: { externalId: row.id, name: row.name, startDate: new Date(row.startDate), endDate: new Date(row.endDate), venue: row.venue, city: row.city, impact: row.impact, sourceUrl: row.source, fetchedAt: new Date(result.fetchedAt) } })));
}

export async function saveWeather(result: SourceResult<WeatherSignal>) {
  await prisma.$transaction(result.records.map((row) => prisma.weatherForecast.upsert({ where: { date: new Date(row.date) }, update: { temperatureMax: row.temperatureMax, precipitationChance: row.precipitationChance, weatherCode: row.weatherCode, fetchedAt: new Date(result.fetchedAt) }, create: { date: new Date(row.date), temperatureMax: row.temperatureMax, precipitationChance: row.precipitationChance, weatherCode: row.weatherCode, fetchedAt: new Date(result.fetchedAt) } })));
}

export async function saveCompRates(rows: Omit<CompRate, "id">[]) {
  for (const row of rows) {
    const hotel = await prisma.competitorHotel.upsert({ where: { name: row.hotel }, update: {}, create: { name: row.hotel } });
    await prisma.competitorRate.upsert({ where: { competitorHotelId_stayDate_queriedAt_mealPlan: { competitorHotelId: hotel.id, stayDate: new Date(row.stayDate), queriedAt: new Date(row.queriedAt), mealPlan: row.mealPlan } }, update: { price: row.price, notes: row.notes }, create: { competitorHotelId: hotel.id, stayDate: new Date(row.stayDate), queriedAt: new Date(row.queriedAt), price: row.price, mealPlan: row.mealPlan, notes: row.notes } });
  }
}

export async function updateSourceState(source: "NAGER" | "OPEN_HOLIDAYS" | "TICKETMASTER" | "OPEN_METEO", success: boolean, records: number, error?: string) {
  const now = new Date();
  await prisma.dataSourceState.upsert({ where: { source }, update: { lastAttemptAt: now, lastSuccessAt: success ? now : undefined, status: success ? "ok" : "error", records, errorMessage: error }, create: { source, lastAttemptAt: now, lastSuccessAt: success ? now : undefined, status: success ? "ok" : "error", records, errorMessage: error } });
}
