import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CalendarApp } from "../components/calendar-app.tsx";
import { demoDataset } from "../lib/demo-data.ts";

test("renders Estival Signals with an explicit external-data boundary", () => {
  const html = renderToStaticMarkup(createElement(CalendarApp, { initialData: demoDataset, demoMode: true }));
  assert.match(html, /Estival Signals/);
  assert.match(html, /Todo Estival Group/);
  assert.match(html, /18 establecimientos/);
  assert.match(html, /Costa Daurada/);
  assert.match(html, /Solo datos públicos y externos/);
  assert.match(html, /Sin ocupación, ADR, reservas, PMS ni información de huéspedes/);
  assert.doesNotMatch(html, /RevPAR|habitaciones vendidas|ingresos del hotel/i);
});
