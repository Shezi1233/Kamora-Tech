"use server";

import { redirect } from "next/navigation";

import { ApiError, apiFetch } from "@/lib/api";
import { clearUserCookie, setAdminCookie, setUserCookie } from "@/lib/cookies";
import { email as isEmail, lengthBetween, passwordOk, text } from "@/lib/validation";
import type { Admin, User } from "@/lib/types";

export type AuthState = {
  error?: string;
  success?: string;
  resetLink?: string;
};

type TokenResponse = {
  access_token: string;
  user?: User | null;
  admin?: Admin | null;
};

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

  try {
    await apiFetch("/auth/register", {
      method: "POST",
      body: {
        full_name: name,
        email,
        phone: phone || null,
        password,
      },
    });
  } catch (error) {
    return { error: error instanceof ApiError ? error.message : "Could not create your account." };
  }
  redirect("/login?registered=1");
}

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = text(formData.get("email")).toLowerCase();
  const password = text(formData.get("password"));
  const next = safeNext(formData.get("next"));

  if (!isEmail(email) || password === "") {
    return { error: "Please enter your email and password." };
  }

  let userToken: string | null = null;
  let adminToken: string | null = null;

  try {
    const data = await apiFetch<TokenResponse>("/auth/login", {
      method: "POST",
      body: { email, password },
    });
    userToken = data.access_token;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      try {
        const adminData = await apiFetch<TokenResponse>("/admin/auth/login", {
          method: "POST",
          body: { email, password },
        });
        adminToken = adminData.access_token;
      } catch {
        return { error: "Email or password is incorrect." };
      }
    } else {
      return {
        error: error instanceof ApiError ? error.message : "Email or password is incorrect.",
      };
    }
  }

  if (adminToken) {
    await setAdminCookie(adminToken);
    redirect("/admin");
  }
  if (userToken) await setUserCookie(userToken);
  redirect(next);
}

export async function logoutAction(): Promise<void> {
  try {
    await apiFetch("/auth/logout", { method: "POST" });
  } finally {
    await clearUserCookie();
  }
  redirect("/");
}

export async function forgotPasswordAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = text(formData.get("email")).toLowerCase();
  if (!isEmail(email)) return { error: "Please enter a valid email address." };

  try {
    const data = await apiFetch<{ success: string; reset_link?: string | null }>(
      "/auth/forgot-password",
      { method: "POST", body: { email } },
    );
    return { success: data.success, resetLink: data.reset_link ?? undefined };
  } catch (error) {
    return {
      error: error instanceof ApiError ? error.message : "Could not create a reset link.",
    };
  }
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

  try {
    await apiFetch("/auth/reset-password", {
      method: "POST",
      body: { token, password },
    });
  } catch (error) {
    return {
      error: error instanceof ApiError ? error.message : "This reset link is invalid or expired.",
    };
  }
  redirect("/login?reset=1");
}

export async function updateProfileAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const name = text(formData.get("full_name"));
  const phone = text(formData.get("phone"));
  if (!lengthBetween(name, 2, 150)) return { error: "Please enter your full name." };

  try {
    await apiFetch("/auth/profile", {
      method: "PATCH",
      body: { full_name: name, phone: phone || null },
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/login?next=/dashboard/profile");
    }
    return { error: error instanceof ApiError ? error.message : "Could not update your profile." };
  }
  return { success: "Profile updated." };
}

export async function changePasswordAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const current = text(formData.get("current_password"));
  const password = text(formData.get("password"));
  const confirm = text(formData.get("password_confirm"));

  if (!passwordOk(password)) return { error: "New password must be at least 8 characters." };
  if (password !== confirm) return { error: "New passwords do not match." };

  try {
    await apiFetch("/auth/change-password", {
      method: "POST",
      body: { current_password: current, password },
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/login?next=/dashboard/change-password");
    }
    return { error: error instanceof ApiError ? error.message : "Could not change your password." };
  }
  return { success: "Password changed." };
}
