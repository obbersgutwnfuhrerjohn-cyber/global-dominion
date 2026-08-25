import type { Response } from "express";
import { randomBytes } from "crypto";

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

export interface ApiErrorBody {
  code: ApiErrorCode;
  message: string;
  requestId: string;
  retryable: boolean;
}

export function createRequestId(): string {
  return `${Date.now().toString(36)}-${randomBytes(6).toString("hex")}`;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  status = 200,
  requestId?: string
): void {
  const id = requestId || (res.locals.requestId as string) || createRequestId();
  res.status(status).json({
    success: true,
    data,
    error: null,
    serverTime: new Date().toISOString(),
    requestId: id,
  });
}

export function sendError(
  res: Response,
  status: number,
  code: ApiErrorCode,
  message: string,
  retryable = false,
  requestId?: string
): void {
  const id = requestId || (res.locals.requestId as string) || createRequestId();
  res.status(status).json({
    success: false,
    data: null,
    error: {
      code,
      message,
      requestId: id,
      retryable,
    } satisfies ApiErrorBody,
    serverTime: new Date().toISOString(),
    requestId: id,
  });
}
