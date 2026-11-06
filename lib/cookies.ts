import "server-only";
import { cookies } from "next/headers";

import {
  ADMIN_COOKIE,
  CART_COOKIE,
  SESSION_MAX_AGE,
  USER_COOKIE,
} from "./api";

const baseCookie = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_MAX_AGE,
};

export async function setUserCookie(token: string): Promise<void> {
  (await cookies()).set(USER_COOKIE, token, baseCookie);
}

export async function setAdminCookie(token: string): Promise<void> {
  (await cookies()).set(ADMIN_COOKIE, token, baseCookie);
}

export async function setCartCookie(token: string): Promise<void> {
  (await cookies()).set(CART_COOKIE, token, baseCookie);
}

export async function clearUserCookie(): Promise<void> {
  (await cookies()).delete(USER_COOKIE);
}

export async function clearAdminCookie(): Promise<void> {
  (await cookies()).delete(ADMIN_COOKIE);
}

export async function getCartCookie(): Promise<string | null> {
  return (await cookies()).get(CART_COOKIE)?.value ?? null;
}
