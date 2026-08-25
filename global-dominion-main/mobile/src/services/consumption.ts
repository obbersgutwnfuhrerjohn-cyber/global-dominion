import { apiClient } from "./api";

import type { PlayerId } from "../types/game";

export interface ConsumptionServiceOptions {
  getPlayerId?: () => PlayerId | null;
  getSessionId?: () => string | null;
}

export type ConsumptionCategory =
  | "food"
  | "housing"
  | "energy"
  | "transport"
  | "healthcare"
  | "education"
  | "entertainment"
  | "communications"
  | "clothing"
  | "luxury"
  | "services";

export interface ConsumptionProfile {
  playerId: PlayerId;

  dailyBudget: number;

  monthlyBudget: number;

  savingsRate: number;

  overallDemand: number;

  updatedAt: string;
}

export interface ConsumptionNeed {
  id: string;

  playerId: PlayerId;

  category: ConsumptionCategory;

  itemId: string;

  itemName: string;

  requiredQuantityPerDay: number;

  currentQuantity: number;

  priority: number;

  satisfied: boolean;

  updatedAt: string;
}

export interface ConsumptionTransaction {
  id: string;

  playerId: PlayerId;

  itemId: string;

  itemName: string;

  category: ConsumptionCategory;

  quantity: number;

  totalCost: number;

  currency: string;

  createdAt: string;
}

export interface MarketDemand {
  itemId: string;

  itemName: string;

  category: ConsumptionCategory;

  dailyDemand: number;

  availableSupply: number;

  demandSupplyRatio: number;

  averagePrice: number;

  updatedAt: string;
}

function requirePlayer(
  options: ConsumptionServiceOptions,
): PlayerId {
  const playerId = options.getPlayerId?.();

  if (!playerId) {
    throw new Error(
      "A logged-in player is required.",
    );
  }

  return playerId;
}

export class ConsumptionService {
  private readonly options: ConsumptionServiceOptions;

  constructor(
    options: ConsumptionServiceOptions = {},
  ) {
    this.options = options;
  }

  public async getProfile(): Promise<
    ConsumptionProfile
  > {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.get<ConsumptionProfile>(
      `/consumption/player/${encodeURIComponent(
        playerId,
      )}/profile`,
    );
  }

  public async getNeeds(): Promise<
    ConsumptionNeed[]
  > {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.get<ConsumptionNeed[]>(
      `/consumption/player/${encodeURIComponent(
        playerId,
      )}/needs`,
    );
  }

  public async getTransactions(): Promise<
    ConsumptionTransaction[]
  > {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.get<
      ConsumptionTransaction[]
    >(
      `/consumption/player/${encodeURIComponent(
        playerId,
      )}/transactions`,
    );
  }

  public async purchase(
    request: {
      itemId: string;

      quantity: number;

      category: ConsumptionCategory;
    },
  ): Promise<ConsumptionTransaction> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.post<ConsumptionTransaction>(
      "/consumption/purchase",
      {
        playerId,
        request,
      },
    );
  }

  public async getMarketDemand(
    category?: ConsumptionCategory,
  ): Promise<MarketDemand[]> {
    return apiClient.get<MarketDemand[]>(
      "/consumption/market-demand",
      {
        category,
      },
    );
  }
}

export const consumptionService =
  new ConsumptionService();