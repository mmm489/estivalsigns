import type { DataSourceAdapter, SourceResult, WeatherSignal } from "@/lib/types";

export class OpenMeteoSource implements DataSourceAdapter<WeatherSignal> {
  readonly id = "openmeteo" as const;

  async fetch(): Promise<SourceResult<WeatherSignal>> {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", process.env.PILOT_LATITUDE ?? "40.4168");
    url.searchParams.set("longitude", process.env.PILOT_LONGITUDE ?? "-3.7038");
    url.searchParams.set("daily", "temperature_2m_max,precipitation_probability_max,weather_code");
    url.searchParams.set("timezone", "Europe/Madrid");
    url.searchParams.set("forecast_days", "14");
    const response = await fetch(url, { headers: { accept: "application/json" } });
    if (!response.ok) throw new Error(`Open-Meteo: HTTP ${response.status}`);
    const body = await response.json() as { daily: { time: string[]; temperature_2m_max: number[]; precipitation_probability_max: number[]; weather_code: number[] } };
    const records = body.daily.time.map((date, index) => ({ date, temperatureMax: body.daily.temperature_2m_max[index], precipitationChance: body.daily.precipitation_probability_max[index], weatherCode: body.daily.weather_code[index] }));
    return { source: this.id, fetchedAt: new Date().toISOString(), records, stale: false };
  }
}
