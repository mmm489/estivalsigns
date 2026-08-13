import type { CalendarDataset, ScoreWeights } from "@/lib/types";

export type PropertyType = "hotel" | "apartments" | "camping";
export type SeasonalityProfile = "coast" | "mountain" | "urban" | "mixed";
export type SignalProfile = "local-demo" | "market-only";

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

/**
 * Cartera ficticia para presentaciones y demostraciones.
 * Conserva la variedad del producto sin identificar ninguna cadena real.
 */
export const demoPortfolio: PortfolioArea[] = [
  {
    id: "litoral-mediterraneo",
    name: "Litoral Mediterráneo",
    clusters: [
      {
        id: "resort-costa-central",
        name: "Resort Costa Central",
        location: "Destino costero principal",
        properties: [
          hotel("hotel-costa-01", "Hotel Costa 01", "Destino costero principal", "coast", "local-demo", ["Todas las habitaciones", "Classic", "Dúplex Classic", "Suite Classic"]),
          hotel("hotel-costa-02", "Hotel Costa 02", "Destino costero principal", "coast", "local-demo", ["Todas las habitaciones", "Superior", "Dúplex Superior", "Junior Suite", "Suite Superior"]),
          hotel("hotel-costa-03", "Hotel Costa 03", "Destino costero principal", "coast", "local-demo", ["Todas las habitaciones", "Estándar", "Dúplex Estándar"]),
          { id: "apartamentos-costa-01", name: "Apartamentos Costa 01", type: "apartments", location: "Destino costero principal", seasonality: "coast", signalProfile: "local-demo", accommodations: ["Todos los apartamentos"] },
          hotel("hotel-wellness-01", "Hotel Wellness 01", "Destino costero principal", "coast", "local-demo", ["Todas las habitaciones", "Habitación Club"]),
        ],
      },
      {
        id: "destino-costa-norte",
        name: "Destino Costa Norte",
        location: "Litoral mediterráneo norte",
        properties: [
          hotel("hotel-costa-04", "Hotel Costa 04", "Litoral mediterráneo norte"),
          hotel("villas-costa-01", "Villas Costa 01", "Litoral mediterráneo norte", "coast", "market-only", ["Todo el inventario", "Habitaciones", "Villas"]),
        ],
      },
      {
        id: "destino-costa-centro",
        name: "Destino Costa Centro",
        location: "Litoral mediterráneo central",
        properties: [
          hotel("hotel-costa-05", "Hotel Costa 05", "Litoral mediterráneo central"),
          { id: "camping-costa-01", name: "Camping Costa 01", type: "camping", location: "Litoral mediterráneo central", seasonality: "coast", signalProfile: "market-only", accommodations: ["Todo el inventario", "Bungalows y glamping", "Parcelas"] },
        ],
      },
      {
        id: "destino-natural",
        name: "Destino Natural",
        location: "Entorno litoral protegido",
        properties: [
          { id: "camping-natural-01", name: "Camping Natural 01", type: "camping", location: "Entorno litoral protegido", seasonality: "coast", signalProfile: "market-only", accommodations: ["Todo el inventario", "Bungalows y glamping", "Parcelas"] },
        ],
      },
    ],
  },
  {
    id: "litoral-sur",
    name: "Litoral Sur",
    clusters: [{ id: "destino-sur", name: "Destino Sur", location: "Costa sur", properties: [hotel("hotel-sur-01", "Hotel Sur 01", "Costa sur")] }],
  },
  {
    id: "litoral-atlantico",
    name: "Litoral Atlántico",
    clusters: [
      { id: "destino-atlantico-norte", name: "Atlántico Norte", location: "Costa atlántica norte", properties: [hotel("hotel-atlantico-01", "Hotel Atlántico 01", "Costa atlántica norte")] },
      { id: "destino-atlantico-sur", name: "Atlántico Sur", location: "Costa atlántica sur", properties: [hotel("hotel-atlantico-02", "Hotel Atlántico 02", "Costa atlántica sur")] },
    ],
  },
  {
    id: "urbano",
    name: "Destino Urbano",
    clusters: [{ id: "ciudad-principal", name: "Ciudad Principal", location: "Mercado urbano", properties: [hotel("hotel-urbano-01", "Hotel Urbano 01", "Mercado urbano", "urban")] }],
  },
  {
    id: "montana",
    name: "Destino Montaña",
    clusters: [{
      id: "resort-montana",
      name: "Resort de Montaña",
      location: "Destino de nieve",
      properties: [
        hotel("hotel-montana-01", "Hotel Montaña 01", "Destino de nieve", "mountain"),
        hotel("hotel-montana-02", "Hotel Montaña 02", "Destino de nieve", "mountain"),
        hotel("hotel-montana-03", "Hotel Montaña 03", "Destino de nieve", "mountain"),
        { id: "apartamentos-montana-01", name: "Apartamentos Montaña 01", type: "apartments", location: "Destino de nieve", seasonality: "mountain", signalProfile: "market-only", accommodations: ["Todos los apartamentos"] },
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

const propertyList = () => demoPortfolio.flatMap((area) => area.clusters.flatMap((cluster) => cluster.properties));

export const portfolioStats = (() => {
  const properties = propertyList();
  return {
    areas: demoPortfolio.length,
    properties: properties.length,
    hotels: properties.filter((property) => property.type === "hotel").length,
    apartments: properties.filter((property) => property.type === "apartments").length,
    campings: properties.filter((property) => property.type === "camping").length,
  };
})();

export function resolvePortfolioScope(selection: PortfolioSelection): ResolvedPortfolioScope {
  const area = demoPortfolio.find((item) => item.id === selection.areaId);
  const cluster = area?.clusters.find((item) => item.id === selection.clusterId);
  const property = cluster?.properties.find((item) => item.id === selection.propertyId);
  const title = property?.name ?? cluster?.name ?? area?.name ?? "Cartera hotelera";
  const location = property?.location ?? cluster?.location ?? area?.name ?? "Mercados nacionales e internacionales";
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
  if (signalProfile === "local-demo") return data;
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
