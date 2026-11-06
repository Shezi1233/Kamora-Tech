"use server";

import { redirect } from "next/navigation";
import { createHash, randomBytes } from "node:crypto";
import { execute, queryOne } from "@/lib/db";
import {
  createSession,
  destroySession,
  getCurrentUser,
  hashPassword,
  verifyPassword,
} from "@/lib/session";
import { mergeGuestCartIntoDb } from "@/lib/cart";
import { email as isEmail, lengthBetween, passwordOk, text } from "@/lib/validation";
import type { User } from "@/lib/types";

export type AuthState = {
  error?: string;
  success?: string;
  resetLink?: string;
};

const attempts = new Map<string, number[]>();

function recentAttempts(key: string): number[] {
  const now = Date.now();
  const list = (attempts.get(key) ?? []).filter((t) => t > now - 10 * 60 * 1000);
  attempts.set(key, list);
  return list;
}

function safeNext(value: FormDataEntryValue | null): string {
  const next = text(value);
  return next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

export async function signupAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const name = text(formData.get("full_name"));
  const email = text(formData.get("email")).toLowerCase();
  const phone = text(formData.get("phone"));
  const password = text(formData.get("password"));
  const confirm = text(formData.get("password_confirm"));
  const terms = formData.get("terms");

  if (!lengthBetween(name, 2, 150)) return { error: "Please enter your full name." };
  if (!isEmail(email)) return { error: "Please enter a valid email address." };
  if (!passwordOk(password)) return { error: "Password must be at least 8 characters." };
  if (password !== confirm) return { error: "Passwords do not match." };
  if (!terms) return { error: "Please accept the terms." };

  const existing = await queryOne<{ id: number }>("SELECT id FROM users WHERE email = ?", [email]);
  if (existing) return { error: "An account with this email already exists. Please log in." };

  const passwordHash = await hashPassword(password);
  await execute("INSERT INTO users (full_name, email, phone, password_hash) VALUES (?, ?, ?, ?)", [
    name,
    email,
    phone || null,
    passwordHash,
  ]);
  redirect("/login?registered=1");
}

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = text(formData.get("email")).toLowerCase();
  const password = text(formData.get("password"));
  const next = safeNext(formData.get("next"));

  const list = recentAttempts(email || "unknown");
  if (list.length >= 10) {
    return { error: "Too many login attempts. Please wait 10 minutes and try again." };
  }
  if (!isEmail(email) || password === "") {
    return { error: "Please enter your email and password." };
  }

  const user = await queryOne<User & { password_hash: string }>(
    "SELECT id, full_name, email, phone, is_active, password_hash FROM users WHERE email = ?",
    [email],
  );
  const userPasswordOk = user ? await verifyPassword(password, user.password_hash) : false;

  if (!userPasswordOk) {
    const admin = await queryOne<{ id: number; is_active: number; password_hash: string }>(
      "SELECT id, is_active, password_hash FROM admins WHERE email = ?",
      [email],
    );
    if (admin && (await verifyPassword(password, admin.password_hash))) {
      if (Number(admin.is_active) !== 1) {
        return { error: "Admin account is deactivated." };
      }
      attempts.delete(email);
      await createSession("admin", admin.id);
      redirect("/admin");
    }
    list.push(Date.now());
    attempts.set(email, list);
    return { error: "Email or password is incorrect." };
  }

  if (!user) {
    return { error: "Email or password is incorrect." };
  }
  if (Number(user.is_active) !== 1) {
    return { error: "Your account is deactivated." };
  }

  attempts.delete(email);
  await createSession("user", user.id);
  await mergeGuestCartIntoDb(user.id);
  redirect(next);
}

export async function logoutAction(): Promise<void> {
  await destroySession("user");
  redirect("/");
}

export async function forgotPasswordAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = text(formData.get("email")).toLowerCase();
  if (!isEmail(email)) return { error: "Please enter a valid email address." };

  const user = await queryOne<{ id: number }>("SELECT id FROM users WHERE email = ?", [email]);
  let resetLink: string | undefined;
  if (user) {
    const token = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    await execute(
      "UPDATE users SET reset_token = ?, reset_expires = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE id = ?",
      [tokenHash, user.id],
    );
    const base = process.env.APP_URL || "http://localhost:3000";
    resetLink = `${base}/reset-password?token=${encodeURIComponent(token)}`;
  }

  return {
    success:
      "If an account exists for that email, a password reset link has been created (valid for 1 hour).",
    resetLink,
  };
}

export async function resetPasswordAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const token = text(formData.get("token"));
  const password = text(formData.get("password"));
  const confirm = text(formData.get("password_confirm"));

  if (!passwordOk(password)) return { error: "Password must be at least 8 characters." };
  if (password !== confirm) return { error: "Passwords do not match." };

  const tokenHash = createHash("sha256").update(token).digest("hex");
  const user = await queryOne<{ id: number }>(
    "SELECT id FROM users WHERE reset_token = ? AND reset_expires > NOW() LIMIT 1",
    [tokenHash],
  );
  if (!user) return { error: "This reset link is invalid or expired." };

  const passwordHash = await hashPassword(password);
  await execute(
    "UPDATE users SET password_hash = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?",
    [passwordHash, user.id],
  );
  redirect("/login?reset=1");
}

export async function updateProfileAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/profile");

  const name = text(formData.get("full_name"));
  const phone = text(formData.get("phone"));
  if (!lengthBetween(name, 2, 150)) return { error: "Please enter your full name." };

  await execute("UPDATE users SET full_name = ?, phone = ? WHERE id = ?", [
    name,
    phone || null,
    user.id,
  ]);
  return { success: "Profile updated." };
}

export async function changePasswordAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/change-password");

  const current = text(formData.get("current_password"));
  const password = text(formData.get("password"));
  const confirm = text(formData.get("password_confirm"));

  const row = await queryOne<{ password_hash: string }>(
    "SELECT password_hash FROM users WHERE id = ?",
    [user.id],
  );
  if (!row || !(await verifyPassword(current, row.password_hash))) {
    return { error: "Current password is incorrect." };
  }
  if (!passwordOk(password)) return { error: "New password must be at least 8 characters." };
  if (password !== confirm) return { error: "New passwords do not match." };

  await execute("UPDATE users SET password_hash = ? WHERE id = ?", [
    await hashPassword(password),
    user.id,
  ]);
  return { success: "Password changed." };
}
