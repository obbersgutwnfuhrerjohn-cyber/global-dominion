import { apiClient } from "./api";

import type {
  CountryId,
  PlayerId,
} from "../types/game";

import type {
  WorldMapState,
  MapViewport,
  MapLayerState,
  MapSelection,
} from "../types/world";

import type {
  WorldEventFeed,
} from "../types/events";

import type {
  ApiRequestContext,
} from "../types/api";

export interface WorldServiceOptions {
  getPlayerId?: () => PlayerId | null;

  getSessionId?: () => string | null;

  getDeviceId?: () => string | null;
}

export interface CountrySummary {
  id: CountryId;

  name: string;

  population: number;

  capital: string;

  gdp: number;

  militaryPower: number;

  activeWars: number;

  playerCount: number;
}

export interface CountrySelectionResult {
  success: boolean;

  countryId: CountryId;

  citizenshipId: string | null;

  message: string;
}

export interface WorldSubscriptionState {
  subscribed: boolean;

  viewport: MapViewport | null;

  layers: MapLayerState;

  selected: MapSelection;

  updatedAt: string;
}

function createContext(
  options: WorldServiceOptions,
): ApiRequestContext {
  return {
    requestId: `world-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}`,

    clientVersion: "0.1.0",

    platform: "android",

    locale: "en-US",

    timezone: "UTC",

    deviceId:
      options.getDeviceId?.() ?? null,

    sessionId:
      options.getSessionId?.() ?? null,
  };
}

export class WorldService {
  private readonly options: WorldServiceOptions;

  constructor(
    options: WorldServiceOptions = {},
  ) {
    this.options = options;
  }

  public async getWorldState(): Promise<WorldMapState> {
    return apiClient.get<WorldMapState>(
      "/world/state",
    );
  }

  public async getCountry(
    countryId: CountryId,
  ): Promise<unknown> {
    return apiClient.get(
      `/world/countries/${encodeURIComponent(
        countryId,
      )}`,
    );
  }

  public async getCountries(): Promise<
    CountrySummary[]
  > {
    return apiClient.get<CountrySummary[]>(
      "/world/countries",
    );
  }

  public async getWorldEvents(
    cursor?: string,
    limit = 100,
  ): Promise<WorldEventFeed> {
    const params = new URLSearchParams();

    params.set(
      "limit",
      String(Math.min(Math.max(limit, 1), 100)),
    );

    if (cursor) {
      params.set("cursor", cursor);
    }

    return apiClient.get<WorldEventFeed>(
      `/world/events?${params.toString()}`,
    );
  }

  public async selectCountry(
    countryId: CountryId,
  ): Promise<CountrySelectionResult> {
    const playerId =
      this.options.getPlayerId?.();

    if (!playerId) {
      throw new Error(
        "A logged-in player is required to select a country.",
      );
    }

    const context = createContext(
      this.options,
    );

    return apiClient.post<CountrySelectionResult>(
      "/world/country-selection",
      {
        context,

        playerId,

        countryId,
      },
    );
  }

  public async updateMapSubscription(
    viewport: MapViewport,
    layers: MapLayerState,
    selected: MapSelection,
  ): Promise<WorldSubscriptionState> {
    const playerId =
      this.options.getPlayerId?.();

    if (!playerId) {
      throw new Error(
        "A logged-in player is required for a world subscription.",
      );
    }

    const context = createContext(
      this.options,
    );

    return apiClient.post<WorldSubscriptionState>(
      "/world/subscription",
      {
        context,

        playerId,

        viewport,

        layers,

        selected,
      },
    );
  }

  public async getServerHeartbeat(): Promise<{
    serverTime: string;

    worldTick: number;

    simulationTick: number;

    activePlayers: number;

    activeWars: number;

    activeBattles: number;

    activeCountries: number;

    connected: boolean;
  }> {
    return apiClient.get(
      "/world/heartbeat",
    );
  }
}

export const worldService =
  new WorldService();