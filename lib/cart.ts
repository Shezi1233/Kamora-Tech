import "server-only";

import { apiFetch } from "./api";
import { setCartCookie } from "./cookies";
import type { CartLine, Service } from "./types";

type ApiCartLine = Service & { quantity: number; item_id: number };

type ApiCart = {
  lines: ApiCartLine[];
  subtotal: string | number;
  has_quote: boolean;
  item_count: number;
  cart_token?: string | null;
};

export async function cartCount(): Promise<number> {
  try {
    const data = await apiFetch<{ count: number }>("/cart/count", { cache: "no-store" });
    return Number(data.count ?? 0);
  } catch {
    return 0;
  }
}

export async function getCartLines(): Promise<{
  lines: CartLine[];
  subtotal: number;
  hasQuote: boolean;
}> {
  const data = await apiFetch<ApiCart>("/cart", { cache: "no-store" });
  return {
    lines: (data.lines ?? []).map((line) => ({ ...line })),
    subtotal: Number(data.subtotal ?? 0),
    hasQuote: Boolean(data.has_quote),
  };
}

async function persistToken(data: ApiCart): Promise<void> {
  if (data.cart_token) await setCartCookie(data.cart_token);
}

export async function addToCart(serviceId: number): Promise<number> {
  const data = await apiFetch<ApiCart>("/cart/items", {
    method: "POST",
    body: { service_id: serviceId, quantity: 1 },
  });
  await persistToken(data);
  return data.item_count;
}

export async function updateCartQuantities(quantities: Record<string, number>): Promise<void> {
  const normalized: Record<number, number> = {};
  for (const [key, value] of Object.entries(quantities)) {
    const itemId = Number.parseInt(key, 10);
    if (Number.isFinite(itemId)) normalized[itemId] = Math.max(0, value);
  }
  await apiFetch<ApiCart>("/cart/quantities", {
    method: "PUT",
    body: { quantities: normalized },
  });
}

export async function removeCartLine(itemId: number): Promise<void> {
  await apiFetch<ApiCart>(`/cart/items/${itemId}`, { method: "DELETE" });
}

export async function clearCart(): Promise<void> {
  await apiFetch<ApiCart>("/cart", { method: "DELETE" });
}
