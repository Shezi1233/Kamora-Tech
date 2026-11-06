import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { requireUser } from "@/lib/session";
import type { Order } from "@/lib/types";
import { formatDate, money } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DashboardOrdersPage() {
  await requireUser("/dashboard/orders");
  const orders = await apiFetch<Order[]>("/orders");

  return (
    <div className="card p-4">
      <h2 className="h4 mb-3">My orders</h2>
      {orders.length === 0 ? (
        <p className="text-secondary mb-0">No orders yet. <Link href="/services">Browse services</Link>.</p>
      ) : (
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr><th>Tracking</th><th>Services</th><th>Status</th><th>Payment</th><th>Total</th><th>Placed</th><th /></tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td><strong>{order.tracking_id}</strong></td>
                  <td className="small">{order.requirements ? `${order.requirements.slice(0, 50)}${order.requirements.length > 50 ? "…" : ""}` : "—"}</td>
                  <td><span className="badge badge-status">{order.status}</span></td>
                  <td><span className="badge badge-status">{order.payment_status}</span></td>
                  <td>{money(order.total)}</td>
                  <td className="small">{formatDate(order.created_at)}</td>
                  <td className="text-end"><Link href={`/dashboard/orders/${order.id}`} className="btn btn-sm btn-outline-light">Open</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
