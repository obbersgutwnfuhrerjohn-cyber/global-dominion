import { apiClient } from "./api";

import type {
  CountryId,
  PlayerId,
} from "../types/game";

export interface EconomyServiceOptions {
  getPlayerId?: () => PlayerId | null;
  getSessionId?: () => string | null;
}

export type ResourceType =
  | "food"
  | "water"
  | "oil"
  | "gas"
  | "coal"
  | "iron"
  | "steel"
  | "aluminum"
  | "copper"
  | "uranium"
  | "rare_earth"
  | "wood"
  | "rubber"
  | "electronics"
  | "energy";

export type EconomicSector =
  | "agriculture"
  | "mining"
  | "energy"
  | "manufacturing"
  | "construction"
  | "technology"
  | "transport"
  | "finance"
  | "healthcare"
  | "retail"
  | "services";

export type MarketOrderType =
  | "buy"
  | "sell";

export interface CountryEconomy {
  countryId: CountryId;

  gdp: number;

  gdpPerCapita: number;

  treasury: number;

  dailyRevenue: number;

  dailyExpenses: number;

  inflation: number;

  unemployment: number;

  population: number;

  employedPopulation: number;

  industrialCapacity: number;

  economicGrowth: number;

  stability: number;

  debt: number;

  updatedAt: string;
}

export interface ResourceStockpile {
  countryId: CountryId;

  resource: ResourceType;

  quantity: number;

  productionPerDay: number;

  consumptionPerDay: number;

  reservedQuantity: number;

  storageCapacity: number;

  updatedAt: string;
}

export interface ResourceDeposit {
  id: string;

  countryId: CountryId;

  regionId: string;

  resource: ResourceType;

  estimatedReserves: number;

  remainingReserves: number;

  extractionRate: number;

  maximumExtractionRate: number;

  active: boolean;

  createdAt: string;
}

export interface EconomicSectorState {
  countryId: CountryId;

  sector: EconomicSector;

  output: number;

  employment: number;

  productivity: number;

  investment: number;

  growth: number;

  updatedAt: string;
}

export interface GovernmentBudget {
  countryId: CountryId;

  taxRevenue: number;

  corporateTaxRevenue: number;

  tradeRevenue: number;

  resourceRevenue: number;

  militaryBudget: number;

  researchBudget: number;

  healthcareBudget: number;

  educationBudget: number;

  infrastructureBudget: number;

  welfareBudget: number;

  administrationBudget: number;

  otherExpenses: number;

  surplus: number;

  updatedAt: string;
}

export interface TaxPolicy {
  countryId: CountryId;

  incomeTax: number;

  corporateTax: number;

  salesTax: number;

  resourceTax: number;

  importTax: number;

  exportTax: number;

  updatedAt: string;
}

export interface TradeAgreement {
  id: string;

  countryA: CountryId;

  countryB: CountryId;

  resources: ResourceType[];

  tariffRate: number;

  dailyTradeValue: number;

  active: boolean;

  createdAt: string;

  expiresAt: string | null;
}

export interface MarketPrice {
  resource: ResourceType;

  price: number;

  supply: number;

  demand: number;

  globalProduction: number;

  globalConsumption: number;

  updatedAt: string;
}

export interface MarketOrder {
  id: string;

  playerId: PlayerId;

  countryId: CountryId;

  resource: ResourceType;

  type: MarketOrderType;

  quantity: number;

  pricePerUnit: number;

  remainingQuantity: number;

  status:
    | "open"
    | "partially_filled"
    | "filled"
    | "cancelled";

  createdAt: string;

  updatedAt: string;
}

export interface Investment {
  id: string;

  playerId: PlayerId;

  countryId: CountryId;

  sector: EconomicSector;

  amount: number;

  expectedReturn: number;

  createdAt: string;

  completedAt: string | null;
}

function requirePlayer(
  options: EconomyServiceOptions,
): PlayerId {
  const playerId =
    options.getPlayerId?.();

  if (!playerId) {
    throw new Error(
      "A logged-in player is required.",
    );
  }

  return playerId;
}

export class EconomyService {
  private readonly options: EconomyServiceOptions;

  constructor(
    options: EconomyServiceOptions = {},
  ) {
    this.options = options;
  }

  public async getCountryEconomy(
    countryId: CountryId,
  ): Promise<CountryEconomy> {
    return apiClient.get<CountryEconomy>(
      `/economy/countries/${encodeURIComponent(
        countryId,
      )}`,
    );
  }

  public async getResources(
    countryId: CountryId,
  ): Promise<ResourceStockpile[]> {
    return apiClient.get<ResourceStockpile[]>(
      `/economy/countries/${encodeURIComponent(
        countryId,
      )}/resources`,
    );
  }

