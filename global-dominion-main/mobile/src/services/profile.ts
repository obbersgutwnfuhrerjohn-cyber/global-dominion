import { apiClient } from "./api";

import type {
  CountryId,
  PlayerId,
} from "../types/game";

export interface ProfileServiceOptions {
  getPlayerId?: () => PlayerId | null;
  getSessionId?: () => string | null;
}

export interface PlayerProfile {
  playerId: PlayerId;

  username: string;

  displayName: string;

  profileImageUrl: string | null;

  coverImageUrl: string | null;

  bio: string;

  countryId: CountryId | null;

  countryName: string | null;

  level: number;

  experience: number;

  reputation: number;

  joinedAt: string;

  updatedAt: string;
}

export interface PlayerStats {
  playerId: PlayerId;

  tripsCompleted: number;

  distanceDrivenKm: number;

  companiesOwned: number;

  factoriesOwned: number;

  employeesManaged: number;

  jobsCompleted: number;

  electionsWon: number;

  researchCompleted: number;

  buildingsCreated: number;

  friendsCount: number;
}

export interface ProfilePrivacy {
  profileVisible: boolean;

  showCountry: boolean;

  showStatistics: boolean;

  showEmployment: boolean;

  showCompanies: boolean;

  showVehicles: boolean;

  allowFriendRequests: boolean;

  allowMessages: boolean;
}

function requirePlayer(
  options: ProfileServiceOptions,
): PlayerId {
  const playerId = options.getPlayerId?.();

  if (!playerId) {
    throw new Error(
      "A logged-in player is required.",
    );
  }

  return playerId;
}

export class ProfileService {
  private readonly options: ProfileServiceOptions;

  constructor(
    options: ProfileServiceOptions = {},
  ) {
    this.options = options;
  }

  public async getMyProfile(): Promise<PlayerProfile> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.get<PlayerProfile>(
      `/profiles/player/${encodeURIComponent(
        playerId,
      )}`,
    );
  }

  public async getProfile(
    playerId: PlayerId,
  ): Promise<PlayerProfile> {
    return apiClient.get<PlayerProfile>(
      `/profiles/player/${encodeURIComponent(
        playerId,
      )}`,
    );
  }

  public async updateProfile(
    changes: {
      displayName?: string;

      bio?: string;

      countryId?: CountryId | null;
    },
  ): Promise<PlayerProfile> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.put<PlayerProfile>(
      `/profiles/player/${encodeURIComponent(
        playerId,
      )}`,
      {
        playerId,
        changes,
      },
    );
  }

  public async setProfileImage(
    imageUrl: string,
  ): Promise<PlayerProfile> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.put<PlayerProfile>(
      `/profiles/player/${encodeURIComponent(
        playerId,
      )}/profile-image`,
      {
        playerId,
        imageUrl,
      },
    );
  }

  public async setCoverImage(
    imageUrl: string,
  ): Promise<PlayerProfile> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.put<PlayerProfile>(
      `/profiles/player/${encodeURIComponent(
        playerId,
      )}/cover-image`,
      {
        playerId,
        imageUrl,
      },
    );
  }

  public async getStats(
    playerId?: PlayerId,
  ): Promise<PlayerStats> {
    const targetPlayerId =
      playerId ??
      requirePlayer(this.options);

    return apiClient.get<PlayerStats>(
      `/profiles/player/${encodeURIComponent(
        targetPlayerId,
      )}/stats`,
    );
  }

  public async getPrivacy(): Promise<ProfilePrivacy> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.get<ProfilePrivacy>(
      `/profiles/player/${encodeURIComponent(
        playerId,
      )}/privacy`,
    );
  }

  public async updatePrivacy(
    changes: Partial<ProfilePrivacy>,
  ): Promise<ProfilePrivacy> {
    const playerId = requirePlayer(
      this.options,
    );

    return apiClient.put<ProfilePrivacy>(
      `/profiles/player/${encodeURIComponent(
        playerId,
      )}/privacy`,
      {
        playerId,
        changes,
      },
    );
  }
}

export const profileService =
  new ProfileService();