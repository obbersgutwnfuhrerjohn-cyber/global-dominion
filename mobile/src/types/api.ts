import type {
  CountryId,
  PlayerId,
  WarId
} from "./game";

import type {
  AuthenticationResult,
  LoginRequest,
  RegistrationRequest
} from "./auth";

import type {
  WorldMapState
} from "./world";

import type {
  WorldEventFeed
} from "./events";

export type ApiErrorCode =
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "validation_error"
  | "rate_limited"
  | "conflict"
  | "server_error"
  | "maintenance"
  | "account_restricted"
  | "email_not_verified";

export interface ApiError {
  code: ApiErrorCode;

  message: string;

  requestId: string;

  retryable: boolean;
}

export interface ApiResponse<T> {
  success: boolean;

  data: T | null;

  error: ApiError | null;

  serverTime: string;

  requestId: string;
}

export interface LoginResponse {
  authentication: AuthenticationResult;
}

export interface RegistrationResponse {
  authentication: AuthenticationResult;
}

export interface WorldStateResponse {
  world: WorldMapState;
}

export interface WorldEventsResponse {
  events: WorldEventFeed;
}

export interface CountryResponse {
  countryId: CountryId;

  data: unknown;
}

export interface PlayerResponse {
  playerId: PlayerId;

  data: unknown;
}

export interface WarResponse {
  warId: WarId;

  data: unknown;
}

export interface Pagination {
  page: number;

  pageSize: number;

  total: number;

  hasNextPage: boolean;

  nextCursor: string | null;
}

export interface PaginatedResponse<T> {
  items: T[];

  pagination: Pagination;
}

export interface ApiRequestContext {
  requestId: string;

  clientVersion: string;

  platform: "android" | "ios" | "web";

  locale: string;

  timezone: string;

  deviceId: string | null;

  sessionId: string | null;
}

export interface RegisterAccountApiRequest {
  context: ApiRequestContext;

  payload: RegistrationRequest;
}

export interface LoginAccountApiRequest {
  context: ApiRequestContext;

  payload: LoginRequest;
}

export interface RefreshSessionApiRequest {
  context: ApiRequestContext;

  refreshToken: string;
}

export interface LogoutApiRequest {
  context: ApiRequestContext;

  sessionId: string;
}

export interface CountrySelectionApiRequest {
  context: ApiRequestContext;

  playerId: PlayerId;

  countryId: CountryId;
}

export interface WorldSubscriptionRequest {
  context: ApiRequestContext;

  playerId: PlayerId;

  latitude: number;

  longitude: number;

  zoom: number;

  subscribedCountryIds: CountryId[];

  subscribedWarIds: WarId[];
}