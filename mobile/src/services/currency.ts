import { apiClient } from "./api";

import type { PlayerId } from "../types/game";

export interface CurrencyServiceOptions {
  getPlayerId?: () => PlayerId | null;
  getSessionId?: () => string | null;
}

export interface Currency {
  id: string;

  countryId: string;

  code: string;

  name: string;

  symbol: string;

  exchangeRateToBase: number;

  inflationRate: number;

  stability: number;

  active: boolean;

  updatedAt: string;
}

export interface ExchangeRate {
  baseCurrency: string;

  quoteCurrency: string;

  rate: number;

  inverseRate: number;

  change24h: number;

  updatedAt: string;
}

export interface CurrencyTransaction {
  id: string;

  playerId: PlayerId;

  fromCurrency: string;

  toCurrency: string;

  amount: number;

  receivedAmount: number;

  exchangeRate: number;

  fee: number;

  createdAt: string;
}

function requirePlayer(
  options: CurrencyServiceOptions,
): PlayerId {
  const playerId = options.getPlayerId?.();

  if (!playerId) {
    throw new Error(
      "A logged-in player is required.",
    );
  }

  return playerId;
}

export class CurrencyService {
  private readonly options: CurrencyServiceOptions;

  constructor(
    options: CurrencyServiceOptions = {},
  ) {
    this.options = options;
  }

  public async getCurrencies(): Promise<
    Currency[]
  > {
    return apiClient.get<Currency[]>(
      "/currency/currencies",
    );
  }

  public async getCurrency(
    code: string,
  ): Promise<Currency> {
    return apiClient.get<Currency>(
      `/currency/currencies/${encodeURIComponent(
        code,
      )}`,
    );
  }

  public async getExchangeRate(
    baseCurrency: string,
    quoteCurrency: string,
  ): Promise<ExchangeRate> {
    return apiClient.get<ExchangeRate>(
      "/currency/rates",
      {
        baseCurrency,
        quoteCurrency,
      },
    );
  }

  public async exchange(
    request: {
      fromCurrency: string;

      toCurrency: string;

      amount: number;
    },
  ): Promise<CurrencyTransaction> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.post<CurrencyTransaction>(
      "/currency/exchange",
      {
        playerId,
        request,
      },
    );
  }

  public async getMyTransactions(): Promise<
    CurrencyTransaction[]
  > {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.get<CurrencyTransaction[]>(
      `/currency/transactions/player/${encodeURIComponent(
        playerId,
      )}`,
    );
  }
}

export const currencyService =
  new CurrencyService();