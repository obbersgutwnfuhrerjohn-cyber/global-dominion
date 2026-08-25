import { ENVIRONMENT } from "../config/environment";
import { StorageKeys, getItem } from "../utils/storage";
import type {
  ApiError,
  ApiRequestContext,
  ApiResponse,
} from "../types/api";

export class ApiRequestError extends Error {
  public readonly code: ApiError["code"];

  public readonly requestId: string;

  public readonly retryable: boolean;

  public readonly status: number | null;

  constructor(
    message: string,
    options: {
      code: ApiError["code"];
      requestId: string;
      retryable: boolean;
      status?: number | null;
    },
  ) {
    super(message);

    this.name = "ApiRequestError";

    this.code = options.code;

    this.requestId = options.requestId;

    this.retryable = options.retryable;

    this.status = options.status ?? null;
  }
}

interface ApiClientOptions {
  getAccessToken?: () => Promise<string | null>;

  getSessionId?: () => string | null;

  getDeviceId?: () => string | null;
}

function createRequestId(): string {
  const timestamp = Date.now().toString(36);

  const randomPart = Math.random()
    .toString(36)
    .slice(2, 12);

  return `${timestamp}-${randomPart}`;
}

function getPlatform(): "android" | "ios" | "web" {
  if (typeof navigator !== "undefined") {
    const userAgent = navigator.userAgent.toLowerCase();

    if (userAgent.includes("android")) {
      return "android";
    }

    if (
      userAgent.includes("iphone") ||
      userAgent.includes("ipad") ||
      userAgent.includes("ipod")
    ) {
      return "ios";
    }
  }

  return "web";
}

function getLocale(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().locale;
  } catch {
    return "en-US";
  }
}

function getTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
}

function createRequestContext(
  options: ApiClientOptions,
): ApiRequestContext {
  return {
    requestId: createRequestId(),

    clientVersion: "0.1.0",

    platform: getPlatform(),

    locale: getLocale(),

    timezone: getTimezone(),

    deviceId: options.getDeviceId?.() ?? null,

    sessionId: options.getSessionId?.() ?? null,
  };
}

async function parseResponseBody(
  response: Response,
): Promise<unknown> {
  const contentType =
    response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();

  if (!text) {
    return null;
  }

  return {
    message: text,
  };
}

function createFallbackError(
  response: Response,
  requestId: string,
): ApiRequestError {
  let code: ApiError["code"] = "server_error";

  if (response.status === 401) {
    code = "unauthorized";
  } else if (response.status === 403) {
    code = "forbidden";
  } else if (response.status === 404) {
    code = "not_found";
  } else if (response.status === 409) {
    code = "conflict";
  } else if (response.status === 429) {
    code = "rate_limited";
  } else if (response.status >= 400 && response.status < 500) {
    code = "validation_error";
  }

  return new ApiRequestError(
    `API request failed with status ${response.status}.`,
    {
      code,
      requestId,
      retryable:
        response.status >= 500 ||
        response.status === 429,
      status: response.status,
    },
  );
}

export class ApiClient {
  private readonly options: ApiClientOptions;

  constructor(options: ApiClientOptions = {}) {
    this.options = options;
  }

  private async request<T>(
    path: string,
    init: RequestInit = {},
  ): Promise<T> {
    const context = createRequestContext(this.options);

    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, ENVIRONMENT.api.timeoutMs);

    try {
      const accessToken =
        await this.options.getAccessToken?.();

      const headers = new Headers(init.headers);

      headers.set("Accept", "application/json");

      headers.set("Content-Type", "application/json");

      headers.set(
        "X-Request-ID",
        context.requestId,
      );

      headers.set(
        "X-Client-Version",
        context.clientVersion,
      );

      headers.set(
        "X-Client-Platform",
        context.platform,
      );

      if (accessToken) {
        headers.set(
          "Authorization",
          `Bearer ${accessToken}`,
        );
      }

      const response = await fetch(
        `${ENVIRONMENT.api.baseUrl}${path}`,
        {
          ...init,

          headers,

          signal: controller.signal,
        },
      );

      const body =
        await parseResponseBody(response);

      if (!response.ok) {
        if (
          body &&
          typeof body === "object" &&
          "error" in body
        ) {
          const apiBody =
            body as Partial<ApiResponse<unknown>>;

          if (apiBody.error) {
            throw new ApiRequestError(
              apiBody.error.message,
              {
                code: apiBody.error.code,

                requestId:
                  apiBody.error.requestId ||
                  context.requestId,

                retryable:
                  apiBody.error.retryable,

                status: response.status,
              },
            );
          }
        }

        throw createFallbackError(
          response,
          context.requestId,
        );
      }

      if (
        body &&
        typeof body === "object" &&
        "success" in body
      ) {
        const apiResponse =
          body as ApiResponse<T>;

        if (!apiResponse.success) {
          const error = apiResponse.error;

          if (error) {
            throw new ApiRequestError(
              error.message,
              {
                code: error.code,

                requestId:
                  error.requestId ||
                  context.requestId,

                retryable: error.retryable,

                status: response.status,
              },
            );
          }

          throw new ApiRequestError(
            "The server rejected the request.",
            {
              code: "server_error",
              requestId: context.requestId,
              retryable: true,
              status: response.status,
            },
          );
        }

        return apiResponse.data as T;
      }

      return body as T;
    } catch (error) {
      if (error instanceof ApiRequestError) {
        throw error;
      }

      if (
        error instanceof DOMException &&
        error.name === "AbortError"
      ) {
        throw new ApiRequestError(
          "The request timed out.",
          {
            code: "server_error",
            requestId: context.requestId,
            retryable: true,
          },
        );
      }

      if (
        error instanceof Error &&
        error.name === "AbortError"
      ) {
        throw new ApiRequestError(
          "The request timed out.",
          {
            code: "server_error",
            requestId: context.requestId,
            retryable: true,
          },
        );
      }

      throw new ApiRequestError(
        error instanceof Error
          ? error.message
          : "Unable to connect to the server.",
        {
          code: "server_error",
          requestId: context.requestId,
          retryable: true,
        },
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  public get<T>(
    path: string,
  ): Promise<T> {
    return this.request<T>(path, {
      method: "GET",
    });
  }

  public post<T>(
    path: string,
    body: unknown,
  ): Promise<T> {
    return this.request<T>(path, {
      method: "POST",

      body: JSON.stringify(body),
    });
  }

  public put<T>(
    path: string,
    body: unknown,
  ): Promise<T> {
    return this.request<T>(path, {
      method: "PUT",

      body: JSON.stringify(body),
    });
  }

  public patch<T>(
    path: string,
    body: unknown,
  ): Promise<T> {
    return this.request<T>(path, {
      method: "PATCH",

      body: JSON.stringify(body),
    });
  }

  public delete<T>(
    path: string,
  ): Promise<T> {
    return this.request<T>(path, {
      method: "DELETE",
    });
  }
}

export const apiClient = new ApiClient({
  getAccessToken: async () => {
    const session = await getItem<{ accessToken?: string }>(StorageKeys.session);
    return session?.accessToken ?? null;
  },
  getSessionId: () => null,
});