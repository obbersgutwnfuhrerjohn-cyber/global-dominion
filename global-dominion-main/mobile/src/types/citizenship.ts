import type {
  CountryId,
  PlayerId
} from "./game";

export type CitizenshipStatus =
  | "pending"
  | "active"
  | "rejected"
  | "revoked";

export type CitizenshipMethod =
  | "starting_choice"
  | "naturalization"
  | "government_grant"
  | "election"
  | "special_event";

export interface CountryEntryRequirements {
  countryId: CountryId;

  citizenshipAvailable: boolean;

  requiresApplication: boolean;

  requiresApproval: boolean;

  minimumPlayerLevel: number;

  minimumPrestige: number;

  applicationCost: number;

  cooldownDays: number;

  maximumNewCitizensPerDay: number;
}

export interface CitizenshipApplication {
  id: string;

  playerId: PlayerId;

  requestedCountryId: CountryId;

  method: CitizenshipMethod;

  status: CitizenshipStatus;

  submittedAt: string;

  reviewedByPlayerId: PlayerId | null;

  reviewedAt: string | null;

  rejectionReason: string | null;
}

export interface Citizenship {
  id: string;

  playerId: PlayerId;

  countryId: CountryId;

  status: CitizenshipStatus;

  method: CitizenshipMethod;

  startedAt: string;

  endedAt: string | null;

  votingRights: boolean;

  politicalRights: boolean;

  employmentRights: boolean;

  militaryServiceAllowed: boolean;

  businessOwnershipAllowed: boolean;
}

export interface PlayerCountrySelection {
  playerId: PlayerId;

  selectedCountryId: CountryId | null;

  selectionCompleted: boolean;

  selectedAt: string | null;
}

export interface CountryPopulationState {
  countryId: CountryId;

  totalPlayers: number;

  activePlayers: number;

  citizens: number;

  foreignResidents: number;

  availableCitizenshipSlots: number;

  updatedAt: string;
}