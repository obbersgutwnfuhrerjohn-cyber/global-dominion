import { apiClient } from "./api";

export interface EnergyServiceOptions {
  getPlayerId?: () => string | null;
  getSessionId?: () => string | null;
}

export type EnergySource =
  | "coal"
  | "gas"
  | "oil"
  | "nuclear"
  | "hydro"
  | "solar"
  | "wind"
  | "geothermal";

export type PowerPlantStatus =
  | "planned"
  | "construction"
  | "operational"
  | "offline"
  | "decommissioned";

export interface PowerPlant {
  id: string;

  name: string;

  countryId: string;

  cityId: string;

  source: EnergySource;

  capacityMw: number;

  currentOutputMw: number;

  efficiency: number;

  operatingCostPerMwh: number;

  carbonEmissionsPerMwh: number;

  status: PowerPlantStatus;

  ownerCompanyId: string | null;

  createdAt: string;

  updatedAt: string;
}

export interface EnergyGrid {
  id: string;

  countryId: string;

  totalCapacityMw: number;

  currentDemandMw: number;

  currentGenerationMw: number;

  reserveCapacityMw: number;

  gridStability: number;

  averagePricePerMwh: number;

  renewablePercentage: number;

  carbonIntensity: number;

  updatedAt: string;
}

export interface EnergyPrice {
  countryId: string;

  source: EnergySource;

  pricePerMwh: number;

  demandMw: number;

  supplyMw: number;

  recordedAt: string;
}

export interface EnergyStats {
  countryId: string;

  totalGenerationMwh: number;

  totalConsumptionMwh: number;

  renewableGenerationMwh: number;

  fossilGenerationMwh: number;

  nuclearGenerationMwh: number;

  averagePricePerMwh: number;

  gridStability: number;

  carbonEmissions: number;

  updatedAt: string;
}

export class EnergyService {
  private readonly options: EnergyServiceOptions;

  constructor(
    options: EnergyServiceOptions = {},
  ) {
    this.options = options;
  }

  public async getPlants(
    countryId?: string,
    cityId?: string,
    source?: EnergySource,
  ): Promise<PowerPlant[]> {
    return apiClient.get<PowerPlant[]>(
      "/energy/plants",
      {
        countryId,
        cityId,
        source,
      },
    );
  }

  public async getPlant(
    plantId: string,
  ): Promise<PowerPlant> {
    return apiClient.get<PowerPlant>(
      `/energy/plants/${encodeURIComponent(
        plantId,
      )}`,
    );
  }

  public async getGrid(
    countryId: string,
  ): Promise<EnergyGrid> {
    return apiClient.get<EnergyGrid>(
      `/energy/countries/${encodeURIComponent(
        countryId,
      )}/grid`,
    );
  }

  public async getPrices(
    countryId: string,
  ): Promise<EnergyPrice[]> {
    return apiClient.get<EnergyPrice[]>(
      `/energy/countries/${encodeURIComponent(
        countryId,
      )}/prices`,
    );
  }

  public async getStats(
    countryId: string,
  ): Promise<EnergyStats> {
    return apiClient.get<EnergyStats>(
      `/energy/countries/${encodeURIComponent(
        countryId,
      )}/stats`,
    );
  }
}

export const energyService =
  new EnergyService();