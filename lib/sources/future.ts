export interface FutureSignalProvider {
  readonly id: "amadeus" | "google-trends";
  fetch(): Promise<never>;
}

export const amadeusStub: FutureSignalProvider = { id: "amadeus", async fetch() { throw new Error("Fase 2: Amadeus no implementado"); } };
export const googleTrendsStub: FutureSignalProvider = { id: "google-trends", async fetch() { throw new Error("Fase 2: Google Trends no implementado"); } };
