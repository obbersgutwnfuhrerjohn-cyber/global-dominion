import { apiClient } from "./api";

import type { PlayerId } from "../types/game";

export interface ConstructionServiceOptions {
  getPlayerId?: () => PlayerId | null;
  getSessionId?: () => string | null;
}

export type ConstructionType =
  | "residential"
  | "commercial"
  | "industrial"
  | "office"
  | "hospital"
  | "school"
  | "university"
  | "power_plant"
  | "warehouse"
  | "road"
  | "rail"
  | "bridge"
  | "port"
  | "airport"
  | "utility";

export type ConstructionStatus =
  | "planned"
  | "approved"
  | "construction"
  | "completed"
  | "cancelled";

export interface ConstructionProject {
  id: string;

  name: string;

  countryId: string;

  cityId: string;

  ownerPlayerId: PlayerId | null;

  ownerCompanyId: string | null;

  type: ConstructionType;

  status: ConstructionStatus;

  estimatedCost: number;

  spentAmount: number;

  progress: number;

  workersRequired: number;

  workersAssigned: number;

  materialsRequired: number;

  materialsDelivered: number;

  startDate: string | null;

  estimatedCompletionDate: string | null;

  completedAt: string | null;

  createdAt: string;

  updatedAt: string;
}

export interface InfrastructureStats {
  countryId: string;

  totalInfrastructureValue: number;

  residentialCapacity: number;

  commercialCapacity: number;

  industrialCapacity: number;

  roadCapacity: number;

  railCapacity: number;

  portCapacity: number;

  airportCapacity: number;

  infrastructureQuality: number;

  constructionActivity: number;

  updatedAt: string;
}

function requirePlayer(
  options: ConstructionServiceOptions,
): PlayerId {
  const playerId = options.getPlayerId?.();

  if (!playerId) {
    throw new Error(
      "A logged-in player is required.",
    );
  }

  return playerId;
}

export class ConstructionService {
  private readonly options: ConstructionServiceOptions;

  constructor(
    options: ConstructionServiceOptions = {},
  ) {
    this.options = options;
  }

  public async getProjects(
    countryId?: string,
    cityId?: string,
    status?: ConstructionStatus,
  ): Promise<ConstructionProject[]> {
    return apiClient.get<ConstructionProject[]>(
      "/construction/projects",
      {
        countryId,
        cityId,
        status,
      },
    );
  }

  public async getProject(
    projectId: string,
  ): Promise<ConstructionProject> {
    return apiClient.get<ConstructionProject>(
      `/construction/projects/${encodeURIComponent(
        projectId,
      )}`,
    );
  }

  public async createProject(
    request: {
      name: string;

      countryId: string;

      cityId: string;

      type: ConstructionType;

      estimatedCost: number;

      workersRequired: number;

      materialsRequired: number;
    },
  ): Promise<ConstructionProject> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.post<ConstructionProject>(
      "/construction/projects",
      {
        playerId,
        request,
      },
    );
  }

  public async fundProject(
    projectId: string,
    amount: number,
  ): Promise<ConstructionProject> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.post<ConstructionProject>(
      `/construction/projects/${encodeURIComponent(
        projectId,
      )}/fund`,
      {
        playerId,
        amount,
      },
    );
  }

  public async getMyProjects(): Promise<
    ConstructionProject[]
  > {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.get<ConstructionProject[]>(
      `/construction/projects/player/${encodeURIComponent(
        playerId,
      )}`,
    );
  }

  public async getInfrastructureStats(
    countryId: string,
  ): Promise<InfrastructureStats> {
    return apiClient.get<InfrastructureStats>(
      `/construction/countries/${encodeURIComponent(
        countryId,
      )}/infrastructure`,
    );
  }
}

export const constructionService =
  new ConstructionService();