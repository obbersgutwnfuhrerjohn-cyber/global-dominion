import { apiClient } from "./api";

import type {
  PlayerId,
} from "../types/game";

export interface JobsServiceOptions {
  getPlayerId?: () => PlayerId | null;
  getSessionId?: () => string | null;
}

export type JobCategory =
  | "management"
  | "engineering"
  | "production"
  | "construction"
  | "agriculture"
  | "logistics"
  | "finance"
  | "research"
  | "healthcare"
  | "education"
  | "technology"
  | "retail"
  | "services"
  | "government";

export type JobStatus =
  | "open"
  | "filled"
  | "paused"
  | "closed";

export interface JobListing {
  id: string;

  employerPlayerId: PlayerId;

  companyId: string | null;

  companyName: string | null;

  title: string;

  description: string;

  category: JobCategory;

  salary: number;

  salaryCurrency: string;

  hoursPerWeek: number;

  requiredSkillLevel: number;

  requiredSkills: string[];

  availablePositions: number;

  filledPositions: number;

  status: JobStatus;

  countryId: string;

  cityId: string | null;

  createdAt: string;

  updatedAt: string;
}

export interface JobApplication {
  id: string;

  jobId: string;

  applicantPlayerId: PlayerId;

  applicantName: string;

  applicantProfileImageUrl: string | null;

  message: string;

  status:
    | "pending"
    | "accepted"
    | "rejected"
    | "withdrawn";

  appliedAt: string;

  updatedAt: string;
}

export interface Employment {
  id: string;

  playerId: PlayerId;

  employerPlayerId: PlayerId;

  companyId: string | null;

  companyName: string | null;

  jobId: string;

  jobTitle: string;

  salary: number;

  salaryCurrency: string;

  startedAt: string;

  endedAt: string | null;

  active: boolean;
}

function requirePlayer(
  options: JobsServiceOptions,
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

export class JobsService {
  private readonly options: JobsServiceOptions;

  constructor(
    options: JobsServiceOptions = {},
  ) {
    this.options = options;
  }

  public async searchJobs(
    filters: {
      category?: JobCategory;

      countryId?: string;

      cityId?: string;

      minSalary?: number;

      maxSalary?: number;

      requiredSkillLevel?: number;
    } = {},
  ): Promise<JobListing[]> {
    return apiClient.get<JobListing[]>(
      "/jobs",
      filters,
    );
  }

  public async getJob(
    jobId: string,
  ): Promise<JobListing> {
    return apiClient.get<JobListing>(
      `/jobs/${encodeURIComponent(jobId)}`,
    );
  }

  public async createJob(
    request: {
      companyId?: string | null;

      title: string;

      description: string;

      category: JobCategory;

      salary: number;

      salaryCurrency: string;

      hoursPerWeek: number;

      requiredSkillLevel: number;

      requiredSkills?: string[];

      availablePositions: number;

      countryId: string;

      cityId?: string | null;
    },
  ): Promise<JobListing> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.post<JobListing>(
      "/jobs",
      {
        playerId,
        request,
      },
    );
  }

  public async applyForJob(
    jobId: string,
    message = "",
  ): Promise<JobApplication> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.post<JobApplication>(
      `/jobs/${encodeURIComponent(
        jobId,
      )}/applications`,
      {
        playerId,
        message,
      },
    );
  }

  public async withdrawApplication(
    applicationId: string,
  ): Promise<void> {
    const playerId =
      requirePlayer(this.options);

    await apiClient.post(
      `/jobs/applications/${encodeURIComponent(
        applicationId,
      )}/withdraw`,
      {
        playerId,
      },
    );
  }

  public async getMyApplications(): Promise<
    JobApplication[]
  > {
    const playerId =
      requirePlayer(this.options);

    return apiClient.get<JobApplication[]>(
      `/jobs/applications/player/${encodeURIComponent(
        playerId,
      )}`,
    );
  }

  public async getJobApplications(
    jobId: string,
  ): Promise<JobApplication[]> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.get<JobApplication[]>(
      `/jobs/${encodeURIComponent(
        jobId,
      )}/applications`,
      {
        playerId,
      },
    );
  }

  public async acceptApplication(
    applicationId: string,
  ): Promise<Employment> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.post<Employment>(
      `/jobs/applications/${encodeURIComponent(
        applicationId,
      )}/accept`,
      {
        playerId,
      },
    );
  }

  public async rejectApplication(
    applicationId: string,
  ): Promise<void> {
    const playerId =
      requirePlayer(this.options);

    await apiClient.post(
      `/jobs/applications/${encodeURIComponent(
        applicationId,
      )}/reject`,
      {
        playerId,
      },
    );
  }

  public async getMyEmployment(): Promise<
    Employment[]
  > {
    const playerId =
      requirePlayer(this.options);

    return apiClient.get<Employment[]>(
      `/jobs/employment/player/${encodeURIComponent(
        playerId,
      )}`,
    );
  }

  public async leaveEmployment(
    employmentId: string,
  ): Promise<void> {
    const playerId =
      requirePlayer(this.options);

    await apiClient.post(
      `/jobs/employment/${encodeURIComponent(
        employmentId,
      )}/leave`,
      {
        playerId,
      },
    );
  }
}

export const jobsService =
  new JobsService();