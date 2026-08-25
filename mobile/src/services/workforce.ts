import { apiClient } from "./api";

import type {
  CountryId,
  PlayerId,
} from "../types/game";

export interface WorkforceServiceOptions {
  getPlayerId?: () => PlayerId | null;
  getSessionId?: () => string | null;
}

export type EmploymentStatus =
  | "employed"
  | "on_leave"
  | "terminated"
  | "resigned";

export type SkillCategory =
  | "management"
  | "engineering"
  | "manufacturing"
  | "agriculture"
  | "transport"
  | "construction"
  | "technology"
  | "research"
  | "finance"
  | "healthcare"
  | "education"
  | "services";

export interface JobListing {
  id: string;

  companyId: string;

  companyName: string;

  factoryId: string | null;

  factoryName: string | null;

  countryId: CountryId;

  title: string;

  description: string;

  category: SkillCategory;

  salary: number;

  experienceRequired: number;

  availablePositions: number;

  remote: boolean;

  active: boolean;

  createdAt: string;
}

export interface PlayerSkill {
  skillId: string;

  name: string;

  category: SkillCategory;

  level: number;

  experience: number;

  experienceToNextLevel: number;
}

export interface Career {
  playerId: PlayerId;

  currentEmploymentId: string | null;

  currentJobTitle: string | null;

  currentCompanyId: string | null;

  currentCompanyName: string | null;

  totalExperience: number;

  careerLevel: number;

  skills: PlayerSkill[];

  updatedAt: string;
}

export interface EmploymentRecord {
  id: string;

  playerId: PlayerId;

  companyId: string;

  companyName: string;

  jobListingId: string;

  jobTitle: string;

  salary: number;

  status: EmploymentStatus;

  startedAt: string;

  endedAt: string | null;
}

export interface JobApplication {
  id: string;

  jobListingId: string;

  playerId: PlayerId;

  status:
    | "submitted"
    | "reviewing"
    | "accepted"
    | "rejected"
    | "withdrawn";

  message: string;

  createdAt: string;

  updatedAt: string;
}

function requirePlayer(
  options: WorkforceServiceOptions,
): PlayerId {
  const playerId = options.getPlayerId?.();

  if (!playerId) {
    throw new Error(
      "A logged-in player is required.",
    );
  }

  return playerId;
}

export class WorkforceService {
  private readonly options: WorkforceServiceOptions;

  constructor(
    options: WorkforceServiceOptions = {},
  ) {
    this.options = options;
  }

  public async searchJobs(
    filters: {
      countryId?: CountryId;

      category?: SkillCategory;

      minSalary?: number;

      maxSalary?: number;

      remote?: boolean;

      search?: string;
    } = {},
  ): Promise<JobListing[]> {
    return apiClient.get<JobListing[]>(
      "/workforce/jobs",
      filters,
    );
  }

  public async getJob(
    jobId: string,
  ): Promise<JobListing> {
    return apiClient.get<JobListing>(
      `/workforce/jobs/${encodeURIComponent(
        jobId,
      )}`,
    );
  }

  public async applyForJob(
    jobId: string,
    message = "",
  ): Promise<JobApplication> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.post<JobApplication>(
      `/workforce/jobs/${encodeURIComponent(
        jobId,
      )}/apply`,
      {
        playerId,
        message,
      },
    );
  }

  public async withdrawApplication(
    applicationId: string,
  ): Promise<void> {
    const playerId = requirePlayer(
      this.options,
    );

    await apiClient.post(
      `/workforce/applications/${encodeURIComponent(
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
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.get<JobApplication[]>(
      `/workforce/applications/player/${encodeURIComponent(
        playerId,
      )}`,
    );
  }

  public async getCareer(): Promise<Career> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.get<Career>(
      `/workforce/career/${encodeURIComponent(
        playerId,
      )}`,
    );
  }

  public async getSkills(): Promise<
    PlayerSkill[]
  > {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.get<PlayerSkill[]>(
      `/workforce/skills/player/${encodeURIComponent(
        playerId,
      )}`,
    );
  }

  public async getEmploymentHistory(): Promise<
    EmploymentRecord[]
  > {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.get<EmploymentRecord[]>(
      `/workforce/employment/player/${encodeURIComponent(
        playerId,
      )}`,
    );
  }

  public async resign(
    employmentId: string,
  ): Promise<void> {
    const playerId = requirePlayer(
      this.options,
    );

    await apiClient.post(
      `/workforce/employment/${encodeURIComponent(
        employmentId,
      )}/resign`,
      {
        playerId,
      },
    );
  }

  public async trainSkill(
    skillId: string,
  ): Promise<PlayerSkill> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.post<PlayerSkill>(
      `/workforce/skills/${encodeURIComponent(
        skillId,
      )}/train`,
      {
        playerId,
      },
    );
  }
}

export const workforceService =
  new WorkforceService();