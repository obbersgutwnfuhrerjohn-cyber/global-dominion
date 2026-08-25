import type { PlayerId } from "./game";

export type AuthenticationMethod =
  | "email_password"
  | "google"
  | "apple";

export type SessionStatus =
  | "active"
  | "expired"
  | "revoked";

export type SecurityRiskLevel =
  | "low"
  | "medium"
  | "high"
  | "critical";

export type AccountRestriction =
  | "none"
  | "email_verification_required"
  | "additional_verification_required"
  | "temporarily_locked"
  | "restricted"
  | "suspended"
  | "banned";

export interface AuthAccount {
  playerId: PlayerId;

  email: string;

  emailVerified: boolean;

  authenticationMethod: AuthenticationMethod;

  accountCreatedAt: string;

  lastLoginAt: string | null;

  accountRestriction: AccountRestriction;

  securityRiskLevel: SecurityRiskLevel;
}

export interface AuthSession {
  id: string;

  playerId: PlayerId;

  status: SessionStatus;

  createdAt: string;

  expiresAt: string;

  lastActivityAt: string;

  deviceId: string | null;
}

export interface EmailVerificationState {
  email: string;

  verified: boolean;

  verificationSentAt: string | null;

  verificationCompletedAt: string | null;

  resendAvailableAt: string | null;
}

export interface PasswordResetState {
  requested: boolean;

  requestedAt: string | null;

  completedAt: string | null;
}

export interface DeviceSecurityRecord {
  deviceId: string;

  playerId: PlayerId;

  firstSeenAt: string;

  lastSeenAt: string;

  trusted: boolean;

  riskLevel: SecurityRiskLevel;
}

export interface NetworkSecurityRecord {
  playerId: PlayerId;

  networkFingerprint: string;

  firstSeenAt: string;

  lastSeenAt: string;

  riskLevel: SecurityRiskLevel;

  flagged: boolean;
}

export interface AccountSecurityReview {
  id: string;

  playerId: PlayerId;

  reason:
    | "duplicate_account"
    | "suspicious_registration"
    | "suspicious_login"
    | "automation"
    | "abuse"
    | "payment_fraud"
    | "other";

  riskLevel: SecurityRiskLevel;

  status:
    | "open"
    | "reviewing"
    | "cleared"
    | "restricted";

  createdAt: string;

  resolvedAt: string | null;

  reviewedBy: string | null;
}

export interface RegistrationRequest {
  email: string;

  password: string;

  username: string;

  displayName: string;

  acceptedTerms: boolean;

  acceptedPrivacyPolicy: boolean;
}

export interface LoginRequest {
  email: string;

  password: string;
}

export interface AuthenticationResult {
  success: boolean;

  playerId: PlayerId | null;

  sessionId: string | null;

  requiresEmailVerification: boolean;

  requiresAdditionalVerification: boolean;

  accountRestriction: AccountRestriction;

  errorCode: string | null;
}

export interface LogoutRequest {
  sessionId: string;
}

export interface PasswordResetRequest {
  email: string;
}