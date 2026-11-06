import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { requireUser } from "@/lib/session";

export const metadata = { title: "Order Placed" };
export const dynamic = "force-dynamic";

function one(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ tracking?: string }>;
}) {
  const user = await requireUser("/checkout");
  const tracking = one((await searchParams).tracking).trim();
  let order: { tracking_id: string } | null = null;
  if (tracking) {
    try {
      order = await apiFetch<{ tracking_id: string }>(
        `/orders/track?tracking=${encodeURIComponent(tracking)}`,
      );
    } catch (error) {
      console.error("[checkout] tracking lookup failed", error);
    }
  }

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 720 }}>
        <div className="card p-4 p-md-5 text-center">
          <i className="fa-solid fa-circle-check display-4 text-secondary mb-3" aria-hidden="true" />
          <p className="section-eyebrow mb-1">Order placed</p>
          <h1 className="h2">Thank you, {user.full_name.split(" ")[0]}.</h1>
          <p className="text-secondary">
            Your order has been received and is now in our queue. We will review the requirements and
            confirm the next steps.
          </p>
          {order ? (
            <div className="card muted-card p-3 my-4">
              <span className="small text-secondary d-block">Tracking ID</span>
              <strong className="fs-4">{order.tracking_id}</strong>
            </div>
          ) : null}
          <div className="d-flex flex-wrap justify-content-center gap-2">
            {order ? (
              <Link href={`/track?tracking=${encodeURIComponent(order.tracking_id)}`} className="btn btn-primary">
                Track order
              </Link>
            ) : null}
            <Link href="/dashboard/orders" className="btn btn-outline-light">My orders</Link>
            <Link href="/services" className="btn btn-outline-light">Continue browsing</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
