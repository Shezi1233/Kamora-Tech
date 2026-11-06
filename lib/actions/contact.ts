"use server";

import { redirect } from "next/navigation";

import { ApiError, apiFetch } from "@/lib/api";
import { email as isEmail, lengthBetween, text } from "@/lib/validation";

export type ContactState = {
  error?: string;
};

export async function contactAction(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const name = text(formData.get("name"));
  const email = text(formData.get("email")).toLowerCase();
  const subject = text(formData.get("subject"));
  const message = text(formData.get("message"));

  if (!lengthBetween(name, 2, 150)) return { error: "Please enter your name." };
  if (!isEmail(email)) return { error: "Please enter a valid email address." };
  if (!lengthBetween(message, 10, 5000)) {
    return { error: "Please write a message of at least 10 characters." };
  }

  try {
    await apiFetch("/contact", {
      method: "POST",
      body: { name, email, subject: subject || null, message },
    });
  } catch (error) {
    return {
      error: error instanceof ApiError ? error.message : "Could not send your message.",
    };
  }
  redirect("/contact?sent=1");
}

export async function markNotificationsReadAction(): Promise<void> {
  try {
    await apiFetch("/notifications/read", { method: "POST" });
  } catch (error) {
    console.error("[notifications] could not mark as read", error);
  }
  redirect("/dashboard/notifications");
}
