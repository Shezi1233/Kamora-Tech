"use server";

import { redirect } from "next/navigation";
import { randomInt } from "node:crypto";
import type { PoolConnection, ResultSetHeader } from "mysql2/promise";
import { getCartLines } from "@/lib/cart";
import { getCurrentUser } from "@/lib/session";
import { withTransaction } from "@/lib/db";
import { lengthBetween, text } from "@/lib/validation";
import { PAYMENT_METHODS } from "@/lib/constants";

export type CheckoutState = {
  error?: string;
};

const TRACKING_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

async function generateTrackingId(connection: PoolConnection): Promise<string> {
  const year = new Date().getFullYear();
  for (let attempt = 0; attempt < 20; attempt += 1) {
    let random = "";
    for (let i = 0; i < 6; i += 1) {
      random += TRACKING_CHARS[randomInt(0, TRACKING_CHARS.length)];
    }
    const code = `AG-${year}-${random}`;
    const [rows] = await connection.execute(
      "SELECT 1 FROM orders WHERE tracking_id = ? LIMIT 1",
      [code],
    );
    if ((rows as unknown[]).length === 0) return code;
  }
  throw new Error("Could not generate a unique tracking ID.");
}

export async function checkoutAction(
  _prev: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/checkout");

  const cart = await getCartLines();
  if (cart.lines.length === 0) return { error: "Your cart is empty." };

  const company = text(formData.get("company"));
  const requirements = text(formData.get("requirements"));
  const notes = text(formData.get("notes"));
  const methodRaw = text(formData.get("payment_method"));
  const method = (PAYMENT_METHODS as readonly string[]).includes(methodRaw)
    ? methodRaw
    : PAYMENT_METHODS[0];
  let couponCode = text(formData.get("coupon"));
  if (/^(undefined|null)$/i.test(couponCode)) couponCode = "";

  if (!lengthBetween(requirements, 10, 5000)) {
    return { error: "Please describe your project requirements (at least 10 characters)." };
  }

  let tracking = "";
  try {
    tracking = await withTransaction(async (connection) => {
      let discount = 0;
      let appliedCoupon: string | null = null;

      if (couponCode !== "") {
        const [couponRows] = await connection.execute(
          `SELECT * FROM coupons
           WHERE code = ? AND is_active = 1 AND (expires_at IS NULL OR expires_at > NOW())
           LIMIT 1`,
          [couponCode],
        );
        const coupon = (couponRows as Array<Record<string, unknown>>)[0];
        if (!coupon) throw new Error("Coupon code is invalid or expired.");
        discount =
          coupon.discount_type === "percent"
            ? cart.subtotal * (Number(coupon.discount_value) / 100)
            : Math.min(Number(coupon.discount_value), cart.subtotal);
        appliedCoupon = String(coupon.code);
      }
      const total = Math.max(0, cart.subtotal - discount);
      const trackingId = await generateTrackingId(connection);

      const [orderResult] = (await connection.execute(
        `INSERT INTO orders
         (user_id, tracking_id, status, payment_status, subtotal, discount, total, coupon_code, company, requirements, notes)
         VALUES (?, ?, 'Order Placed', 'Pending', ?, ?, ?, ?, ?, ?, ?)`,
        [
          user.id,
          trackingId,
          cart.subtotal,
          discount,
          total,
          appliedCoupon,
          company || null,
          requirements || null,
          notes || null,
        ],
      )) as ResultSetHeader[];
      const orderId = orderResult.insertId;

      for (const line of cart.lines) {
        const [priceRows] = await connection.execute(
          "SELECT price FROM services WHERE id = ? AND is_active = 1 LIMIT 1",
          [line.id],
        );
        const priceRow = (priceRows as Array<{ price: string | null }>)[0];
        if (!priceRow) throw new Error("A service in your cart is no longer available.");
        const unitPrice = priceRow.price === null ? null : Number(priceRow.price);
        const lineTotal = unitPrice === null ? 0 : unitPrice * line.quantity;
        await connection.execute(
          `INSERT INTO order_items
           (order_id, service_id, service_title, unit_price, quantity, line_total)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [orderId, line.id, line.title, unitPrice, line.quantity, lineTotal],
        );
      }

      await connection.execute(
        `INSERT INTO order_status_history
         (order_id, previous_status, new_status, customer_note)
         VALUES (?, NULL, 'Order Placed', 'Order received.')`,
        [orderId],
      );
      await connection.execute(
        "INSERT INTO payments (order_id, method, amount, status) VALUES (?, ?, ?, 'Pending')",
        [orderId, method, total],
      );
      await connection.execute(
        `DELETE ci FROM cart_items ci JOIN carts c ON c.id = ci.cart_id WHERE c.user_id = ?`,
        [user.id],
      );
      await connection.execute(
        "INSERT INTO notifications (user_id, type, message) VALUES (?, 'order_placed', ?)",
        [user.id, `Your order ${trackingId} has been placed.`],
      );
      await connection.execute(
        "INSERT INTO notifications (admin_id, type, message) VALUES (NULL, 'new_order', ?)",
        [`New order ${trackingId} placed.`],
      );

      return trackingId;
    });
  } catch (error) {
    return {
      error:
        error instanceof Error && error.message === "Coupon code is invalid or expired."
          ? error.message
          : "Checkout failed. Please try again.",
    };
  }

  redirect(`/checkout/success?tracking=${encodeURIComponent(tracking)}`);
}
