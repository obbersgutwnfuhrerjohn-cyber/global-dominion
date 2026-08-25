import { apiClient } from "./api";

import type {
  CountryId,
  PlayerId,
  WarId,
} from "../types/game";

export interface InternationalServiceOptions {
  getPlayerId?: () => PlayerId | null;

  getSessionId?: () => string | null;
}

export type DiplomaticRelationStatus =
  | "unknown"
  | "neutral"
  | "friendly"
  | "allied"
  | "hostile"
  | "at_war";

export type AgreementType =
  | "alliance"
  | "non_aggression"
  | "mutual_defense"
  | "trade"
  | "research"
  | "transit"
  | "military_access"
  | "intelligence"
  | "ceasefire"
  | "peace";

export type AgreementStatus =
  | "proposed"
  | "active"
  | "expired"
  | "rejected"
  | "cancelled";

export type DiplomaticProposalType =
  | "agreement"
  | "peace"
  | "ceasefire"
  | "trade"
  | "sanctions"
  | "recognition"
  | "alliance"
  | "military_access";

export interface DiplomaticRelation {
  id: string;

  countryAId: CountryId;

  countryBId: CountryId;

  status: DiplomaticRelationStatus;

  relationScore: number;

  trust: number;

  tension: number;

  tradeValue: number;

  diplomaticReputationA: number;

  diplomaticReputationB: number;

  updatedAt: string;
}

export interface DiplomaticAgreement {
  id: string;

  type: AgreementType;

  name: string;

  countryIds: CountryId[];

  proposedByCountryId: CountryId;

  status: AgreementStatus;

  startAt: string | null;

  endAt: string | null;

  terms: Record<string, unknown>;

  createdAt: string;

  updatedAt: string;
}

export interface DiplomaticProposal {
  id: string;

  type: DiplomaticProposalType;

  fromCountryId: CountryId;

  toCountryId: CountryId;

  createdByPlayerId: PlayerId;

  title: string;

  message: string;

  terms: Record<string, unknown>;

  status:
    | "pending"
    | "accepted"
    | "rejected"
    | "countered"
    | "expired"
    | "cancelled";

  createdAt: string;

  expiresAt: string;
}

export interface DiplomaticEmbassy {
  id: string;

  hostCountryId: CountryId;

  foreignCountryId: CountryId;

  cityId: string;

  level: number;

  diplomaticInfluence: number;

  active: boolean;

  createdAt: string;
}

export interface Sanction {
  id: string;

  issuingCountryId: CountryId;

  targetCountryId: CountryId;

  type:
    | "trade"
    | "financial"
    | "technology"
    | "travel"
    | "arms"
    | "resource";

  severity:
    | "limited"
    | "moderate"
    | "severe"
    | "total";

  reason: string;

  active: boolean;

  createdAt: string;

  expiresAt: string | null;
}

export interface InternationalOrganization {
  id: string;

  name: string;

  abbreviation: string;

  description: string;

  memberCountryIds: CountryId[];

  headquartersCountryId: CountryId | null;

  foundedAt: string;

  active: boolean;
}

export interface OrganizationMembership {
  organizationId: string;

  countryId: CountryId;

  role:
    | "member"
    | "observer"
    | "founder"
    | "chair";

  joinedAt: string;
}

export interface WarDeclaration {
  id: string;

  warId: WarId;

  attackerCountryId: CountryId;

  defenderCountryId: CountryId;

  declaredByPlayerId: PlayerId;

  reason: string;

  createdAt: string;

  active: boolean;
}

export interface PeaceProposal {
  id: string;

  warId: WarId;

  proposerCountryId: CountryId;

  targetCountryId: CountryId;

  proposedByPlayerId: PlayerId;

  terms: {
    territorialChanges?: Record<
      string,
      CountryId
    >;

    reparations?: number;

    demilitarizedZones?: string[];

    prisonerExchange?: boolean;

    tradeAccess?: boolean;

    ceasefireDurationTicks?: number;
  };

  status:
    | "pending"
    | "accepted"
    | "rejected"
    | "countered"
    | "expired";

