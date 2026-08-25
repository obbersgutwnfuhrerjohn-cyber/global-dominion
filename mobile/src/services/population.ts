import { apiClient } from "./api";

export interface PopulationServiceOptions {
  getPlayerId?: () => string | null;
  getSessionId?: () => string | null;
}

export interface PopulationStats {
  countryId: string;

  cityId: string | null;

  population: number;

  workingAgePopulation: number;

  employedPopulation: number;

  unemployedPopulation: number;

  students: number;

  retirees: number;

  birthRate: number;

  deathRate: number;

  migrationRate: number;

  averageAge: number;

  lifeExpectancy: number;

  populationGrowthRate: number;

  updatedAt: string;
}

export interface MigrationFlow {
  id: string;

  originCountryId: string;

  destinationCountryId: string;

  originCityId: string | null;

  destinationCityId: string | null;

  population: number;

  reason:
    | "employment"
    | "education"
    | "housing"
    | "healthcare"
    | "safety"
    | "family"
    | "quality_of_life";

  createdAt: string;
}

export interface PopulationForecast {
  countryId: string;

  year: number;

  projectedPopulation: number;

  projectedWorkingAgePopulation: number;

  projectedRetiredPopulation: number;

  projectedGrowthRate: number;
}

export class PopulationService {
  private readonly options: PopulationServiceOptions;

  constructor(
    options: PopulationServiceOptions = {},
  ) {
    this.options = options;
  }

  public async getCountryPopulation(
    countryId: string,
  ): Promise<PopulationStats> {
    return apiClient.get<PopulationStats>(
      `/population/countries/${encodeURIComponent(
        countryId,
      )}`,
    );
  }

  public async getCityPopulation(
    cityId: string,
  ): Promise<PopulationStats> {
    return apiClient.get<PopulationStats>(
      `/population/cities/${encodeURIComponent(
        cityId,
      )}`,
    );
  }

  public async getMigration(
    countryId?: string,
  ): Promise<MigrationFlow[]> {
    return apiClient.get<MigrationFlow[]>(
      "/population/migration",
      {
        countryId,
      },
    );
  }

  public async getForecast(
    countryId: string,
    years: number = 10,
  ): Promise<PopulationForecast[]> {
    return apiClient.get<PopulationForecast[]>(
      `/population/countries/${encodeURIComponent(
        countryId,
      )}/forecast`,
      {
        years,
      },
    );
  }
}

export const populationService =
  new PopulationService();