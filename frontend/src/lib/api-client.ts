import type { ApiErrorResponse } from "@/lib/auth-types";

export const AUTH_COOKIE_NAME = "sip_access_token";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export class ApiError extends Error {
  status: number;
  code: string;
  details: Array<{ field: string | null; message: string }>;

  constructor(
    message: string,
    status: number,
    code: string,
    details: Array<{ field: string | null; message: string }> = [],
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export class AuthSessionError extends ApiError {
  constructor(message = "Sessão expirada. Inicie sessão novamente.") {
    super(message, 401, "AUTH_SESSION");
    this.name = "AuthSessionError";
  }
}

function dispatchSessionExpired(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("auth:session-expired"));
  }
}

function errorFromResponse(response: Response, payload: unknown): ApiError {
  if (response.status === 401) {
    dispatchSessionExpired();
    return new AuthSessionError();
  }
  if (payload && typeof payload === "object" && "message" in payload) {
    const apiError = payload as ApiErrorResponse;
    return new ApiError(apiError.message, response.status, apiError.code, apiError.details ?? []);
  }
  return new ApiError(
    `Request failed with status ${response.status}`,
    response.status,
    "HTTP_ERROR",
  );
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("Accept", "application/json");
  if (init?.body) {
    headers.set("Content-Type", "application/json");
  }
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    headers.set("X-Correlation-ID", crypto.randomUUID());
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers,
      credentials: "include",
    });
  } catch {
    throw new ApiError(
      "Não foi possível contactar o servidor. Tente novamente.",
      0,
      "NETWORK_ERROR",
    );
  }

  if (!response.ok) {
    let payload: unknown = null;
    try {
      payload = await response.json();
    } catch {
      // corpo não-JSON — usa payload nulo
    }
    throw errorFromResponse(response, payload);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

export const apiClient = {
  get<T>(path: string): Promise<T> {
    return request<T>(path);
  },
  post<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(path, {
      method: "POST",
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  },
  patch<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(path, {
      method: "PATCH",
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  },
  delete<T>(path: string): Promise<T> {
    return request<T>(path, { method: "DELETE" });
  },
};
