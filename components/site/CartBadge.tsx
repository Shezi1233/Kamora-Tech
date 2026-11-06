"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function CartBadge({ initialCount = 0 }: { initialCount?: number }) {
  const [count, setCount] = useState(initialCount);
  const [bump, setBump] = useState(false);

  useEffect(() => {
    function onCount(event: Event) {
      const detail = (event as CustomEvent<{ count: number }>).detail;
      if (detail && typeof detail.count === "number") {
        setCount(detail.count);
        setBump(true);
        window.setTimeout(() => setBump(false), 350);
      }
    }
    window.addEventListener("cart:count", onCount);
    return () => window.removeEventListener("cart:count", onCount);
  }, []);

  return (
    <Link href="/cart" className="btn btn-outline-light position-relative" aria-label="Cart">
      <i className="fa-solid fa-cart-shopping" aria-hidden="true" />
      <span
        id="cart-count"
        className={`badge bg-accent ms-1 ${bump ? "bump" : ""}`}
        aria-live="polite"
      >
        {count}
      </span>
    </Link>
  );
}
