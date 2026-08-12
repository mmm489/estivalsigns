export interface UlysesAggregatedSnapshot {
  snapshotDate: string;
  stayDate: string;
  roomsSold: number;
  roomsAvailable: number;
  adr: number;
  revenue: number;
  channel?: string;
  segment?: string;
}

export interface UlysesSource {
  validateConfiguration(): Promise<void>;
  fetchAggregatedSnapshots(): Promise<UlysesAggregatedSnapshot[]>;
}

export class UlysesCloudSource implements UlysesSource {
  async validateConfiguration(): Promise<void> {
    throw new Error("No implementado");
  }

  async fetchAggregatedSnapshots(): Promise<UlysesAggregatedSnapshot[]> {
    throw new Error("No implementado");
  }
}

const piiPatterns = [/guest/i, /hu[eé]sped/i, /nombre/i, /surname/i, /apellido/i, /email/i, /e-mail/i, /passport/i, /pasaporte/i, /dni/i, /document/i, /tel[eé]fono/i, /phone/i, /address/i, /direcci[oó]n/i];

export function validateAggregatedPmsHeaders(headers: string[]) {
  const forbidden = headers.filter((header) => piiPatterns.some((pattern) => pattern.test(header)));
  if (forbidden.length) throw new Error(`Archivo rechazado: posibles columnas personales (${forbidden.join(", ")})`);
  return true;
}

export function assertPmsEnabled() {
  if (process.env.ENABLE_PMS_MODULE !== "true") throw new Error("Módulo PMS desactivado");
}
