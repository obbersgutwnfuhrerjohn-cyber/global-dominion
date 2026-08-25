import { apiClient } from "./api";

import type { PlayerId } from "../types/game";

export interface CitiesServiceOptions {
  getPlayerId?: () => PlayerId | null;
  getSessionId?: () => string | null;
}

export interface City {
  id: string;

  name: string;

  countryId: string;

  regionId: string | null;

  population: number;

  populationGrowthRate: number;

  economicOutput: number;

  averageIncome: number;

  unemploymentRate: number;

  developmentLevel: number;

  infrastructureLevel: number;

  industrialLevel: number;

  commercialLevel: number;

  residentialLevel: number;

  educationLevel: number;

  healthcareLevel: number;

  qualityOfLife: number;

  active: boolean;

  createdAt: string;

  updatedAt: string;
}

export interface CityEconomy {
  cityId: string;

  cityName: string;

  population: number;

  laborForce: number;

  employedPopulation: number;

  unemploymentRate: number;

  averageIncome: number;

  totalProduction: number;

  totalConsumption: number;

  exports: number;

  imports: number;

  taxRevenue: number;

  companyCount: number;

  factoryCount: number;

  infrastructureValue: number;

  economicGrowthRate: number;

  updatedAt: string;
}

export interface CityResource {
  id: string;

  cityId: string;

  resourceId: string;

  resourceName: string;

  productionPerDay: number;

  localDemandPerDay: number;

  exportableAmount: number;

  price: number;

  currency: string;
}

export interface CityDevelopmentProject {
  id: string;

  cityId: string;

  ownerPlayerId: PlayerId | null;

  name: string;

  category:
    | "residential"
    | "commercial"
    | "industrial"
    | "education"
    | "healthcare"
    | "transport"
    | "utilities";

  progress: number;

  investmentRequired: number;

  investmentReceived: number;

  status:
    | "planned"
    | "funded"
    | "under_construction"
    | "completed"
    | "cancelled";

  createdAt: string;

  completedAt: string | null;
}

function requirePlayer(
  options: CitiesServiceOptions,
): PlayerId {
  const playerId = options.getPlayerId?.();

  if (!playerId) {
    throw new Error(
      "A logged-in player is required.",
    );
  }

  return playerId;
}

export class CitiesService {
  private readonly options: CitiesServiceOptions;

  constructor(
    options: CitiesServiceOptions = {},
  ) {
    this.options = options;
  }

  public async getCities(
    countryId?: string,
    regionId?: string,
  ): Promise<City[]> {
    return apiClient.get<City[]>(
      "/cities",
      {
        countryId,
        regionId,
      },
    );
  }

  public async getCity(
    cityId: string,
  ): Promise<City> {
    return apiClient.get<City>(
      `/cities/${encodeURIComponent(
        cityId,
      )}`,
    );
  }

  public async getEconomy(
    cityId: string,
  ): Promise<CityEconomy> {
    return apiClient.get<CityEconomy>(
      `/cities/${encodeURIComponent(
        cityId,
      )}/economy`,
    );
  }

  public async getResources(
    cityId: string,
  ): Promise<CityResource[]> {
    return apiClient.get<CityResource[]>(
      `/cities/${encodeURIComponent(
        cityId,
      )}/resources`,
    );
  }

  public async getDevelopmentProjects(
    cityId: string,
  ): Promise<CityDevelopmentProject[]> {
    return apiClient.get<
      CityDevelopmentProject[]
    >(
      `/cities/${encodeURIComponent(
        cityId,
      )}/development`,
    );
  }

  public async createDevelopmentProject(
    request: {
      cityId: string;

      name: string;

      category: CityDevelopmentProject["category"];

      investmentRequired: number;
    },
  ): Promise<CityDevelopmentProject> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.post<CityDevelopmentProject>(
      "/cities/development",
      {
        playerId,
        request,
      },
    );
  }

  public async investInDevelopment(
    projectId: string,
    amount: number,
  ): Promise<CityDevelopmentProject> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.post<CityDevelopmentProject>(
      `/cities/development/${encodeURIComponent(
        projectId,
      )}/invest`,
      {
        playerId,
        amount,
      },
    );
  }
}

export const citiesService =
  new CitiesService();