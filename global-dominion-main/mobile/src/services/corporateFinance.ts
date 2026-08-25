import { apiClient } from "./api";

import type { PlayerId } from "../types/game";

export interface CorporateFinanceServiceOptions {
  getPlayerId?: () => PlayerId | null;
  getSessionId?: () => string | null;
}

export interface Shareholder {
  id: string;

  companyId: string;

  ownerPlayerId: PlayerId;

  shares: number;

  ownershipPercentage: number;

  averagePurchasePrice: number;

  marketValue: number;

  votingPower: number;

  updatedAt: string;
}

export interface CompanyFinancials {
  companyId: string;

  revenue: number;

  operatingCosts: number;

  wages: number;

  energyCosts: number;

  logisticsCosts: number;

  taxes: number;

  interestExpense: number;

  netProfit: number;

  cashBalance: number;

  assets: number;

  liabilities: number;

  equity: number;

  currency: string;

  periodStart: string;

  periodEnd: string;
}

export interface DividendPayment {
  id: string;

  companyId: string;

  shareholderPlayerId: PlayerId;

  shares: number;

  dividendPerShare: number;

  totalAmount: number;

  currency: string;

  paidAt: string;
}

export interface CorporateLoan {
  id: string;

  companyId: string;

  lenderBankId: string;

  principal: number;

  remainingBalance: number;

  interestRate: number;

  monthlyPayment: number;

  durationMonths: number;

  remainingMonths: number;

  status:
    | "pending"
    | "active"
    | "paid"
    | "defaulted";

  createdAt: string;
}

function requirePlayer(
  options: CorporateFinanceServiceOptions,
): PlayerId {
  const playerId = options.getPlayerId?.();

  if (!playerId) {
    throw new Error(
      "A logged-in player is required.",
    );
  }

  return playerId;
}

export class CorporateFinanceService {
  private readonly options: CorporateFinanceServiceOptions;

  constructor(
    options: CorporateFinanceServiceOptions = {},
  ) {
    this.options = options;
  }

  public async getFinancials(
    companyId: string,
  ): Promise<CompanyFinancials> {
    return apiClient.get<CompanyFinancials>(
      `/corporate-finance/companies/${encodeURIComponent(
        companyId,
      )}/financials`,
    );
  }

  public async getShareholders(
    companyId: string,
  ): Promise<Shareholder[]> {
    return apiClient.get<Shareholder[]>(
      `/corporate-finance/companies/${encodeURIComponent(
        companyId,
      )}/shareholders`,
    );
  }

  public async getMyHoldings(): Promise<
    Shareholder[]
  > {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.get<Shareholder[]>(
      `/corporate-finance/shareholders/player/${encodeURIComponent(
        playerId,
      )}`,
    );
  }

  public async declareDividend(
    request: {
      companyId: string;

      dividendPerShare: number;
    },
  ): Promise<DividendPayment[]> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.post<DividendPayment[]>(
      "/corporate-finance/dividends",
      {
        playerId,
        request,
      },
    );
  }

  public async getMyDividends(): Promise<
    DividendPayment[]
  > {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.get<DividendPayment[]>(
      `/corporate-finance/dividends/player/${encodeURIComponent(
        playerId,
      )}`,
    );
  }

  public async getCorporateLoans(
    companyId: string,
  ): Promise<CorporateLoan[]> {
    return apiClient.get<CorporateLoan[]>(
      `/corporate-finance/companies/${encodeURIComponent(
        companyId,
      )}/loans`,
    );
  }

  public async applyForCorporateLoan(
    request: {
      companyId: string;

      bankId: string;

      principal: number;

      durationMonths: number;
    },
  ): Promise<CorporateLoan> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.post<CorporateLoan>(
      "/corporate-finance/loans",
      {
        playerId,
        request,
      },
    );
  }

  public async repayCorporateLoan(
    loanId: string,
    amount: number,
  ): Promise<CorporateLoan> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.post<CorporateLoan>(
      `/corporate-finance/loans/${encodeURIComponent(
        loanId,
      )}/repay`,
      {
        playerId,
        amount,
      },
    );
  }
}

export const corporateFinanceService =
  new CorporateFinanceService();