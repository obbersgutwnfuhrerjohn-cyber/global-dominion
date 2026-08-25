import { apiClient } from "./api";

import type { PlayerId } from "../types/game";

export interface ResourceServiceOptions {
  getPlayerId?: () => PlayerId | null;
  getSessionId?: () => string | null;
}

export type NaturalResource =
  | "oil"
  | "natural_gas"
  | "coal"
  | "iron"
  | "copper"
  | "gold"
  | "silver"
  | "lithium"
  | "uranium"
  | "rare_earth"
  | "timber"
  | "stone";

export type ExtractionMethod =
  | "open_pit"
  | "underground"
  | "drilling"
  | "harvesting"
  | "quarry";

export interface ResourceDeposit {
  id: string;

  countryId: string;

  cityId: string;

  name: string;

  resource: NaturalResource;

  totalReserves: number;

  remainingReserves: number;

  quality: number;

  extractionDifficulty: number;

  estimatedValue: number;

  discoveredAt: string;

  active: boolean;
}

export interface ExtractionSite {
  id: string;

  depositId: string;

  ownerPlayerId: PlayerId | null;

  ownerCompanyId: string | null;

  countryId: string;

  cityId: string;

  resource: NaturalResource;

  extractionMethod: ExtractionMethod;

  productionCapacity: number;

  currentProduction: number;

  workers: number;

  energyConsumption: number;

  operatingCostPerUnit: number;

  environmentalImpact: number;

  active: boolean;

  createdAt: string;

  updatedAt: string;
}

export interface ResourceMarket {
  resource: NaturalResource;

  totalSupply: number;

  totalDemand: number;

  averagePrice: number;

  priceChangePercentage: number;

  globalProduction: number;

  globalConsumption: number;

  updatedAt: string;
}

function requirePlayer(
  options: ResourceServiceOptions,
): PlayerId {
  const playerId = options.getPlayerId?.();

  if (!playerId) {
    throw new Error(
      "A logged-in player is required.",
    );
  }

  return playerId;
}

export class ResourceService {
  private readonly options: ResourceServiceOptions;

  constructor(
    options: ResourceServiceOptions = {},
  ) {
    this.options = options;
  }

  public async getDeposits(
    countryId?: string,
    resource?: NaturalResource,
  ): Promise<ResourceDeposit[]> {
    return apiClient.get<ResourceDeposit[]>(
      "/resources/deposits",
      {
        countryId,
        resource,
      },
    );
  }

  public async getDeposit(
    depositId: string,
  ): Promise<ResourceDeposit> {
    return apiClient.get<ResourceDeposit>(
      `/resources/deposits/${encodeURIComponent(
        depositId,
      )}`,
    );
  }

  public async getSites(
    countryId?: string,
    resource?: NaturalResource,
  ): Promise<ExtractionSite[]> {
    return apiClient.get<ExtractionSite[]>(
      "/resources/extraction-sites",
      {
        countryId,
        resource,
      },
    );
  }

  public async createExtractionSite(
    request: {
      depositId: string;

      countryId: string;

      cityId: string;

      extractionMethod: ExtractionMethod;
    },
  ): Promise<ExtractionSite> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.post<ExtractionSite>(
      "/resources/extraction-sites",
      {
        playerId,
        request,
      },
    );
  }

  public async getMySites(): Promise<
    ExtractionSite[]
  > {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.get<ExtractionSite[]>(
      `/resources/extraction-sites/player/${encodeURIComponent(
        playerId,
      )}`,
    );
  }

  public async getMarket(
    resource: NaturalResource,
  ): Promise<ResourceMarket> {
    return apiClient.get<ResourceMarket>(
      `/resources/market/${encodeURIComponent(
        resource,
      )}`,
    );
  }
}

export const resourceService =
  new ResourceService();