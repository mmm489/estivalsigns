import type { CalendarDataset, ScoreWeights } from "@/lib/types";

export type PropertyType = "hotel" | "apartments" | "camping";
export type SeasonalityProfile = "coast" | "mountain" | "urban" | "mixed";
export type SignalProfile = "la-pineda" | "market-only";

export interface PortfolioProperty {
  id: string;
  name: string;
  type: PropertyType;
  location: string;
  seasonality: Exclude<SeasonalityProfile, "mixed">;
  signalProfile: SignalProfile;
  accommodations: string[];
}

export interface PortfolioCluster {
  id: string;
  name: string;
  location: string;
  properties: PortfolioProperty[];
}

export interface PortfolioArea {
  id: string;
  name: string;
  clusters: PortfolioCluster[];
}

const hotel = (
  id: string,
  name: string,
  location: string,
  seasonality: Exclude<SeasonalityProfile, "mixed"> = "coast",
  signalProfile: SignalProfile = "market-only",
  accommodations = ["Todas las habitaciones"],
): PortfolioProperty => ({ id, name, type: "hotel", location, seasonality, signalProfile, accommodations });

export const estivalPortfolio: PortfolioArea[] = [
  {
    id: "costa-daurada",
    name: "Costa Daurada",
    clusters: [
      {
        id: "estival-park-resort",
        name: "Estival Park Resort",
        location: "La Pineda · Vila-seca · Tarragona",
        properties: [
          hotel("silmar", "Estival Park Silmar", "La Pineda", "coast", "la-pineda", ["Todas las habitaciones", "Classic", "Dúplex Classic", "Suite Classic"]),
          hotel("almaris", "Estival Park Almaris", "La Pineda", "coast", "la-pineda", ["Todas las habitaciones", "Superior", "Dúplex Superior", "Junior Suite", "Suite Superior"]),
          hotel("marena", "Estival Park Marena", "La Pineda", "coast", "la-pineda", ["Todas las habitaciones", "Estándar", "Dúplex Estándar"]),
          { id: "park-apartments", name: "Estival Park Apartments", type: "apartments", location: "La Pineda", seasonality: "coast", signalProfile: "la-pineda", accommodations: ["Todos los apartamentos"] },
          hotel("oassium", "Oassium Hotel at Estival Park", "La Pineda", "coast", "la-pineda", ["Todas las habitaciones", "Habitación Club"]),
        ],
      },
      {
        id: "cambrils",
        name: "Cambrils",
        location: "Cambrils · Tarragona",
        properties: [
          hotel("centurion", "Estival Centurión", "Cambrils"),
          hotel("eldorado", "Estival ElDorado", "Cambrils", "coast", "market-only", ["Todo el inventario", "Habitaciones", "Villas"]),
        ],
      },
      {
        id: "comarruga",
        name: "Coma-ruga",
        location: "Coma-ruga · El Vendrell · Tarragona",
        properties: [
          hotel("maramar", "Estival Maramar", "Coma-ruga"),
          { id: "vendrell-platja", name: "Estival Vendrell Platja", type: "camping", location: "Coma-ruga", seasonality: "coast", signalProfile: "market-only", accommodations: ["Todo el inventario", "Bungalows y glamping", "Parcelas"] },
        ],
      },
      {
        id: "punta-de-la-mora",
        name: "Punta de la Mora",
        location: "Tarragona · Costa Daurada",
        properties: [
          { id: "torre-de-la-mora", name: "Estival Torre de la Mora", type: "camping", location: "Punta de la Mora", seasonality: "coast", signalProfile: "market-only", accommodations: ["Todo el inventario", "Bungalows y glamping", "Parcelas"] },
        ],
      },
    ],
  },
  {
    id: "costa-del-sol",
    name: "Costa del Sol",
    clusters: [{ id: "benalmadena", name: "Benalmádena", location: "Benalmádena · Málaga", properties: [hotel("torrequebrada", "Estival Torrequebrada", "Benalmádena")] }],
  },
  {
    id: "costa-de-la-luz",
    name: "Costa de la Luz",
    clusters: [
      { id: "islantilla", name: "Islantilla", location: "Islantilla · Huelva", properties: [hotel("islantilla-hotel", "Estival Islantilla", "Islantilla")] },
      { id: "isla-cristina", name: "Isla Cristina", location: "Isla Cristina · Huelva", properties: [hotel("isla-cristina-hotel", "Estival Isla Cristina", "Isla Cristina")] },
    ],
  },
  {
    id: "barcelona",
    name: "Barcelona",
    clusters: [{ id: "barcelona-ciudad", name: "Barcelona ciudad", location: "Barcelona", properties: [hotel("vilamari", "Hotel Vilamarí", "Barcelona", "urban")] }],
  },
  {
    id: "andorra",
    name: "Andorra",
    clusters: [{
      id: "pas-de-la-casa",
      name: "Pas de la Casa",
      location: "Pas de la Casa · Andorra",
      properties: [
        hotel("sporting", "Hotel Sporting", "Pas de la Casa", "mountain"),
        hotel("cristina", "Hotel Cristina", "Pas de la Casa", "mountain"),
        hotel("caribou", "Hotel Caribou", "Pas de la Casa", "mountain"),
        { id: "caribou-apartments", name: "Caribou Apartments", type: "apartments", location: "Pas de la Casa", seasonality: "mountain", signalProfile: "market-only", accommodations: ["Todos los apartamentos"] },
      ],
    }],
  },
];

