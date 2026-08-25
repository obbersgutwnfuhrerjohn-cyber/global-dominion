import { apiClient } from "./api";

import type { PlayerId } from "../types/game";

export interface EmploymentServiceOptions {
  getPlayerId?: () => PlayerId | null;
  getSessionId?: () => string | null;
}

export type EmploymentStatus =
  | "employed"
  | "unemployed"
  | "self_employed"
  | "retired";

export interface Job {
  id: string;

  companyId: string;

  companyName: string;

  countryId: string;

  cityId: string;

  title: string;

  description: string;

  industry: string;

  requiredEducationLevel: number;

  requiredSkillLevel: number;

  salary: number;

  currency: string;

  workingHoursPerWeek: number;

  vacancies: number;

  active: boolean;

  createdAt: string;

  updatedAt: string;
}

export interface Employment {
  id: string;

  playerId: PlayerId;

  jobId: string;

  companyId: string;

  jobTitle: string;

  salary: number;

  currency: string;

  status: EmploymentStatus;

  startDate: string;

  endDate: string | null;

  createdAt: string;

  updatedAt: string;
}

export interface LaborMarketStats {
  countryId: string;

  laborForce: number;

  employed: number;

  unemployed: number;

  unemploymentRate: number;

  averageSalary: number;

  medianSalary: number;

  jobVacancies: number;

  laborParticipationRate: number;

  updatedAt: string;
}

function requirePlayer(
  options: EmploymentServiceOptions,
): PlayerId {
  const playerId = options.getPlayerId?.();

  if (!playerId) {
    throw new Error(
      "A logged-in player is required.",
    );
  }

  return playerId;
}

export class EmploymentService {
  private readonly options: EmploymentServiceOptions;

  constructor(
    options: EmploymentServiceOptions = {},
  ) {
    this.options = options;
  }

  public async getJobs(
    countryId?: string,
    cityId?: string,
    industry?: string,
  ): Promise<Job[]> {
    return apiClient.get<Job[]>(
      "/employment/jobs",
      {
        countryId,
        cityId,
        industry,
      },
    );
  }

  public async getJob(
    jobId: string,
  ): Promise<Job> {
    return apiClient.get<Job>(
      `/employment/jobs/${encodeURIComponent(
        jobId,
      )}`,
    );
  }

  public async applyForJob(
    jobId: string,
  ): Promise<Employment> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.post<Employment>(
      "/employment/applications",
      {
        playerId,
        jobId,
      },
    );
  }

  public async getMyEmployment(): Promise<
    Employment[]
  > {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.get<Employment[]>(
      `/employment/players/${encodeURIComponent(
        playerId,
      )}`,
    );
  }

  public async resign(
    employmentId: string,
  ): Promise<Employment> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.post<Employment>(
      `/employment/${encodeURIComponent(
        employmentId,
      )}/resign`,
      {
        playerId,
      },
    );
  }

  public async getLaborMarket(
    countryId: string,
  ): Promise<LaborMarketStats> {
    return apiClient.get<LaborMarketStats>(
      `/employment/countries/${encodeURIComponent(
        countryId,
      )}/market`,
    );
  }
}

export const employmentService =
  new EmploymentService();