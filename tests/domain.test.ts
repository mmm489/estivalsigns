import test from "node:test";
import assert from "node:assert/strict";
import { detectBridges, mapNagerHoliday } from "../lib/sources/nager.ts";
import { calculateDemandDay, defaultWeights, median } from "../lib/score.ts";
import { parseCompSetCsv } from "../lib/csv.ts";
import { validateAggregatedPmsHeaders } from "../lib/sources/ulyses.ts";
import { datasetForScope, demoPortfolio, portfolioStats, resolvePortfolioScope, weightsForScope } from "../lib/portfolio.ts";

test("Nager maps selected Spanish subdivisions", () => {
  const rows = mapNagerHoliday({ date: "2026-09-11", localName: "Diada", name: "Catalonia Day", countryCode: "ES", global: false, counties: ["ES-CT", "ES-AN"] });
  assert.equal(rows.length, 1); assert.equal(rows[0].subdivisionCode, "ES-CT");
});

test("detects a probable bridge next to a Thursday holiday", () => {
  const base = mapNagerHoliday({ date: "2026-12-03", localName: "Festivo", name: "Holiday", countryCode: "ES", global: true });
  const rows = detectBridges(base); assert.equal(rows[1].date, "2026-12-04"); assert.equal(rows[1].isBridge, true);
});

test("demand score stays within 0–100 and remains explainable", () => {
  const day = calculateDemandDay("2026-08-15", { holidays: [], schoolBreaks: [], events: [], weather: [], compRates: [] }, { ...defaultWeights, seasons: Array(12).fill(150) });
  assert.equal(day.score, 100); assert.ok(day.factors.some((factor) => factor.label === "Curva estacional"));
});

test("median comp set is robust to outliers", () => assert.equal(median([100, 110, 120, 999]), 115));

test("comp set CSV validates required fields", () => {
  const result = parseCompSetCsv("hotel_competidor,fecha_estancia,fecha_consulta,precio,regimen\nHotel A,2026-09-01,2026-08-01,189,MP");
  assert.equal(result.errors.length, 0); assert.equal(result.rows[0].price, 189);
});

test("future PMS parser rejects possible PII headers", () => assert.throws(() => validateAggregatedPmsHeaders(["fecha_estancia", "email_huesped", "habitaciones_vendidas"]), /rechazado/i));

test("demo portfolio keeps the complete 18-property hierarchy", () => {
  assert.equal(demoPortfolio.length, 5);
  assert.deepEqual(portfolioStats, { areas: 5, properties: 18, hotels: 14, apartments: 2, campings: 2 });
  const resort = demoPortfolio[0].clusters.find((cluster) => cluster.id === "resort-costa-central");
  assert.equal(resort?.properties.length, 5);
});

test("portfolio scope resolves area, cluster, property and accommodation", () => {
  const scope = resolvePortfolioScope({ areaId: "montana", clusterId: "resort-montana", propertyId: "hotel-montana-01", accommodation: "all" });
  assert.equal(scope.title, "Hotel Montaña 01");
  assert.equal(scope.seasonality, "mountain");
  assert.match(scope.path, /Destino Montaña · Resort de Montaña · Hotel Montaña 01/);
});

test("non-local scopes never reuse another destination's events, weather or comp set", () => {
  const scoped = datasetForScope({ holidays: [], schoolBreaks: [], events: [{ id: "local", name: "Local", startDate: "2026-01-01", endDate: "2026-01-01", category: "otro", impact: 1, confirmed: true, source: "manual" }], weather: [{ date: "2026-01-01", temperatureMax: 20, precipitationChance: 0, weatherCode: 0 }], compRates: [], competitorHotels: ["Hotel local"], activeMarkets: ["ES"] }, "market-only");
  assert.equal(scoped.events.length, 0);
  assert.equal(scoped.weather.length, 0);
  assert.equal(scoped.competitorHotels.length, 0);
});

test("mountain properties use a winter seasonality curve", () => {
  const mountain = weightsForScope(defaultWeights, "mountain");
  assert.ok(mountain.seasons[0] > mountain.seasons[6]);
});
