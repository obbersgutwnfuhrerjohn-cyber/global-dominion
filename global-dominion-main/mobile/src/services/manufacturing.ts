import { apiClient } from "./api";

import type { PlayerId } from "../types/game";

export interface ManufacturingServiceOptions {
  getPlayerId?: () => PlayerId | null;
  getSessionId?: () => string | null;
}

export type FactoryType =
  | "mining"
  | "agriculture"
  | "food"
  | "textile"
  | "chemical"
  | "electronics"
  | "automotive"
  | "machinery"
  | "construction"
  | "pharmaceutical"
  | "consumer_goods";

export type ProductionStatus =
  | "planned"
  | "building"
  | "active"
  | "paused"
  | "closed";

export interface Factory {
  id: string;

  name: string;

  countryId: string;

  cityId: string;

  ownerPlayerId: PlayerId | null;

  ownerCompanyId: string | null;

  type: FactoryType;

  productionCapacity: number;

  currentProduction: number;

  efficiency: number;

  condition: number;

  employees: number;

  energyConsumption: number;

  operatingCostPerDay: number;

  status: ProductionStatus;

  createdAt: string;

  updatedAt: string;
}

export interface ProductionRecipe {
  id: string;

  name: string;

  factoryType: FactoryType;

  outputItemId: string;

  outputQuantity: number;

  inputItemId: string;

  inputQuantity: number;

  productionTimeHours: number;

  energyRequired: number;

  technologyLevelRequired: number;
}

export interface ProductionOrder {
  id: string;

  factoryId: string;

  ownerPlayerId: PlayerId;

  recipeId: string;

  quantity: number;

  progress: number;

  status:
    | "queued"
    | "active"
    | "completed"
    | "cancelled";

  startedAt: string | null;

  completedAt: string | null;

  createdAt: string;
}

export interface ProductionStats {
  countryId: string;

  totalFactories: number;

  activeFactories: number;

  totalProduction: number;

  industrialOutput: number;

  industrialEmployment: number;

  averageEfficiency: number;

  energyConsumption: number;

  updatedAt: string;
}

function requirePlayer(
  options: ManufacturingServiceOptions,
): PlayerId {
  const playerId = options.getPlayerId?.();

  if (!playerId) {
    throw new Error(
      "A logged-in player is required.",
    );
  }

  return playerId;
}

export class ManufacturingService {
  private readonly options: ManufacturingServiceOptions;

  constructor(
    options: ManufacturingServiceOptions = {},
  ) {
    this.options = options;
  }

  public async getFactories(
    countryId?: string,
    cityId?: string,
    type?: FactoryType,
  ): Promise<Factory[]> {
    return apiClient.get<Factory[]>(
      "/manufacturing/factories",
      {
        countryId,
        cityId,
        type,
      },
    );
  }

  public async getFactory(
    factoryId: string,
  ): Promise<Factory> {
    return apiClient.get<Factory>(
      `/manufacturing/factories/${encodeURIComponent(
        factoryId,
      )}`,
    );
  }

  public async createFactory(
    request: {
      name: string;

      countryId: string;

      cityId: string;

      type: FactoryType;
    },
  ): Promise<Factory> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.post<Factory>(
      "/manufacturing/factories",
      {
        playerId,
        request,
      },
    );
  }

  public async getRecipes(
    factoryType?: FactoryType,
  ): Promise<ProductionRecipe[]> {
    return apiClient.get<ProductionRecipe[]>(
      "/manufacturing/recipes",
      {
        factoryType,
      },
    );
  }

  public async createProductionOrder(
    request: {
      factoryId: string;

      recipeId: string;

      quantity: number;
    },
  ): Promise<ProductionOrder> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.post<ProductionOrder>(
      "/manufacturing/orders",
      {
        playerId,
        request,
      },
    );
  }

  public async getMyOrders(): Promise<
    ProductionOrder[]
  > {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.get<ProductionOrder[]>(
      `/manufacturing/orders/player/${encodeURIComponent(
        playerId,
      )}`,
    );
  }

  public async getStats(
    countryId: string,
  ): Promise<ProductionStats> {
    return apiClient.get<ProductionStats>(
      `/manufacturing/countries/${encodeURIComponent(
        countryId,
      )}/stats`,
    );
  }
}

export const manufacturingService =
  new ManufacturingService();