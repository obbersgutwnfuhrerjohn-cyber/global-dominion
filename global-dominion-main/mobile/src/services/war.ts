import { apiClient } from "./api";

import type {
  CountryId,
  PlayerId,
} from "../types/game";

export interface WarServiceOptions {
  getPlayerId?: () => PlayerId | null;
  getSessionId?: () => string | null;
}

export type WarStatus =
  | "planned"
  | "active"
  | "ceasefire"
  | "peace_negotiations"
  | "ended"
  | "cancelled";

export type WarParticipantRole =
  | "attacker"
  | "defender"
  | "ally";

export type ConflictType =
  | "war"
  | "border_conflict"
  | "civil_conflict"
  | "rebellion"
  | "peacekeeping";

export type FrontStatus =
  | "stable"
  | "advancing"
  | "retreating"
  | "contested"
  | "broken";

export type BattleStatus =
  | "planned"
  | "active"
  | "resolved"
  | "cancelled";

export type WarObjectiveType =
  | "territory"
  | "capital"
  | "city"
  | "strategic_region"
  | "resource"
  | "demilitarization"
  | "surrender";

export interface War {
  id: string;

  name: string;

  type: ConflictType;

  status: WarStatus;

  startedAt: string;

  endedAt: string | null;

  attackerCountryIds: CountryId[];

  defenderCountryIds: CountryId[];

  allyCountryIds: CountryId[];

  totalCasualties: number;

  attackerWarScore: number;

  defenderWarScore: number;

  createdByPlayerId: PlayerId;

  updatedAt: string;
}

export interface WarParticipant {
  id: string;

  warId: string;

  countryId: CountryId;

  role: WarParticipantRole;

  joinedAt: string;

  active: boolean;

  warScore: number;

  casualties: number;

  territoryGained: number;

  territoryLost: number;
}

export interface FrontLine {
  id: string;

  warId: string;

  name: string;

  regionIds: string[];

  countryIds: CountryId[];

  status: FrontStatus;

  latitude: number;

  longitude: number;

  lengthKm: number;

  attackerStrength: number;

  defenderStrength: number;

  supplyLevel: number;

  intensity: number;

  updatedAt: string;
}

export interface Battle {
  id: string;

  warId: string;

  frontId: string;

  name: string;

  regionId: string;

  attackerCountryId: CountryId;

  defenderCountryId: CountryId;

  attackingUnitIds: string[];

  defendingUnitIds: string[];

  status: BattleStatus;

  attackerStrength: number;

  defenderStrength: number;

  attackerLosses: number;

  defenderLosses: number;

  attackerProgress: number;

  defenderProgress: number;

  startedAt: string;

  resolvedAt: string | null;

  latitude: number;

  longitude: number;
}

export interface WarObjective {
  id: string;

  warId: string;

  type: WarObjectiveType;

  targetId: string;

  targetName: string;

  requiredControl: number;

  currentControl: number;

  completed: boolean;

  completedAt: string | null;
}

export interface TerritoryControl {
  regionId: string;

  regionName: string;

  countryId: CountryId;

  previousCountryId: CountryId | null;

  controlPercent: number;

  contested: boolean;

  frontline: boolean;

  updatedAt: string;
}

export interface Ceasefire {
  id: string;

  warId: string;

  proposedByCountryId: CountryId;

  acceptedByCountryIds: CountryId[];

  expiresAt: string | null;

  active: boolean;

  createdAt: string;
}

export interface PeaceTreaty {
  id: string;

  warId: string;

  proposedByPlayerId: PlayerId;

  participants: CountryId[];

  territorialChanges: Array<{
    regionId: string;

    fromCountryId: CountryId;

    toCountryId: CountryId;
  }>;

  reparations: Array<{
    fromCountryId: CountryId;

    toCountryId: CountryId;

    amount: number;
  }>;

  demilitarizedRegions: string[];

  accepted: boolean;

  signedAt: string | null;

  createdAt: string;
}

