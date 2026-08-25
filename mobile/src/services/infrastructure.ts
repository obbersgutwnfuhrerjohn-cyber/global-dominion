import { apiClient } from "./api";

import type { PlayerId } from "../types/game";

export interface InfrastructureServiceOptions {
  getPlayerId?: () => PlayerId | null;
  getSessionId?: () => string | null;
}

export type InfrastructureType =
  | "road"
  | "highway"
  | "rail"
  | "port"
  | "airport"
  | "power_grid"
  | "water"
  | "telecom"
  | "sewer"
  | "public_transit";

export interface InfrastructureAsset {
  id: string;

  name: string;

  type: InfrastructureType;

  countryId: string;

  cityId: string | null;

  ownerPlayerId: PlayerId | null;

  ownerCompanyId: string | null;

  capacity: number;

  utilization: number;

  condition: number;

  efficiency: number;

  maintenanceCostPerDay: number;

  constructionCost: number;

  active: boolean;

  createdAt: string;

  updatedAt: string;
}

export interface InfrastructureProject {
  id: string;

  name: string;

  type: InfrastructureType;

  countryId: string;

  cityId: string | null;

  ownerPlayerId: PlayerId;

  totalCost: number;

  spentAmount: number;

  progress: number;

  expectedCapacity: number;

  status:
    | "planned"
    | "funded"
    | "under_construction"
    | "completed"
    | "cancelled";

  startedAt: string | null;

  completedAt: string | null;

  createdAt: string;
}

export interface InfrastructureNetwork {
  id: string;

  countryId: string;

  type: InfrastructureType;

  totalCapacity: number;

  totalUtilization: number;

  coverage: number;

  reliability: number;

  averageCondition: number;

  updatedAt: string;
}

function requirePlayer(
  options: InfrastructureServiceOptions,
): PlayerId {
  const playerId = options.getPlayerId?.();

  if (!playerId) {
    throw new Error(
      "A logged-in player is required.",
    );
  }

  return playerId;
}

export class InfrastructureService {
  private readonly options: InfrastructureServiceOptions;

  constructor(
    options: InfrastructureServiceOptions = {},
  ) {
    this.options = options;
  }

  public async getAssets(
    countryId?: string,
    cityId?: string,
    type?: InfrastructureType,
  ): Promise<InfrastructureAsset[]> {
    return apiClient.get<InfrastructureAsset[]>(
      "/infrastructure/assets",
      {
        countryId,
        cityId,
        type,
      },
    );
  }

  public async getAsset(
    assetId: string,
  ): Promise<InfrastructureAsset> {
    return apiClient.get<InfrastructureAsset>(
      `/infrastructure/assets/${encodeURIComponent(
        assetId,
      )}`,
    );
  }

  public async getNetworks(
    countryId: string,
  ): Promise<InfrastructureNetwork[]> {
    return apiClient.get<InfrastructureNetwork[]>(
      `/infrastructure/countries/${encodeURIComponent(
        countryId,
      )}/networks`,
    );
  }

  public async getProjects(
    countryId?: string,
    cityId?: string,
  ): Promise<InfrastructureProject[]> {
    return apiClient.get<InfrastructureProject[]>(
      "/infrastructure/projects",
      {
        countryId,
        cityId,
      },
    );
  }

  public async createProject(
    request: {
      name: string;

      type: InfrastructureType;

      countryId: string;

      cityId?: string | null;

      totalCost: number;

      expectedCapacity: number;
    },
  ): Promise<InfrastructureProject> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.post<InfrastructureProject>(
      "/infrastructure/projects",
      {
        playerId,
        request,
      },
    );
  }

  public async fundProject(
    projectId: string,
    amount: number,
  ): Promise<InfrastructureProject> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.post<InfrastructureProject>(
      `/infrastructure/projects/${encodeURIComponent(
        projectId,
      )}/fund`,
      {
        playerId,
        amount,
      },
    );
  }

  public async maintainAsset(
    assetId: string,
  ): Promise<InfrastructureAsset> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.post<InfrastructureAsset>(
      `/infrastructure/assets/${encodeURIComponent(
        assetId,
      )}/maintain`,
      {
        playerId,
      },
    );
  }
}

export const infrastructureService =
  new InfrastructureService();