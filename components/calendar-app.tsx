"use client";

import { useMemo, useState } from "react";
import { addDays, formatDate, iso, monthGrid } from "@/lib/date-utils";
import { sourceStatuses } from "@/lib/demo-data";
import { datasetForScope, demoPortfolio, portfolioStats, resolvePortfolioScope, weightsForScope, type PortfolioSelection, type ResolvedPortfolioScope } from "@/lib/portfolio";
import { calculateDemandDay, demandColor, defaultWeights } from "@/lib/score";
import type { CalendarDataset, DayDemand, EventSignal, ScoreWeights } from "@/lib/types";

type View = "calendario" | "agenda" | "comparador" | "configuracion";
const weekdays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const flags: Record<string, string> = { ES: "🇪🇸", FR: "🇫🇷", GB: "🇬🇧", IE: "🇮🇪", DE: "🇩🇪", NL: "🇳🇱", BE: "🇧🇪" };

function useCalendarData(year: number, month: number, weights: ScoreWeights, data: CalendarDataset) {
  return useMemo(() => monthGrid(year, month).map((date) => calculateDemandDay(date, data, weights)), [year, month, weights, data]);
}

export function CalendarApp({ initialData, initialWeights = defaultWeights, demoMode = false }: { initialData: CalendarDataset; initialWeights?: ScoreWeights; demoMode?: boolean }) {
  const now = new Date();
  const [view, setView] = useState<View>("calendario");
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selected, setSelected] = useState(iso(now));
  const [weights, setWeights] = useState(initialWeights);
  const [filters, setFilters] = useState({ holidays: true, school: true, events: true, comp: true });
  const [events, setEvents] = useState<EventSignal[]>(initialData.events);
  const [portfolioSelection, setPortfolioSelection] = useState<PortfolioSelection>({ areaId: "", clusterId: "", propertyId: "", accommodation: "all" });
  const [toast, setToast] = useState("");
  const scope = useMemo(() => resolvePortfolioScope(portfolioSelection), [portfolioSelection]);
  const demandData = useMemo(() => datasetForScope({ ...initialData, events }, scope.signalProfile), [initialData, events, scope.signalProfile]);
  const scopedWeights = useMemo(() => weightsForScope(weights, scope.seasonality), [weights, scope.seasonality]);
  const days = useCalendarData(year, month, scopedWeights, demandData);
  const selectedDay = days.find((day) => day.date === selected) ?? calculateDemandDay(selected, demandData, scopedWeights);

  const moveMonth = (direction: number) => {
    const date = new Date(Date.UTC(year, month + direction, 1));
    setYear(date.getUTCFullYear()); setMonth(date.getUTCMonth()); setSelected(iso(date));
  };

  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 2600); };

  return (
    <main className="app">
      <header className="topbar">
        <div className="brand"><div className="brand-mark">R</div><div><strong>Revenue Signals</strong><span>Demostración corporativa · {portfolioStats.properties} establecimientos ficticios</span></div></div>
        <nav className="nav-tabs" aria-label="Vistas principales">
          {(["calendario", "agenda", "comparador", "configuracion"] as View[]).map((item) => <button className={`nav-tab ${view === item ? "active" : ""}`} onClick={() => setView(item)} key={item}>{item === "configuracion" ? "Configuración" : item[0].toUpperCase() + item.slice(1)}</button>)}
        </nav>
        <div className="top-actions"><div className="source-pill"><span className="dot" /> 3 fuentes al día</div><button className="icon-button" aria-label="Actualizar fuentes" onClick={() => notify("Actualización encolada · se conservan los últimos datos")}>↻</button></div>
      </header>

      <div className="workspace">
        <PortfolioSelector selection={portfolioSelection} setSelection={setPortfolioSelection} scope={scope} />
        <section className="hero">
          <div><p className="eyebrow">{scope.path}</p><h1>{scope.title}<br />señales de demanda.</h1><p className="hero-copy">Festivos, vacaciones escolares y señales externas reunidos en una temperatura explicable para {scope.location}.{scope.signalProfile === "local-demo" && " Incluye eventos, parque temático, meteorología y comp set del destino piloto."}</p></div>
          <div className="hero-note"><strong>Entorno de demostración anonimizado.</strong><br />Los nombres de la cadena, establecimientos y destinos son ficticios. Sin ocupación, ADR, reservas, PMS ni información de huéspedes.{scope.signalProfile !== "local-demo" && <><br /><strong>Contexto preparado:</strong> faltan fuentes locales y comp set propios; nunca se reutilizan los de otro destino.</>}{demoMode && <><br /><strong>Modo demo:</strong> utiliza datos de ejemplo y señales públicas.</>}</div>
        </section>

        {view === "calendario" && <CalendarView {...{ year, month, days, selected, setSelected, moveMonth, filters, setFilters, selectedDay }} />}
        {view === "agenda" && <AgendaView weights={scopedWeights} data={demandData} notify={notify} />}
        {view === "comparador" && <CompareView weights={scopedWeights} data={demandData} />}
        {view === "configuracion" && <SettingsView weights={weights} setWeights={setWeights} events={events} setEvents={setEvents} competitorHotels={demandData.competitorHotels} activeMarkets={initialData.activeMarkets} notify={notify} />}
      </div>
      {toast && <div className="toast" role="status">{toast}</div>}
    </main>
  );
}

