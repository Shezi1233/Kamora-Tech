"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { removeCartItemAction } from "@/lib/actions/cart";

export function RemoveCartLineButton({
  itemId,
  title,
}: {
  itemId: number;
  title: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onClick() {
    startTransition(async () => {
      const result = await removeCartItemAction(itemId);
      window.dispatchEvent(
        new CustomEvent("cart:count", { detail: { count: result.count } }),
      );
      window.dispatchEvent(
        new CustomEvent("app:toast", {
          detail: { message: "Service removed from your cart." },
        }),
      );
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="btn btn-sm btn-outline-light"
      aria-label={`Remove ${title}`}
    >
      <i
        className={`fa-solid ${pending ? "fa-spinner fa-spin" : "fa-xmark"}`}
        aria-hidden="true"
      />
    </button>
  );
}
