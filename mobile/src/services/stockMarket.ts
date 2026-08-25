import { apiClient } from "./api";

import type {
  PlayerId,
} from "../types/game";

export interface StockMarketServiceOptions {
  getPlayerId?: () => PlayerId | null;
  getSessionId?: () => string | null;
}

export interface ListedCompany {
  companyId: string;

  companyName: string;

  ticker: string;

  countryId: string;

  sector: string;

  sharePrice: number;

  marketCap: number;

  totalShares: number;

  sharesAvailable: number;

  dailyChange: number;

  dailyChangePercentage: number;

  listed: boolean;

  updatedAt: string;
}

export interface StockHolding {
  id: string;

  playerId: PlayerId;

  companyId: string;

  companyName: string;

  ticker: string;

  shares: number;

  averagePurchasePrice: number;

  currentPrice: number;

  marketValue: number;

  unrealizedProfit: number;

  ownershipPercentage: number;

  updatedAt: string;
}

export type OrderType =
  | "market"
  | "limit";

export type OrderSide =
  | "buy"
  | "sell";

export type OrderStatus =
  | "open"
  | "partially_filled"
  | "filled"
  | "cancelled";

export interface StockOrder {
  id: string;

  playerId: PlayerId;

  companyId: string;

  ticker: string;

  side: OrderSide;

  type: OrderType;

  shares: number;

  remainingShares: number;

  price: number | null;

  status: OrderStatus;

  createdAt: string;

  executedAt: string | null;
}

export interface MarketQuote {
  companyId: string;

  ticker: string;

  price: number;

  previousPrice: number;

  change: number;

  changePercentage: number;

  volume: number;

  timestamp: string;
}

function requirePlayer(
  options: StockMarketServiceOptions,
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

export class StockMarketService {
  private readonly options: StockMarketServiceOptions;

  constructor(
    options: StockMarketServiceOptions = {},
  ) {
    this.options = options;
  }

  public async getListedCompanies(
    countryId?: string,
    sector?: string,
  ): Promise<ListedCompany[]> {
    return apiClient.get<ListedCompany[]>(
      "/stocks/listed",
      {
        countryId,
        sector,
      },
    );
  }

  public async getQuote(
    companyId: string,
  ): Promise<MarketQuote> {
    return apiClient.get<MarketQuote>(
      `/stocks/companies/${encodeURIComponent(
        companyId,
      )}/quote`,
    );
  }

  public async getQuotes(
    companyIds: string[],
  ): Promise<MarketQuote[]> {
    return apiClient.get<MarketQuote[]>(
      "/stocks/quotes",
      {
        companyIds,
      },
    );
  }

  public async getMyHoldings(): Promise<
    StockHolding[]
  > {
    const playerId =
      requirePlayer(this.options);

    return apiClient.get<StockHolding[]>(
      `/stocks/holdings/player/${encodeURIComponent(
        playerId,
      )}`,
    );
  }

  public async placeOrder(
    request: {
      companyId: string;

      side: OrderSide;

      type: OrderType;

      shares: number;

      price?: number | null;
    },
  ): Promise<StockOrder> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.post<StockOrder>(
      "/stocks/orders",
      {
        playerId,

        request,
      },
    );
  }

  public async getMyOrders(): Promise<
    StockOrder[]
  > {
    const playerId =
      requirePlayer(this.options);

    return apiClient.get<StockOrder[]>(
      `/stocks/orders/player/${encodeURIComponent(
        playerId,
      )}`,
    );
  }

  public async cancelOrder(
    orderId: string,
  ): Promise<void> {
    const playerId =
      requirePlayer(this.options);

    await apiClient.post(
      `/stocks/orders/${encodeURIComponent(
        orderId,
      )}/cancel`,
      {
        playerId,
      },
    );
  }
}

export const stockMarketService =
  new StockMarketService();