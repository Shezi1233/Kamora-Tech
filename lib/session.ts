import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ADMIN_COOKIE, USER_COOKIE, apiFetch } from "./api";
import type { Admin, User } from "./types";

export async function getCurrentUser(): Promise<User | null> {
  const token = (await cookies()).get(USER_COOKIE)?.value;
  if (!token) return null;
  try {
    return await apiFetch<User>("/auth/me", { token });
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
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  try {
    return await apiFetch<Admin>("/admin/auth/me", { token });
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<Admin> {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
