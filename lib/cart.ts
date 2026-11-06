import "server-only";
import { cookies } from "next/headers";
import { execute, getPool, placeholders, query, queryOne } from "./db";
import { getCurrentUser } from "./session";
import type { CartLine, Service } from "./types";

export const CART_COOKIE = "kt_cart";
const CART_MAX_AGE = 60 * 60 * 24 * 30;

type GuestCart = Record<string, number>;

async function readGuestCart(): Promise<GuestCart> {
  try {
    const raw = (await cookies()).get(CART_COOKIE)?.value;
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    const cart: GuestCart = {};
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      const id = Number.parseInt(key, 10);
      const qty = Number.parseInt(String(value), 10);
      if (Number.isFinite(id) && id > 0 && Number.isFinite(qty) && qty > 0) {
        cart[String(id)] = qty;
      }
    }
    return cart;
  } catch {
    return {};
  }
}

async function writeGuestCart(cart: GuestCart): Promise<void> {
  const store = await cookies();
  const clean: GuestCart = {};
  for (const [key, qty] of Object.entries(cart)) {
    if (qty > 0) clean[key] = qty;
  }
  if (Object.keys(clean).length === 0) {
    store.delete(CART_COOKIE);
    return;
  }
  store.set(CART_COOKIE, JSON.stringify(clean), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: CART_MAX_AGE,
  });
}

export async function cartCount(): Promise<number> {
  try {
    const user = await getCurrentUser();
    if (user) {
      const row = await queryOne<{ total: number | string }>(
        `SELECT COALESCE(SUM(ci.quantity), 0) AS total
         FROM carts c JOIN cart_items ci ON ci.cart_id = c.id
         WHERE c.user_id = ?`,
        [user.id],
      );
      return Number(row?.total ?? 0);
    }
    const guest = await readGuestCart();
    return Object.values(guest).reduce((sum, qty) => sum + qty, 0);
  } catch {
    return 0;
  }
}

export async function getCartLines(): Promise<{
  lines: CartLine[];
  subtotal: number;
  hasQuote: boolean;
}> {
  const user = await getCurrentUser();
  let items: CartLine[] = [];

  if (user) {
    items = await query<CartLine>(
      `SELECT s.*, c2.name AS category_name, ci.quantity, ci.id AS item_id
       FROM cart_items ci
       JOIN services s ON s.id = ci.service_id
       JOIN carts c ON c.id = ci.cart_id
       JOIN categories c2 ON c2.id = s.category_id
       WHERE c.user_id = ? AND s.is_active = 1
       ORDER BY ci.id`,
      [user.id],
    );
    items = items.map((row) => ({ ...row, category_name: row.category_name }));
  } else {
    const guest = await readGuestCart();
    const ids = Object.keys(guest).map((id) => Number(id));
    if (ids.length) {
      const rows = await query<Service & { category_name: string }>(
        `SELECT s.*, c.name AS category_name
         FROM services s JOIN categories c ON c.id = s.category_id
         WHERE s.id IN (${placeholders(ids.length)}) AND s.is_active = 1`,
        ids,
      );
      items = rows.map((row) => ({
        ...row,
        quantity: guest[String(row.id)] ?? 1,
        item_id: row.id,
      }));
    }
  }

  let subtotal = 0;
  let hasQuote = false;
  for (const item of items) {
    const price = item.price === null || item.price === "" ? null : Number(item.price);
    if (price === null) hasQuote = true;
    else subtotal += price * item.quantity;
  }
  return { lines: items, subtotal, hasQuote };
}

async function getOrCreateCartId(userId: number): Promise<number> {
  const existing = await queryOne<{ id: number }>("SELECT id FROM carts WHERE user_id = ? LIMIT 1", [
    userId,
  ]);
  if (existing) return existing.id;
  const result = await execute("INSERT INTO carts (user_id) VALUES (?)", [userId]);
  return result.insertId;
}

