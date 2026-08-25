import { apiClient } from "./api";

import type {
  CountryId,
  PlayerId,
} from "../types/game";

export interface PlayersServiceOptions {
  getPlayerId?: () => PlayerId | null;
  getSessionId?: () => string | null;
}

export type PlayerStatus =
  | "active"
  | "away"
  | "offline"
  | "suspended"
  | "banned";

export type RelationshipStatus =
  | "none"
  | "pending_sent"
  | "pending_received"
  | "friends"
  | "blocked";

export interface PlayerProfile {
  id: PlayerId;

  username: string;

  displayName: string;

  profileImageUrl: string | null;

  biography: string;

  countryId: CountryId | null;

  cityId: string | null;

  status: PlayerStatus;

  level: number;

  experience: number;

  reputation: number;

  wealth: number;

  employmentId: string | null;

  companyId: string | null;

  createdAt: string;

  updatedAt: string;
}

export interface PublicPlayerProfile {
  id: PlayerId;

  username: string;

  displayName: string;

  profileImageUrl: string | null;

  biography: string;

  countryId: CountryId | null;

  cityId: string | null;

  level: number;

  experience: number;

  reputation: number;

  employmentTitle: string | null;

  companyName: string | null;

  createdAt: string;
}

export interface Friend {
  playerId: PlayerId;

  username: string;

  displayName: string;

  profileImageUrl: string | null;

  countryId: CountryId | null;

  level: number;

  status: PlayerStatus;

  friendshipCreatedAt: string;
}

export interface FriendRequest {
  id: string;

  senderPlayerId: PlayerId;

  receiverPlayerId: PlayerId;

  senderDisplayName: string;

  senderProfileImageUrl: string | null;

  status:
    | "pending"
    | "accepted"
    | "rejected"
    | "cancelled";

  createdAt: string;

  respondedAt: string | null;
}

export interface BlockedPlayer {
  playerId: PlayerId;

  username: string;

  displayName: string;

  blockedAt: string;
}

export interface PlayerCountryRepresentation {
  playerId: PlayerId;

  countryId: CountryId;

  role:
    | "citizen"
    | "mayor"
    | "governor"
    | "minister"
    | "president"
    | "prime_minister"
    | "monarch"
    | "elected_leader";

  displayImageUrl: string | null;

  displayName: string;

  termStart: string | null;

  termEnd: string | null;
}

function requirePlayer(
  options: PlayersServiceOptions,
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

export class PlayersService {
  private readonly options: PlayersServiceOptions;

  constructor(
    options: PlayersServiceOptions = {},
  ) {
    this.options = options;
  }

  public async getMyProfile(): Promise<
    PlayerProfile
  > {
    const playerId =
      requirePlayer(this.options);

    return apiClient.get<PlayerProfile>(
      `/players/${encodeURIComponent(
        playerId,
      )}`,
    );
  }

  public async getPublicProfile(
    playerId: PlayerId,
  ): Promise<PublicPlayerProfile> {
    return apiClient.get<PublicPlayerProfile>(
      `/players/${encodeURIComponent(
        playerId,
      )}/public`,
    );
  }

  public async updateProfile(
    changes: {
      displayName?: string;

      biography?: string;

      countryId?: CountryId | null;

      cityId?: string | null;
    },
  ): Promise<PlayerProfile> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.put<PlayerProfile>(
      `/players/${encodeURIComponent(
        playerId,
      )}`,
      {
        changes,
      },
    );
  }

  public async setProfileImage(
    imageUrl: string,
  ): Promise<PlayerProfile> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.put<PlayerProfile>(
      `/players/${encodeURIComponent(
        playerId,
      )}/profile-image`,
      {
        imageUrl,
      },
    );
  }

  public async removeProfileImage(): Promise<
    PlayerProfile
  > {
    const playerId =
      requirePlayer(this.options);

    return apiClient.delete<PlayerProfile>(
      `/players/${encodeURIComponent(
        playerId,
      )}/profile-image`,
    );
  }

  public async searchPlayers(
    query: string,
  ): Promise<PublicPlayerProfile[]> {
    return apiClient.get<PublicPlayerProfile[]>(
      "/players/search",
      {
        query,
      },
    );
  }

  public async sendFriendRequest(
    receiverPlayerId: PlayerId,
  ): Promise<FriendRequest> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.post<FriendRequest>(
      "/players/friends/requests",
      {
        senderPlayerId: playerId,

        receiverPlayerId,
      },
    );
  }

  public async acceptFriendRequest(
    requestId: string,
  ): Promise<Friend> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.post<Friend>(
      `/players/friends/requests/${encodeURIComponent(
        requestId,
      )}/accept`,
      {
        playerId,
      },
    );
  }

  public async rejectFriendRequest(
    requestId: string,
  ): Promise<void> {
    const playerId =
      requirePlayer(this.options);

    await apiClient.post(
      `/players/friends/requests/${encodeURIComponent(
        requestId,
      )}/reject`,
      {
        playerId,
      },
    );
  }

  public async cancelFriendRequest(
    requestId: string,
  ): Promise<void> {
    const playerId =
      requirePlayer(this.options);

    await apiClient.post(
      `/players/friends/requests/${encodeURIComponent(
        requestId,
      )}/cancel`,
      {
        playerId,
      },
    );
  }

  public async getFriendRequests(): Promise<
    FriendRequest[]
  > {
    const playerId =
      requirePlayer(this.options);

    return apiClient.get<FriendRequest[]>(
      `/players/${encodeURIComponent(
        playerId,
      )}/friend-requests`,
    );
  }

  public async getFriends(): Promise<Friend[]> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.get<Friend[]>(
      `/players/${encodeURIComponent(
        playerId,
      )}/friends`,
    );
  }

  public async removeFriend(
    friendPlayerId: PlayerId,
  ): Promise<void> {
    const playerId =
      requirePlayer(this.options);

    await apiClient.post(
      "/players/friends/remove",
      {
        playerId,

        friendPlayerId,
      },
    );
  }

  public async blockPlayer(
    targetPlayerId: PlayerId,
  ): Promise<void> {
    const playerId =
      requirePlayer(this.options);

    await apiClient.post(
      "/players/blocks",
      {
        playerId,

        targetPlayerId,
      },
    );
  }

  public async unblockPlayer(
    targetPlayerId: PlayerId,
  ): Promise<void> {
    const playerId =
      requirePlayer(this.options);

    await apiClient.post(
      "/players/blocks/remove",
      {
        playerId,

        targetPlayerId,
      },
    );
  }

  public async getBlockedPlayers(): Promise<
    BlockedPlayer[]
  > {
    const playerId =
      requirePlayer(this.options);

    return apiClient.get<BlockedPlayer[]>(
      `/players/${encodeURIComponent(
        playerId,
      )}/blocked`,
    );
  }

  public async getCountryRepresentatives(
    countryId: CountryId,
  ): Promise<PlayerCountryRepresentation[]> {
    return apiClient.get<
      PlayerCountryRepresentation[]
    >(
      `/players/countries/${encodeURIComponent(
        countryId,
      )}/representatives`,
    );
  }

  public async setCountryRepresentationImage(
    representationId: string,
    imageUrl: string,
  ): Promise<PlayerCountryRepresentation> {
    const playerId =
      requirePlayer(this.options);

    return apiClient.put<PlayerCountryRepresentation>(
      `/players/country-representations/${encodeURIComponent(
        representationId,
      )}/image`,
      {
        playerId,

        imageUrl,
      },
    );
  }
}

export const playersService =
  new PlayersService();