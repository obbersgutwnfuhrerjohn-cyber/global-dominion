import { apiClient } from "./api";

export interface MarketServiceOptions {
  getPlayerId?: () => string | null;
  getSessionId?: () => string | null;
}

export interface Market {
  id: string;

  countryId: string;

  cityId: string | null;

  name: string;

  currency: string;

  totalSupply: number;

  totalDemand: number;

  averagePrice: number;

  priceIndex: number;

  inflationRate: number;

  updatedAt: string;
}

export interface MarketItem {
  id: string;

  marketId: string;

  itemId: string;

  itemName: string;

  category:
    | "food"
    | "housing"
    | "energy"
    | "transport"
    | "electronics"
    | "clothing"
    | "healthcare"
    | "industrial"
    | "luxury"
    | "services";

  supply: number;

  demand: number;

  price: number;

  previousPrice: number;

  priceChangePercentage: number;

  dailySales: number;

  updatedAt: string;
}

export interface PriceHistory {
  itemId: string;

  marketId: string;

  price: number;

  supply: number;

  demand: number;

  recordedAt: string;
}

export interface Purchase {
  id: string;

  buyerPlayerId: string;

  marketId: string;

  itemId: string;

  quantity: number;

  pricePerUnit: number;

  totalCost: number;

  currency: string;

  createdAt: string;
}

export class MarketService {
  private readonly options: MarketServiceOptions;

  constructor(
    options: MarketServiceOptions = {},
  ) {
    this.options = options;
  }

  public async getMarkets(
    countryId?: string,
    cityId?: string,
  ): Promise<Market[]> {
    return apiClient.get<Market[]>(
      "/markets",
      {
        countryId,
        cityId,
      },
    );
  }

  public async getMarket(
    marketId: string,
  ): Promise<Market> {
    return apiClient.get<Market>(
      `/markets/${encodeURIComponent(
        marketId,
      )}`,
    );
  }

  public async getItems(
    marketId: string,
  ): Promise<MarketItem[]> {
    return apiClient.get<MarketItem[]>(
      `/markets/${encodeURIComponent(
        marketId,
      )}/items`,
    );
  }

  public async getItem(
    marketId: string,
    itemId: string,
  ): Promise<MarketItem> {
    return apiClient.get<MarketItem>(
      `/markets/${encodeURIComponent(
        marketId,
      )}/items/${encodeURIComponent(
        itemId,
      )}`,
    );
  }

  public async getPriceHistory(
    marketId: string,
    itemId: string,
  ): Promise<PriceHistory[]> {
    return apiClient.get<PriceHistory[]>(
      `/markets/${encodeURIComponent(
        marketId,
      )}/items/${encodeURIComponent(
        itemId,
      )}/history`,
    );
  }

  public async purchase(
    request: {
      marketId: string;

      itemId: string;

      quantity: number;
    },
  ): Promise<Purchase> {
    const playerId = this.options.getPlayerId?.();

    if (!playerId) {
      throw new Error(
        "A logged-in player is required.",
      );
    }

    return apiClient.post<Purchase>(
      "/markets/purchases",
      {
        playerId,
        request,
      },
    );
  }

  public async getMyPurchases(): Promise<
    Purchase[]
  > {
    const playerId = this.options.getPlayerId?.();

    if (!playerId) {
      throw new Error(
        "A logged-in player is required.",
      );
    }

    return apiClient.get<Purchase[]>(
      `/markets/purchases/player/${encodeURIComponent(
        playerId,
      )}`,
    );
  }
}

export const marketService =
  new MarketService();