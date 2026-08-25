import { apiClient } from "./api";

import type {
  PlayerId,
} from "../types/game";

export interface VehiclesServiceOptions {
  getPlayerId?: () => PlayerId | null;
  getSessionId?: () => string | null;
}

export type VehicleStatus =
  | "active"
  | "stored"
  | "sold"
  | "retired";

export interface PlayerVehicle {
  id: string;

  ownerPlayerId: PlayerId;

  vin: string;

  make: string;

  model: string;

  year: number;

  trim: string | null;

  color: string | null;

  status: VehicleStatus;

  mileageKm: number;

  fuelLevel: number;

  condition: number;

  latitude: number | null;

  longitude: number | null;

  createdAt: string;

  updatedAt: string;
}

export interface VehicleTrip {
  id: string;

  vehicleId: string;

  playerId: PlayerId;

  distanceKm: number;

  durationSeconds: number;

  averageSpeedKmh: number;

  maxSpeedKmh: number;

  startedAt: string;

  endedAt: string;

  startLatitude: number | null;

  startLongitude: number | null;

  endLatitude: number | null;

  endLongitude: number | null;
}

function requirePlayer(
  options: VehiclesServiceOptions,
): PlayerId {
  const playerId =
    options.getPlayerId?.();

  if (!playerId) {
    throw new Error(
      "A logged-in player is required.",
    );
  }

  return playerId;
}

export class VehiclesService {
  private readonly options: VehiclesServiceOptions;

  constructor(
    options: VehiclesServiceOptions = {},
  ) {
    this.options = options;
  }

  public async getMyVehicles(): Promise<
    PlayerVehicle[]
  > {
    const playerId =
      requirePlayer(this.options);

    return apiClient.get<PlayerVehicle[]>(
      `/vehicles/player/${encodeURIComponent(
        playerId,
      )}`,
    );
  }

  public async getVehicle(
    vehicleId: string,
  ): Promise<PlayerVehicle> {
    return apiClient.get<PlayerVehicle>(
      `/vehicles/${encodeURIComponent(
        vehicleId,
      )}`,
    );
  }

  public async addVehicle(
    request: {
      vin: string;

      color?: string | null;
    },
  ): Promise<PlayerVehicle> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.post<PlayerVehicle>(
      "/vehicles",
      {
        playerId,

        request,
      },
    );
  }

  public async updateVehicle(
    vehicleId: string,
    changes: {
      color?: string | null;
    },
  ): Promise<PlayerVehicle> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.put<PlayerVehicle>(
      `/vehicles/${encodeURIComponent(
        vehicleId,
      )}`,
      {
        playerId,

        changes,
      },
    );
  }

  public async setActiveVehicle(
    vehicleId: string,
  ): Promise<PlayerVehicle> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.post<PlayerVehicle>(
      `/vehicles/${encodeURIComponent(
        vehicleId,
      )}/activate`,
      {
        playerId,
      },
    );
  }

  public async storeVehicle(
    vehicleId: string,
  ): Promise<PlayerVehicle> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.post<PlayerVehicle>(
      `/vehicles/${encodeURIComponent(
        vehicleId,
      )}/store`,
      {
        playerId,
      },
    );
  }

  public async retireVehicle(
    vehicleId: string,
  ): Promise<PlayerVehicle> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.post<PlayerVehicle>(
      `/vehicles/${encodeURIComponent(
        vehicleId,
      )}/retire`,
      {
        playerId,
      },
    );
  }

  public async getTrips(
    vehicleId: string,
  ): Promise<VehicleTrip[]> {
    return apiClient.get<VehicleTrip[]>(
      `/vehicles/${encodeURIComponent(
        vehicleId,
      )}/trips`,
    );
  }

  public async updateVehicleLocation(
    vehicleId: string,
    location: {
      latitude: number;

      longitude: number;
    },
  ): Promise<PlayerVehicle> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.put<PlayerVehicle>(
      `/vehicles/${encodeURIComponent(
        vehicleId,
      )}/location`,
      {
        playerId,

        location,
      },
    );
  }
}

export const vehiclesService =
  new VehiclesService();