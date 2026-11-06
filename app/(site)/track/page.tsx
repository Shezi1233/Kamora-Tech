import Link from "next/link";
import { query, queryOne } from "@/lib/db";
import type { Order, OrderItem, StatusHistory } from "@/lib/types";
import { formatDate, formatDateTime, money } from "@/lib/format";
import { requireUser } from "@/lib/session";

export const metadata = { title: "Track Order" };

function one(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export default async function TrackPage({
  searchParams,
}: {
  searchParams: Promise<{ tracking?: string }>;
}) {
  const tracking = one((await searchParams).tracking).trim();
  const nextPath = tracking ? `/track?tracking=${encodeURIComponent(tracking)}` : "/track";
  const user = await requireUser(nextPath);
  let order: Order | null = null;
  let items: OrderItem[] = [];
  let history: StatusHistory[] = [];

  if (tracking) {
    order = await queryOne<Order>(
      "SELECT * FROM orders WHERE tracking_id = ? AND user_id = ? LIMIT 1",
      [tracking, user.id],
    ).catch(() => null);
    if (order) {
      [items, history] = await Promise.all([
        query<OrderItem>("SELECT * FROM order_items WHERE order_id = ? ORDER BY id", [order.id]).catch(() => []),
        query<StatusHistory>("SELECT * FROM order_status_history WHERE order_id = ? ORDER BY id DESC", [order.id]).catch(() => []),
      ]);
    }
  }

  return (
    <>
      <section className="section-alt py-5">
        <div className="container">
          <p className="section-eyebrow mb-1">Order tracking</p>
          <h1 className="mb-2">Check your project status</h1>
          <p className="text-secondary mb-0">
            Enter the tracking ID from your order confirmation. Only orders linked to your account are shown.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="container" style={{ maxWidth: 820 }}>
          <form action="/track" method="get" className="card p-3 p-md-4 mb-4">
            <label className="form-label" htmlFor="tracking">Tracking ID</label>
            <div className="input-group">
              <input id="tracking" name="tracking" defaultValue={tracking} className="form-control" placeholder="AG-2026-XXXXXX" required />
              <button type="submit" className="btn btn-primary">Track</button>
            </div>
          </form>

          {tracking && !order ? (
            <div className="alert alert-danger">No order found for tracking ID <strong>{tracking}</strong>.</div>
          ) : null}

          {order ? (
            <div className="card p-4">
              <div className="d-flex flex-wrap justify-content-between gap-2 border-bottom border-secondary border-opacity-25 pb-3 mb-3">
                <div>
                  <span className="small text-secondary d-block">Tracking ID</span>
                  <strong>{order.tracking_id}</strong>
                </div>
                <div>
                  <span className="small text-secondary d-block">Status</span>
                  <span className="badge badge-status">{order.status}</span>
                </div>
                <div>
                  <span className="small text-secondary d-block">Payment</span>
                  <span className="badge badge-status">{order.payment_status}</span>
                </div>
                <div>
                  <span className="small text-secondary d-block">Placed</span>
                  <strong>{formatDate(order.created_at)}</strong>
                </div>
              </div>
              <h2 className="h5">Services</h2>
              <ul className="list-group list-group-flush mb-3">
                {items.map((item) => (
                  <li className="list-group-item bg-transparent text-reset px-0 d-flex justify-content-between gap-2" key={item.id}>
                    <span>{item.service_title} <span className="text-secondary">× {item.quantity}</span></span>
                    <strong>{money(item.line_total)}</strong>
                  </li>
                ))}
              </ul>
              <div className="d-flex justify-content-between border-top border-secondary border-opacity-25 pt-3">
                <span className="text-secondary">Total</span>
                <strong>{money(order.total)}</strong>
              </div>
              {history.length > 0 ? (
                <>
                  <h2 className="h5 mt-4">History</h2>
                  <div className="timeline">
                    {history.map((entry) => (
                      <div className="timeline-item" key={entry.id}>
                        <strong>{entry.new_status}</strong>
                        <span className="small text-secondary d-block">{formatDateTime(entry.created_at)}</span>
                        {entry.customer_note ? <p className="small mb-0">{entry.customer_note}</p> : null}
                      </div>
                    ))}
                  </div>
                </>
              ) : null}
              <p className="small text-secondary mt-4 mb-0">
                Need help? <Link href="/contact">Contact support</Link> and include your tracking ID.
              </p>
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
