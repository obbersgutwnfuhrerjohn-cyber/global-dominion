import { apiClient } from "./api";

import type {
  CountryId,
  WarId,
} from "../types/game";

export type MapLayer =
  | "political"
  | "territories"
  | "cities"
  | "military"
  | "battles"
  | "frontlines"
  | "factories"
  | "resources"
  | "trade"
  | "diplomacy"
  | "players"
  | "events"
  | "fog_of_war";

export interface MapServiceOptions {
  getPlayerId?: () => string | null;

  getSessionId?: () => string | null;
}

export interface MapViewport {
  north: number;

  south: number;

  east: number;

  west: number;

  zoom: number;
}

export interface MapCoordinate {
  latitude: number;

  longitude: number;
}

export interface MapCountryFeature {
  countryId: CountryId;

  name: string;

  flagUrl: string | null;

  color: string;

  geometry: unknown;

  capital: MapCoordinate | null;

  population: number;

  controlledTerritoryPercentage: number;

  updatedAt: string;
}

export interface MapTerritoryFeature {
  territoryId: string;

  countryId: CountryId;

  previousCountryId: CountryId | null;

  name: string;

  geometry: unknown;

  controlPercentage: number;

  contested: boolean;

  occupied: boolean;

  strategicValue: number;

  updatedAt: string;
}

export interface MapCityFeature {
  cityId: string;

  countryId: CountryId;

  name: string;

  latitude: number;

  longitude: number;

  population: number;

  capital: boolean;

  major: boolean;

  industrial: boolean;

  military: boolean;
}

export interface MapMilitaryFeature {
  unitId: string;

  countryId: CountryId;

  unitType:
    | "infantry"
    | "armor"
    | "artillery"
    | "air"
    | "navy"
    | "special_forces"
    | "missile"
    | "transport";

  latitude: number;

  longitude: number;

  heading: number;

  personnel: number;

  status:
    | "idle"
    | "moving"
    | "engaged"
    | "retreating"
    | "destroyed";

  visibility:
    | "visible"
    | "suspected"
    | "hidden";

  flagUrl: string | null;

  updatedAt: string;
}

export interface MapBattleFeature {
  battleId: string;

  warId: WarId;

  latitude: number;

  longitude: number;

  attackerCountryId: CountryId;

  defenderCountryId: CountryId;

  attackerStrength: number;

  defenderStrength: number;

  progress: number;

  intensity:
    | "low"
    | "medium"
    | "high"
    | "critical";

  status:
    | "forming"
    | "active"
    | "decisive"
    | "ended";

  startedAt: string;

  updatedAt: string;
}

export interface MapFrontlineFeature {
  id: string;

  warId: WarId;

  geometry: unknown;

  attackerCountryId: CountryId;

  defenderCountryId: CountryId;

  intensity: number;

  updatedAt: string;
}

export interface MapFactoryFeature {
  factoryId: string;

  companyId: string;

  countryId: CountryId;

  latitude: number;

  longitude: number;

  name: string;

  productionType: string;

  operational: boolean;

  productionRate: number;

  employeeCount: number;

  visible: boolean;
}

export interface MapResourceFeature {
  id: string;

  countryId: CountryId;

  resourceType:
    | "oil"
    | "gas"
    | "coal"
    | "iron"
    | "uranium"
    | "rare_earth"
    | "food"
    | "water"
    | "timber";

  latitude: number;

  longitude: number;

  productionRate: number;

  estimatedReserve: number;

  visible: boolean;
}

export interface MapTradeRouteFeature {
  id: string;

  originCountryId: CountryId;

  destinationCountryId: CountryId;

  geometry: unknown;

  valuePerTick: number;

  active: boolean;
}

export interface MapPlayerFeature {
  playerId: string;

  latitude: number;

  longitude: number;

  countryId: CountryId | null;

  displayName: string;

  profileImageUrl: string | null;

  status:
    | "online"
    | "away"
    | "busy";

  visible: boolean;

  updatedAt: string;
}

export interface MapEventFeature {
  id: string;

  type:
    | "battle"
    | "capture"
    | "war"
    | "peace"
    | "election"
    | "revolution"
    | "disaster"
    | "economic"
    | "political"
    | "industrial";

  latitude: number;

  longitude: number;

  title: string;

  description: string;

  countryId: CountryId | null;

  warId: WarId | null;

  createdAt: string;
}

export interface MapDataResponse {
  viewport: MapViewport;

  countries: MapCountryFeature[];

  territories: MapTerritoryFeature[];

  cities: MapCityFeature[];

  military: MapMilitaryFeature[];

  battles: MapBattleFeature[];

  frontlines: MapFrontlineFeature[];

  factories: MapFactoryFeature[];

  resources: MapResourceFeature[];

  tradeRoutes: MapTradeRouteFeature[];

  players: MapPlayerFeature[];

  events: MapEventFeature[];

  worldTick: number;

  generatedAt: string;
}

export interface FogOfWarRegion {
  id: string;

  geometry: unknown;

  visibility:
    | "visible"
    | "partially_visible"
    | "unknown";

  intelligenceLevel:
    | "none"
    | "low"
    | "medium"
    | "high";

  updatedAt: string;
}

export interface MapSelection {
  type:
    | "country"
    | "territory"
    | "city"
    | "unit"
    | "battle"
    | "factory"
    | "player"
    | "event"
    | null;

  id: string | null;
}

