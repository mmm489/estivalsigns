export const iso = (date: Date) => date.toISOString().slice(0, 10);

export function addDays(value: string | Date, days: number) {
  const date = typeof value === "string" ? new Date(`${value}T12:00:00Z`) : new Date(value);
  date.setUTCDate(date.getUTCDate() + days);
  return iso(date);
}

export function eachDay(start: string, end: string) {
  const dates: string[] = [];
  for (let cursor = start; cursor <= end; cursor = addDays(cursor, 1)) dates.push(cursor);
  return dates;
}

export function monthGrid(year: number, month: number) {
  const first = new Date(Date.UTC(year, month, 1));
  const last = new Date(Date.UTC(year, month + 1, 0));
  const mondayOffset = (first.getUTCDay() + 6) % 7;
  return eachDay(addDays(first, -mondayOffset), addDays(last, 6 - ((last.getUTCDay() + 6) % 7)));
}

export const inRange = (date: string, start: string, end: string) => date >= start && date <= end;

export function formatDate(date: string, options: Intl.DateTimeFormatOptions = {}) {
  return new Intl.DateTimeFormat("es-ES", { timeZone: "Europe/Madrid", ...options }).format(
    new Date(`${date}T12:00:00Z`),
  );
}