function PortfolioSelector({ selection, setSelection, scope }: { selection: PortfolioSelection; setSelection: (selection: PortfolioSelection) => void; scope: ResolvedPortfolioScope }) {
  const clusters = scope.area?.clusters ?? [];
  const properties = scope.cluster?.properties ?? [];
  const accommodations = scope.property?.accommodations ?? [];
  const typeLabels = { hotel: "Hotel", apartments: "Apartamentos", camping: "Camping" } as const;
  return <section className="portfolio-bar" aria-label="Ámbito de la cartera">
    <div className="portfolio-heading"><span className="panel-kicker">Ámbito activo</span><strong>{scope.title}</strong><small>{scope.property ? typeLabels[scope.property.type] : scope.cluster ? "Complejo o localidad" : scope.area ? "Zona" : "Vista corporativa"} · {scope.location}</small></div>
    <div className="portfolio-selectors">
      <label><span>Zona</span><select aria-label="Zona o destino" value={selection.areaId} onChange={(event) => setSelection({ areaId: event.target.value, clusterId: "", propertyId: "", accommodation: "all" })}><option value="">Toda la cartera</option>{demoPortfolio.map((area) => <option value={area.id} key={area.id}>{area.name}</option>)}</select></label>
      <label><span>Complejo / localidad</span><select aria-label="Complejo o localidad" value={selection.clusterId} disabled={!scope.area} onChange={(event) => setSelection({ ...selection, clusterId: event.target.value, propertyId: "", accommodation: "all" })}><option value="">Toda la zona</option>{clusters.map((cluster) => <option value={cluster.id} key={cluster.id}>{cluster.name}</option>)}</select></label>
      <label><span>Establecimiento</span><select aria-label="Establecimiento" value={selection.propertyId} disabled={!scope.cluster} onChange={(event) => setSelection({ ...selection, propertyId: event.target.value, accommodation: "all" })}><option value="">Todos los establecimientos</option>{properties.map((property) => <option value={property.id} key={property.id}>{property.name}</option>)}</select></label>
      <label><span>Alojamiento</span><select aria-label="Tipo de alojamiento" value={selection.accommodation} disabled={!scope.property} onChange={(event) => setSelection({ ...selection, accommodation: event.target.value })}><option value="all">Todo el inventario</option>{accommodations.filter((item) => !item.toLowerCase().startsWith("todo")).map((item) => <option value={item} key={item}>{item}</option>)}</select></label>
    </div>
    <div className="portfolio-stats"><span><b>{portfolioStats.properties}</b> establecimientos</span><span><b>{portfolioStats.hotels}</b> hoteles</span><span><b>{portfolioStats.apartments}</b> apartamentos</span><span><b>{portfolioStats.campings}</b> campings</span></div>
  </section>;
}

