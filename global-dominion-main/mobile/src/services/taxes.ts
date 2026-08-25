import { apiClient } from "./api";

import type {
  PlayerId,
} from "../types/game";

export interface TaxesServiceOptions {
  getPlayerId?: () => PlayerId | null;
  getSessionId?: () => string | null;
}

export type TaxType =
  | "income"
  | "corporate"
  | "sales"
  | "property"
  | "trade"
  | "capital_gains"
  | "payroll"
  | "resource"
  | "luxury";

export interface TaxRate {
  id: string;

  countryId: string;

  name: string;

  type: TaxType;

  rate: number;

  minimumAmount: number;

  maximumAmount: number | null;

  active: boolean;

  effectiveFrom: string;

  effectiveUntil: string | null;
}

export interface TaxAssessment {
  id: string;

  playerId: PlayerId;

  companyId: string | null;

  countryId: string;

  taxType: TaxType;

  taxableAmount: number;

  taxRate: number;

  taxAmount: number;

  currency: string;

  periodStart: string;

  periodEnd: string;

  status:
    | "pending"
    | "paid"
    | "overdue"
    | "disputed";

  dueAt: string;

  paidAt: string | null;
}

export interface TaxPayment {
  id: string;

  assessmentId: string;

  playerId: PlayerId;

  amount: number;

  currency: string;

  paidAt: string;
}

export interface GovernmentRevenue {
  countryId: string;

  currency: string;

  totalRevenue: number;

  incomeTax: number;

  corporateTax: number;

  salesTax: number;

  propertyTax: number;

  tradeTax: number;

  otherTax: number;

  periodStart: string;

  periodEnd: string;
}

function requirePlayer(
  options: TaxesServiceOptions,
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

export class TaxesService {
  private readonly options: TaxesServiceOptions;

  constructor(
    options: TaxesServiceOptions = {},
  ) {
    this.options = options;
  }

  public async getTaxRates(
    countryId: string,
  ): Promise<TaxRate[]> {
    return apiClient.get<TaxRate[]>(
      `/taxes/countries/${encodeURIComponent(
        countryId,
      )}/rates`,
    );
  }

  public async getMyAssessments(): Promise<
    TaxAssessment[]
  > {
    const playerId =
      requirePlayer(this.options);

    return apiClient.get<TaxAssessment[]>(
      `/taxes/player/${encodeURIComponent(
        playerId,
      )}/assessments`,
    );
  }

  public async getAssessment(
    assessmentId: string,
  ): Promise<TaxAssessment> {
    return apiClient.get<TaxAssessment>(
      `/taxes/assessments/${encodeURIComponent(
        assessmentId,
      )}`,
    );
  }

  public async payTax(
    assessmentId: string,
  ): Promise<TaxPayment> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.post<TaxPayment>(
      `/taxes/assessments/${encodeURIComponent(
        assessmentId,
      )}/pay`,
      {
        playerId,
      },
    );
  }

  public async disputeTax(
    assessmentId: string,
    reason: string,
  ): Promise<TaxAssessment> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.post<TaxAssessment>(
      `/taxes/assessments/${encodeURIComponent(
        assessmentId,
      )}/dispute`,
      {
        playerId,

        reason,
      },
    );
  }

  public async getGovernmentRevenue(
    countryId: string,
    periodStart: string,
    periodEnd: string,
  ): Promise<GovernmentRevenue> {
    return apiClient.get<GovernmentRevenue>(
      `/taxes/countries/${encodeURIComponent(
        countryId,
      )}/revenue`,
      {
        periodStart,

        periodEnd,
      },
    );
  }
}

export const taxesService =
  new TaxesService();