export interface MapCameraCommand {
  center: MapCoordinate;

  zoom: number;

  bearing?: number;

  pitch?: number;

  durationMs?: number;
}

export class MapService {
  private readonly options: MapServiceOptions;

  constructor(
    options: MapServiceOptions = {},
  ) {
    this.options = options;
  }

  public async getMapData(
    viewport: MapViewport,
    layers: MapLayer[],
  ): Promise<MapDataResponse> {
    const params =
      new URLSearchParams();

    params.set(
      "north",
      String(viewport.north),
    );

    params.set(
      "south",
      String(viewport.south),
    );

    params.set(
      "east",
      String(viewport.east),
    );

    params.set(
      "west",
      String(viewport.west),
    );

    params.set(
      "zoom",
      String(viewport.zoom),
    );

    params.set(
      "layers",
      layers.join(","),
    );

    return apiClient.get<MapDataResponse>(
      `/map/data?${params.toString()}`,
    );
  }

  public async getCountries(
    viewport?: MapViewport,
  ): Promise<MapCountryFeature[]> {
    if (!viewport) {
      return apiClient.get<MapCountryFeature[]>(
        "/map/countries",
      );
    }

    const params =
      this.viewportParams(viewport);

    return apiClient.get<MapCountryFeature[]>(
      `/map/countries?${params}`,
    );
  }

  public async getTerritories(
    viewport: MapViewport,
  ): Promise<MapTerritoryFeature[]> {
    return apiClient.get<MapTerritoryFeature[]>(
      `/map/territories?${this.viewportParams(
        viewport,
      )}`,
    );
  }

  public async getCities(
    viewport: MapViewport,
  ): Promise<MapCityFeature[]> {
    return apiClient.get<MapCityFeature[]>(
      `/map/cities?${this.viewportParams(
        viewport,
      )}`,
    );
  }

  public async getMilitaryUnits(
    viewport: MapViewport,
  ): Promise<MapMilitaryFeature[]> {
    return apiClient.get<MapMilitaryFeature[]>(
      `/map/military?${this.viewportParams(
        viewport,
      )}`,
    );
  }

  public async getBattles(
    viewport: MapViewport,
  ): Promise<MapBattleFeature[]> {
    return apiClient.get<MapBattleFeature[]>(
      `/map/battles?${this.viewportParams(
        viewport,
      )}`,
    );
  }

  public async getFrontlines(
    viewport: MapViewport,
  ): Promise<MapFrontlineFeature[]> {
    return apiClient.get<MapFrontlineFeature[]>(
      `/map/frontlines?${this.viewportParams(
        viewport,
      )}`,
    );
  }

  public async getFactories(
    viewport: MapViewport,
  ): Promise<MapFactoryFeature[]> {
    return apiClient.get<MapFactoryFeature[]>(
      `/map/factories?${this.viewportParams(
        viewport,
      )}`,
    );
  }

  public async getResources(
    viewport: MapViewport,
  ): Promise<MapResourceFeature[]> {
    return apiClient.get<MapResourceFeature[]>(
      `/map/resources?${this.viewportParams(
        viewport,
      )}`,
    );
  }

  public async getTradeRoutes(
    viewport: MapViewport,
  ): Promise<MapTradeRouteFeature[]> {
    return apiClient.get<MapTradeRouteFeature[]>(
      `/map/trade-routes?${this.viewportParams(
        viewport,
      )}`,
    );
  }

  public async getPlayers(
    viewport: MapViewport,
  ): Promise<MapPlayerFeature[]> {
    return apiClient.get<MapPlayerFeature[]>(
      `/map/players?${this.viewportParams(
        viewport,
      )}`,
    );
  }

  public async getEvents(
    viewport: MapViewport,
  ): Promise<MapEventFeature[]> {
    return apiClient.get<MapEventFeature[]>(
      `/map/events?${this.viewportParams(
        viewport,
      )}`,
    );
  }

  public async getFogOfWar(
    viewport: MapViewport,
  ): Promise<FogOfWarRegion[]> {
    return apiClient.get<FogOfWarRegion[]>(
      `/map/fog-of-war?${this.viewportParams(
        viewport,
      )}`,
    );
  }

  public async getCountryGeometry(
    countryId: CountryId,
  ): Promise<unknown> {
    return apiClient.get(
      `/map/countries/${encodeURIComponent(
        countryId,
      )}/geometry`,
    );
  }

  public async getTerritoryGeometry(
    territoryId: string,
  ): Promise<unknown> {
    return apiClient.get(
      `/map/territories/${encodeURIComponent(
        territoryId,
      )}/geometry`,
    );
  }

  public async reportMapInteraction(
    selection: MapSelection,
  ): Promise<void> {
    const playerId =
      this.options.getPlayerId?.();

    if (!playerId) {
      return;
    }

    await apiClient.post(
      "/map/interactions",
      {
        playerId,

        sessionId:
          this.options.getSessionId?.() ??
          null,

        selection,
      },
    );
  }

  private viewportParams(
    viewport: MapViewport,
  ): string {
    const params =
      new URLSearchParams();

    params.set(
      "north",
      String(viewport.north),
    );

    params.set(
      "south",
      String(viewport.south),
    );

    params.set(
      "east",
      String(viewport.east),
    );

    params.set(
      "west",
      String(viewport.west),
    );

    params.set(
      "zoom",
      String(viewport.zoom),
    );

    return params.toString();
  }
}

export const mapService =
  new MapService();