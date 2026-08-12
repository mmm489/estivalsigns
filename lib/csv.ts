import type { CompRate } from "@/lib/types";

const split = (line: string, delimiter: string) => line.split(delimiter).map((value) => value.trim().replace(/^"|"$/g, ""));

export function parseCompSetCsv(csv: string): { rows: Omit<CompRate, "id">[]; errors: string[] } {
  const lines = csv.trim().split(/\r?\n/).filter(Boolean);
  if (!lines.length) return { rows: [], errors: ["El CSV está vacío"] };
  const delimiter = lines[0].includes(";") ? ";" : ",";
  const headers = split(lines[0], delimiter).map((header) => header.toLowerCase());
  const required = ["hotel_competidor", "fecha_estancia", "fecha_consulta", "precio", "regimen"];
  const missing = required.filter((header) => !headers.includes(header));
  if (missing.length) return { rows: [], errors: [`Faltan columnas: ${missing.join(", ")}`] };
  const rows: Omit<CompRate, "id">[] = [];
  const errors: string[] = [];
  lines.slice(1).forEach((line, index) => {
    const values = split(line, delimiter);
    const row = Object.fromEntries(headers.map((header, valueIndex) => [header, values[valueIndex]]));
    const price = Number(String(row.precio).replace(",", "."));
    const mealPlan = String(row.regimen).toUpperCase();
    if (!row.hotel_competidor || !/^\d{4}-\d{2}-\d{2}$/.test(row.fecha_estancia) || !Number.isFinite(price) || price < 0 || !["SA", "AD", "MP", "TI"].includes(mealPlan)) {
      errors.push(`Fila ${index + 2}: datos inválidos`);
      return;
    }
    rows.push({ hotel: row.hotel_competidor, stayDate: row.fecha_estancia, queriedAt: row.fecha_consulta, price, mealPlan: mealPlan as CompRate["mealPlan"], notes: row.notas });
  });
  return { rows, errors };
}
