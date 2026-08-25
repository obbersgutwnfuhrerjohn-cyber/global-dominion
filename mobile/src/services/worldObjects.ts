import { apiClient } from "./api";

import type {
  CountryId,
  PlayerId,
} from "../types/game";

export interface WorldObjectsServiceOptions {
  getPlayerId?: () => PlayerId | null;
  getSessionId?: () => string | null;
}

export type WorldObjectType =
  | "building"
  | "factory"
  | "warehouse"
  | "company"
  | "shop"
  | "farm"
  | "hospital"
  | "school"
  | "university"
  | "research_center"
  | "airport"
  | "port"
  | "rail_station"
  | "government"
  | "landmark"
  | "event"
  | "custom";

export interface WorldObject {
  id: string;

  type: WorldObjectType;

  ownerPlayerId: PlayerId | null;

  countryId: CountryId | null;

  cityId: string | null;

  name: string;

  description: string;

  latitude: number;

  longitude: number;

  altitude: number | null;

  rotation: number;

  scale: number;

  modelId: string | null;

  iconId: string | null;

  interactive: boolean;

  active: boolean;

  createdAt: string;

  updatedAt: string;
}

export interface WorldObjectMarker {
  id: string;

  type: WorldObjectType;

  name: string;

  latitude: number;

  longitude: number;

  iconId: string | null;

  ownerPlayerId: PlayerId | null;

  interactive: boolean;
}

export interface WorldObjectSearch {
  type?: WorldObjectType;

  countryId?: CountryId;

  cityId?: string;

  ownerPlayerId?: PlayerId;

  latitude?: number;

  longitude?: number;

  radiusKm?: number;
}

function requirePlayer(
  options: WorldObjectsServiceOptions,
): PlayerId {
  const playerId = options.getPlayerId?.();

  if (!playerId) {
    throw new Error(
      "A logged-in player is required.",
    );
  }

  return playerId;
}

export class WorldObjectsService {
  private readonly options: WorldObjectsServiceOptions;

  constructor(
    options: WorldObjectsServiceOptions = {},
  ) {
    this.options = options;
  }

  public async getNearbyObjects(
    latitude: number,
    longitude: number,
    radiusKm = 5,
    type?: WorldObjectType,
  ): Promise<WorldObjectMarker[]> {
    return apiClient.get<WorldObjectMarker[]>(
      "/world/objects/nearby",
      {
        latitude,
        longitude,
        radiusKm,
        type,
      },
    );
  }

  public async searchObjects(
    filters: WorldObjectSearch,
  ): Promise<WorldObjectMarker[]> {
    return apiClient.get<WorldObjectMarker[]>(
      "/world/objects/search",
      filters,
    );
  }

  public async getObject(
    objectId: string,
  ): Promise<WorldObject> {
    return apiClient.get<WorldObject>(
      `/world/objects/${encodeURIComponent(
        objectId,
      )}`,
    );
  }

  public async createObject(
    request: {
      type: WorldObjectType;

      countryId?: CountryId | null;

      cityId?: string | null;

      name: string;

      description?: string;

      latitude: number;

      longitude: number;

      modelId?: string | null;

      iconId?: string | null;
    },
  ): Promise<WorldObject> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.post<WorldObject>(
      "/world/objects",
      {
        playerId,

        request,
      },
    );
  }

  public async updateObject(
    objectId: string,
    changes: {
      name?: string;

      description?: string;

      rotation?: number;

      scale?: number;
    },
  ): Promise<WorldObject> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.put<WorldObject>(
      `/world/objects/${encodeURIComponent(
        objectId,
      )}`,
      {
        playerId,

        changes,
      },
    );
  }

  public async deleteObject(
    objectId: string,
  ): Promise<void> {
    const playerId = requirePlayer(
      this.options,
    );

    await apiClient.delete(
      `/world/objects/${encodeURIComponent(
        objectId,
      )}`,
      {
        playerId,
      },
    );
  }

  public async getMyObjects(): Promise<
    WorldObject[]
  > {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.get<WorldObject[]>(
      `/world/objects/player/${encodeURIComponent(
        playerId,
      )}`,
    );
  }

  public async activateObject(
    objectId: string,
  ): Promise<WorldObject> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.post<WorldObject>(
      `/world/objects/${encodeURIComponent(
        objectId,
      )}/activate`,
      {
        playerId,
      },
    );
  }

  public async deactivateObject(
    objectId: string,
  ): Promise<WorldObject> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.post<WorldObject>(
      `/world/objects/${encodeURIComponent(
        objectId,
      )}/deactivate`,
      {
        playerId,
      },
    );
  }
}

export const worldObjectsService =
  new WorldObjectsService();