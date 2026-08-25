import { apiClient } from "./api";

import type {
  PlayerId,
} from "../types/game";

export interface AuthServiceOptions {
  getDeviceId?: () => string | null;

  getSessionId?: () => string | null;
}

export interface AuthUser {
  playerId: PlayerId;

  email: string;

  emailVerified: boolean;

  displayName: string | null;

  profileImageUrl: string | null;

  createdAt: string;

  lastLoginAt: string | null;
}

export interface AuthSession {
  sessionId: string;

  playerId: PlayerId;

  accessToken: string;

  refreshToken: string;

  expiresAt: string;

  createdAt: string;

  deviceId: string | null;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
  username?: string;
  countryId?: string;
}

export interface RegisterResult {
  success: boolean;

  user: AuthUser | null;

  verificationRequired: boolean;

  message: string;
}

export interface LoginResult {
  success: boolean;

  user: AuthUser | null;

  session: AuthSession | null;

  verificationRequired: boolean;

  accountLocked: boolean;

  message: string;
}

export interface VerificationResult {
  success: boolean;

  message: string;
}

export interface PasswordResetResult {
  success: boolean;

  message: string;
}

export interface DeviceRegistration {
  id: string;

  playerId: PlayerId;

  deviceId: string;

  platform:
    | "android"
    | "ios"
    | "web"
    | "unknown";

  firstSeenAt: string;

  lastSeenAt: string;

  trusted: boolean;

  active: boolean;
}

export interface SecurityStatus {
  playerId: PlayerId;

  emailVerified: boolean;

  activeSessions: number;

  registeredDevices: number;

  suspiciousActivity: boolean;

  accountLocked: boolean;

  requiresAdditionalVerification: boolean;

  updatedAt: string;
}

export interface DuplicateAccountSignal {
  signal:
    | "shared_ip"
    | "shared_device"
    | "shared_payment"
    | "shared_identity"
    | "behavioral_similarity";

  confidence: number;

  accountCount: number;

  createdAt: string;
}

export interface AuthEvent {
  id: string;

  type:
    | "login"
    | "logout"
    | "registration"
    | "email_verification"
    | "password_reset"
    | "device_added"
    | "suspicious_login"
    | "security_review";

  createdAt: string;

  successful: boolean;
}

export interface AccountRestriction {
  active: boolean;

  type:
    | "none"
    | "verification_required"
    | "temporary_lock"
    | "suspension"
    | "permanent_ban";

  reason: string | null;

  expiresAt: string | null;
}

export class AuthService {
  private readonly options: AuthServiceOptions;

  constructor(
    options: AuthServiceOptions = {},
  ) {
    this.options = options;
  }

  public async register(
    request: RegisterRequest,
  ): Promise<RegisterResult> {
    return apiClient.post<RegisterResult>(
      "/auth/register",
      {
        email: request.email.trim(),

        password: request.password,

        displayName:
          request.displayName.trim(),

        username: request.username?.trim().toLowerCase(),
        countryId: request.countryId,

        deviceId:
          this.options.getDeviceId?.() ??
          null,
      },
    );
  }

  public async login(
    email: string,
    password: string,
  ): Promise<LoginResult> {
    return apiClient.post<LoginResult>(
      "/auth/login",
      {
        email: email.trim(),

        password,

        deviceId:
          this.options.getDeviceId?.() ??
          null,
      },
    );
  }

  public async logout(): Promise<void> {
    const sessionId =
      this.options.getSessionId?.();

    if (!sessionId) {
      return;
    }

    await apiClient.post(
      "/auth/logout",
      {
        sessionId,

        deviceId:
          this.options.getDeviceId?.() ??
          null,
      },
    );
  }

  public async refreshSession(
    refreshToken: string,
  ): Promise<AuthSession> {
    return apiClient.post<AuthSession>(
      "/auth/refresh",
      {
        refreshToken,

        deviceId:
          this.options.getDeviceId?.() ??
          null,
      },
    );
  }

  public async resendVerificationEmail(): Promise<
    VerificationResult
  > {
    const sessionId =
      this.options.getSessionId?.();

    return apiClient.post<VerificationResult>(
      "/auth/email/resend",
      {
        sessionId,

        deviceId:
          this.options.getDeviceId?.() ??
          null,
      },
    );
  }

  public async verifyEmail(
    token: string,
  ): Promise<VerificationResult> {
    return apiClient.post<VerificationResult>(
      "/auth/email/verify",
      {
        token,
      },
    );
  }

  public async requestPasswordReset(
    email: string,
  ): Promise<PasswordResetResult> {
    return apiClient.post<PasswordResetResult>(
      "/auth/password/reset-request",
      {
        email: email.trim(),
      },
    );
  }

  public async confirmPasswordReset(
    token: string,
    newPassword: string,
  ): Promise<PasswordResetResult> {
    return apiClient.post<PasswordResetResult>(
      "/auth/password/reset-confirm",
      {
        token,

        newPassword,
      },
    );
  }

  public async getCurrentUser(): Promise<
    AuthUser | null
  > {
    const sessionId =
      this.options.getSessionId?.();

    if (!sessionId) {
      return null;
    }

    return apiClient.get<AuthUser>(
      "/auth/me",
    );
  }

  public async getSecurityStatus(): Promise<
    SecurityStatus
  > {
    return apiClient.get<SecurityStatus>(
      "/auth/security/status",
    );
  }

  public async getDevices(): Promise<
    DeviceRegistration[]
  > {
    return apiClient.get<DeviceRegistration[]>(
      "/auth/security/devices",
    );
  }

  public async registerDevice(
    platform:
      | "android"
      | "ios"
      | "web"
      | "unknown",
  ): Promise<DeviceRegistration> {
    return apiClient.post<DeviceRegistration>(
      "/auth/security/devices",
      {
        deviceId:
          this.options.getDeviceId?.() ??
          null,

        platform,
      },
    );
  }

  public async removeDevice(
    deviceId: string,
  ): Promise<void> {
    await apiClient.delete(
      `/auth/security/devices/${encodeURIComponent(
        deviceId,
      )}`,
    );
  }

  public async getAccountRestriction(): Promise<
    AccountRestriction
  > {
    return apiClient.get<AccountRestriction>(
      "/auth/security/restriction",
    );
  }

  public async getAuthEvents(): Promise<
    AuthEvent[]
  > {
    return apiClient.get<AuthEvent[]>(
      "/auth/security/events",
    );
  }

  public async reportSuspiciousLogin(
    description: string,
  ): Promise<void> {
    await apiClient.post(
      "/auth/security/report",
      {
        description,

        deviceId:
          this.options.getDeviceId?.() ??
          null,

        sessionId:
          this.options.getSessionId?.() ??
          null,
      },
    );
  }

  public async requestSecurityReview(): Promise<void> {
    await apiClient.post(
      "/auth/security/review",
      {
        deviceId:
          this.options.getDeviceId?.() ??
          null,
      },
    );
  }
}

export const authService =
  new AuthService();