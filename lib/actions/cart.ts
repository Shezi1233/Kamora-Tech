"use server";

import { redirect } from "next/navigation";
import {
  addToCart,
  cartCount,
  clearCart,
  getCartLines,
  removeCartLine,
  updateCartQuantities,
} from "@/lib/cart";

export type CartActionResult = {
  ok: boolean;
  count: number;
  error?: string;
  redirectTo?: string;
};

export async function addToCartAction(
  serviceId: number,
  orderNow = false,
): Promise<CartActionResult> {
  try {
    const id = Number(serviceId);
    if (!Number.isFinite(id) || id <= 0) {
      return { ok: false, count: 0, error: "Invalid service." };
    }
    const count = await addToCart(id);
    return {
      ok: true,
      count,
      redirectTo: orderNow ? "/checkout" : undefined,
    };
  } catch (error) {
    return {
      ok: false,
      count: 0,
      error: error instanceof Error ? error.message : "Could not add to cart.",
    };
  }
}

export async function updateCartAction(formData: FormData): Promise<void> {
  const quantities: Record<string, number> = {};
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("qty[")) continue;
    const itemId = key.slice(4, -1);
    const qty = Number.parseInt(String(value), 10);
    if (Number.isFinite(qty)) quantities[itemId] = Math.max(0, qty);
  }
  await updateCartQuantities(quantities);
  redirect("/cart?updated=1");
}

export async function removeCartItemAction(
  itemId: number,
): Promise<{ ok: boolean; count: number }> {
  const id = Number(itemId);
  if (Number.isFinite(id) && id > 0) await removeCartLine(id);
  return { ok: true, count: await cartCount() };
}

export async function clearCartAction(): Promise<void> {
  await clearCart();
  redirect("/cart?cleared=1");
}

export async function cartSummary() {
  return getCartLines();
}