export interface PortfolioSelection {
  areaId: string;
  clusterId: string;
  propertyId: string;
  accommodation: string;
}

export interface ResolvedPortfolioScope {
  area?: PortfolioArea;
  cluster?: PortfolioCluster;
  property?: PortfolioProperty;
  title: string;
  location: string;
  path: string;
  seasonality: SeasonalityProfile;
  signalProfile: SignalProfile;
  accommodation: string;
}

const propertyList = () => estivalPortfolio.flatMap((area) => area.clusters.flatMap((cluster) => cluster.properties));

export const portfolioStats = (() => {
  const properties = propertyList();
  return {
    areas: estivalPortfolio.length,
    properties: properties.length,
    hotels: properties.filter((property) => property.type === "hotel").length,
    apartments: properties.filter((property) => property.type === "apartments").length,
    campings: properties.filter((property) => property.type === "camping").length,
  };
})();

export function resolvePortfolioScope(selection: PortfolioSelection): ResolvedPortfolioScope {
  const area = estivalPortfolio.find((item) => item.id === selection.areaId);
  const cluster = area?.clusters.find((item) => item.id === selection.clusterId);
  const property = cluster?.properties.find((item) => item.id === selection.propertyId);
  const title = property?.name ?? cluster?.name ?? area?.name ?? "Estival Group";
  const location = property?.location ?? cluster?.location ?? area?.name ?? "España · Andorra";
  const path = [area?.name, cluster?.name, property?.name, selection.accommodation !== "all" ? selection.accommodation : undefined].filter(Boolean).join(" · ") || "Toda la cartera";
  const clusterProfiles = new Set(cluster?.properties.map((item) => item.signalProfile));
  const clusterSeasonality = new Set(cluster?.properties.map((item) => item.seasonality));
  return {
    area,
    cluster,
    property,
    title,
    location,
    path,
    seasonality: property?.seasonality ?? (clusterSeasonality.size === 1 ? [...clusterSeasonality][0] : "mixed") ?? "mixed",
    signalProfile: property?.signalProfile ?? (clusterProfiles.size === 1 ? [...clusterProfiles][0] : "market-only") ?? "market-only",
    accommodation: selection.accommodation,
  };
}

export function datasetForScope(data: CalendarDataset, signalProfile: SignalProfile): CalendarDataset {
  if (signalProfile === "la-pineda") return data;
  return { ...data, events: [], weather: [], compRates: [], competitorHotels: [] };
}

const seasonalityCurves: Record<Exclude<SeasonalityProfile, "coast">, number[]> = {
  mountain: [55, 50, 35, 15, 8, 6, 8, 10, 10, 15, 35, 60],
  urban: [30, 32, 34, 36, 38, 35, 30, 28, 42, 45, 40, 38],
  mixed: [28, 28, 28, 30, 32, 34, 36, 38, 34, 34, 30, 30],
};

export function weightsForScope(weights: ScoreWeights, seasonality: SeasonalityProfile): ScoreWeights {
  return seasonality === "coast" ? weights : { ...weights, seasons: seasonalityCurves[seasonality] };
}
