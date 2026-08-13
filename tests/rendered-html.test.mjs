import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CalendarApp } from "../components/calendar-app.tsx";
import { demoDataset } from "../lib/demo-data.ts";

test("renders Revenue Signals as an anonymized demonstration", () => {
  const html = renderToStaticMarkup(createElement(CalendarApp, { initialData: demoDataset, demoMode: true }));
  assert.match(html, /Revenue Signals/);
  assert.match(html, /Toda la cartera/);
  assert.match(html, /18 establecimientos/);
  assert.match(html, /Litoral Mediterráneo/);
  assert.match(html, /Entorno de demostración anonimizado/);
  assert.match(html, /nombres de la cadena, establecimientos y destinos son ficticios/);
  assert.match(html, /Sin ocupación, ADR, reservas, PMS ni información de huéspedes/);
  assert.doesNotMatch(html, /RevPAR|habitaciones vendidas|ingresos del hotel/i);
  assert.doesNotMatch(html, /Estival|La Pineda|PortAventura/i);
});
