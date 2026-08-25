import { apiClient } from "./api";

import type { PlayerId } from "../types/game";

export interface WorldEventsServiceOptions {
  getPlayerId?: () => PlayerId | null;
  getSessionId?: () => string | null;
}

export type WorldEventType =
  | "economic_boom"
  | "recession"
  | "natural_disaster"
  | "resource_shortage"
  | "epidemic"
  | "infrastructure_failure"
  | "political_crisis"
  | "trade_disruption"
  | "energy_shortage"
  | "market_crash"
  | "technology_breakthrough";

export type WorldEventSeverity =
  | "minor"
  | "moderate"
  | "major"
  | "critical";

export type WorldEventStatus =
  | "scheduled"
  | "active"
  | "resolved"
  | "cancelled";

export interface WorldEvent {
  id: string;

  name: string;

  description: string;

  type: WorldEventType;

  severity: WorldEventSeverity;

  status: WorldEventStatus;

  countryIds: string[];

  cityIds: string[];

  affectedIndustryIds: string[];

  economicImpact: number;

  populationImpact: number;

  infrastructureImpact: number;

  marketImpact: number;

  startAt: string;

  endAt: string | null;

  createdAt: string;

  updatedAt: string;
}

export interface WorldEventEffect {
  id: string;

  eventId: string;

  targetType:
    | "country"
    | "city"
    | "industry"
    | "market"
    | "infrastructure";

  targetId: string;

  modifier: number;

  description: string;

  active: boolean;
}

export interface WorldEventHistory {
  id: string;

  eventId: string;

  eventName: string;

  type: WorldEventType;

  severity: WorldEventSeverity;

  affectedCountries: number;

  affectedCities: number;

  economicImpact: number;

  populationImpact: number;

  startAt: string;

  endAt: string | null;
}

function requirePlayer(
  options: WorldEventsServiceOptions,
): PlayerId {
  const playerId = options.getPlayerId?.();

  if (!playerId) {
    throw new Error(
      "A logged-in player is required.",
    );
  }

  return playerId;
}

export class WorldEventsService {
  private readonly options: WorldEventsServiceOptions;

  constructor(
    options: WorldEventsServiceOptions = {},
  ) {
    this.options = options;
  }

  public async getActiveEvents(
    countryId?: string,
    cityId?: string,
  ): Promise<WorldEvent[]> {
    return apiClient.get<WorldEvent[]>(
      "/world-events/active",
      {
        countryId,
        cityId,
      },
    );
  }

  public async getUpcomingEvents(
    countryId?: string,
  ): Promise<WorldEvent[]> {
    return apiClient.get<WorldEvent[]>(
      "/world-events/upcoming",
      {
        countryId,
      },
    );
  }

  public async getEvent(
    eventId: string,
  ): Promise<WorldEvent> {
    return apiClient.get<WorldEvent>(
      `/world-events/${encodeURIComponent(
        eventId,
      )}`,
    );
  }

  public async getEventEffects(
    eventId: string,
  ): Promise<WorldEventEffect[]> {
    return apiClient.get<WorldEventEffect[]>(
      `/world-events/${encodeURIComponent(
        eventId,
      )}/effects`,
    );
  }

  public async getHistory(
    countryId?: string,
  ): Promise<WorldEventHistory[]> {
    return apiClient.get<WorldEventHistory[]>(
      "/world-events/history",
      {
        countryId,
      },
    );
  }

  public async createEvent(
    request: {
      name: string;

      description: string;

      type: WorldEventType;

      severity: WorldEventSeverity;

      countryIds?: string[];

      cityIds?: string[];

      affectedIndustryIds?: string[];

      durationHours?: number;
    },
  ): Promise<WorldEvent> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.post<WorldEvent>(
      "/world-events",
      {
        playerId,
        request,
      },
    );
  }

  public async resolveEvent(
    eventId: string,
  ): Promise<WorldEvent> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.post<WorldEvent>(
      `/world-events/${encodeURIComponent(
        eventId,
      )}/resolve`,
      {
        playerId,
      },
    );
  }

  public async cancelEvent(
    eventId: string,
  ): Promise<WorldEvent> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.post<WorldEvent>(
      `/world-events/${encodeURIComponent(
        eventId,
      )}/cancel`,
      {
        playerId,
      },
    );
  }
}

export const worldEventsService =
  new WorldEventsService();