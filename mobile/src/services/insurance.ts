import { apiClient } from "./api";

import type { PlayerId } from "../types/game";

export interface InsuranceServiceOptions {
  getPlayerId?: () => PlayerId | null;
  getSessionId?: () => string | null;
}

export type InsuranceType =
  | "health"
  | "property"
  | "vehicle"
  | "business"
  | "cargo"
  | "life";

export type PolicyStatus =
  | "quoted"
  | "active"
  | "expired"
  | "cancelled"
  | "claimed";

export interface InsuranceCompany {
  id: string;

  name: string;

  countryId: string;

  totalAssets: number;

  totalPremiums: number;

  totalClaims: number;

  financialStrength: number;

  claimProcessingSpeed: number;

  active: boolean;

  createdAt: string;
}

export interface InsurancePolicy {
  id: string;

  ownerPlayerId: PlayerId;

  insuranceCompanyId: string;

  type: InsuranceType;

  insuredAssetId: string | null;

  coverageAmount: number;

  deductible: number;

  premium: number;

  paymentFrequency:
    | "monthly"
    | "quarterly"
    | "yearly";

  status: PolicyStatus;

  startsAt: string;

  endsAt: string;

  createdAt: string;
}

export interface InsuranceClaim {
  id: string;

  policyId: string;

  claimantPlayerId: PlayerId;

  eventId: string | null;

  description: string;

  damageAmount: number;

  approvedAmount: number;

  status:
    | "submitted"
    | "investigating"
    | "approved"
    | "rejected"
    | "paid";

  submittedAt: string;

  resolvedAt: string | null;
}

function requirePlayer(
  options: InsuranceServiceOptions,
): PlayerId {
  const playerId = options.getPlayerId?.();

  if (!playerId) {
    throw new Error(
      "A logged-in player is required.",
    );
  }

  return playerId;
}

export class InsuranceService {
  private readonly options: InsuranceServiceOptions;

  constructor(
    options: InsuranceServiceOptions = {},
  ) {
    this.options = options;
  }

  public async getCompanies(
    countryId?: string,
  ): Promise<InsuranceCompany[]> {
    return apiClient.get<InsuranceCompany[]>(
      "/insurance/companies",
      {
        countryId,
      },
    );
  }

  public async getCompany(
    companyId: string,
  ): Promise<InsuranceCompany> {
    return apiClient.get<InsuranceCompany>(
      `/insurance/companies/${encodeURIComponent(
        companyId,
      )}`,
    );
  }

  public async getMyPolicies(): Promise<
    InsurancePolicy[]
  > {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.get<InsurancePolicy[]>(
      `/insurance/policies/player/${encodeURIComponent(
        playerId,
      )}`,
    );
  }

  public async createPolicy(
    request: {
      insuranceCompanyId: string;

      type: InsuranceType;

      insuredAssetId?: string | null;

      coverageAmount: number;

      deductible: number;

      paymentFrequency:
        | "monthly"
        | "quarterly"
        | "yearly";
    },
  ): Promise<InsurancePolicy> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.post<InsurancePolicy>(
      "/insurance/policies",
      {
        playerId,
        request,
      },
    );
  }

  public async submitClaim(
    request: {
      policyId: string;

      eventId?: string | null;

      description: string;

      damageAmount: number;
    },
  ): Promise<InsuranceClaim> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.post<InsuranceClaim>(
      "/insurance/claims",
      {
        playerId,
        request,
      },
    );
  }

  public async getMyClaims(): Promise<
    InsuranceClaim[]
  > {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.get<InsuranceClaim[]>(
      `/insurance/claims/player/${encodeURIComponent(
        playerId,
      )}`,
    );
  }
}

export const insuranceService =
  new InsuranceService();