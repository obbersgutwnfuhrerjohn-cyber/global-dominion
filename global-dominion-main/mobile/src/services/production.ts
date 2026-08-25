import { apiClient } from "./api";

import type { PlayerId } from "../types/game";

export interface ProductionServiceOptions {
  getPlayerId?: () => PlayerId | null;
  getSessionId?: () => string | null;
}

export interface ProductionRecipe {
  id: string;

  name: string;

  outputItemId: string;

  outputQuantity: number;

  productionTimeSeconds: number;

  inputs: ProductionInput[];

  energyRequired: number;

  workersRequired: number;

  technologyLevelRequired: number;

  active: boolean;
}

export interface ProductionInput {
  itemId: string;

  itemName: string;

  quantity: number;

  unit: string;
}

export interface ProductionFacility {
  id: string;

  name: string;

  ownerPlayerId: PlayerId | null;

  ownerCompanyId: string | null;

  countryId: string;

  cityId: string | null;

  capacityPerDay: number;

  currentProductionPerDay: number;

  efficiency: number;

  condition: number;

  workersRequired: number;

  energyRequiredPerDay: number;

  active: boolean;

  createdAt: string;

  updatedAt: string;
}

export type ProductionRunStatus =
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export interface ProductionRun {
  id: string;

  facilityId: string;

  recipeId: string;

  ownerPlayerId: PlayerId;

  inputItems: ProductionInput[];

  outputItemId: string;

  outputQuantity: number;

  energyUsed: number;

  workersUsed: number;

  status: ProductionRunStatus;

  startedAt: string | null;

  completedAt: string | null;

  createdAt: string;
}

function requirePlayer(
  options: ProductionServiceOptions,
): PlayerId {
  const playerId = options.getPlayerId?.();

  if (!playerId) {
    throw new Error(
      "A logged-in player is required.",
    );
  }

  return playerId;
}

export class ProductionService {
  private readonly options: ProductionServiceOptions;

  constructor(
    options: ProductionServiceOptions = {},
  ) {
    this.options = options;
  }

  public async getRecipes(): Promise<
    ProductionRecipe[]
  > {
    return apiClient.get<ProductionRecipe[]>(
      "/production/recipes",
    );
  }

  public async getRecipe(
    recipeId: string,
  ): Promise<ProductionRecipe> {
    return apiClient.get<ProductionRecipe>(
      `/production/recipes/${encodeURIComponent(
        recipeId,
      )}`,
    );
  }

  public async getMyFacilities(): Promise<
    ProductionFacility[]
  > {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.get<ProductionFacility[]>(
      `/production/facilities/player/${encodeURIComponent(
        playerId,
      )}`,
    );
  }

  public async getFacility(
    facilityId: string,
  ): Promise<ProductionFacility> {
    return apiClient.get<ProductionFacility>(
      `/production/facilities/${encodeURIComponent(
        facilityId,
      )}`,
    );
  }

  public async createFacility(
    request: {
      name: string;

      countryId: string;

      cityId?: string | null;

      capacityPerDay: number;

      workersRequired: number;

      energyRequiredPerDay: number;

      companyId?: string | null;
    },
  ): Promise<ProductionFacility> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.post<ProductionFacility>(
      "/production/facilities",
      {
        playerId,
        request,
      },
    );
  }

  public async startProduction(
    request: {
      facilityId: string;

      recipeId: string;

      quantity: number;
    },
  ): Promise<ProductionRun> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.post<ProductionRun>(
      "/production/runs",
      {
        playerId,
        request,
      },
    );
  }

  public async getMyRuns(): Promise<
    ProductionRun[]
  > {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.get<ProductionRun[]>(
      `/production/runs/player/${encodeURIComponent(
        playerId,
      )}`,
    );
  }

  public async getRun(
    runId: string,
  ): Promise<ProductionRun> {
    return apiClient.get<ProductionRun>(
      `/production/runs/${encodeURIComponent(
        runId,
      )}`,
    );
  }

  public async cancelProduction(
    runId: string,
  ): Promise<void> {
    const playerId = requirePlayer(
      this.options,
    );

    await apiClient.post(
      `/production/runs/${encodeURIComponent(
        runId,
      )}/cancel`,
      {
        playerId,
      },
    );
  }
}

export const productionService =
  new ProductionService();