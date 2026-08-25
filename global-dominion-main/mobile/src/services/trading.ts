import { apiClient } from "./api";

import type {
  PlayerId,
} from "../types/game";

export interface TradingServiceOptions {
  getPlayerId?: () => PlayerId | null;
  getSessionId?: () => string | null;
}

export type TradeOrderSide =
  | "buy"
  | "sell";

export type TradeOrderStatus =
  | "open"
  | "partially_filled"
  | "filled"
  | "cancelled"
  | "expired";

export interface MarketProduct {
  itemId: string;

  itemName: string;

  category: string;

  unit: string;

  currentPrice: number;

  dailyChange: number;

  dailyChangePercentage: number;

  availableQuantity: number;

  updatedAt: string;
}

export interface TradeOrder {
  id: string;

  playerId: PlayerId;

  companyId: string | null;

  itemId: string;

  itemName: string;

  side: TradeOrderSide;

  quantity: number;

  remainingQuantity: number;

  pricePerUnit: number;

  currency: string;

  status: TradeOrderStatus;

  createdAt: string;

  expiresAt: string | null;
}

export interface TradeTransaction {
  id: string;

  buyerPlayerId: PlayerId;

  sellerPlayerId: PlayerId;

  buyerCompanyId: string | null;

  sellerCompanyId: string | null;

  itemId: string;

  itemName: string;

  quantity: number;

  pricePerUnit: number;

  totalValue: number;

  currency: string;

  createdAt: string;
}

export interface MarketPriceHistory {
  itemId: string;

  price: number;

  volume: number;

  timestamp: string;
}

function requirePlayer(
  options: TradingServiceOptions,
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

export class TradingService {
  private readonly options: TradingServiceOptions;

  constructor(
    options: TradingServiceOptions = {},
  ) {
    this.options = options;
  }

  public async getMarketProducts(
    category?: string,
  ): Promise<MarketProduct[]> {
    return apiClient.get<MarketProduct[]>(
      "/trading/products",
      {
        category,
      },
    );
  }

  public async getProduct(
    itemId: string,
  ): Promise<MarketProduct> {
    return apiClient.get<MarketProduct>(
      `/trading/products/${encodeURIComponent(
        itemId,
      )}`,
    );
  }

  public async getPriceHistory(
    itemId: string,
  ): Promise<MarketPriceHistory[]> {
    return apiClient.get<
      MarketPriceHistory[]
    >(
      `/trading/products/${encodeURIComponent(
        itemId,
      )}/history`,
    );
  }

  public async placeOrder(
    request: {
      itemId: string;

      side: TradeOrderSide;

      quantity: number;

      pricePerUnit: number;

      companyId?: string | null;

      expiresAt?: string | null;
    },
  ): Promise<TradeOrder> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.post<TradeOrder>(
      "/trading/orders",
      {
        playerId,

        request,
      },
    );
  }

  public async getMyOrders(): Promise<
    TradeOrder[]
  > {
    const playerId =
      requirePlayer(this.options);

    return apiClient.get<TradeOrder[]>(
      `/trading/orders/player/${encodeURIComponent(
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
      `/trading/orders/${encodeURIComponent(
        orderId,
      )}/cancel`,
      {
        playerId,
      },
    );
  }

  public async getMyTransactions(): Promise<
    TradeTransaction[]
  > {
    const playerId =
      requirePlayer(this.options);

    return apiClient.get<TradeTransaction[]>(
      `/trading/transactions/player/${encodeURIComponent(
        playerId,
      )}`,
    );
  }
}

export const tradingService =
  new TradingService();