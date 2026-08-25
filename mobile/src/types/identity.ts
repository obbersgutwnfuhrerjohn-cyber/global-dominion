import type {
  CountryId,
  PlayerId
} from "./game";

export type ImageAssetType =
  | "player_avatar"
  | "leader_portrait"
  | "campaign_image"
  | "national_emblem"
  | "government_banner"
  | "company_logo"
  | "factory_logo";

export type ImageModerationStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "removed";

export interface ImageAsset {
  id: string;

  ownerId: PlayerId | CountryId;

  type: ImageAssetType;

  storagePath: string;

  imageUrl: string;

  thumbnailUrl: string | null;

  width: number;

  height: number;

  fileSizeBytes: number;

  moderationStatus: ImageModerationStatus;

  uploadedAt: string;

  updatedAt: string;
}

export interface PlayerVisualIdentity {
  playerId: PlayerId;

  avatarAssetId: string | null;

  profileBannerAssetId: string | null;

  verifiedPortraitAssetId: string | null;

  displayName: string;

  updatedAt: string;
}

export interface LeaderVisualIdentity {
  playerId: PlayerId;

  countryId: CountryId;

  portraitAssetId: string | null;

  campaignAssetId: string | null;

  elected: boolean;

  office:
    | "president"
    | "prime_minister"
    | "other";

  termStartedAt: string | null;

  termEndsAt: string | null;
}

export interface CountryVisualIdentity {
  countryId: CountryId;

  officialFlagAssetId: string;

  officialFlagUrl: string;

  currentDisplayEmblemAssetId: string | null;

  currentDisplayEmblemUrl: string | null;

  governmentBannerAssetId: string | null;

  governmentBannerUrl: string | null;

  currentLeaderId: PlayerId | null;

  leaderPortraitAssetId: string | null;

  customPoliticalIdentityEnabled: boolean;

  lastUpdatedAt: string;
}

export interface IdentityChangeRequest {
  countryId: CountryId;

  requestedByPlayerId: PlayerId;

  assetId: string;

  changeType:
    | "national_emblem"
    | "government_banner"
    | "leader_portrait";

  reason: string;

  submittedAt: string;
}

export interface IdentityModerationReview {
  id: string;

  assetId: string;

  submittedByPlayerId: PlayerId;

  countryId: CountryId | null;

  status: ImageModerationStatus;

  moderatorId: string | null;

  moderationReason: string | null;

  createdAt: string;

  resolvedAt: string | null;
}