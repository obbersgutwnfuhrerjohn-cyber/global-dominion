import { apiClient } from "./api";

import type {
  CountryId,
  PlayerId,
} from "../types/game";

export interface FinanceServiceOptions {
  getPlayerId?: () => PlayerId | null;
  getSessionId?: () => string | null;
}

export type TransactionType =
  | "salary"
  | "purchase"
  | "sale"
  | "tax"
  | "transfer"
  | "investment"
  | "dividend"
  | "loan"
  | "repayment"
  | "construction"
  | "production"
  | "transport"
  | "government"
  | "other";

export interface Account {
  id: string;

  ownerPlayerId: PlayerId;

  countryId: CountryId;

  currency: string;

  balance: number;

  availableBalance: number;

  reservedBalance: number;

  createdAt: string;

  updatedAt: string;
}

export interface Transaction {
  id: string;

  accountId: string;

  type: TransactionType;

  amount: number;

  currency: string;

  description: string;

  referenceId: string | null;

  balanceAfter: number;

  createdAt: string;
}

export interface Transfer {
  id: string;

  fromAccountId: string;

  toAccountId: string;

  amount: number;

  currency: string;

  description: string;

  status:
    | "pending"
    | "completed"
    | "cancelled"
    | "failed";

  createdAt: string;

  completedAt: string | null;
}

export interface Loan {
  id: string;

  borrowerPlayerId: PlayerId;

  principal: number;

  remainingBalance: number;

  interestRate: number;

  monthlyPayment: number;

  currency: string;

  status:
    | "pending"
    | "active"
    | "paid"
    | "defaulted";

  createdAt: string;

  dueAt: string | null;
}

export interface Investment {
  id: string;

  playerId: PlayerId;

  companyId: string | null;

  amount: number;

  ownershipPercentage: number;

  currentValue: number;

  currency: string;

  status:
    | "active"
    | "sold";

  createdAt: string;
}

function requirePlayer(
  options: FinanceServiceOptions,
): PlayerId {
  const playerId = options.getPlayerId?.();

  if (!playerId) {
    throw new Error(
      "A logged-in player is required.",
    );
  }

  return playerId;
}

export class FinanceService {
  private readonly options: FinanceServiceOptions;

  constructor(
    options: FinanceServiceOptions = {},
  ) {
    this.options = options;
  }

  public async getMyAccount(): Promise<Account> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.get<Account>(
      `/finance/accounts/player/${encodeURIComponent(
        playerId,
      )}`,
    );
  }

  public async getTransactions(
    limit = 50,
  ): Promise<Transaction[]> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.get<Transaction[]>(
      `/finance/accounts/player/${encodeURIComponent(
        playerId,
      )}/transactions`,
      {
        limit,
      },
    );
  }

  public async getTransaction(
    transactionId: string,
  ): Promise<Transaction> {
    return apiClient.get<Transaction>(
      `/finance/transactions/${encodeURIComponent(
        transactionId,
      )}`,
    );
  }

  public async transferMoney(
    request: {
      toPlayerId: PlayerId;

      amount: number;

      description?: string;
    },
  ): Promise<Transfer> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.post<Transfer>(
      "/finance/transfers",
      {
        playerId,
        request,
      },
    );
  }

  public async getTransfers(): Promise<
    Transfer[]
  > {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.get<Transfer[]>(
      `/finance/transfers/player/${encodeURIComponent(
        playerId,
      )}`,
    );
  }

  public async requestLoan(
    request: {
      amount: number;

      termMonths: number;

      purpose: string;
    },
  ): Promise<Loan> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.post<Loan>(
      "/finance/loans",
      {
        playerId,
        request,
      },
    );
  }

  public async getLoans(): Promise<Loan[]> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.get<Loan[]>(
      `/finance/loans/player/${encodeURIComponent(
        playerId,
      )}`,
    );
  }

  public async repayLoan(
    loanId: string,
    amount: number,
  ): Promise<Loan> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.post<Loan>(
      `/finance/loans/${encodeURIComponent(
        loanId,
      )}/repay`,
      {
        playerId,
        amount,
      },
    );
  }

  public async getInvestments(): Promise<
    Investment[]
  > {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.get<Investment[]>(
      `/finance/investments/player/${encodeURIComponent(
        playerId,
      )}`,
    );
  }

  public async invest(
    request: {
      companyId: string;

      amount: number;
    },
  ): Promise<Investment> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.post<Investment>(
      "/finance/investments",
      {
        playerId,
        request,
      },
    );
  }

  public async sellInvestment(
    investmentId: string,
  ): Promise<Investment> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.post<Investment>(
      `/finance/investments/${encodeURIComponent(
        investmentId,
      )}/sell`,
      {
        playerId,
      },
    );
  }
}

export const financeService =
  new FinanceService();