import type {
  CountryId,
  PlayerId,
  PartyId
} from "./game";

import type {
  CompanyId,
  FactoryId,
  JobId
} from "./economy";

export type AvatarSource =
  | "uploaded"
  | "generated"
  | "default";

export type PlayerCareer =
  | "civilian"
  | "business"
  | "politics"
  | "military"
  | "diplomacy"
  | "intelligence"
  | "science";

export type AccountStatus =
  | "active"
  | "restricted"
  | "suspended"
  | "banned";

export type VerificationStatus =
  | "unverified"
  | "verified";

export type LeadershipImageType =
  | "official_portrait"
  | "national_emblem"
  | "campaign_image";

export interface PlayerAvatar {
  source: AvatarSource;

  imageUrl: string | null;

  thumbnailUrl: string | null;

  updatedAt: string | null;
}

export interface PlayerIdentity {
  id: PlayerId;

  username: string;

  displayName: string;

  biography: string;

  avatar: PlayerAvatar;

  countryId: CountryId | null;

  nationalityCountryId: CountryId | null;

  citizenshipStartedAt: string | null;

  career: PlayerCareer;

  createdAt: string;

  updatedAt: string;
}

export interface PlayerLevel {
  level: number;

  experience: number;

  experienceToNextLevel: number;

  prestige: number;
}

export interface PoliticalCareer {
  partyId: PartyId | null;

  position:
    | "citizen"
    | "party_member"
    | "local_official"
    | "parliament_member"
    | "minister"
    | "prime_minister"
    | "president";

  electionWins: number;

  electionLosses: number;

  approvalRating: number;

  termsServed: number;

  currentTermStartedAt: string | null;

  currentTermEndsAt: string | null;
}

export interface MilitaryCareer {
  branch:
    | "army"
    | "air_force"
    | "navy"
    | "special_forces"
    | "intelligence"
    | null;

  rank: string | null;

  serviceYears: number;

  combatExperience: number;

  commandExperience: number;
}

export interface PlayerBusinessCareer {
  ownedCompanyIds: CompanyId[];

  managedFactoryIds: FactoryId[];

  totalCompaniesCreated: number;

  totalFactoriesCreated: number;

  totalEmployeesHired: number;

  totalBusinessRevenue: number;
}

export interface PlayerEmploymentState {
  currentJobId: JobId | null;

  currentCompanyId: CompanyId | null;

  currentFactoryId: FactoryId | null;

  employed: boolean;

  startedAt: string | null;

  totalJobsCompleted: number;

  totalWorkExperience: number;

  totalWagesEarned: number;
}

export interface PlayerWalletState {
  currency: number;

  bankBalance: number;

  totalEarned: number;

  totalSpent: number;
}

export interface PlayerSecurityState {
  emailVerification: VerificationStatus;

  phoneVerification: VerificationStatus;

  accountStatus: AccountStatus;

  createdFromDeviceId: string | null;

  lastKnownIpHash: string | null;

  securityRiskLevel:
    | "low"
    | "medium"
    | "high"
    | "critical";

  additionalVerificationRequired: boolean;
}

export interface PlayerStatistics {
  daysPlayed: number;

  countriesVisited: number;

  electionsParticipated: number;

  electionsWon: number;

  companiesCreated: number;

  factoriesCreated: number;

  jobsHeld: number;

  battlesParticipated: number;

  militaryUnitsCommanded: number;

  diplomaticAgreements: number;

  totalTradeValue: number;
}

export interface PlayerProfile {
  identity: PlayerIdentity;

  level: PlayerLevel;

  political: PoliticalCareer;

  military: MilitaryCareer;

  business: PlayerBusinessCareer;

  employment: PlayerEmploymentState;

  wallet: PlayerWalletState;

  security: PlayerSecurityState;

  statistics: PlayerStatistics;
}

export interface LeadershipImage {
  id: string;

  playerId: PlayerId;

  countryId: CountryId;

  type: LeadershipImageType;

  imageUrl: string;

  title: string;

  approved: boolean;

  createdAt: string;
}

export interface NationalVisualIdentity {
  countryId: CountryId;

  officialFlagUrl: string;

  currentDisplayImageUrl: string;

  currentLeaderImageUrl: string | null;

  currentLeaderId: PlayerId | null;

  customIdentityEnabled: boolean;

  updatedAt: string;
}