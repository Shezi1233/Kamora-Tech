"use server";

import { redirect } from "next/navigation";

import { ApiError, apiFetch } from "@/lib/api";
import { PAYMENT_METHODS } from "@/lib/constants";
import { lengthBetween, text } from "@/lib/validation";

export type CheckoutState = {
  error?: string;
};

export async function checkoutAction(
  _prev: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const company = text(formData.get("company"));
  const requirements = text(formData.get("requirements"));
  const notes = text(formData.get("notes"));
  const methodRaw = text(formData.get("payment_method"));
  const method = (PAYMENT_METHODS as readonly string[]).includes(methodRaw)
    ? methodRaw
    : PAYMENT_METHODS[0];
  let coupon = text(formData.get("coupon"));
  if (/^(undefined|null)$/i.test(coupon)) coupon = "";

  if (!lengthBetween(requirements, 10, 5000)) {
    return { error: "Please describe your project requirements (at least 10 characters)." };
  }

  let tracking: string;
  try {
    const data = await apiFetch<{ tracking_id: string; order_id: number }>("/orders", {
      method: "POST",
      body: {
        company: company || null,
        requirements,
        notes: notes || null,
        payment_method: method,
        coupon: coupon || null,
      },
    });
    tracking = data.tracking_id;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/login?next=/checkout");
    }
    return {
      error: error instanceof ApiError ? error.message : "Checkout failed. Please try again.",
    };
  }

  redirect(`/checkout/success?tracking=${encodeURIComponent(tracking)}`);
}
