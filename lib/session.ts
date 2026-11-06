import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { execute, queryOne } from "./db";
import type { Admin, User } from "./types";

export const USER_COOKIE = "kt_user_session";
export const ADMIN_COOKIE = "kt_admin_session";
const SESSION_DAYS = 30;
const SESSION_SECONDS = SESSION_DAYS * 24 * 60 * 60;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(kind: "user" | "admin", id: number): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expires = new Date(Date.now() + SESSION_SECONDS * 1000);
  await execute(
    "INSERT INTO app_sessions (token_hash, user_id, admin_id, expires_at) VALUES (?, ?, ?, ?)",
    [tokenHash, kind === "user" ? id : null, kind === "admin" ? id : null, expires],
  );
  const store = await cookies();
  store.set(kind === "user" ? USER_COOKIE : ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
}

export async function destroySession(kind: "user" | "admin"): Promise<void> {
  const store = await cookies();
  const name = kind === "user" ? USER_COOKIE : ADMIN_COOKIE;
  const token = store.get(name)?.value;
  if (token) {
    await execute("DELETE FROM app_sessions WHERE token_hash = ?", [hashToken(token)]);
  }
  store.delete(name);
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const token = (await cookies()).get(USER_COOKIE)?.value;
    if (!token) return null;
    return await queryOne<User>(
      `SELECT u.id, u.full_name, u.email, u.phone, u.is_active, u.created_at
       FROM app_sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = ? AND s.expires_at > NOW() AND u.is_active = 1
       LIMIT 1`,
      [hashToken(token)],
    );
  } catch {
    return null;
  }
}

export async function requireUser(nextPath?: string): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    const target = nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : "/login";
    redirect(target);
  }
  return user;
}

export async function getCurrentAdmin(): Promise<Admin | null> {
  try {
    const token = (await cookies()).get(ADMIN_COOKIE)?.value;
    if (!token) return null;
    return await queryOne<Admin>(
      `SELECT a.id, a.full_name, a.email, a.is_active
       FROM app_sessions s
       JOIN admins a ON a.id = s.admin_id
       WHERE s.token_hash = ? AND s.expires_at > NOW() AND a.is_active = 1
       LIMIT 1`,
      [hashToken(token)],
    );
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<Admin> {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
