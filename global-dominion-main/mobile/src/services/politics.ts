import { apiClient } from "./api";

import type { PlayerId } from "../types/game";

export interface PoliticsServiceOptions {
  getPlayerId?: () => PlayerId | null;
  getSessionId?: () => string | null;
}

export type PoliticalSystem =
  | "democracy"
  | "republic"
  | "constitutional_monarchy"
  | "parliamentary"
  | "authoritarian";

export type ElectionStatus =
  | "scheduled"
  | "active"
  | "counting"
  | "completed"
  | "cancelled";

export interface PoliticalParty {
  id: string;

  countryId: string;

  name: string;

  ideology:
    | "liberal"
    | "conservative"
    | "social"
    | "green"
    | "national"
    | "centrist";

  popularity: number;

  seats: number;

  funding: number;

  active: boolean;

  createdAt: string;
}

export interface Election {
  id: string;

  countryId: string;

  name: string;

  status: ElectionStatus;

  startAt: string;

  endAt: string;

  turnout: number;

  winnerPartyId: string | null;

  createdAt: string;

  completedAt: string | null;
}

export interface ElectionResult {
  electionId: string;

  partyId: string;

  votes: number;

  votePercentage: number;

  seatsWon: number;
}

export interface PoliticalApproval {
  countryId: string;

  governmentApproval: number;

  economicApproval: number;

  healthcareApproval: number;

  educationApproval: number;

  infrastructureApproval: number;

  publicSafetyApproval: number;

  overallApproval: number;

  updatedAt: string;
}

function requirePlayer(
  options: PoliticsServiceOptions,
): PlayerId {
  const playerId = options.getPlayerId?.();

  if (!playerId) {
    throw new Error(
      "A logged-in player is required.",
    );
  }

  return playerId;
}

export class PoliticsService {
  private readonly options: PoliticsServiceOptions;

  constructor(
    options: PoliticsServiceOptions = {},
  ) {
    this.options = options;
  }

  public async getParties(
    countryId: string,
  ): Promise<PoliticalParty[]> {
    return apiClient.get<PoliticalParty[]>(
      `/politics/countries/${encodeURIComponent(
        countryId,
      )}/parties`,
    );
  }

  public async getElections(
    countryId: string,
  ): Promise<Election[]> {
    return apiClient.get<Election[]>(
      `/politics/countries/${encodeURIComponent(
        countryId,
      )}/elections`,
    );
  }

  public async getElection(
    electionId: string,
  ): Promise<Election> {
    return apiClient.get<Election>(
      `/politics/elections/${encodeURIComponent(
        electionId,
      )}`,
    );
  }

  public async getResults(
    electionId: string,
  ): Promise<ElectionResult[]> {
    return apiClient.get<ElectionResult[]>(
      `/politics/elections/${encodeURIComponent(
        electionId,
      )}/results`,
    );
  }

  public async vote(
    electionId: string,
    partyId: string,
  ): Promise<ElectionResult> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.post<ElectionResult>(
      `/politics/elections/${encodeURIComponent(
        electionId,
      )}/vote`,
      {
        playerId,
        partyId,
      },
    );
  }

  public async getApproval(
    countryId: string,
  ): Promise<PoliticalApproval> {
    return apiClient.get<PoliticalApproval>(
      `/politics/countries/${encodeURIComponent(
        countryId,
      )}/approval`,
    );
  }
}

export const politicsService =
  new PoliticsService();