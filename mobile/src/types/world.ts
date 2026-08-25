import type {
  CountryId,
  CityId,
  GeoPoint,
  CountryStatus
} from "./game";

export type MapFeatureType =
  | "country"
  | "province"
  | "city"
  | "capital"
  | "border"
  | "infrastructure"
  | "resource"
  | "military";

export type InfrastructureType =
  | "road"
  | "highway"
  | "railway"
  | "airport"
  | "seaport"
  | "industrial_zone"
  | "power_plant"
  | "research_center";

export type ResourceLocationType =
  | "mine"
  | "oil_field"
  | "gas_field"
  | "farm"
  | "forest"
  | "deposit"
  | "energy_site";

export interface MapCoordinate {
  latitude: number;
  longitude: number;
}

export interface CountryBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface CountryMapStyle {
  fillColor: string;
  borderColor: string;
  borderWidth: number;

  selectedFillColor: string;
  occupiedFillColor: string;

  opacity: number;
}

export interface CountryMapData {
  countryId: CountryId;

  geometrySource: string;

  bounds: CountryBounds;

  centroid: MapCoordinate;

  mapStyle: CountryMapStyle;

  visible: boolean;
}

export interface Province {
  id: string;

  countryId: CountryId;

  name: string;

  geometrySource: string;

  population: number;

  economicValue: number;

  strategicValue: number;

  controlledBy: CountryId;

  occupied: boolean;

  infrastructureLevel: number;

  resourceTypes: string[];

  updatedAt: string;
}

export interface WorldCity {
  id: CityId;

  countryId: CountryId;

  provinceId: string | null;

  name: string;

  location: GeoPoint;

  population: number;

  capital: boolean;

  majorCity: boolean;

  economicImportance: number;

  militaryImportance: number;

  industrialImportance: number;

  controlledBy: CountryId;

  occupied: boolean;
}

export interface Infrastructure {
  id: string;

  countryId: CountryId;

  provinceId: string | null;

  type: InfrastructureType;

  name: string;

  location: GeoPoint;

  capacity: number;

  operational: boolean;

  health: number;

  strategicImportance: number;

  updatedAt: string;
}

export interface ResourceLocation {
  id: string;

  countryId: CountryId;

  provinceId: string | null;

  type: ResourceLocationType;

  name: string;

  location: GeoPoint;

  estimatedReserve: number;

  productionCapacity: number;

  currentProduction: number;

  operational: boolean;

  controlledBy: CountryId;
}

export interface WorldCountryState {
  countryId: CountryId;

  status: CountryStatus;

  controlledTerritoryPercentage: number;

  occupiedTerritoryPercentage: number;

  capitalControlled: boolean;

  activeWarIds: string[];

  activeFrontIds: string[];

  militaryUnitCount: number;

  playerCount: number;

  updatedAt: string;
}

export interface WorldMapState {
  version: number;

  serverTime: string;

  countries: WorldCountryState[];

  activeWarIds: string[];

  activeBattleIds: string[];

  updatedAt: string;
}

export interface MapLayerState {
  politicalBorders: boolean;

  countryNames: boolean;

  cities: boolean;

  infrastructure: boolean;

  resources: boolean;

  economy: boolean;

  military: boolean;

  diplomacy: boolean;

  wars: boolean;

  frontLines: boolean;

  supplyLines: boolean;

  intelligence: boolean;

  fogOfWar: boolean;
}

export interface MapViewport {
  latitude: number;

  longitude: number;

  latitudeDelta: number;

  longitudeDelta: number;

  zoom: number;

  bearing: number;

  pitch: number;
}

export interface MapSelection {
  type:
    | "country"
    | "province"
    | "city"
    | "unit"
    | "battle"
    | "front"
    | "factory"
    | "infrastructure"
    | null;

  id: string | null;
}

export interface MapEvent {
  id: string;

  type:
    | "border_change"
    | "battle_started"
    | "battle_ended"
    | "territory_captured"
    | "unit_movement"
    | "war_declared"
    | "peace_signed"
    | "political_event"
    | "economic_event";

  countryIds: CountryId[];

  location: GeoPoint | null;

  title: string;

  description: string;

  timestamp: string;

  severity: "low" | "medium" | "high" | "critical";
}