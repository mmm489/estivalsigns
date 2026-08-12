export type SourceName =
  | "nager"
  | "openholidays"
  | "ticketmaster"
  | "openmeteo"
  | "manual"
  | "compset";

export interface SourceResult<T> {
  source: SourceName;
  fetchedAt: string;
  records: T[];
  stale: boolean;
  warning?: string;
}

export interface HolidaySignal {
  id: string;
  date: string;
  countryCode: string;
  subdivisionCode?: string;
  localName: string;
  name: string;
  isNational: boolean;
  isBridge: boolean;
  sourceUrl: string;
}

export interface SchoolBreakSignal {
  id: string;
  countryCode: string;
  zone?: string;
  name: string;
  startDate: string;
  endDate: string;
  confirmed: boolean;
  source: "OpenHolidays" | "data.gouv.fr" | "manual";
}

export interface EventSignal {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  category: "festival" | "deporte" | "congreso" | "parque" | "otro";
  impact: 1 | 2 | 3 | 4 | 5;
  city?: string;
  venue?: string;
  confirmed: boolean;
  source: string;
}

export interface WeatherSignal {
  date: string;
  temperatureMax: number;
  precipitationChance: number;
  weatherCode: number;
}

export interface CompRate {
  id: string;
  hotel: string;
  stayDate: string;
  queriedAt: string;
  price: number;
  mealPlan: "SA" | "AD" | "MP" | "TI";
  notes?: string;
}

export interface ScoreWeights {
  frenchZone: number;
  holiday: number;
  bridge: number;
  highImpactEvent: number;
  themeParkSpecial: number;
  weekend: number;
  seasons: number[];
}

export interface DayDemand {
  date: string;
  score: number;
  level: "fría" | "templada" | "activa" | "caliente" | "muy caliente";
  factors: Array<{ label: string; points: number; type: string }>;
  holidays: HolidaySignal[];
  schoolBreaks: SchoolBreakSignal[];
  events: EventSignal[];
  weather?: WeatherSignal;
  compMedian?: number;
  compTrend?: number;
  parkStatus?: "abierto" | "cerrado" | "especial" | "por confirmar";
}

export interface CalendarDataset {
  holidays: HolidaySignal[];
  schoolBreaks: SchoolBreakSignal[];
  events: EventSignal[];
  weather: WeatherSignal[];
  compRates: CompRate[];
}

export interface DataSourceAdapter<T> {
  readonly id: SourceName;
  fetch(range: { start: string; end: string }): Promise<SourceResult<T>>;
}
