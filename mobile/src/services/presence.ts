import { apiClient } from "./api";

import type {
  PlayerId,
} from "../types/game";

export interface PresenceServiceOptions {
  getPlayerId?: () => PlayerId | null;
  getSessionId?: () => string | null;
}

export type PlayerActivity =
  | "idle"
  | "driving"
  | "walking"
  | "working"
  | "building"
  | "shopping"
  | "social"
  | "offline";

export interface PlayerPresence {
  playerId: PlayerId;

  username: string;

  displayName: string;

  profileImageUrl: string | null;

  online: boolean;

  activity: PlayerActivity;

  latitude: number | null;

  longitude: number | null;

  heading: number | null;

  speedKmh: number | null;

  vehicleId: string | null;

  vehicleMake: string | null;

  vehicleModel: string | null;

  lastSeenAt: string;
}

export interface PresenceUpdate {
  latitude: number;

  longitude: number;

  heading?: number | null;

  speedKmh?: number | null;

  activity?: PlayerActivity;

  vehicleId?: string | null;
}

export interface LivePlayerMarker {
  playerId: PlayerId;

  displayName: string;

  profileImageUrl: string | null;

  latitude: number;

  longitude: number;

  heading: number | null;

  activity: PlayerActivity;

  vehicleId: string | null;

  vehicleMake: string | null;

  vehicleModel: string | null;
}

function requirePlayer(
  options: PresenceServiceOptions,
): PlayerId {
  const playerId = options.getPlayerId?.();

  if (!playerId) {
    throw new Error(
      "A logged-in player is required.",
    );
  }

  return playerId;
}

export class PresenceService {
  private readonly options: PresenceServiceOptions;

  constructor(
    options: PresenceServiceOptions = {},
  ) {
    this.options = options;
  }

  public async setOnline(): Promise<void> {
    const playerId = requirePlayer(
      this.options,
    );

    await apiClient.post(
      "/presence/online",
      {
        playerId,
      },
    );
  }

  public async setOffline(): Promise<void> {
    const playerId = requirePlayer(
      this.options,
    );

    await apiClient.post(
      "/presence/offline",
      {
        playerId,
      },
    );
  }

  public async updateLocation(
    update: PresenceUpdate,
  ): Promise<void> {
    const playerId = requirePlayer(
      this.options,
    );

    await apiClient.put(
      `/presence/player/${encodeURIComponent(
        playerId,
      )}`,
      {
        playerId,

        update,
      },
    );
  }

  public async getPlayerPresence(
    playerId: PlayerId,
  ): Promise<PlayerPresence> {
    return apiClient.get<PlayerPresence>(
      `/presence/player/${encodeURIComponent(
        playerId,
      )}`,
    );
  }

  public async getOnlineFriends(): Promise<
    PlayerPresence[]
  > {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.get<PlayerPresence[]>(
      `/presence/player/${encodeURIComponent(
        playerId,
      )}/friends`,
    );
  }

  public async getNearbyPlayers(
    latitude: number,
    longitude: number,
    radiusKm = 5,
  ): Promise<LivePlayerMarker[]> {
    return apiClient.get<LivePlayerMarker[]>(
      "/presence/nearby",
      {
        latitude,
        longitude,
        radiusKm,
      },
    );
  }
}

export const presenceService =
  new PresenceService();