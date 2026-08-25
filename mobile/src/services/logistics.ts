import { apiClient } from "./api";

import type { PlayerId } from "../types/game";

export interface LogisticsServiceOptions {
  getPlayerId?: () => PlayerId | null;
  getSessionId?: () => string | null;
}

export type TransportMode =
  | "road"
  | "rail"
  | "sea"
  | "air";

export type ShipmentStatus =
  | "planned"
  | "in_transit"
  | "delivered"
  | "delayed"
  | "cancelled";

export interface TransportRoute {
  id: string;

  originCountryId: string;

  originCityId: string;

  destinationCountryId: string;

  destinationCityId: string;

  mode: TransportMode;

  distanceKm: number;

  capacity: number;

  averageSpeedKmh: number;

  costPerUnit: number;

  reliability: number;

  active: boolean;

  createdAt: string;

  updatedAt: string;
}

export interface Shipment {
  id: string;

  ownerPlayerId: PlayerId;

  originCityId: string;

  destinationCityId: string;

  routeId: string;

  itemId: string;

  quantity: number;

  transportMode: TransportMode;

  shippingCost: number;

  status: ShipmentStatus;

  departureAt: string;

  estimatedArrivalAt: string;

  deliveredAt: string | null;

  createdAt: string;
}

export interface LogisticsHub {
  id: string;

  name: string;

  countryId: string;

  cityId: string;

  type:
    | "port"
    | "airport"
    | "rail_terminal"
    | "warehouse"
    | "distribution_center";

  capacity: number;

  utilization: number;

  efficiency: number;

  active: boolean;

  createdAt: string;
}

export interface LogisticsStats {
  countryId: string;

  totalShipments: number;

  activeShipments: number;

  deliveredShipments: number;

  delayedShipments: number;

  totalCargo: number;

  averageDeliveryTimeHours: number;

  averageShippingCost: number;

  networkEfficiency: number;

  updatedAt: string;
}

function requirePlayer(
  options: LogisticsServiceOptions,
): PlayerId {
  const playerId = options.getPlayerId?.();

  if (!playerId) {
    throw new Error(
      "A logged-in player is required.",
    );
  }

  return playerId;
}

export class LogisticsService {
  private readonly options: LogisticsServiceOptions;

  constructor(
    options: LogisticsServiceOptions = {},
  ) {
    this.options = options;
  }

  public async getRoutes(
    originCityId?: string,
    destinationCityId?: string,
    mode?: TransportMode,
  ): Promise<TransportRoute[]> {
    return apiClient.get<TransportRoute[]>(
      "/logistics/routes",
      {
        originCityId,
        destinationCityId,
        mode,
      },
    );
  }

  public async getRoute(
    routeId: string,
  ): Promise<TransportRoute> {
    return apiClient.get<TransportRoute>(
      `/logistics/routes/${encodeURIComponent(
        routeId,
      )}`,
    );
  }

  public async getHubs(
    countryId?: string,
    cityId?: string,
  ): Promise<LogisticsHub[]> {
    return apiClient.get<LogisticsHub[]>(
      "/logistics/hubs",
      {
        countryId,
        cityId,
      },
    );
  }

  public async createShipment(
    request: {
      originCityId: string;

      destinationCityId: string;

      routeId: string;

      itemId: string;

      quantity: number;
    },
  ): Promise<Shipment> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.post<Shipment>(
      "/logistics/shipments",
      {
        playerId,
        request,
      },
    );
  }

  public async getMyShipments(): Promise<
    Shipment[]
  > {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.get<Shipment[]>(
      `/logistics/shipments/player/${encodeURIComponent(
        playerId,
      )}`,
    );
  }

  public async getShipment(
    shipmentId: string,
  ): Promise<Shipment> {
    return apiClient.get<Shipment>(
      `/logistics/shipments/${encodeURIComponent(
        shipmentId,
      )}`,
    );
  }

  public async getStats(
    countryId: string,
  ): Promise<LogisticsStats> {
    return apiClient.get<LogisticsStats>(
      `/logistics/countries/${encodeURIComponent(
        countryId,
      )}/stats`,
    );
  }
}

export const logisticsService =
  new LogisticsService();