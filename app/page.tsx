import { CalendarApp } from "@/components/calendar-app";
import { demoDataset } from "@/lib/demo-data";
import { addDays, iso } from "@/lib/date-utils";
import { loadCalendarDataset, loadScoreWeights } from "@/lib/persistence";
import { defaultWeights } from "@/lib/score";

export const dynamic = "force-dynamic";

export default async function Home() {
  let data = demoDataset;
  let demoMode = true;
  let weights = defaultWeights;
  if (process.env.DATABASE_URL) {
    try {
      const start = iso(new Date());
      const stored = await loadCalendarDataset(addDays(start, -31), addDays(start, 548));
      const storedWeights = await loadScoreWeights();
      weights = { ...defaultWeights, ...storedWeights };
      if (stored.holidays.length || stored.schoolBreaks.length || stored.events.length) { data = stored; demoMode = false; }
    } catch (error) {
      console.error("No se pudo leer el caché PostgreSQL; se muestra la demo", error);
    }
  }
  return <CalendarApp initialData={data} initialWeights={weights} demoMode={demoMode} />;
}
