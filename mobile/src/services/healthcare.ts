import { apiClient } from "./api";

import type { PlayerId } from "../types/game";

export interface HealthcareServiceOptions {
  getPlayerId?: () => PlayerId | null;
  getSessionId?: () => string | null;
}

export type HealthcareFacilityType =
  | "clinic"
  | "hospital"
  | "specialist"
  | "pharmacy"
  | "research";

export interface HealthcareFacility {
  id: string;

  name: string;

  countryId: string;

  cityId: string;

  type: HealthcareFacilityType;

  capacity: number;

  patientsPerDay: number;

  quality: number;

  equipmentLevel: number;

  staffCount: number;

  funding: number;

  operatingCostPerDay: number;

  active: boolean;

  createdAt: string;

  updatedAt: string;
}

export interface HealthRecord {
  id: string;

  playerId: PlayerId;

  healthScore: number;

  lifeExpectancy: number;

  lastCheckupAt: string | null;

  updatedAt: string;
}

export interface MedicalTreatment {
  id: string;

  playerId: PlayerId;

  facilityId: string;

  treatmentType: string;

  cost: number;

  coveredAmount: number;

  playerPayment: number;

  currency: string;

  status:
    | "scheduled"
    | "active"
    | "completed"
    | "cancelled";

  createdAt: string;

  completedAt: string | null;
}

export interface HealthcareStats {
  countryId: string;

  hospitalCapacity: number;

  healthcareDemand: number;

  averageQuality: number;

  doctorPerThousandPeople: number;

  healthcareSpending: number;

  averageLifeExpectancy: number;

  publicCoverage: number;

  privateCoverage: number;

  updatedAt: string;
}

function requirePlayer(
  options: HealthcareServiceOptions,
): PlayerId {
  const playerId = options.getPlayerId?.();

  if (!playerId) {
    throw new Error(
      "A logged-in player is required.",
    );
  }

  return playerId;
}

export class HealthcareService {
  private readonly options: HealthcareServiceOptions;

  constructor(
    options: HealthcareServiceOptions = {},
  ) {
    this.options = options;
  }

  public async getFacilities(
    countryId?: string,
    cityId?: string,
    type?: HealthcareFacilityType,
  ): Promise<HealthcareFacility[]> {
    return apiClient.get<HealthcareFacility[]>(
      "/healthcare/facilities",
      {
        countryId,
        cityId,
        type,
      },
    );
  }

  public async getFacility(
    facilityId: string,
  ): Promise<HealthcareFacility> {
    return apiClient.get<HealthcareFacility>(
      `/healthcare/facilities/${encodeURIComponent(
        facilityId,
      )}`,
    );
  }

  public async getMyHealth(): Promise<HealthRecord> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.get<HealthRecord>(
      `/healthcare/players/${encodeURIComponent(
        playerId,
      )}/health`,
    );
  }

  public async scheduleTreatment(
    request: {
      facilityId: string;

      treatmentType: string;
    },
  ): Promise<MedicalTreatment> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.post<MedicalTreatment>(
      "/healthcare/treatments",
      {
        playerId,
        request,
      },
    );
  }

  public async getMyTreatments(): Promise<
    MedicalTreatment[]
  > {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.get<MedicalTreatment[]>(
      `/healthcare/players/${encodeURIComponent(
        playerId,
      )}/treatments`,
    );
  }

  public async getCountryStats(
    countryId: string,
  ): Promise<HealthcareStats> {
    return apiClient.get<HealthcareStats>(
      `/healthcare/countries/${encodeURIComponent(
        countryId,
      )}/stats`,
    );
  }
}

export const healthcareService =
  new HealthcareService();