export async function addToCart(serviceId: number): Promise<number> {
  const service = await queryOne<{ id: number }>(
    "SELECT id FROM services WHERE id = ? AND is_active = 1",
    [serviceId],
  );
  if (!service) throw new Error("That service is not available.");

  const user = await getCurrentUser();
  if (user) {
    const cartId = await getOrCreateCartId(user.id);
    const existing = await queryOne<{ id: number; quantity: number }>(
      "SELECT id, quantity FROM cart_items WHERE cart_id = ? AND service_id = ?",
      [cartId, serviceId],
    );
    if (existing) {
      await execute("UPDATE cart_items SET quantity = ? WHERE id = ?", [
        existing.quantity + 1,
        existing.id,
      ]);
    } else {
      await execute("INSERT INTO cart_items (cart_id, service_id, quantity) VALUES (?, ?, 1)", [
        cartId,
        serviceId,
      ]);
    }
  } else {
    const guest = await readGuestCart();
    guest[String(serviceId)] = (guest[String(serviceId)] ?? 0) + 1;
    await writeGuestCart(guest);
  }
  return cartCount();
}

export async function updateCartQuantities(
  quantities: Record<string, number>,
): Promise<void> {
  const user = await getCurrentUser();
  if (user) {
    for (const [key, qty] of Object.entries(quantities)) {
      const itemId = Number.parseInt(key, 10);
      if (!Number.isFinite(itemId)) continue;
      if (qty <= 0) {
        await execute(
          `DELETE ci FROM cart_items ci JOIN carts c ON c.id = ci.cart_id
           WHERE c.user_id = ? AND ci.id = ?`,
          [user.id, itemId],
        );
      } else {
        await execute(
          `UPDATE cart_items ci JOIN carts c ON c.id = ci.cart_id
           SET ci.quantity = ? WHERE c.user_id = ? AND ci.id = ?`,
          [qty, user.id, itemId],
        );
      }
    }
  } else {
    const guest = await readGuestCart();
    for (const [key, qty] of Object.entries(quantities)) {
      const id = Number.parseInt(key, 10);
      if (!Number.isFinite(id)) continue;
      if (qty <= 0) delete guest[String(id)];
      else guest[String(id)] = qty;
    }
    await writeGuestCart(guest);
  }
}

export async function removeCartLine(itemId: number): Promise<void> {
  const user = await getCurrentUser();
  if (user) {
    await execute(
      `DELETE ci FROM cart_items ci JOIN carts c ON c.id = ci.cart_id
       WHERE c.user_id = ? AND ci.id = ?`,
      [user.id, itemId],
    );
  } else {
    const guest = await readGuestCart();
    delete guest[String(itemId)];
    await writeGuestCart(guest);
  }
}

export async function clearCart(): Promise<void> {
  const user = await getCurrentUser();
  if (user) {
    await execute(
      `DELETE ci FROM cart_items ci JOIN carts c ON c.id = ci.cart_id WHERE c.user_id = ?`,
      [user.id],
    );
  } else {
    await writeGuestCart({});
  }
}

export async function mergeGuestCartIntoDb(userId: number): Promise<void> {
  const guest = await readGuestCart();
  if (Object.keys(guest).length === 0) return;
  const cartId = await getOrCreateCartId(userId);
  for (const [key, qty] of Object.entries(guest)) {
    const serviceId = Number.parseInt(key, 10);
    if (!Number.isFinite(serviceId) || serviceId <= 0) continue;
    const existing = await queryOne<{ id: number; quantity: number }>(
      "SELECT id, quantity FROM cart_items WHERE cart_id = ? AND service_id = ?",
      [cartId, serviceId],
    );
    if (existing) {
      await execute("UPDATE cart_items SET quantity = ? WHERE id = ?", [
        existing.quantity + qty,
        existing.id,
      ]);
    } else {
      await execute(
        "INSERT INTO cart_items (cart_id, service_id, quantity) VALUES (?, ?, ?)",
        [cartId, serviceId, qty],
      );
    }
  }
  await writeGuestCart({});
}

export async function clearDbCart(userId: number): Promise<void> {
  const connection = await getPool().getConnection();
  try {
    await connection.execute(
      `DELETE ci FROM cart_items ci JOIN carts c ON c.id = ci.cart_id WHERE c.user_id = ?`,
      [userId],
    );
  } finally {
    connection.release();
  }
}
