import test from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import Home from "../app/page.tsx";

test("renders Estival Signals with an explicit external-data boundary", () => {
  const html = renderToStaticMarkup(Home());
  assert.match(html, /Estival Signals/);
  assert.match(html, /Solo datos públicos y externos/);
  assert.match(html, /Sin ocupación, ADR, reservas, PMS ni información de huéspedes/);
  assert.doesNotMatch(html, /RevPAR|habitaciones vendidas|ingresos del hotel/i);
});