  public async getDeposits(
    countryId: CountryId,
  ): Promise<ResourceDeposit[]> {
    return apiClient.get<ResourceDeposit[]>(
      `/economy/countries/${encodeURIComponent(
        countryId,
      )}/deposits`,
    );
  }

  public async getSectorStates(
    countryId: CountryId,
  ): Promise<EconomicSectorState[]> {
    return apiClient.get<EconomicSectorState[]>(
      `/economy/countries/${encodeURIComponent(
        countryId,
      )}/sectors`,
    );
  }

  public async getGovernmentBudget(
    countryId: CountryId,
  ): Promise<GovernmentBudget> {
    return apiClient.get<GovernmentBudget>(
      `/economy/countries/${encodeURIComponent(
        countryId,
      )}/budget`,
    );
  }

  public async updateGovernmentBudget(
    countryId: CountryId,
    budget: Partial<
      Omit<GovernmentBudget, "countryId" | "updatedAt">
    >,
  ): Promise<GovernmentBudget> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.put<GovernmentBudget>(
      `/economy/countries/${encodeURIComponent(
        countryId,
      )}/budget`,
      {
        playerId,

        budget,
      },
    );
  }

  public async getTaxPolicy(
    countryId: CountryId,
  ): Promise<TaxPolicy> {
    return apiClient.get<TaxPolicy>(
      `/economy/countries/${encodeURIComponent(
        countryId,
      )}/tax-policy`,
    );
  }

  public async updateTaxPolicy(
    countryId: CountryId,
    policy: Partial<
      Omit<TaxPolicy, "countryId" | "updatedAt">
    >,
  ): Promise<TaxPolicy> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.put<TaxPolicy>(
      `/economy/countries/${encodeURIComponent(
        countryId,
      )}/tax-policy`,
      {
        playerId,

        policy,
      },
    );
  }

  public async getMarketPrices(): Promise<
    MarketPrice[]
  > {
    return apiClient.get<MarketPrice[]>(
      "/economy/market/prices",
    );
  }

  public async getMarketPrice(
    resource: ResourceType,
  ): Promise<MarketPrice> {
    return apiClient.get<MarketPrice>(
      `/economy/market/prices/${encodeURIComponent(
        resource,
      )}`,
    );
  }

  public async createMarketOrder(
    request: {
      countryId: CountryId;

      resource: ResourceType;

      type: MarketOrderType;

      quantity: number;

      pricePerUnit: number;
    },
  ): Promise<MarketOrder> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.post<MarketOrder>(
      "/economy/market/orders",
      {
        playerId,

        request,
      },
    );
  }

  public async getMyMarketOrders(): Promise<
    MarketOrder[]
  > {
    const playerId =
      requirePlayer(this.options);

    return apiClient.get<MarketOrder[]>(
      `/economy/market/orders/${encodeURIComponent(
        playerId,
      )}`,
    );
  }

  public async cancelMarketOrder(
    orderId: string,
  ): Promise<void> {
    const playerId =
      requirePlayer(this.options);

    await apiClient.post(
      `/economy/market/orders/${encodeURIComponent(
        orderId,
      )}/cancel`,
      {
        playerId,
      },
    );
  }

  public async getTradeAgreements(
    countryId: CountryId,
  ): Promise<TradeAgreement[]> {
    return apiClient.get<TradeAgreement[]>(
      `/economy/countries/${encodeURIComponent(
        countryId,
      )}/trade-agreements`,
    );
  }

  public async createTradeAgreement(
    request: {
      countryA: CountryId;

      countryB: CountryId;

      resources: ResourceType[];

      tariffRate: number;
    },
  ): Promise<TradeAgreement> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.post<TradeAgreement>(
      "/economy/trade-agreements",
      {
        playerId,

        request,
      },
    );
  }

  public async cancelTradeAgreement(
    agreementId: string,
  ): Promise<void> {
    const playerId =
      requirePlayer(this.options);

    await apiClient.post(
      `/economy/trade-agreements/${encodeURIComponent(
        agreementId,
      )}/cancel`,
      {
        playerId,
      },
    );
  }

  public async invest(
    request: {
      countryId: CountryId;

      sector: EconomicSector;

      amount: number;
    },
  ): Promise<Investment> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.post<Investment>(
      "/economy/investments",
      {
        playerId,

        request,
      },
    );
  }

  public async getMyInvestments(): Promise<
    Investment[]
  > {
    const playerId =
      requirePlayer(this.options);

    return apiClient.get<Investment[]>(
      `/economy/investments/${encodeURIComponent(
        playerId,
      )}`,
    );
  }
}

export const economyService =
  new EconomyService();