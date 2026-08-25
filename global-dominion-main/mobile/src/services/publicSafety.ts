import { apiClient } from "./api";

import type { PlayerId } from "../types/game";

export interface PublicSafetyServiceOptions {
  getPlayerId?: () => PlayerId | null;
  getSessionId?: () => string | null;
}

export type EmergencyServiceType =
  | "police"
  | "fire"
  | "ambulance"
  | "rescue";

export type IncidentType =
  | "theft"
  | "assault"
  | "vandalism"
  | "traffic_accident"
  | "fire"
  | "medical"
  | "natural_disaster"
  | "industrial_accident";

export type IncidentStatus =
  | "reported"
  | "responding"
  | "active"
  | "resolved"
  | "closed";

export interface EmergencyService {
  id: string;

  countryId: string;

  cityId: string;

  type: EmergencyServiceType;

  name: string;

  personnel: number;

  vehicles: number;

  equipmentLevel: number;

  responseTimeMinutes: number;

  coverage: number;

  funding: number;

  active: boolean;

  createdAt: string;

  updatedAt: string;
}

export interface Incident {
  id: string;

  countryId: string;

  cityId: string;

  type: IncidentType;

  severity: number;

  latitude: number;

  longitude: number;

  description: string;

  status: IncidentStatus;

  reportedByPlayerId: PlayerId | null;

  assignedServiceId: string | null;

  responseTimeMinutes: number | null;

  reportedAt: string;

  resolvedAt: string | null;
}

export interface SafetyStats {
  countryId: string;

  cityId: string | null;

  crimeRate: number;

  accidentRate: number;

  emergencyResponseScore: number;

  policeCoverage: number;

  fireCoverage: number;

  medicalCoverage: number;

  publicSafetyScore: number;

  updatedAt: string;
}

function requirePlayer(
  options: PublicSafetyServiceOptions,
): PlayerId {
  const playerId = options.getPlayerId?.();

  if (!playerId) {
    throw new Error(
      "A logged-in player is required.",
    );
  }

  return playerId;
}

export class PublicSafetyService {
  private readonly options: PublicSafetyServiceOptions;

  constructor(
    options: PublicSafetyServiceOptions = {},
  ) {
    this.options = options;
  }

  public async getServices(
    countryId?: string,
    cityId?: string,
    type?: EmergencyServiceType,
  ): Promise<EmergencyService[]> {
    return apiClient.get<EmergencyService[]>(
      "/public-safety/services",
      {
        countryId,
        cityId,
        type,
      },
    );
  }

  public async getIncidents(
    countryId?: string,
    cityId?: string,
    status?: IncidentStatus,
  ): Promise<Incident[]> {
    return apiClient.get<Incident[]>(
      "/public-safety/incidents",
      {
        countryId,
        cityId,
        status,
      },
    );
  }

  public async reportIncident(
    request: {
      countryId: string;

      cityId: string;

      type: IncidentType;

      severity: number;

      latitude: number;

      longitude: number;

      description: string;
    },
  ): Promise<Incident> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.post<Incident>(
      "/public-safety/incidents",
      {
        playerId,
        request,
      },
    );
  }

  public async getIncident(
    incidentId: string,
  ): Promise<Incident> {
    return apiClient.get<Incident>(
      `/public-safety/incidents/${encodeURIComponent(
        incidentId,
      )}`,
    );
  }

  public async getStats(
    countryId: string,
    cityId?: string,
  ): Promise<SafetyStats> {
    return apiClient.get<SafetyStats>(
      "/public-safety/stats",
      {
        countryId,
        cityId,
      },
    );
  }

  public async getMyReports(): Promise<
    Incident[]
  > {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.get<Incident[]>(
      `/public-safety/incidents/player/${encodeURIComponent(
        playerId,
      )}`,
    );
  }
}

export const publicSafetyService =
  new PublicSafetyService();