import { apiClient } from "./api";

import type { PlayerId } from "../types/game";

export interface InvestmentServiceOptions {
  getPlayerId?: () => PlayerId | null;
  getSessionId?: () => string | null;
}

export type SecurityType =
  | "stock"
  | "bond";

export interface Security {
  id: string;

  symbol: string;

  name: string;

  type: SecurityType;

  companyId: string | null;

  issuerName: string;

  countryId: string;

  currency: string;

  price: number;

  previousPrice: number;

  marketCap: number;

  totalSupply: number;

  availableSupply: number;

  dividendYield: number;

  interestRate: number;

  active: boolean;

  updatedAt: string;
}

export interface PortfolioHolding {
  id: string;

  playerId: PlayerId;

  securityId: string;

  symbol: string;

  quantity: number;

  averagePurchasePrice: number;

  currentPrice: number;

  marketValue: number;

  unrealizedProfit: number;

  currency: string;

  updatedAt: string;
}

export interface InvestmentOrder {
  id: string;

  playerId: PlayerId;

  securityId: string;

  type: "buy" | "sell";

  quantity: number;

  price: number;

  totalValue: number;

  status:
    | "pending"
    | "executed"
    | "cancelled"
    | "rejected";

  createdAt: string;

  executedAt: string | null;
}

export interface MarketIndex {
  id: string;

  name: string;

  countryId: string;

  value: number;

  previousValue: number;

  dailyChangePercentage: number;

  updatedAt: string;
}

function requirePlayer(
  options: InvestmentServiceOptions,
): PlayerId {
  const playerId = options.getPlayerId?.();

  if (!playerId) {
    throw new Error(
      "A logged-in player is required.",
    );
  }

  return playerId;
}

export class InvestmentService {
  private readonly options: InvestmentServiceOptions;

  constructor(
    options: InvestmentServiceOptions = {},
  ) {
    this.options = options;
  }

  public async getSecurities(
    countryId?: string,
    type?: SecurityType,
  ): Promise<Security[]> {
    return apiClient.get<Security[]>(
      "/investments/securities",
      {
        countryId,
        type,
      },
    );
  }

  public async getSecurity(
    securityId: string,
  ): Promise<Security> {
    return apiClient.get<Security>(
      `/investments/securities/${encodeURIComponent(
        securityId,
      )}`,
    );
  }

  public async getMarkets(): Promise<
    MarketIndex[]
  > {
    return apiClient.get<MarketIndex[]>(
      "/investments/markets",
    );
  }

  public async getPortfolio(): Promise<
    PortfolioHolding[]
  > {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.get<PortfolioHolding[]>(
      `/investments/portfolio/player/${encodeURIComponent(
        playerId,
      )}`,
    );
  }

  public async placeOrder(
    request: {
      securityId: string;

      type: "buy" | "sell";

      quantity: number;

      price: number;
    },
  ): Promise<InvestmentOrder> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.post<InvestmentOrder>(
      "/investments/orders",
      {
        playerId,
        request,
      },
    );
  }

  public async cancelOrder(
    orderId: string,
  ): Promise<void> {
    const playerId = requirePlayer(
      this.options,
    );

    await apiClient.post(
      `/investments/orders/${encodeURIComponent(
        orderId,
      )}/cancel`,
      {
        playerId,
      },
    );
  }

  public async getOrders(): Promise<
    InvestmentOrder[]
  > {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.get<InvestmentOrder[]>(
      `/investments/orders/player/${encodeURIComponent(
        playerId,
      )}`,
    );
  }
}

export const investmentService =
  new InvestmentService();