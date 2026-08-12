import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const weights = [
  ["frenchZone", "Vacaciones FR por zona", 7],
  ["holiday", "Festivo emisor", 8],
  ["bridge", "Puente probable", 5],
  ["highImpactEvent", "Evento impacto 4–5", 14],
  ["themeParkSpecial", "PortAventura especial", 12],
  ["weekend", "Fin de semana", 8],
] as const;

const seasonal = [8, 8, 10, 18, 25, 35, 45, 50, 34, 25, 12, 10];
const markets = [["ES", "España", 8], ["FR", "Francia", 9], ["GB", "Reino Unido", 6], ["IE", "Irlanda", 5], ["DE", "Alemania", 5], ["NL", "Países Bajos", 4], ["BE", "Bélgica", 4]] as const;

async function main() {
  await Promise.all(weights.map(([key, label, value]) => prisma.scoreWeight.upsert({ where: { key }, update: { label, value }, create: { key, label, value } })));
  await Promise.all(seasonal.map((value, index) => prisma.seasonalWeight.upsert({ where: { month: index + 1 }, update: { value }, create: { month: index + 1, value } })));
  await Promise.all(markets.map(([code, label, weight]) => prisma.emitterMarket.upsert({ where: { code }, update: { label, weight }, create: { code, label, weight } })));
  for (const name of ["Golden Costa Salou", "H10 Salauris Palace", "Ohtels Vila Romana", "Blaumar Hotel", "Magnolia Hotel", "Best Negresco"]) await prisma.competitorHotel.upsert({ where: { name }, update: {}, create: { name } });
  const year = new Date().getFullYear();
  const events = [
    { id: "sant-joan", name: "Sant Joan", startDate: new Date(`${year}-06-23`), endDate: new Date(`${year}-06-24`), category: "FESTIVAL" as const, impact: 4, notes: "Fechas recurrentes; confirmar programa local", source: "Manual · por confirmar" },
    { id: "santa-tecla", name: "Santa Tecla", startDate: new Date(`${year}-09-15`), endDate: new Date(`${year}-09-24`), category: "FESTIVAL" as const, impact: 4, notes: "Ventana orientativa", source: "Manual · por confirmar" },
  ];
  for (const event of events) await prisma.manualEvent.upsert({ where: { id: event.id }, update: event, create: { ...event, confirmed: false } });
}

main().finally(() => prisma.$disconnect());
