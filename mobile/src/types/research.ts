import { apiClient } from "./api";

import type { PlayerId } from "../types/game";

export interface ResearchServiceOptions {
  getPlayerId?: () => PlayerId | null;
  getSessionId?: () => string | null;
}

export type ResearchField =
  | "engineering"
  | "medicine"
  | "agriculture"
  | "energy"
  | "materials"
  | "electronics"
  | "computing"
  | "transportation"
  | "environment"
  | "space";

export type ResearchStatus =
  | "available"
  | "in_progress"
  | "completed"
  | "paused";

export interface Technology {
  id: string;

  name: string;

  field: ResearchField;

  description: string;

  level: number;

  researchCost: number;

  researchTimeHours: number;

  requiredTechnologyIds: string[];

  productivityBonus: number;

  efficiencyBonus: number;

  unlocked: boolean;

  createdAt: string;
}

export interface ResearchProject {
  id: string;

  playerId: PlayerId;

  technologyId: string;

  field: ResearchField;

  progress: number;

  funding: number;

  status: ResearchStatus;

  startedAt: string | null;

  completedAt: string | null;

  createdAt: string;

  updatedAt: string;
}

export interface ResearchInstitution {
  id: string;

  name: string;

  countryId: string;

  cityId: string;

  field: ResearchField;

  researchers: number;

  researchCapacity: number;

  funding: number;

  technologyLevel: number;

  active: boolean;

  createdAt: string;

  updatedAt: string;
}

export interface ResearchStats {
  countryId: string;

  totalResearchSpending: number;

  activeResearchers: number;

  completedProjects: number;

  technologyLevel: number;

  innovationRate: number;

  patents: number;

  researchOutput: number;

  updatedAt: string;
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

  public async getTechnologies(
    field?: ResearchField,
  ): Promise<Technology[]> {
    return apiClient.get<Technology[]>(
      "/research/technologies",
      {
        field,
      },
    );
  }

  public async getTechnology(
    technologyId: string,
  ): Promise<Technology> {
    return apiClient.get<Technology>(
      `/research/technologies/${encodeURIComponent(
        technologyId,
      )}`,
    );
  }

  public async getInstitutions(
    countryId?: string,
    field?: ResearchField,
  ): Promise<ResearchInstitution[]> {
    return apiClient.get<ResearchInstitution[]>(
      "/research/institutions",
      {
        countryId,
        field,
      },
    );
  }

  public async startResearch(
    technologyId: string,
  ): Promise<ResearchProject> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.post<ResearchProject>(
      "/research/projects",
      {
        playerId,
        technologyId,
      },
    );
  }

  public async fundResearch(
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

  public async getStats(
    countryId: string,
  ): Promise<ResearchStats> {
    return apiClient.get<ResearchStats>(
      `/research/countries/${encodeURIComponent(
        countryId,
      )}/stats`,
    );
  }
}

export const researchService =
  new ResearchService();