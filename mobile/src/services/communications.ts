import { apiClient } from "./api";

export interface CommunicationsServiceOptions {
  getPlayerId?: () => string | null;
  getSessionId?: () => string | null;
}

export type NetworkType =
  | "fiber"
  | "mobile"
  | "satellite"
  | "fixed_wireless";

export interface CommunicationNetwork {
  id: string;

  countryId: string;

  cityId: string | null;

  name: string;

  type: NetworkType;

  coverage: number;

  capacityGbps: number;

  currentUsageGbps: number;

  latencyMs: number;

  reliability: number;

  pricePerGb: number;

  active: boolean;

  createdAt: string;

  updatedAt: string;
}

export interface InternetStats {
  countryId: string;

  populationCoverage: number;

  averageSpeedMbps: number;

  averageLatencyMs: number;

  networkCapacityGbps: number;

  networkUsageGbps: number;

  internetPenetration: number;

  reliability: number;

  updatedAt: string;
}

export interface CommunicationsEvent {
  id: string;

  countryId: string;

  cityId: string | null;

  networkId: string | null;

  type:
    | "outage"
    | "congestion"
    | "upgrade"
    | "expansion";

  severity: number;

  description: string;

  startsAt: string;

  endsAt: string | null;

  active: boolean;
}

export class CommunicationsService {
  private readonly options: CommunicationsServiceOptions;

  constructor(
    options: CommunicationsServiceOptions = {},
  ) {
    this.options = options;
  }

  public async getNetworks(
    countryId?: string,
    cityId?: string,
    type?: NetworkType,
  ): Promise<CommunicationNetwork[]> {
    return apiClient.get<CommunicationNetwork[]>(
      "/communications/networks",
      {
        countryId,
        cityId,
        type,
      },
    );
  }

  public async getNetwork(
    networkId: string,
  ): Promise<CommunicationNetwork> {
    return apiClient.get<CommunicationNetwork>(
      `/communications/networks/${encodeURIComponent(
        networkId,
      )}`,
    );
  }

  public async getStats(
    countryId: string,
  ): Promise<InternetStats> {
    return apiClient.get<InternetStats>(
      `/communications/countries/${encodeURIComponent(
        countryId,
      )}/stats`,
    );
  }

  public async getEvents(
    countryId?: string,
    active?: boolean,
  ): Promise<CommunicationsEvent[]> {
    return apiClient.get<CommunicationsEvent[]>(
      "/communications/events",
      {
        countryId,
        active,
      },
    );
  }
}

export const communicationsService =
  new CommunicationsService();