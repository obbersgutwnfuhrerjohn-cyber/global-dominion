import { apiClient } from "./api";

import type {
  CountryId,
  PlayerId,
} from "../types/game";

export interface PlayerServiceOptions {
  getPlayerId?: () => PlayerId | null;

  getSessionId?: () => string | null;
}

export type PlayerStatus =
  | "online"
  | "away"
  | "busy"
  | "offline";

export type PlayerRank =
  | "citizen"
  | "worker"
  | "specialist"
  | "manager"
  | "politician"
  | "soldier"
  | "officer"
  | "commander"
  | "minister"
  | "head_of_government";

export interface PlayerProfile {
  id: PlayerId;

  username: string;

  displayName: string;

  emailVerified: boolean;

  profileImageUrl: string | null;

  countryId: CountryId | null;

  nationalityCountryId: CountryId | null;

  rank: PlayerRank;

  level: number;

  experience: number;

  prestige: number;

  reputation: number;

  wealth: number;

  currency: string;

  status: PlayerStatus;

  biography: string;

  createdAt: string;

  lastActiveAt: string;

  updatedAt: string;
}

export interface PlayerIdentity {
  playerId: PlayerId;

  username: string;

  displayName: string;

  profileImageUrl: string | null;

  countryId: CountryId | null;

  rank: PlayerRank;

  level: number;

  prestige: number;
}

export interface PlayerStatistics {
  playerId: PlayerId;

  playTimeMinutes: number;

  electionsParticipated: number;

  electionsWon: number;

  warsParticipated: number;

  battlesParticipated: number;

  battlesWon: number;

  companiesCreated: number;

  factoriesCreated: number;

  jobsWorked: number;

  jobsCreated: number;

  diplomaticAgreements: number;

  tradeVolume: number;

  politicalInfluence: number;

  militaryExperience: number;

  economicExperience: number;

  socialExperience: number;
}

export interface PlayerAchievement {
  id: string;

  playerId: PlayerId;

  name: string;

  description: string;

  category:
    | "politics"
    | "military"
    | "economy"
    | "diplomacy"
    | "social"
    | "exploration";

  progress: number;

  target: number;

  completed: boolean;

  completedAt: string | null;
}

export interface PlayerSkill {
  id: string;

  playerId: PlayerId;

  name:
    | "leadership"
    | "management"
    | "diplomacy"
    | "military"
    | "logistics"
    | "economics"
    | "politics"
    | "engineering"
    | "research"
    | "communication";

  level: number;

  experience: number;
}

export interface PlayerJob {
  id: string;

  playerId: PlayerId;

  jobPositionId: string;

  companyId: string | null;

  factoryId: string | null;

  title: string;

  department: string;

  salary: number;

  currency: string;

  startedAt: string;

  active: boolean;
}

export interface PlayerRole {
  id: string;

  playerId: PlayerId;

  role:
    | "citizen"
    | "employee"
    | "employer"
    | "soldier"
    | "officer"
    | "politician"
    | "government"
    | "diplomat";

  organizationId: string | null;

  countryId: CountryId | null;

  active: boolean;

  createdAt: string;
}

export interface ProfileUpdateRequest {
  displayName?: string;

  biography?: string;

  profileImageAssetId?: string | null;
}

export interface PlayerProgression {
  level: number;

  experience: number;

  experienceToNextLevel: number;

  prestige: number;

  reputation: number;

  availableSkillPoints: number;

  rank: PlayerRank;
}

function requirePlayer(
  options: PlayerServiceOptions,
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

export class PlayerService {
  private readonly options: PlayerServiceOptions;

  constructor(
    options: PlayerServiceOptions = {},
  ) {
    this.options = options;
  }

  public async getMyProfile(): Promise<PlayerProfile> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.get<PlayerProfile>(
      `/players/${encodeURIComponent(
        playerId,
      )}`,
    );
  }

  public async getPlayerProfile(
    playerId: PlayerId,
  ): Promise<PlayerProfile> {
    return apiClient.get<PlayerProfile>(
      `/players/${encodeURIComponent(
        playerId,
      )}`,
    );
  }

  public async getIdentity(
    playerId: PlayerId,
  ): Promise<PlayerIdentity> {
    return apiClient.get<PlayerIdentity>(
      `/players/${encodeURIComponent(
        playerId,
      )}/identity`,
    );
  }

  public async updateProfile(
    update: ProfileUpdateRequest,
  ): Promise<PlayerProfile> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.put<PlayerProfile>(
      `/players/${encodeURIComponent(
        playerId,
      )}`,
      {
        playerId,

        sessionId:
          this.options.getSessionId?.() ??
          null,

        update,
      },
    );
  }

  public async setCountry(
    countryId: CountryId,
  ): Promise<PlayerProfile> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.post<PlayerProfile>(
      `/players/${encodeURIComponent(
        playerId,
      )}/country`,
      {
        countryId,

        sessionId:
          this.options.getSessionId?.() ??
          null,
      },
    );
  }

  public async getStatistics(): Promise<PlayerStatistics> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.get<PlayerStatistics>(
      `/players/${encodeURIComponent(
        playerId,
      )}/statistics`,
    );
  }

  public async getProgression(): Promise<PlayerProgression> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.get<PlayerProgression>(
      `/players/${encodeURIComponent(
        playerId,
      )}/progression`,
    );
  }

  public async getAchievements(): Promise<
    PlayerAchievement[]
  > {
    const playerId =
      requirePlayer(this.options);

    return apiClient.get<PlayerAchievement[]>(
      `/players/${encodeURIComponent(
        playerId,
      )}/achievements`,
    );
  }

  public async getSkills(): Promise<PlayerSkill[]> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.get<PlayerSkill[]>(
      `/players/${encodeURIComponent(
        playerId,
      )}/skills`,
    );
  }

  public async upgradeSkill(
    skillId: string,
  ): Promise<PlayerSkill> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.post<PlayerSkill>(
      `/players/${encodeURIComponent(
        playerId,
      )}/skills/${encodeURIComponent(
        skillId,
      )}/upgrade`,
      {
        playerId,
      },
    );
  }

  public async getJobs(): Promise<PlayerJob[]> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.get<PlayerJob[]>(
      `/players/${encodeURIComponent(
        playerId,
      )}/jobs`,
    );
  }

  public async getCurrentJob(): Promise<PlayerJob | null> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.get<PlayerJob | null>(
      `/players/${encodeURIComponent(
        playerId,
      )}/jobs/current`,
    );
  }

  public async applyForJob(
    jobPositionId: string,
  ): Promise<{
    accepted: boolean;

    applicationId: string;

    message: string;
  }> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.post(
      "/players/jobs/apply",
      {
        playerId,

        jobPositionId,
      },
    );
  }

  public async leaveJob(
    jobId: string,
  ): Promise<void> {
    const playerId =
      requirePlayer(this.options);

    await apiClient.post(
      `/players/jobs/${encodeURIComponent(
        jobId,
      )}/leave`,
      {
        playerId,
      },
    );
  }

  public async getRoles(): Promise<PlayerRole[]> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.get<PlayerRole[]>(
      `/players/${encodeURIComponent(
        playerId,
      )}/roles`,
    );
  }

  public async searchPlayers(
    query: string,
  ): Promise<PlayerIdentity[]> {
    return apiClient.get<PlayerIdentity[]>(
      `/players/search?q=${encodeURIComponent(
        query,
      )}`,
    );
  }
}

export const playerService =
  new PlayerService();