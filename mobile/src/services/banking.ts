import { apiClient } from "./api";

import type { PlayerId } from "../types/game";

export interface BankingServiceOptions {
  getPlayerId?: () => PlayerId | null;
  getSessionId?: () => string | null;
}

export type AccountType =
  | "checking"
  | "savings"
  | "business"
  | "investment";

export type LoanType =
  | "personal"
  | "mortgage"
  | "business"
  | "construction";

export type LoanStatus =
  | "pending"
  | "active"
  | "paid"
  | "defaulted"
  | "cancelled";

export interface Bank {
  id: string;

  countryId: string;

  name: string;

  currencyCode: string;

  assets: number;

  deposits: number;

  loans: number;

  interestRate: number;

  stability: number;

  active: boolean;

  createdAt: string;

  updatedAt: string;
}

export interface BankAccount {
  id: string;

  playerId: PlayerId;

  bankId: string;

  type: AccountType;

  currencyCode: string;

  balance: number;

  interestRate: number;

  active: boolean;

  createdAt: string;

  updatedAt: string;
}

export interface Loan {
  id: string;

  playerId: PlayerId;

  bankId: string;

  type: LoanType;

  principal: number;

  remainingBalance: number;

  interestRate: number;

  monthlyPayment: number;

  termMonths: number;

  paymentsRemaining: number;

  status: LoanStatus;

  createdAt: string;

  dueDate: string | null;

  completedAt: string | null;
}

export interface BankTransaction {
  id: string;

  accountId: string;

  playerId: PlayerId;

  type:
    | "deposit"
    | "withdrawal"
    | "transfer"
    | "payment"
    | "loan_disbursement"
    | "loan_repayment";

  amount: number;

  currencyCode: string;

  description: string;

  createdAt: string;
}

function requirePlayer(
  options: BankingServiceOptions,
): PlayerId {
  const playerId = options.getPlayerId?.();

  if (!playerId) {
    throw new Error(
      "A logged-in player is required.",
    );
  }

  return playerId;
}

export class BankingService {
  private readonly options: BankingServiceOptions;

  constructor(
    options: BankingServiceOptions = {},
  ) {
    this.options = options;
  }

  public async getBanks(countryId?: string): Promise<Bank[]> {
    const query = countryId ? `?countryId=${encodeURIComponent(countryId)}` : "";
    return apiClient.get<Bank[]>(`/banking/banks${query}`);
  }

  public async getBank(
    bankId: string,
  ): Promise<Bank> {
    return apiClient.get<Bank>(
      `/banking/banks/${encodeURIComponent(
        bankId,
      )}`,
    );
  }

  public async getMyAccounts(): Promise<
    BankAccount[]
  > {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.get<BankAccount[]>(
      `/banking/accounts/player/${encodeURIComponent(
        playerId,
      )}`,
    );
  }

  public async openAccount(
    request: {
      bankId: string;

      type: AccountType;

      currencyCode: string;
    },
  ): Promise<BankAccount> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.post<BankAccount>(
      "/banking/accounts",
      {
        playerId,
        request,
      },
    );
  }

  public async transfer(
    request: {
      fromAccountId: string;

      toAccountId: string;

      amount: number;

      currencyCode: string;
    },
  ): Promise<BankTransaction> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.post<BankTransaction>(
      "/banking/transfers",
      {
        playerId,
        request,
      },
    );
  }

  public async getMyLoans(): Promise<
    Loan[]
  > {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.get<Loan[]>(
      `/banking/loans/player/${encodeURIComponent(
        playerId,
      )}`,
    );
  }

  public async applyForLoan(
    request: {
      bankId: string;

      type: LoanType;

      amount: number;

      termMonths: number;
    },
  ): Promise<Loan> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.post<Loan>(
      "/banking/loans",
      {
        playerId,
        request,
      },
    );
    }
  public async getTransactions(accountId: string): Promise<BankTransaction[]> {
    const playerId = requirePlayer(this.options);
    const query = playerId ? "?playerId=" + encodeURIComponent(playerId) : "";
    return apiClient.get<BankTransaction[]>(
        "/banking/accounts/" + encodeURIComponent(accountId) + "/transactions" + query
    );
}

}
export const bankingService = new BankingService();
