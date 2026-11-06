import "server-only";

import { cookies, headers } from "next/headers";
import { parseSetCookie } from "next/dist/compiled/@edge-runtime/cookies";

const API_BASE_URL = process.env.API_BASE_URL?.replace(/\/$/, "");

if (!API_BASE_URL) {
  throw new Error("API_BASE_URL environment variable is required.");
}

export const USER_COOKIE = "kt_user_session";
export const ADMIN_COOKIE = "kt_admin_session";
export const CART_COOKIE = "kt_cart_token";

export const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  form?: FormData;
  token?: string | null;
  cartToken?: string | null;
  admin?: boolean;
  cache?: RequestCache;
  timeoutMs?: number;
  signal?: AbortSignal;
};

async function readToken(name: string): Promise<string | null> {
  try {
    return (await cookies()).get(name)?.value ?? null;
  } catch {
    return null;
  }
}

export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const incomingHeaders = await headers();
  const incomingCookie = incomingHeaders.get("cookie");

  const token =
    options.token !== undefined
      ? options.token
      : await readToken(options.admin ? ADMIN_COOKIE : USER_COOKIE);
  const cartToken =
    options.cartToken !== undefined ? options.cartToken : await readToken(CART_COOKIE);

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${API_BASE_URL}/api/v1${normalizedPath}`;

  const requestHeaders: Record<string, string> = { Accept: "application/json" };
  if (incomingCookie) requestHeaders.Cookie = incomingCookie;
  if (token) requestHeaders.Authorization = `Bearer ${token}`;
  if (cartToken) requestHeaders["X-Cart-Token"] = cartToken;

  let body: BodyInit | undefined;
  if (options.form) {
    body = options.form;
  } else if (options.body !== undefined) {
    requestHeaders["Content-Type"] = "application/json";
    body = JSON.stringify(options.body);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 20000);
  if (options.signal) {
    options.signal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method: options.method ?? (body ? "POST" : "GET"),
      headers: requestHeaders,
      body,
      cache: options.cache ?? "no-store",
      signal: controller.signal,
    });
  } catch (error) {
    console.error(`[api] request failed: ${options.method ?? "GET"} ${url}`, error);
    throw new ApiError("The backend service is unreachable. Please try again shortly.", 503);
  } finally {
    clearTimeout(timeout);
  }

  const cookieStore = await cookies();
  for (const setCookie of response.headers.getSetCookie()) {
    const parsed = parseSetCookie(setCookie);
    if (parsed) cookieStore.set(parsed);
  }

  const text = await response.text();
  const data = text ? safeJson(text) : null;

  if (!response.ok) {
    const detail =
      data && typeof data === "object" && "detail" in data
        ? String((data as { detail: unknown }).detail)
        : `Request failed with status ${response.status}.`;
    throw new ApiError(detail, response.status);
  }

  return data as T;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
