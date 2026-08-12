import test from "node:test";
import assert from "node:assert/strict";
import { detectBridges, mapNagerHoliday } from "../lib/sources/nager.ts";
import { calculateDemandDay, defaultWeights, median } from "../lib/score.ts";
import { parseCompSetCsv } from "../lib/csv.ts";
import { validateAggregatedPmsHeaders } from "../lib/sources/ulyses.ts";

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
