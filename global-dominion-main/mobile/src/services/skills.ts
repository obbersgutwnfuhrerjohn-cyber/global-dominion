import { apiClient } from "./api";

import type {
  PlayerId,
} from "../types/game";

export interface SkillsServiceOptions {
  getPlayerId?: () => PlayerId | null;
  getSessionId?: () => string | null;
}

export type SkillCategory =
  | "management"
  | "engineering"
  | "production"
  | "construction"
  | "agriculture"
  | "logistics"
  | "finance"
  | "research"
  | "medicine"
  | "education"
  | "technology"
  | "sales"
  | "leadership"
  | "government";

export interface PlayerSkill {
  id: string;

  playerId: PlayerId;

  skillId: string;

  name: string;

  category: SkillCategory;

  level: number;

  experience: number;

  experienceToNextLevel: number;

  efficiencyBonus: number;

  lastUpdatedAt: string;
}

export interface SkillDefinition {
  id: string;

  name: string;

  category: SkillCategory;

  description: string;

  maxLevel: number;

  baseExperiencePerLevel: number;
}

export interface SkillExperienceEvent {
  id: string;

  playerId: PlayerId;

  skillId: string;

  experienceGained: number;

  reason:
    | "work"
    | "production"
    | "construction"
    | "research"
    | "education"
    | "management"
    | "government"
    | "achievement";

  createdAt: string;
}

export interface PlayerLevel {
  playerId: PlayerId;

  level: number;

  experience: number;

  experienceToNextLevel: number;

  totalSkillLevels: number;

  updatedAt: string;
}

function requirePlayer(
  options: SkillsServiceOptions,
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

export class SkillsService {
  private readonly options: SkillsServiceOptions;

  constructor(
    options: SkillsServiceOptions = {},
  ) {
    this.options = options;
  }

  public async getSkillDefinitions(): Promise<
    SkillDefinition[]
  > {
    return apiClient.get<SkillDefinition[]>(
      "/skills/definitions",
    );
  }

  public async getMySkills(): Promise<
    PlayerSkill[]
  > {
    const playerId =
      requirePlayer(this.options);

    return apiClient.get<PlayerSkill[]>(
      `/skills/player/${encodeURIComponent(
        playerId,
      )}`,
    );
  }

  public async getPlayerSkills(
    playerId: PlayerId,
  ): Promise<PlayerSkill[]> {
    return apiClient.get<PlayerSkill[]>(
      `/skills/player/${encodeURIComponent(
        playerId,
      )}`,
    );
  }

  public async getSkill(
    skillId: string,
  ): Promise<PlayerSkill> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.get<PlayerSkill>(
      `/skills/player/${encodeURIComponent(
        playerId,
      )}/${encodeURIComponent(skillId)}`,
    );
  }

  public async gainExperience(
    skillId: string,
    experience: number,
    reason: SkillExperienceEvent["reason"],
  ): Promise<PlayerSkill> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.post<PlayerSkill>(
      `/skills/player/${encodeURIComponent(
        playerId,
      )}/experience`,
      {
        skillId,

        experience,

        reason,
      },
    );
  }

  public async getExperienceHistory(): Promise<
    SkillExperienceEvent[]
  > {
    const playerId =
      requirePlayer(this.options);

    return apiClient.get<
      SkillExperienceEvent[]
    >(
      `/skills/player/${encodeURIComponent(
        playerId,
      )}/history`,
    );
  }

  public async getPlayerLevel(): Promise<
    PlayerLevel
  > {
    const playerId =
      requirePlayer(this.options);

    return apiClient.get<PlayerLevel>(
      `/skills/player/${encodeURIComponent(
        playerId,
      )}/level`,
    );
  }
}

export const skillsService =
  new SkillsService();