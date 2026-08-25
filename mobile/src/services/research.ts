import { apiClient } from "./api";

import type { PlayerId } from "../types/game";

export interface ResearchServiceOptions {
  getPlayerId?: () => PlayerId | null;
  getSessionId?: () => string | null;
}

export type ResearchCategory =
  | "technology"
  | "medicine"
  | "energy"
  | "transport"
  | "manufacturing"
  | "agriculture"
  | "materials"
  | "communications"
  | "space";

export type ResearchStatus =
  | "proposed"
  | "funded"
  | "active"
  | "completed"
  | "cancelled";

export interface ResearchProject {
  id: string;

  name: string;

  description: string;

  countryId: string;

  category: ResearchCategory;

  ownerPlayerId: PlayerId | null;

  ownerCompanyId: string | null;

  fundingRequired: number;

  fundingReceived: number;

  progress: number;

  researchPower: number;

  status: ResearchStatus;

  createdAt: string;

  completedAt: string | null;
}

export interface Technology {
  id: string;

  name: string;

  description: string;

  category: ResearchCategory;

  level: number;

  developmentCost: number;

  productivityBonus: number;

  energyEfficiencyBonus: number;

  researchRequired: number;

  unlocked: boolean;

  discoveredAt: string | null;
}

export interface ResearchInstitution {
  id: string;

  name: string;

  countryId: string;

  cityId: string;

  specialization: ResearchCategory;

  researchCapacity: number;

  funding: number;

  reputation: number;

  active: boolean;

  createdAt: string;
}

function requirePlayer(
  options: ResearchServiceOptions,
): PlayerId {
  const playerId = options.getPlayerId?.();

  if (!playerId) {
    throw new Error(
      "A logged-in player is required.",
    );
  }

  return playerId;
}

export class ResearchService {
  private readonly options: ResearchServiceOptions;

  constructor(
    options: ResearchServiceOptions = {},
  ) {
    this.options = options;
  }

  public async getProjects(
    countryId?: string,
    category?: ResearchCategory,
  ): Promise<ResearchProject[]> {
    return apiClient.get<ResearchProject[]>(
      "/research/projects",
      {
        countryId,
        category,
      },
    );
  }

  public async getProject(
    projectId: string,
  ): Promise<ResearchProject> {
    return apiClient.get<ResearchProject>(
      `/research/projects/${encodeURIComponent(
        projectId,
      )}`,
    );
  }

  public async createProject(
    request: {
      name: string;

      description: string;

      countryId: string;

      category: ResearchCategory;

      fundingRequired: number;
    },
  ): Promise<ResearchProject> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.post<ResearchProject>(
      "/research/projects",
      {
        playerId,
        request,
      },
    );
  }

  public async fundProject(
    projectId: string,
    amount: number,
  ): Promise<ResearchProject> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.post<ResearchProject>(
      `/research/projects/${encodeURIComponent(
        projectId,
      )}/fund`,
      {
        playerId,
        amount,
      },
    );
  }

  public async getTechnologies(
    category?: ResearchCategory,
  ): Promise<Technology[]> {
    return apiClient.get<Technology[]>(
      "/research/technologies",
      {
        category,
      },
    );
  }

  public async getInstitutions(
    countryId?: string,
    cityId?: string,
  ): Promise<ResearchInstitution[]> {
    return apiClient.get<ResearchInstitution[]>(
      "/research/institutions",
      {
        countryId,
        cityId,
      },
    );
  }

  public async getMyProjects(): Promise<
    ResearchProject[]
  > {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.get<ResearchProject[]>(
      `/research/projects/player/${encodeURIComponent(
        playerId,
      )}`,
    );
  }
}

export const researchService =
  new ResearchService();