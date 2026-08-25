import { apiClient } from "./api";

export interface CentralBankServiceOptions {
  getPlayerId?: () => string | null;
  getSessionId?: () => string | null;
}

export type MonetaryPolicy =
  | "expansionary"
  | "neutral"
  | "restrictive";

export interface CentralBank {
  id: string;

  countryId: string;

  name: string;

  currencyCode: string;

  policyRate: number;

  reserveRequirement: number;

  moneySupply: number;

  inflationTarget: number;

  currentInflation: number;

  monetaryPolicy: MonetaryPolicy;

  foreignReserves: number;

  stability: number;

  updatedAt: string;
}

export interface InterestRate {
  id: string;

  countryId: string;

  type:
    | "policy"
    | "deposit"
    | "mortgage"
    | "business"
    | "consumer";

  rate: number;

  updatedAt: string;
}

export interface MonetaryEvent {
  id: string;

  countryId: string;

  type:
    | "rate_change"
    | "money_supply_change"
    | "reserve_change"
    | "currency_intervention";

  amount: number;

  previousValue: number;

  newValue: number;

  description: string;

  createdAt: string;
}

export class CentralBankService {
  private readonly options: CentralBankServiceOptions;

  constructor(
    options: CentralBankServiceOptions = {},
  ) {
    this.options = options;
  }

  public async getCentralBank(
    countryId: string,
  ): Promise<CentralBank> {
    return apiClient.get<CentralBank>(
      `/central-bank/countries/${encodeURIComponent(
        countryId,
      )}`,
    );
  }

  public async getInterestRates(
    countryId: string,
  ): Promise<InterestRate[]> {
    return apiClient.get<InterestRate[]>(
      `/central-bank/countries/${encodeURIComponent(
        countryId,
      )}/rates`,
    );
  }

  public async getEvents(
    countryId: string,
  ): Promise<MonetaryEvent[]> {
    return apiClient.get<MonetaryEvent[]>(
      `/central-bank/countries/${encodeURIComponent(
        countryId,
      )}/events`,
    );
  }

  public async getPolicy(
    countryId: string,
  ): Promise<CentralBank> {
    return apiClient.get<CentralBank>(
      `/central-bank/countries/${encodeURIComponent(
        countryId,
      )}/policy`,
    );
  }
}

export const centralBankService =
  new CentralBankService();