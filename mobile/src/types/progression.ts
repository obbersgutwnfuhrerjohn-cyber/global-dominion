import type {
  PlayerId
} from "./game";

export type ProgressionPath =
  | "civilian"
  | "business"
  | "industrial"
  | "political"
  | "military"
  | "diplomatic"
  | "scientific"
  | "intelligence";

export type AchievementCategory =
  | "general"
  | "politics"
  | "business"
  | "industry"
  | "military"
  | "diplomacy"
  | "research"
  | "economy"
  | "exploration";

export interface PlayerExperience {
  playerId: PlayerId;

  totalExperience: number;

  currentLevel: number;

  experienceInCurrentLevel: number;

  experienceRequiredForNextLevel: number;

  prestige: number;

  updatedAt: string;
}

export interface Skill {
  id: string;

  name: string;

  description: string;

  category: ProgressionPath;

  maximumLevel: number;
}

export interface PlayerSkill {
  playerId: PlayerId;

  skillId: string;

  level: number;

  experience: number;

  experienceToNextLevel: number;

  updatedAt: string;
}

export interface ProgressionPathState {
  playerId: PlayerId;

  path: ProgressionPath;

  level: number;

  experience: number;

  specialization: string | null;

  active: boolean;

  startedAt: string;
}

export interface Achievement {
  id: string;

  name: string;

  description: string;

  category: AchievementCategory;

  experienceReward: number;

  prestigeReward: number;

  hidden: boolean;

  repeatable: boolean;
}

export interface PlayerAchievement {
  playerId: PlayerId;

  achievementId: string;

  unlockedAt: string;

  progress: number;

  completed: boolean;
}

export interface PlayerTitle {
  id: string;

  name: string;

  description: string;

  requiredLevel: number;

  requiredPrestige: number;

  requiredAchievementIds: string[];

  unlocked: boolean;
}

export interface PlayerCareerMilestone {
  id: string;

  playerId: PlayerId;

  path: ProgressionPath;

  title: string;

  description: string;

  levelRequired: number;

  completed: boolean;

  completedAt: string | null;
}

export interface PlayerRank {
  playerId: PlayerId;

  globalRank: number;

  countryRank: number;

  careerRank: number;

  prestigeRank: number;

  updatedAt: string;
}

export interface LeaderboardEntry {
  playerId: PlayerId;

  displayName: string;

  avatarUrl: string | null;

  countryId: string | null;

  level: number;

  prestige: number;

  rank: number;
}

export interface CountryLeaderboard {
  countryId: string;

  category:
    | "overall"
    | "politics"
    | "military"
    | "economy"
    | "industry"
    | "research";

  entries: LeaderboardEntry[];

  updatedAt: string;
}

export interface GlobalLeaderboard {
  category:
    | "overall"
    | "wealth"
    | "prestige"
    | "military"
    | "politics"
    | "industry"
    | "research";

  entries: LeaderboardEntry[];

  updatedAt: string;
}