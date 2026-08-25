import { apiClient } from "./api";

import type {
  PlayerId,
} from "../types/game";

export interface FriendsServiceOptions {
  getPlayerId?: () => PlayerId | null;
  getSessionId?: () => string | null;
}

export type FriendRequestStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "cancelled";

export interface Friend {
  playerId: PlayerId;

  username: string;

  displayName: string;

  profileImageUrl: string | null;

  countryId: string | null;

  countryName: string | null;

  level: number;

  online: boolean;

  lastSeenAt: string | null;

  addedAt: string;
}

export interface FriendRequest {
  id: string;

  fromPlayerId: PlayerId;

  fromUsername: string;

  fromDisplayName: string;

  fromProfileImageUrl: string | null;

  toPlayerId: PlayerId;

  status: FriendRequestStatus;

  createdAt: string;

  updatedAt: string;
}

export interface FriendSearchResult {
  playerId: PlayerId;

  username: string;

  displayName: string;

  profileImageUrl: string | null;

  countryName: string | null;

  level: number;

  friendshipStatus:
    | "none"
    | "friend"
    | "outgoing"
    | "incoming";
}

function requirePlayer(
  options: FriendsServiceOptions,
): PlayerId {
  const playerId = options.getPlayerId?.();

  if (!playerId) {
    throw new Error(
      "A logged-in player is required.",
    );
  }

  return playerId;
}

export class FriendsService {
  private readonly options: FriendsServiceOptions;

  constructor(
    options: FriendsServiceOptions = {},
  ) {
    this.options = options;
  }

  public async getFriends(): Promise<Friend[]> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.get<Friend[]>(
      `/friends/player/${encodeURIComponent(
        playerId,
      )}`,
    );
  }

  public async searchPlayers(
    query: string,
  ): Promise<FriendSearchResult[]> {
    return apiClient.get<FriendSearchResult[]>(
      "/friends/search",
      {
        query,
      },
    );
  }

  public async sendRequest(
    toPlayerId: PlayerId,
  ): Promise<FriendRequest> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.post<FriendRequest>(
      "/friends/requests",
      {
        fromPlayerId: playerId,

        toPlayerId,
      },
    );
  }

  public async getIncomingRequests(): Promise<
    FriendRequest[]
  > {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.get<FriendRequest[]>(
      `/friends/requests/incoming/${encodeURIComponent(
        playerId,
      )}`,
    );
  }

  public async getOutgoingRequests(): Promise<
    FriendRequest[]
  > {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.get<FriendRequest[]>(
      `/friends/requests/outgoing/${encodeURIComponent(
        playerId,
      )}`,
    );
  }

  public async acceptRequest(
    requestId: string,
  ): Promise<Friend> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.post<Friend>(
      `/friends/requests/${encodeURIComponent(
        requestId,
      )}/accept`,
      {
        playerId,
      },
    );
  }

  public async declineRequest(
    requestId: string,
  ): Promise<void> {
    const playerId = requirePlayer(
      this.options,
    );

    await apiClient.post(
      `/friends/requests/${encodeURIComponent(
        requestId,
      )}/decline`,
      {
        playerId,
      },
    );
  }

  public async cancelRequest(
    requestId: string,
  ): Promise<void> {
    const playerId = requirePlayer(
      this.options,
    );

    await apiClient.post(
      `/friends/requests/${encodeURIComponent(
        requestId,
      )}/cancel`,
      {
        playerId,
      },
    );
  }

  public async removeFriend(
    friendPlayerId: PlayerId,
  ): Promise<void> {
    const playerId = requirePlayer(
      this.options,
    );

    await apiClient.post(
      "/friends/remove",
      {
        playerId,

        friendPlayerId,
      },
    );
  }

  public async getOnlineFriends(): Promise<
    Friend[]
  > {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.get<Friend[]>(
      `/friends/player/${encodeURIComponent(
        playerId,
      )}/online`,
    );
  }
}

export const friendsService =
  new FriendsService();