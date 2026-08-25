import { apiClient } from "./api";

export interface EnvironmentServiceOptions {
  getPlayerId?: () => string | null;
  getSessionId?: () => string | null;
}

export type EnvironmentalIssue =
  | "air_pollution"
  | "water_pollution"
  | "deforestation"
  | "drought"
  | "flooding"
  | "wildfire"
  | "extreme_heat"
  | "storm";

export interface EnvironmentalStats {
  countryId: string;

  airQualityIndex: number;

  carbonEmissions: number;

  waterQuality: number;

  forestCoverage: number;

  renewablePercentage: number;

  averageTemperature: number;

  environmentalHealth: number;

  updatedAt: string;
}

export interface PollutionSource {
  id: string;

  countryId: string;

  cityId: string | null;

  sourceType:
    | "factory"
    | "power_plant"
    | "vehicle"
    | "construction"
    | "household";

  emissionsPerDay: number;

  pollutionLevel: number;

  active: boolean;

  updatedAt: string;
}

export interface EnvironmentalEvent {
  id: string;

  countryId: string;

  cityId: string | null;

  type: EnvironmentalIssue;

  severity: number;

  affectedArea: number;

  description: string;

  startsAt: string;

  endsAt: string | null;

  active: boolean;
}

export interface ClimateRecord {
  countryId: string;

  date: string;

  temperature: number;

  precipitation: number;

  windSpeed: number;

  droughtIndex: number;

  stormRisk: number;

  wildfireRisk: number;
}

export class EnvironmentService {
  private readonly options: EnvironmentServiceOptions;

  constructor(
    options: EnvironmentServiceOptions = {},
  ) {
    this.options = options;
  }

  public async getStats(
    countryId: string,
  ): Promise<EnvironmentalStats> {
    return apiClient.get<EnvironmentalStats>(
      `/environment/countries/${encodeURIComponent(
        countryId,
      )}/stats`,
    );
  }

  public async getPollutionSources(
    countryId?: string,
    cityId?: string,
  ): Promise<PollutionSource[]> {
    return apiClient.get<PollutionSource[]>(
      "/environment/pollution",
      {
        countryId,
        cityId,
      },
    );
  }

  public async getEvents(
    countryId?: string,
    active?: boolean,
  ): Promise<EnvironmentalEvent[]> {
    return apiClient.get<EnvironmentalEvent[]>(
      "/environment/events",
      {
        countryId,
        active,
      },
    );
  }

  public async getClimate(
    countryId: string,
  ): Promise<ClimateRecord[]> {
    return apiClient.get<ClimateRecord[]>(
      `/environment/countries/${encodeURIComponent(
        countryId,
      )}/climate`,
    );
  }
}

export const environmentService =
  new EnvironmentService();