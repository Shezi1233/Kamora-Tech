"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addToCartAction } from "@/lib/actions/cart";

export function AddToCartButton({
  serviceId,
  orderNow = false,
  label = "Add to Cart",
  className = "btn btn-primary",
}: {
  serviceId: number;
  orderNow?: boolean;
  label?: string;
  className?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [added, setAdded] = useState(false);

  function onClick() {
    startTransition(async () => {
      const result = await addToCartAction(serviceId, orderNow);
      if (!result.ok) {
        window.dispatchEvent(
          new CustomEvent("app:toast", {
            detail: { message: result.error ?? "Could not add to cart.", tone: "danger" },
          }),
        );
        return;
      }
      window.dispatchEvent(new CustomEvent("cart:count", { detail: { count: result.count } }));
      if (result.redirectTo) {
        router.push(result.redirectTo);
        return;
      }
      setAdded(true);
      window.setTimeout(() => setAdded(false), 1600);
      window.dispatchEvent(
        new CustomEvent("app:toast", { detail: { message: "Service added to your cart." } }),
      );
    });
  }

  return (
    <button
      type="button"
      className={`${className} ${added ? "btn-added" : ""}`}
      onClick={onClick}
      disabled={pending}
    >
      <i
        className={`fa-solid ${added ? "fa-check" : "fa-cart-plus"} me-1`}
        aria-hidden="true"
      />
      {pending ? "Adding…" : added ? "Added" : label}
    </button>
  );
}
