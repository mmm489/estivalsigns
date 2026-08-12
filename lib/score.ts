import { inRange } from "@/lib/date-utils";
import type { CompRate, DayDemand, EventSignal, HolidaySignal, SchoolBreakSignal, ScoreWeights, WeatherSignal } from "@/lib/types";

export const defaultWeights: ScoreWeights = {
  frenchZone: 7,
  holiday: 8,
  bridge: 5,
  highImpactEvent: 14,
  themeParkSpecial: 12,
  weekend: 8,
  seasons: [8, 8, 10, 18, 25, 35, 45, 50, 34, 25, 12, 10],
};

export const median = (numbers: number[]) => {
  if (!numbers.length) return undefined;
  const values = [...numbers].sort((a, b) => a - b);
  const middle = Math.floor(values.length / 2);
  return values.length % 2 ? values[middle] : (values[middle - 1] + values[middle]) / 2;
};

export function calculateDemandDay(
  date: string,
  data: { holidays: HolidaySignal[]; schoolBreaks: SchoolBreakSignal[]; events: EventSignal[]; weather: WeatherSignal[]; compRates: CompRate[] },
  weights: ScoreWeights = defaultWeights,
): DayDemand {
  const month = Number(date.slice(5, 7)) - 1;
  const weekday = new Date(`${date}T12:00:00Z`).getUTCDay();
  const holidays = data.holidays.filter((item) => item.date === date);
  const schoolBreaks = data.schoolBreaks.filter((item) => inRange(date, item.startDate, item.endDate));
  const events = data.events.filter((item) => inRange(date, item.startDate, item.endDate));
  const weather = data.weather.find((item) => item.date === date);
  const currentRates = data.compRates.filter((item) => item.stayDate === date);
  const compMedian = median(currentRates.map((item) => item.price));
  const factors: DayDemand["factors"] = [];
  factors.push({ label: "Curva estacional", points: weights.seasons[month], type: "season" });
  if (weekday === 0 || weekday === 6) factors.push({ label: "Fin de semana", points: weights.weekend, type: "weekend" });
  for (const holiday of holidays) factors.push({ label: `${holiday.isBridge ? "Puente" : "Festivo"} ${holiday.countryCode}`, points: holiday.isBridge ? weights.bridge : weights.holiday, type: "holiday" });
  for (const school of schoolBreaks.filter((item) => item.countryCode === "FR")) factors.push({ label: school.zone ?? "Vacaciones FR", points: weights.frenchZone, type: "school" });
  for (const event of events.filter((item) => item.impact >= 4)) factors.push({ label: event.name, points: event.category === "parque" ? weights.themeParkSpecial : weights.highImpactEvent, type: "event" });
  const score = Math.max(0, Math.min(100, factors.reduce((sum, factor) => sum + factor.points, 0)));
  const level: DayDemand["level"] = score >= 80 ? "muy caliente" : score >= 65 ? "caliente" : score >= 45 ? "activa" : score >= 25 ? "templada" : "fría";
  return { date, score, level, factors, holidays, schoolBreaks, events, weather, compMedian, compTrend: compMedian ? 4 : undefined, parkStatus: events.some((event) => event.category === "parque") ? "especial" : month >= 3 && month <= 9 ? "abierto" : "por confirmar" };
}

export function demandColor(score: number) {
  if (score >= 80) return "heat-5";
  if (score >= 65) return "heat-4";
  if (score >= 45) return "heat-3";
  if (score >= 25) return "heat-2";
  return "heat-1";
}