  createdAt: string;

  expiresAt: string;
}

function requirePlayer(
  options: InternationalServiceOptions,
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

export class InternationalService {
  private readonly options: InternationalServiceOptions;

  constructor(
    options: InternationalServiceOptions = {},
  ) {
    this.options = options;
  }

  public async getRelation(
    countryAId: CountryId,
    countryBId: CountryId,
  ): Promise<DiplomaticRelation> {
    return apiClient.get<DiplomaticRelation>(
      `/international/relations/${encodeURIComponent(
        countryAId,
      )}/${encodeURIComponent(
        countryBId,
      )}`,
    );
  }

  public async getCountryRelations(
    countryId: CountryId,
  ): Promise<DiplomaticRelation[]> {
    return apiClient.get<DiplomaticRelation[]>(
      `/international/countries/${encodeURIComponent(
        countryId,
      )}/relations`,
    );
  }

  public async getAgreements(
    countryId: CountryId,
  ): Promise<DiplomaticAgreement[]> {
    return apiClient.get<DiplomaticAgreement[]>(
      `/international/countries/${encodeURIComponent(
        countryId,
      )}/agreements`,
    );
  }

  public async getAgreement(
    agreementId: string,
  ): Promise<DiplomaticAgreement> {
    return apiClient.get<DiplomaticAgreement>(
      `/international/agreements/${encodeURIComponent(
        agreementId,
      )}`,
    );
  }

  public async createProposal(
    request: {
      type: DiplomaticProposalType;

      fromCountryId: CountryId;

      toCountryId: CountryId;

      title: string;

      message: string;

      terms: Record<string, unknown>;

      expiresAt: string;
    },
  ): Promise<DiplomaticProposal> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.post<DiplomaticProposal>(
      "/international/proposals",
      {
        playerId,

        sessionId:
          this.options.getSessionId?.() ??
          null,

        request,
      },
    );
  }

  public async getProposals(
    countryId: CountryId,
  ): Promise<DiplomaticProposal[]> {
    return apiClient.get<DiplomaticProposal[]>(
      `/international/countries/${encodeURIComponent(
        countryId,
      )}/proposals`,
    );
  }

  public async acceptProposal(
    proposalId: string,
  ): Promise<DiplomaticProposal> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.post<DiplomaticProposal>(
      `/international/proposals/${encodeURIComponent(
        proposalId,
      )}/accept`,
      {
        playerId,

        sessionId:
          this.options.getSessionId?.() ??
          null,
      },
    );
  }

  public async rejectProposal(
    proposalId: string,
  ): Promise<DiplomaticProposal> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.post<DiplomaticProposal>(
      `/international/proposals/${encodeURIComponent(
        proposalId,
      )}/reject`,
      {
        playerId,

        sessionId:
          this.options.getSessionId?.() ??
          null,
      },
    );
  }

  public async counterProposal(
    proposalId: string,
    terms: Record<string, unknown>,
    message: string,
  ): Promise<DiplomaticProposal> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.post<DiplomaticProposal>(
      `/international/proposals/${encodeURIComponent(
        proposalId,
      )}/counter`,
      {
        playerId,

        sessionId:
          this.options.getSessionId?.() ??
          null,

        terms,

        message,
      },
    );
  }

  public async cancelProposal(
    proposalId: string,
  ): Promise<void> {
    const playerId =
      requirePlayer(this.options);

    await apiClient.post(
      `/international/proposals/${encodeURIComponent(
        proposalId,
      )}/cancel`,
      {
        playerId,
      },
    );
  }

  public async getEmbassies(
    countryId: CountryId,
  ): Promise<DiplomaticEmbassy[]> {
    return apiClient.get<DiplomaticEmbassy[]>(
      `/international/countries/${encodeURIComponent(
        countryId,
      )}/embassies`,
    );
  }

  public async establishEmbassy(
    hostCountryId: CountryId,
    foreignCountryId: CountryId,
    cityId: string,
  ): Promise<DiplomaticEmbassy> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.post<DiplomaticEmbassy>(
      "/international/embassies",
      {
        playerId,

        hostCountryId,

        foreignCountryId,

        cityId,
      },
    );
  }

  public async closeEmbassy(
    embassyId: string,
  ): Promise<void> {
    const playerId =
      requirePlayer(this.options);

    await apiClient.post(
      `/international/embassies/${encodeURIComponent(
        embassyId,
      )}/close`,
      {
        playerId,
      },
    );
  }

  public async getSanctions(
    countryId: CountryId,
  ): Promise<Sanction[]> {
    return apiClient.get<Sanction[]>(
      `/international/countries/${encodeURIComponent(
        countryId,
      )}/sanctions`,
    );
  }

  public async imposeSanction(
    targetCountryId: CountryId,
    type: Sanction["type"],
    severity: Sanction["severity"],
    reason: string,
  ): Promise<Sanction> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.post<Sanction>(
      "/international/sanctions",
      {
        playerId,

        targetCountryId,

        type,

        severity,

        reason,
      },
    );
  }

  public async liftSanction(
    sanctionId: string,
  ): Promise<void> {
    const playerId =
      requirePlayer(this.options);

    await apiClient.post(
      `/international/sanctions/${encodeURIComponent(
        sanctionId,
      )}/lift`,
      {
        playerId,
      },
    );
  }

  public async getOrganizations(): Promise<
    InternationalOrganization[]
  > {
    return apiClient.get<
      InternationalOrganization[]
    >("/international/organizations");
  }

  public async getOrganization(
    organizationId: string,
  ): Promise<InternationalOrganization> {
    return apiClient.get<InternationalOrganization>(
      `/international/organizations/${encodeURIComponent(
        organizationId,
      )}`,
    );
  }

  public async getMembership(
    organizationId: string,
    countryId: CountryId,
  ): Promise<OrganizationMembership | null> {
    return apiClient.get<OrganizationMembership | null>(
      `/international/organizations/${encodeURIComponent(
        organizationId,
      )}/members/${encodeURIComponent(
        countryId,
      )}`,
    );
  }

  public async joinOrganization(
    organizationId: string,
    countryId: CountryId,
  ): Promise<OrganizationMembership> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.post<OrganizationMembership>(
      `/international/organizations/${encodeURIComponent(
        organizationId,
      )}/members`,
      {
        playerId,

        countryId,
      },
    );
  }

  public async declareWar(
    attackerCountryId: CountryId,
    defenderCountryId: CountryId,
    reason: string,
  ): Promise<WarDeclaration> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.post<WarDeclaration>(
      "/international/war/declarations",
      {
        playerId,

        attackerCountryId,

        defenderCountryId,

        reason,
      },
    );
  }

  public async getWarDeclarations(
    countryId: CountryId,
  ): Promise<WarDeclaration[]> {
    return apiClient.get<WarDeclaration[]>(
      `/international/countries/${encodeURIComponent(
        countryId,
      )}/war-declarations`,
    );
  }

  public async proposePeace(
    request: {
      warId: WarId;

      targetCountryId: CountryId;

      terms: PeaceProposal["terms"];

      expiresAt: string;
    },
  ): Promise<PeaceProposal> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.post<PeaceProposal>(
      "/international/peace/proposals",
      {
        playerId,

        request,
      },
    );
  }

  public async getPeaceProposals(
    warId: WarId,
  ): Promise<PeaceProposal[]> {
    return apiClient.get<PeaceProposal[]>(
      `/international/wars/${encodeURIComponent(
        warId,
      )}/peace-proposals`,
    );
  }

  public async acceptPeaceProposal(
    proposalId: string,
  ): Promise<PeaceProposal> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.post<PeaceProposal>(
      `/international/peace/proposals/${encodeURIComponent(
        proposalId,
      )}/accept`,
      {
        playerId,
      },
    );
  }

  public async rejectPeaceProposal(
    proposalId: string,
  ): Promise<PeaceProposal> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.post<PeaceProposal>(
      `/international/peace/proposals/${encodeURIComponent(
        proposalId,
      )}/reject`,
      {
        playerId,
      },
    );
  }
}

export const internationalService =
  new InternationalService();