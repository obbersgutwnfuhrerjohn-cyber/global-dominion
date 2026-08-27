import { apiClient } from "./api";

import type { PlayerId } from "../types/game";

export interface AgricultureServiceOptions {
  getPlayerId?: () => PlayerId | null;
  getSessionId?: () => string | null;
}

export type FarmType =
  | "crop"
  | "livestock"
  | "dairy"
  | "orchard"
  | "greenhouse"
  | "mixed";

export type AgriculturalResource =
  | "wheat"
  | "corn"
  | "rice"
  | "vegetables"
  | "fruit"
  | "cattle"
  | "poultry"
  | "milk"
  | "eggs";

export interface Farm {
  id: string;

  ownerPlayerId: PlayerId | null;

  ownerCompanyId: string | null;

  countryId: string;

  cityId: string;

  name: string;

  type: FarmType;

  areaHectares: number;

  workers: number;

  productivity: number;

  productionCapacity: number;

  currentProduction: number;

  waterUsage: number;

  energyUsage: number;

  active: boolean;

  createdAt: string;

  updatedAt: string;
}

export interface AgriculturalProduction {
  id: string;

  farmId: string;

  resource: AgriculturalResource;

  quantity: number;

  unit: string;

  productionCost: number;

  marketValue: number;

  currency: string;

  season: string;

  producedAt: string;
}

export interface FoodMarketStats {
  countryId: string;

  totalFoodProduction: number;

  foodDemand: number;

  foodSupply: number;

  foodImportDependency: number;

  averageFoodPrice: number;

  agriculturalEmployment: number;

  agriculturalOutput: number;

  foodSecurity: number;

  updatedAt: string;
}

function requirePlayer(
  options: AgricultureServiceOptions,
): PlayerId {
  const playerId = options.getPlayerId?.();

  if (!playerId) {
    throw new Error(
      "A logged-in player is required.",
    );
  }

  return playerId;
}

export class AgricultureService {
  private readonly options: AgricultureServiceOptions;

  constructor(
    options: AgricultureServiceOptions = {},
  ) {
    this.options = options;
  }

  public async getFarms(countryId?: string, cityId?: string, type?: FarmType): Promise<Farm[]> {
    const params = new URLSearchParams();
    if (countryId) params.set("countryId", countryId);
    if (cityId) params.set("cityId", cityId);
    if (type) params.set("type", type);
    const query = params.toString();
    return apiClient.get<Farm[]>(`/agriculture/farms${query ? `?${query}` : ""}`);
  }

  public async getFarm(
    farmId: string,
  ): Promise<Farm> {
    return apiClient.get<Farm>(
      `/agriculture/farms/${encodeURIComponent(
        farmId,
      )}`,
    );
  }

  public async createFarm(
    request: {
      countryId: string;

      cityId: string;

      name: string;

      type: FarmType;

      areaHectares: number;
    },
  ): Promise<Farm> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.post<Farm>(
      "/agriculture/farms",
      {
        playerId,
        request,
      },
    );
  }

  public async getProduction(
    farmId: string,
  ): Promise<AgriculturalProduction[]> {
    return apiClient.get<AgriculturalProduction[]>(
      `/agriculture/farms/${encodeURIComponent(
        farmId,
      )}/production`,
    );
  }

  public async getMyFarms(): Promise<Farm[]> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.get<Farm[]>(
      `/agriculture/farms/player/${encodeURIComponent(
        playerId,
      )}`,
    );
  }

  public async getFoodMarket(
    countryId: string,
  ): Promise<FoodMarketStats> {
    return apiClient.get<FoodMarketStats>(
      `/agriculture/countries/${encodeURIComponent(
        countryId,
      )}/food-market`,
    );
  }
}

export const agricultureService =
  new AgricultureService();
