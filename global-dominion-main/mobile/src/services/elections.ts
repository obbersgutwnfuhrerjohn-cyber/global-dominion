import { apiClient } from "./api";

import type {
  CountryId,
  PlayerId,
} from "../types/game";

export interface ElectionsServiceOptions {
  getPlayerId?: () => PlayerId | null;
  getSessionId?: () => string | null;
}

export type ElectionStatus =
  | "scheduled"
  | "registration"
  | "voting"
  | "counting"
  | "completed"
  | "cancelled";

export type GovernmentRole =
  | "citizen"
  | "mayor"
  | "governor"
  | "president"
  | "minister";

export interface Election {
  id: string;

  countryId: CountryId;

  countryName: string;

  title: string;

  office: GovernmentRole;

  status: ElectionStatus;

  registrationStartsAt: string;

  registrationEndsAt: string;

  votingStartsAt: string;

  votingEndsAt: string;

  resultsPublishedAt: string | null;

  candidateCount: number;

  voterCount: number;

  winnerPlayerId: PlayerId | null;

  winnerName: string | null;

  winnerProfileImageUrl: string | null;
}

export interface Candidate {
  id: string;

  electionId: string;

  playerId: PlayerId;

  username: string;

  displayName: string;

  profileImageUrl: string | null;

  campaignName: string;

  manifesto: string;

  votes: number;

  registeredAt: string;

  eligible: boolean;
}

export interface ElectionResult {
  electionId: string;

  winnerPlayerId: PlayerId;

  winnerName: string;

  winnerProfileImageUrl: string | null;

  office: GovernmentRole;

  totalVotes: number;

  turnoutPercentage: number;

  completedAt: string;
}

export interface GovernmentPosition {
  id: string;

  countryId: CountryId;

  playerId: PlayerId;

  playerName: string;

  playerProfileImageUrl: string | null;

  role: GovernmentRole;

  startedAt: string;

  endsAt: string | null;

  active: boolean;
}

function requirePlayer(
  options: ElectionsServiceOptions,
): PlayerId {
  const playerId = options.getPlayerId?.();

  if (!playerId) {
    throw new Error(
      "A logged-in player is required.",
    );
  }

  return playerId;
}

export class ElectionsService {
  private readonly options: ElectionsServiceOptions;

  constructor(
    options: ElectionsServiceOptions = {},
  ) {
    this.options = options;
  }

  public async getCountryElections(
    countryId: CountryId,
  ): Promise<Election[]> {
    return apiClient.get<Election[]>(
      `/elections/countries/${encodeURIComponent(
        countryId,
      )}`,
    );
  }

  public async getElection(
    electionId: string,
  ): Promise<Election> {
    return apiClient.get<Election>(
      `/elections/${encodeURIComponent(
        electionId,
      )}`,
    );
  }

  public async getCandidates(
    electionId: string,
  ): Promise<Candidate[]> {
    return apiClient.get<Candidate[]>(
      `/elections/${encodeURIComponent(
        electionId,
      )}/candidates`,
    );
  }

  public async registerCandidate(
    electionId: string,
    request: {
      campaignName: string;

      manifesto: string;
    },
  ): Promise<Candidate> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.post<Candidate>(
      `/elections/${encodeURIComponent(
        electionId,
      )}/candidates`,
      {
        playerId,

        request,
      },
    );
  }

  public async withdrawCandidate(
    candidateId: string,
  ): Promise<void> {
    const playerId = requirePlayer(
      this.options,
    );

    await apiClient.post(
      `/elections/candidates/${encodeURIComponent(
        candidateId,
      )}/withdraw`,
      {
        playerId,
      },
    );
  }

  public async vote(
    electionId: string,
    candidateId: string,
  ): Promise<void> {
    const playerId = requirePlayer(
      this.options,
    );

    await apiClient.post(
      `/elections/${encodeURIComponent(
        electionId,
      )}/vote`,
      {
        playerId,

        candidateId,
      },
    );
  }

  public async getResults(
    electionId: string,
  ): Promise<ElectionResult> {
    return apiClient.get<ElectionResult>(
      `/elections/${encodeURIComponent(
        electionId,
      )}/results`,
    );
  }

  public async getGovernment(
    countryId: CountryId,
  ): Promise<GovernmentPosition[]> {
    return apiClient.get<GovernmentPosition[]>(
      `/government/countries/${encodeURIComponent(
        countryId,
      )}`,
    );
  }

  public async getMyPositions(): Promise<
    GovernmentPosition[]
  > {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.get<GovernmentPosition[]>(
      `/government/player/${encodeURIComponent(
        playerId,
      )}`,
    );
  }

  public async resignPosition(
    positionId: string,
  ): Promise<void> {
    const playerId = requirePlayer(
      this.options,
    );

    await apiClient.post(
      `/government/positions/${encodeURIComponent(
        positionId,
      )}/resign`,
      {
        playerId,
      },
    );
  }
}

export const electionsService =
  new ElectionsService();