interface CalendarViewProps {
  year: number;
  month: number;
  days: DayDemand[];
  selected: string;
  setSelected: (date: string) => void;
  moveMonth: (direction: number) => void;
  filters: Record<string, boolean>;
  setFilters: React.Dispatch<React.SetStateAction<{ holidays: boolean; school: boolean; events: boolean; comp: boolean }>>;
  selectedDay: DayDemand;
}

function CalendarView({ year, month, days, selected, setSelected, moveMonth, filters, setFilters, selectedDay }: CalendarViewProps) {
  return <>
    <div className="toolbar">
      <div className="month-nav"><button className="btn" onClick={() => moveMonth(-1)} aria-label="Mes anterior">←</button><div className="month-title">{new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" }).format(new Date(year, month, 1))}</div><button className="btn" onClick={() => moveMonth(1)} aria-label="Mes siguiente">→</button></div>
      <div className="filter-row">
        {Object.entries({ holidays: "Festivos", school: "Escolares", events: "Eventos", comp: "Comp set" }).map(([key, label]) => <button key={key} className={`btn ${filters[key] ? "ghost-active" : ""}`} onClick={() => setFilters((current) => ({ ...current, [key]: !current[key as keyof typeof current] }))}>{label}</button>)}
      </div>
    </div>
    <div className="layout-grid">
      <div><div className="calendar-shell"><div className="weekdays">{weekdays.map((day) => <div key={day}>{day}</div>)}</div><div className="calendar-grid">{days.map((day: DayDemand) => <DayCell key={day.date} day={day} currentMonth={month} selected={selected === day.date} onSelect={setSelected} filters={filters} />)}</div></div><div className="legend"><span>Temperatura de demanda</span>{[["heat-1","Fría"],["heat-2","Templada"],["heat-3","Activa"],["heat-4","Caliente"],["heat-5","Muy caliente"]].map(([tone,label]) => <span className="legend-item" key={tone}><span className={`swatch ${tone}`} />{label}</span>)}</div></div>
      <DayPanel day={selectedDay} />
    </div>
  </>;
}

function DayCell({ day, currentMonth, selected, onSelect, filters }: { day: DayDemand; currentMonth: number; selected: boolean; onSelect: (date: string) => void; filters: Record<string, boolean> }) {
  const cellMonth = Number(day.date.slice(5, 7)) - 1;
  return <button className={`day-cell ${demandColor(day.score)} ${cellMonth !== currentMonth ? "outside" : ""} ${selected ? "selected" : ""}`} onClick={() => onSelect(day.date)} aria-label={`${formatDate(day.date, { dateStyle: "long" })}, demanda ${day.score}`}>
    <div className="day-head"><span className="day-number">{Number(day.date.slice(-2))}</span><span className="score-badge">{day.score}</span></div>
    <div className="chip-stack">
      {filters.holidays && day.holidays.slice(0, 2).map((item) => <span className="chip" key={item.id}>{flags[item.countryCode]} {item.isBridge ? "Puente" : item.localName}</span>)}
      {filters.school && day.schoolBreaks.slice(0, 2).map((item) => <span className="chip school" key={item.id}>🎒 {item.zone ?? item.countryCode}{!item.confirmed ? " · ?" : ""}</span>)}
      {filters.events && day.events.slice(0, 2).map((item) => <span className={`chip ${item.category === "parque" ? "park" : "event"}`} key={item.id}>{item.category === "congreso" ? "◆" : item.category === "parque" ? "◐" : "●"} {item.name}</span>)}
      {filters.comp && day.compMedian && <span className="chip comp">Mediana {Math.round(day.compMedian)} € ↗</span>}
    </div>
    {day.weather && <span className="weather-mini">{day.weather.precipitationChance > 35 ? "☂" : "☀"} {Math.round(day.weather.temperatureMax)}°</span>}
  </button>;
}

function DayPanel({ day }: { day: DayDemand }) {
  return <aside className="side-panel">
    <span className="panel-kicker">Detalle de la fecha</span><div className="panel-date">{formatDate(day.date, { weekday: "long", day: "numeric", month: "long" })}</div>
    <div className="thermometer"><div className="score-large">{day.score}</div><div><strong>{day.level}</strong><span>Score externo sobre 100</span></div></div>
    <div className="factor-list">{day.factors.map((factor, index) => <div className="factor" key={`${factor.label}-${index}`}><span>{factor.label}</span><b>+{factor.points}</b></div>)}</div>
    <div className="detail-block"><h3>Señales activas</h3>
      {day.events.map((event) => <div className="detail-item" key={event.id}>{event.name} · impacto {event.impact}/5<small>{event.city ?? "Área local"} · {event.confirmed ? "confirmado" : "por confirmar"}</small></div>)}
      {day.schoolBreaks.map((school) => <div className="detail-item" key={school.id}>{flags[school.countryCode]} {school.name}<small>{school.zone ?? school.countryCode} · {school.confirmed ? school.source : "por confirmar"}</small></div>)}
      {day.holidays.map((holiday) => <div className="detail-item" key={holiday.id}>{flags[holiday.countryCode]} {holiday.localName}<small>{holiday.subdivisionCode ?? "Nacional"} · Nager.Date</small></div>)}
      {!day.events.length && !day.schoolBreaks.length && !day.holidays.length && <div className="detail-item">Sin señales extraordinarias<small>El score procede de temporada y patrón semanal.</small></div>}
    </div>
    {(day.weather || day.compMedian) && <div className="detail-block"><h3>Última hora y mercado</h3>{day.weather && <div className="detail-item">☀ Máx. {day.weather.temperatureMax} °C · lluvia {day.weather.precipitationChance}%<small>Open-Meteo · ventana de 14 días</small></div>}{day.compMedian && <div className="detail-item">Mediana comp set · {Math.round(day.compMedian)} €<small>Última consulta manual · evolución +{day.compTrend}%</small></div>}</div>}
  </aside>;
}

function AgendaView({ weights, data, notify }: { weights: ScoreWeights; data: CalendarDataset; notify: (message: string) => void }) {
  const today = iso(new Date());
  const days = useMemo(() => Array.from({ length: 90 }, (_, index) => calculateDemandDay(addDays(today, index), data, weights)), [today, weights, data]);
  const exportCsv = () => {
    const csv = ["fecha,score,nivel,factores", ...days.map((day) => `${day.date},${day.score},${day.level},"${day.factors.map((factor) => factor.label).join(" · ")}"`)].join("\n");
    const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" })); link.download = "agenda-demanda-90-dias.csv"; link.click(); URL.revokeObjectURL(link.href); notify("Agenda exportada a CSV");
  };
  return <section className="view-card"><div className="view-header"><div><p className="eyebrow">Próximos 90 días</p><h2>Agenda de señales</h2><p>Orden cronológico, score explicable y factores públicos activos.</p></div><button className="btn primary" onClick={exportCsv}>Exportar CSV</button></div><div className="agenda-wrap"><table className="agenda-list"><thead><tr><th>Fecha</th><th>Score</th><th>Temperatura</th><th>Factores principales</th><th>Comp set</th></tr></thead><tbody>{days.map((day) => <tr key={day.date}><td><strong>{formatDate(day.date, { weekday: "short", day: "2-digit", month: "short" })}</strong></td><td><span className={`agenda-score ${demandColor(day.score)}`}>{day.score}</span></td><td>{day.level}</td><td>{day.factors.slice(0, 3).map((factor) => factor.label).join(" · ")}</td><td>{day.compMedian ? `${Math.round(day.compMedian)} € ↗` : "—"}</td></tr>)}</tbody></table></div></section>;
}

function CompareView({ weights, data }: { weights: ScoreWeights; data: CalendarDataset }) {
  const today = iso(new Date()); const [left, setLeft] = useState(addDays(today, 14)); const [right, setRight] = useState(addDays(today, 45));
  const values = [calculateDemandDay(left, data, weights), calculateDemandDay(right, data, weights)];
  return <section className="view-card"><div className="view-header"><div><p className="eyebrow">Argumentario para dirección</p><h2>Comparador de fechas</h2><p>Contrasta dos días y explica la diferencia de presión externa.</p></div></div><div className="compare-grid">{values.map((day, index) => <div className="compare-card" key={index}><div className="field"><label>Fecha {index === 0 ? "A" : "B"}</label><input type="date" value={index === 0 ? left : right} onChange={(event) => index === 0 ? setLeft(event.target.value) : setRight(event.target.value)} /></div><h3>{formatDate(day.date, { weekday: "long", day: "numeric", month: "long" })}</h3><div className="thermometer"><div className="score-large">{day.score}</div><div><strong>{day.level}</strong><span>{day.factors.length} factores puntuables</span></div></div>{day.factors.map((factor) => <div className="factor" key={factor.label}><span>{factor.label}</span><b>+{factor.points}</b></div>)}<div className="callout" style={{ marginTop: 16 }}>{day.score >= values[1 - index].score ? "Mayor presión externa relativa: hay argumentos para proteger valor." : "Menor presión externa relativa: conviene vigilar la respuesta del mercado."}</div></div>)}</div></section>;
}

function SettingsView({ weights, setWeights, events, setEvents, competitorHotels: initialHotels, activeMarkets: initialMarkets, notify }: { weights: ScoreWeights; setWeights: (value: ScoreWeights) => void; events: EventSignal[]; setEvents: (value: EventSignal[]) => void; competitorHotels: string[]; activeMarkets: string[]; notify: (message: string) => void }) {
  const [competitorHotels, setCompetitorHotels] = useState(initialHotels);
  const [activeMarkets, setActiveMarkets] = useState(new Set(initialMarkets));
  const weightFields: Array<[keyof Omit<ScoreWeights, "seasons">, string]> = [["frenchZone","Vacaciones FR · cada zona"],["holiday","Festivo mercado emisor"],["bridge","Puente probable"],["highImpactEvent","Evento impacto 4–5"],["themeParkSpecial","Parque temático especial"],["weekend","Fin de semana"]];
  const addEvent = async (form: FormData) => { const name = String(form.get("name") || ""); const startDate = String(form.get("startDate") || ""); if (!name || !startDate) return; const event = { id: crypto.randomUUID(), name, startDate, endDate: String(form.get("endDate") || startDate), category: String(form.get("category")) as EventSignal["category"], impact: Number(form.get("impact")) as EventSignal["impact"], confirmed: form.get("confirmed") === "on", source: "Entrada manual" }; const response = await fetch("/api/manual-events", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(event) }); setEvents([...events, event]); notify(response.ok ? "Evento guardado y añadido al calendario" : "Evento añadido a esta sesión · configura Neon para persistirlo"); };
  const saveWeights = async () => { const response = await fetch("/api/settings/weights", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(weights) }); notify(response.ok ? "Pesos guardados" : "Pesos aplicados a esta sesión · configura Neon para persistirlos"); };
  const deleteEvent = async (id: string) => { const response = await fetch(`/api/manual-events?id=${encodeURIComponent(id)}`, { method: "DELETE" }); if (response.ok) setEvents(events.filter((event) => event.id !== id)); notify(response.ok ? "Evento eliminado" : "No se pudo eliminar · comprueba Neon"); };
  const toggleEventConfirmation = async (event: EventSignal) => { const confirmed = !event.confirmed; const response = await fetch("/api/manual-events", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: event.id, confirmed }) }); setEvents(events.map((item) => item.id === event.id ? { ...item, confirmed } : item)); notify(response.ok ? "Estado del evento actualizado" : "Estado aplicado a esta sesión · configura Neon para persistirlo"); };
  const toggleMarket = async (code: string) => { const next = new Set(activeMarkets); const active = !next.has(code); if (active) next.add(code); else next.delete(code); setActiveMarkets(next); const response = await fetch("/api/settings/markets", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ code, active }) }); if (!response.ok) notify("Mercado aplicado a esta sesión · configura Neon para persistirlo"); };
  const addCompetitor = async (form: FormData) => { const name = String(form.get("competitorName") || "").trim(); if (!name) return; const response = await fetch("/api/competitors", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name }) }); setCompetitorHotels([...new Set([...competitorHotels, name])]); notify(response.ok ? "Competidor añadido" : "Competidor añadido a esta sesión · configura Neon para persistirlo"); };
  const removeCompetitor = async (name: string) => { const response = await fetch(`/api/competitors?name=${encodeURIComponent(name)}`, { method: "DELETE" }); setCompetitorHotels(competitorHotels.filter((hotel) => hotel !== name)); notify(response.ok ? "Competidor retirado" : "Competidor oculto en esta sesión · configura Neon para persistirlo"); };
  const saveRate = async (form: FormData) => { const payload = { hotel: String(form.get("hotel") || ""), stayDate: String(form.get("stayDate") || ""), queriedAt: new Date().toISOString(), price: Number(form.get("price")), mealPlan: String(form.get("mealPlan")) }; const response = await fetch("/api/comp-set", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) }); notify(response.ok ? "Precio de comp set guardado" : "No se pudo guardar · comprueba los datos y Neon"); };
  const importCsv = async (file?: File) => { if (!file) return; const response = await fetch("/api/comp-set/preview?commit=true", { method: "POST", headers: { "content-type": "text/csv" }, body: await file.text() }); const result = await response.json(); notify(response.ok && result.valid ? `${result.rows.length} precios importados` : result.errors?.[0] ?? "CSV inválido"); };
  return <section className="view-card"><div className="view-header"><div><p className="eyebrow">Control del modelo</p><h2>Configuración</h2><p>Pesos transparentes, mercados, eventos curados y estado de fuentes.</p></div></div><div className="settings-grid">
    <div className="settings-card"><h3>Pesos del score</h3>{weightFields.map(([key,label]) => <div className="weight-row" key={key}><div><strong>{label}</strong><input type="range" min="0" max="25" value={weights[key]} onChange={(event) => setWeights({ ...weights, [key]: Number(event.target.value) })} /></div><b>+{weights[key]}</b></div>)}<button className="btn primary" style={{marginTop:12}} onClick={saveWeights}>Guardar pesos</button><div className="callout" style={{ marginTop: 14 }}>El score se limita siempre a 0–100. Los factores y puntos quedan visibles en cada fecha.</div></div>
    <div className="settings-card"><h3>Fuentes y frescura</h3><div className="source-list">{sourceStatuses.map((source) => <div className="source-row" key={source.name}><div><strong>{source.name}</strong><small>{source.updated}</small></div><span className={`status ${source.tone === "warn" ? "warn" : ""}`}>{source.state}</span></div>)}</div><div className="callout" style={{ marginTop:14 }}>Si una API falla, se conservan los últimos datos válidos y se muestra su fecha de actualización.</div></div>
    <div className="settings-card"><h3>Eventos manuales</h3><form action={addEvent}><div className="field"><label htmlFor="manual-name">Nombre</label><input id="manual-name" name="name" placeholder="Congreso, torneo o evento local" /></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><div className="field"><label htmlFor="manual-start">Inicio</label><input id="manual-start" type="date" name="startDate" /></div><div className="field"><label htmlFor="manual-end">Fin</label><input id="manual-end" type="date" name="endDate" /></div></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><div className="field"><label htmlFor="manual-category">Categoría</label><select id="manual-category" name="category"><option value="festival">Festival</option><option value="deporte">Deporte</option><option value="congreso">Congreso</option><option value="parque">Parque temático</option><option value="otro">Otro</option></select></div><div className="field"><label htmlFor="manual-impact">Impacto</label><select id="manual-impact" name="impact">{[1,2,3,4,5].map((value) => <option key={value}>{value}</option>)}</select></div></div><label style={{fontSize:11,display:"flex",gap:8,marginBottom:14}}><input type="checkbox" name="confirmed" /> Fecha confirmada</label><button className="btn primary" type="submit">Añadir evento</button></form><div className="source-list" style={{marginTop:14}}>{events.slice(0, 6).map((event) => <div className="source-row" key={event.id}><div><strong>{event.name}</strong><small>{event.startDate} · impacto {event.impact}/5 · {event.confirmed ? "confirmado" : "por confirmar"}</small></div><div style={{display:"flex",gap:5}}><button className="btn" onClick={() => toggleEventConfirmation(event)}>{event.confirmed ? "Revisar" : "Confirmar"}</button><button className="btn" aria-label={`Eliminar ${event.name}`} onClick={() => deleteEvent(event.id)}>×</button></div></div>)}</div></div>
    <div className="settings-card"><h3>Comp set · entrada manual</h3><form action={saveRate}><div className="field"><label htmlFor="comp-hotel">Hotel competidor</label><select id="comp-hotel" name="hotel">{competitorHotels.map((hotel) => <option key={hotel}>{hotel}</option>)}</select></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><div className="field"><label htmlFor="comp-stay">Fecha estancia</label><input id="comp-stay" name="stayDate" type="date" required /></div><div className="field"><label htmlFor="comp-price">Precio</label><input id="comp-price" name="price" type="number" min="0" step="0.01" placeholder="189" required /></div></div><div className="field"><label htmlFor="comp-meal">Régimen</label><select id="comp-meal" name="mealPlan"><option>SA</option><option>AD</option><option>MP</option><option>TI</option></select></div><div style={{display:"flex",gap:8}}><button className="btn primary" type="submit">Guardar precio</button><label className="btn">Importar CSV<input type="file" accept=".csv" hidden onChange={(event) => importCsv(event.target.files?.[0])} /></label></div></form><form action={addCompetitor} style={{marginTop:12,display:"flex",gap:8}}><input name="competitorName" aria-label="Nuevo hotel competidor" placeholder="Añadir hotel competidor" style={{flex:1,border:"1px solid var(--line)",borderRadius:9,padding:"9px"}} /><button className="btn" type="submit">Añadir</button></form><div className="source-list" style={{marginTop:10}}>{competitorHotels.map((hotel) => <div className="source-row" key={hotel}><span>{hotel}</span><button className="btn" aria-label={`Retirar ${hotel}`} onClick={() => removeCompetitor(hotel)}>Retirar</button></div>)}</div><div className="callout" style={{ marginTop:14 }}><strong>Sin scraping.</strong> Solo entrada manual/CSV. Preparado para un proveedor API futuro sin cambiar el calendario.</div></div>
    <div className="settings-card"><h3>Mercados emisores</h3>{[["FR","🇫🇷","Francia"],["ES","🇪🇸","España"],["GB","🇬🇧","Reino Unido"],["IE","🇮🇪","Irlanda"],["DE","🇩🇪","Alemania"],["NL","🇳🇱","Países Bajos"],["BE","🇧🇪","Bélgica"]].map(([code,flag,name]) => <label className="weight-row" key={code}><span>{flag} {name}</span><input type="checkbox" checked={activeMarkets.has(code)} onChange={() => toggleMarket(code)} /></label>)}</div>
    <div className="settings-card"><h3>Módulos futuros</h3><div className="source-row"><div><strong>Amadeus · REU / BCN</strong><small>Esquema preparado</small></div><span className="status warn">fase 2</span></div><div className="source-row" style={{marginTop:8}}><div><strong>Google Trends</strong><small>Interfaz de proveedor preparada</small></div><span className="status warn">fase 2</span></div><div className="callout" style={{marginTop:14}}><strong>PMS Ulyses desactivado.</strong> ENABLE_PMS_MODULE=false. No hay pantalla, navegación ni endpoint para datos internos; el esquema futuro solo admite agregados.</div></div>
  </div></section>;
}