function requirePlayer(
  options: WarServiceOptions,
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

export class WarService {
  private readonly options: WarServiceOptions;

  constructor(
    options: WarServiceOptions = {},
  ) {
    this.options = options;
  }

  public async getActiveWars(): Promise<War[]> {
    return apiClient.get<War[]>(
      "/wars/active",
    );
  }

  public async getWarsForCountry(
    countryId: CountryId,
  ): Promise<War[]> {
    return apiClient.get<War[]>(
      `/wars/countries/${encodeURIComponent(
        countryId,
      )}`,
    );
  }

  public async getWar(
    warId: string,
  ): Promise<War> {
    return apiClient.get<War>(
      `/wars/${encodeURIComponent(warId)}`,
    );
  }

  public async declareWar(
    request: {
      attackerCountryId: CountryId;

      defenderCountryId: CountryId;

      name: string;

      type?: ConflictType;
    },
  ): Promise<War> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.post<War>(
      "/wars/declare",
      {
        playerId,

        request,
      },
    );
  }

  public async joinWar(
    warId: string,
    countryId: CountryId,
  ): Promise<WarParticipant> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.post<WarParticipant>(
      `/wars/${encodeURIComponent(
        warId,
      )}/participants`,
      {
        playerId,

        countryId,
      },
    );
  }

  public async leaveWar(
    warId: string,
    countryId: CountryId,
  ): Promise<void> {
    const playerId =
      requirePlayer(this.options);

    await apiClient.post(
      `/wars/${encodeURIComponent(
        warId,
      )}/participants/leave`,
      {
        playerId,

        countryId,
      },
    );
  }

  public async getParticipants(
    warId: string,
  ): Promise<WarParticipant[]> {
    return apiClient.get<WarParticipant[]>(
      `/wars/${encodeURIComponent(
        warId,
      )}/participants`,
    );
  }

  public async getFrontLines(
    warId: string,
  ): Promise<FrontLine[]> {
    return apiClient.get<FrontLine[]>(
      `/wars/${encodeURIComponent(
        warId,
      )}/fronts`,
    );
  }

  public async getAllActiveFrontLines(): Promise<
    FrontLine[]
  > {
    return apiClient.get<FrontLine[]>(
      "/wars/fronts/active",
    );
  }

  public async getBattles(
    warId: string,
  ): Promise<Battle[]> {
    return apiClient.get<Battle[]>(
      `/wars/${encodeURIComponent(
        warId,
      )}/battles`,
    );
  }

  public async getBattle(
    battleId: string,
  ): Promise<Battle> {
    return apiClient.get<Battle>(
      `/wars/battles/${encodeURIComponent(
        battleId,
      )}`,
    );
  }

  public async startBattle(
    request: {
      warId: string;

      frontId: string;

      regionId: string;

      attackerUnitIds: string[];

      defenderUnitIds: string[];
    },
  ): Promise<Battle> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.post<Battle>(
      "/wars/battles",
      {
        playerId,

        request,
      },
    );
  }

  public async getWarObjectives(
    warId: string,
  ): Promise<WarObjective[]> {
    return apiClient.get<WarObjective[]>(
      `/wars/${encodeURIComponent(
        warId,
      )}/objectives`,
    );
  }

  public async createObjective(
    request: {
      warId: string;

      type: WarObjectiveType;

      targetId: string;

      targetName: string;
    },
  ): Promise<WarObjective> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.post<WarObjective>(
      "/wars/objectives",
      {
        playerId,

        request,
      },
    );
  }

  public async getTerritoryControl(
    warId: string,
  ): Promise<TerritoryControl[]> {
    return apiClient.get<TerritoryControl[]>(
      `/wars/${encodeURIComponent(
        warId,
      )}/territory`,
    );
  }

  public async getAllContestedTerritory(): Promise<
    TerritoryControl[]
  > {
    return apiClient.get<TerritoryControl[]>(
      "/wars/territory/contested",
    );
  }

  public async proposeCeasefire(
    request: {
      warId: string;

      proposedByCountryId: CountryId;

      expiresAt?: string | null;
    },
  ): Promise<Ceasefire> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.post<Ceasefire>(
      "/wars/ceasefires",
      {
        playerId,

        request,
      },
    );
  }

  public async acceptCeasefire(
    ceasefireId: string,
    countryId: CountryId,
  ): Promise<Ceasefire> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.post<Ceasefire>(
      `/wars/ceasefires/${encodeURIComponent(
        ceasefireId,
      )}/accept`,
      {
        playerId,

        countryId,
      },
    );
  }

  public async proposePeace(
    request: {
      warId: string;

      participants: CountryId[];

      territorialChanges?: PeaceTreaty["territorialChanges"];

      reparations?: PeaceTreaty["reparations"];

      demilitarizedRegions?: string[];
    },
  ): Promise<PeaceTreaty> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.post<PeaceTreaty>(
      "/wars/peace-treaties",
      {
        playerId,

        request,
      },
    );
  }

  public async signPeace(
    treatyId: string,
    countryId: CountryId,
  ): Promise<PeaceTreaty> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.post<PeaceTreaty>(
      `/wars/peace-treaties/${encodeURIComponent(
        treatyId,
      )}/sign`,
      {
        playerId,

        countryId,
      },
    );
  }

  public async getPeaceTreaty(
    treatyId: string,
  ): Promise<PeaceTreaty> {
    return apiClient.get<PeaceTreaty>(
      `/wars/peace-treaties/${encodeURIComponent(
        treatyId,
      )}`,
    );
  }
}

export const warService =
  new WarService();