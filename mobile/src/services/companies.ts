import { apiClient } from "./api";

import type {
  PlayerId,
} from "../types/game";

export interface CompaniesServiceOptions {
  getPlayerId?: () => PlayerId | null;
  getSessionId?: () => string | null;
}

export type CompanyType =
  | "sole_proprietorship"
  | "partnership"
  | "corporation"
  | "cooperative"
  | "state_owned";

export type CompanyStatus =
  | "active"
  | "inactive"
  | "bankrupt"
  | "dissolved";

export interface Company {
  id: string;

  ownerPlayerId: PlayerId;

  name: string;

  description: string;

  type: CompanyType;

  status: CompanyStatus;

  countryId: string;

  cityId: string | null;

  foundedAt: string;

  capital: number;

  revenue: number;

  expenses: number;

  profit: number;

  employeeCount: number;

  factoryCount: number;

  warehouseCount: number;

  researchProjectCount: number;

  reputation: number;

  createdAt: string;

  updatedAt: string;
}

export interface CompanyShareholder {
  id: string;

  companyId: string;

  playerId: PlayerId;

  playerName: string;

  shares: number;

  ownershipPercentage: number;

  votingPower: number;

  acquiredAt: string;
}

export interface CompanyFinancials {
  companyId: string;

  cash: number;

  assets: number;

  liabilities: number;

  revenue: number;

  operatingCosts: number;

  wages: number;

  researchCosts: number;

  logisticsCosts: number;

  taxes: number;

  netProfit: number;

  updatedAt: string;
}

function requirePlayer(
  options: CompaniesServiceOptions,
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

export class CompaniesService {
  private readonly options: CompaniesServiceOptions;

  constructor(
    options: CompaniesServiceOptions = {},
  ) {
    this.options = options;
  }

  public async getMyCompanies(): Promise<
    Company[]
  > {
    const playerId =
      requirePlayer(this.options);

    return apiClient.get<Company[]>(
      `/companies/player/${encodeURIComponent(
        playerId,
      )}`,
    );
  }

  public async getCompany(
    companyId: string,
  ): Promise<Company> {
    return apiClient.get<Company>(
      `/companies/${encodeURIComponent(
        companyId,
      )}`,
    );
  }

  public async createCompany(
    request: {
      name: string;

      description?: string;

      type: CompanyType;

      countryId: string;

      cityId?: string | null;

      startingCapital: number;
    },
  ): Promise<Company> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.post<Company>(
      "/companies",
      {
        playerId,

        request,
      },
    );
  }

  public async updateCompany(
    companyId: string,
    changes: {
      name?: string;

      description?: string;
    },
  ): Promise<Company> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.put<Company>(
      `/companies/${encodeURIComponent(
        companyId,
      )}`,
      {
        playerId,

        changes,
      },
    );
  }

  public async getShareholders(
    companyId: string,
  ): Promise<CompanyShareholder[]> {
    return apiClient.get<
      CompanyShareholder[]
    >(
      `/companies/${encodeURIComponent(
        companyId,
      )}/shareholders`,
    );
  }

  public async buyShares(
    companyId: string,
    shares: number,
  ): Promise<CompanyShareholder> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.post<CompanyShareholder>(
      `/companies/${encodeURIComponent(
        companyId,
      )}/shares/buy`,
      {
        playerId,

        shares,
      },
    );
  }

  public async sellShares(
    companyId: string,
    shares: number,
  ): Promise<void> {
    const playerId =
      requirePlayer(this.options);

    await apiClient.post(
      `/companies/${encodeURIComponent(
        companyId,
      )}/shares/sell`,
      {
        playerId,

        shares,
      },
    );
  }

  public async getFinancials(
    companyId: string,
  ): Promise<CompanyFinancials> {
    return apiClient.get<CompanyFinancials>(
      `/companies/${encodeURIComponent(
        companyId,
      )}/financials`,
    );
  }

  public async transferOwnership(
    companyId: string,
    newOwnerPlayerId: PlayerId,
  ): Promise<Company> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.post<Company>(
      `/companies/${encodeURIComponent(
        companyId,
      )}/ownership`,
      {
        playerId,

        newOwnerPlayerId,
      },
    );
  }
}

export const companiesService =
  new CompaniesService();