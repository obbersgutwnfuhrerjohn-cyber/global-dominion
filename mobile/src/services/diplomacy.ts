import { apiClient } from "./api";

import type { PlayerId } from "../types/game";

export interface DiplomacyServiceOptions {
  getPlayerId?: () => PlayerId | null;
  getSessionId?: () => string | null;
}

export type DiplomaticRelation =
  | "neutral"
  | "friendly"
  | "allied"
  | "strained"
  | "hostile";

export type TreatyType =
  | "trade"
  | "defense"
  | "research"
  | "energy"
  | "transport"
  | "investment"
  | "peace";

export interface CountryRelation {
  id: string;

  countryAId: string;

  countryBId: string;

  relation: DiplomaticRelation;

  tradeVolume: number;

  diplomaticScore: number;

  updatedAt: string;
}

export interface Treaty {
  id: string;

  name: string;

  type: TreatyType;

  countryIds: string[];

  description: string;

  economicValue: number;

  active: boolean;

  startsAt: string;

  endsAt: string | null;

  createdAt: string;
}

export interface DiplomaticMission {
  id: string;

  sendingCountryId: string;

  receivingCountryId: string;

  sendingPlayerId: PlayerId;

  purpose:
    | "improve_relations"
    | "negotiate_trade"
    | "negotiate_treaty"
    | "resolve_dispute"
    | "investment";

  progress: number;

  status:
    | "pending"
    | "active"
    | "successful"
    | "failed"
    | "cancelled";

  createdAt: string;

  completedAt: string | null;
}

function requirePlayer(
  options: DiplomacyServiceOptions,
): PlayerId {
  const playerId = options.getPlayerId?.();

  if (!playerId) {
    throw new Error(
      "A logged-in player is required.",
    );
  }

  return playerId;
}

export class DiplomacyService {
  private readonly options: DiplomacyServiceOptions;

  constructor(
    options: DiplomacyServiceOptions = {},
  ) {
    this.options = options;
  }

  public async getRelations(
    countryId: string,
  ): Promise<CountryRelation[]> {
    return apiClient.get<CountryRelation[]>(
      `/diplomacy/countries/${encodeURIComponent(
        countryId,
      )}/relations`,
    );
  }

  public async getRelation(
    countryAId: string,
    countryBId: string,
  ): Promise<CountryRelation> {
    return apiClient.get<CountryRelation>(
      "/diplomacy/relation",
      {
        countryAId,
        countryBId,
      },
    );
  }

  public async getTreaties(
    countryId?: string,
  ): Promise<Treaty[]> {
    return apiClient.get<Treaty[]>(
      "/diplomacy/treaties",
      {
        countryId,
      },
    );
  }

  public async proposeTreaty(
    request: {
      name: string;

      type: TreatyType;

      countryIds: string[];

      description: string;

      durationMonths: number;
    },
  ): Promise<Treaty> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.post<Treaty>(
      "/diplomacy/treaties",
      {
        playerId,
        request,
      },
    );
  }

  public async sendMission(
    request: {
      sendingCountryId: string;

      receivingCountryId: string;

      purpose: DiplomaticMission["purpose"];
    },
  ): Promise<DiplomaticMission> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.post<DiplomaticMission>(
      "/diplomacy/missions",
      {
        playerId,
        request,
      },
    );
  }

  public async getMyMissions(): Promise<
    DiplomaticMission[]
  > {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.get<DiplomaticMission[]>(
      `/diplomacy/missions/player/${encodeURIComponent(
        playerId,
      )}`,
    );
  }
}

export const diplomacyService =
  new DiplomacyService();