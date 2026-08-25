import { apiClient } from "./api";

import type { PlayerId } from "../types/game";

export interface GovernmentServiceOptions {
  getPlayerId?: () => PlayerId | null;
  getSessionId?: () => string | null;
}

export type TaxType =
  | "income"
  | "corporate"
  | "sales"
  | "property"
  | "import"
  | "export"
  | "energy";

export interface Government {
  id: string;

  countryId: string;

  name: string;

  treasuryBalance: number;

  taxRevenue: number;

  governmentSpending: number;

  debt: number;

  stability: number;

  approvalRating: number;

  updatedAt: string;
}

export interface TaxPolicy {
  id: string;

  governmentId: string;

  type: TaxType;

  rate: number;

  minimumThreshold: number;

  maximumThreshold: number | null;

  active: boolean;

  updatedAt: string;
}

export interface GovernmentBudget {
  id: string;

  governmentId: string;

  period: string;

  totalRevenue: number;

  totalSpending: number;

  infrastructureSpending: number;

  healthcareSpending: number;

  educationSpending: number;

  publicSafetySpending: number;

  researchSpending: number;

  welfareSpending: number;

  defenseSpending: number;

  balance: number;

  createdAt: string;
}

export interface GovernmentTransaction {
  id: string;

  governmentId: string;

  type:
    | "tax"
    | "spending"
    | "subsidy"
    | "grant"
    | "loan"
    | "debt_payment";

  amount: number;

  currency: string;

  description: string;

  createdAt: string;
}

function requirePlayer(
  options: GovernmentServiceOptions,
): PlayerId {
  const playerId = options.getPlayerId?.();

  if (!playerId) {
    throw new Error(
      "A logged-in player is required.",
    );
  }

  return playerId;
}

export class GovernmentService {
  private readonly options: GovernmentServiceOptions;

  constructor(
    options: GovernmentServiceOptions = {},
  ) {
    this.options = options;
  }

  public async getGovernment(
    countryId: string,
  ): Promise<Government> {
    return apiClient.get<Government>(
      `/government/countries/${encodeURIComponent(
        countryId,
      )}`,
    );
  }

  public async getTaxPolicies(
    countryId: string,
  ): Promise<TaxPolicy[]> {
    return apiClient.get<TaxPolicy[]>(
      `/government/countries/${encodeURIComponent(
        countryId,
      )}/taxes`,
    );
  }

  public async getBudget(
    countryId: string,
    period?: string,
  ): Promise<GovernmentBudget> {
    return apiClient.get<GovernmentBudget>(
      `/government/countries/${encodeURIComponent(
        countryId,
      )}/budget`,
      {
        period,
      },
    );
  }

  public async getTransactions(
    countryId: string,
  ): Promise<GovernmentTransaction[]> {
    return apiClient.get<GovernmentTransaction[]>(
      `/government/countries/${encodeURIComponent(
        countryId,
      )}/transactions`,
    );
  }

  public async proposeTaxChange(
    request: {
      countryId: string;

      type: TaxType;

      rate: number;
    },
  ): Promise<TaxPolicy> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.post<TaxPolicy>(
      "/government/taxes/proposals",
      {
        playerId,
        request,
      },
    );
  }

  public async fundPublicProject(
    request: {
      countryId: string;

      projectType:
        | "infrastructure"
        | "healthcare"
        | "education"
        | "public_safety"
        | "research";

      amount: number;

      description: string;
    },
  ): Promise<GovernmentTransaction> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.post<GovernmentTransaction>(
      "/government/spending",
      {
        playerId,
        request,
      },
    );
  }
}

export const governmentService =
  new GovernmentService();