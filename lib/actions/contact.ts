"use server";

import { redirect } from "next/navigation";
import { execute } from "@/lib/db";
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

  await execute(
    "INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)",
    [name, email, subject || null, message],
  );
  await execute(
    "INSERT INTO notifications (admin_id, type, message) VALUES (NULL, 'contact_message', ?)",
    [`New contact message from ${name}`],
  );
  redirect("/contact?sent=1");
}

export async function markNotificationsReadAction(): Promise<void> {
  const { getCurrentUser } = await import("@/lib/session");
  const { execute: run } = await import("@/lib/db");
  const user = await getCurrentUser();
  if (user) {
    await run("UPDATE notifications SET is_read = 1 WHERE user_id = ?", [user.id]);
  }
  redirect("/dashboard/notifications");
}
