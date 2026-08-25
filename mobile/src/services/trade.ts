import { apiClient } from "./api";

import type { PlayerId } from "../types/game";

export interface TradeServiceOptions {
  getPlayerId?: () => PlayerId | null;
  getSessionId?: () => string | null;
}

export type TradeDirection =
  | "import"
  | "export";

export type TradeStatus =
  | "proposed"
  | "pending"
  | "in_transit"
  | "completed"
  | "cancelled";

export interface TradeAgreement {
  id: string;

  countryAId: string;

  countryBId: string;

  name: string;

  tariffRate: number;

  importQuota: number | null;

  exportQuota: number | null;

  active: boolean;

  startsAt: string;

  endsAt: string | null;

  createdAt: string;
}

export interface TradeOrder {
  id: string;

  buyerPlayerId: PlayerId;

  sellerPlayerId: PlayerId | null;

  exporterCountryId: string;

  importerCountryId: string;

  itemId: string;

  quantity: number;

  pricePerUnit: number;

  tariffAmount: number;

  shippingCost: number;

  totalValue: number;

  currency: string;

  direction: TradeDirection;

  status: TradeStatus;

  createdAt: string;

  completedAt: string | null;
}

export interface TradeBalance {
  countryId: string;

  exports: number;

  imports: number;

  tradeBalance: number;

  tradeVolume: number;

  updatedAt: string;
}

export interface Tariff {
  id: string;

  countryId: string;

  partnerCountryId: string | null;

  itemId: string | null;

  rate: number;

  minimumValue: number | null;

  maximumValue: number | null;

  active: boolean;

  updatedAt: string;
}

function requirePlayer(
  options: TradeServiceOptions,
): PlayerId {
  const playerId = options.getPlayerId?.();

  if (!playerId) {
    throw new Error(
      "A logged-in player is required.",
    );
  }

  return playerId;
}

export class TradeService {
  private readonly options: TradeServiceOptions;

  constructor(
    options: TradeServiceOptions = {},
  ) {
    this.options = options;
  }

  public async getAgreements(
    countryId?: string,
  ): Promise<TradeAgreement[]> {
    return apiClient.get<TradeAgreement[]>(
      "/trade/agreements",
      {
        countryId,
      },
    );
  }

  public async getAgreement(
    agreementId: string,
  ): Promise<TradeAgreement> {
    return apiClient.get<TradeAgreement>(
      `/trade/agreements/${encodeURIComponent(
        agreementId,
      )}`,
    );
  }

  public async getOrders(
    countryId?: string,
    status?: TradeStatus,
  ): Promise<TradeOrder[]> {
    return apiClient.get<TradeOrder[]>(
      "/trade/orders",
      {
        countryId,
        status,
      },
    );
  }

  public async getOrder(
    orderId: string,
  ): Promise<TradeOrder> {
    return apiClient.get<TradeOrder>(
      `/trade/orders/${encodeURIComponent(
        orderId,
      )}`,
    );
  }

  public async createOrder(
    request: {
      sellerPlayerId?: PlayerId | null;

      exporterCountryId: string;

      importerCountryId: string;

      itemId: string;

      quantity: number;

      pricePerUnit: number;

      direction: TradeDirection;
    },
  ): Promise<TradeOrder> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.post<TradeOrder>(
      "/trade/orders",
      {
        playerId,
        request,
      },
    );
  }

  public async getMyOrders(): Promise<
    TradeOrder[]
  > {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.get<TradeOrder[]>(
      `/trade/orders/player/${encodeURIComponent(
        playerId,
      )}`,
    );
  }

  public async getBalance(
    countryId: string,
  ): Promise<TradeBalance> {
    return apiClient.get<TradeBalance>(
      `/trade/countries/${encodeURIComponent(
        countryId,
      )}/balance`,
    );
  }

  public async getTariffs(
    countryId: string,
  ): Promise<Tariff[]> {
    return apiClient.get<Tariff[]>(
      `/trade/countries/${encodeURIComponent(
        countryId,
      )}/tariffs`,
    );
  }
}

export const tradeService =
  new TradeService();