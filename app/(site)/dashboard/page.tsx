import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { requireUser } from "@/lib/session";
import type { Notification, Order } from "@/lib/types";
import { formatDate, money } from "@/lib/format";

export const dynamic = "force-dynamic";

type DashboardData = {
  total_orders: number;
  active_orders: number;
  unread_notifications: number;
  recent_orders: Order[];
  notifications: Notification[];
};

export default async function DashboardPage() {
  await requireUser("/dashboard");
  let data: DashboardData = {
    total_orders: 0,
    active_orders: 0,
    unread_notifications: 0,
    recent_orders: [],
    notifications: [],
  };
  try {
    data = await apiFetch<DashboardData>("/dashboard");
  } catch (error) {
    console.error("[dashboard] failed", error);
  }
  const orderCount = { total: data.total_orders };
  const activeCount = { total: data.active_orders };
  const unread = { total: data.unread_notifications };
  const recent = data.recent_orders;
  const notifications = data.notifications;

  return (
    <>
      <div className="row g-3 mb-4">
        <div className="col-sm-4">
          <div className="card p-3 h-100">
            <span className="small text-secondary">Total orders</span>
            <strong className="fs-3">{Number(orderCount?.total ?? 0)}</strong>
          </div>
        </div>
        <div className="col-sm-4">
          <div className="card p-3 h-100">
            <span className="small text-secondary">Active orders</span>
            <strong className="fs-3">{Number(activeCount?.total ?? 0)}</strong>
          </div>
        </div>
        <div className="col-sm-4">
          <div className="card p-3 h-100">
            <span className="small text-secondary">Unread notifications</span>
            <strong className="fs-3">{Number(unread?.total ?? 0)}</strong>
          </div>
        </div>
      </div>

      <div className="card p-4 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="h5 mb-0">Recent orders</h2>
          <Link href="/dashboard/orders" className="small">View all</Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-secondary mb-0">No orders yet. <Link href="/services">Browse services</Link> to get started.</p>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr><th>Tracking</th><th>Status</th><th>Total</th><th>Date</th><th /></tr>
              </thead>
              <tbody>
                {recent.map((order) => (
                  <tr key={order.id}>
                    <td><Link href={`/dashboard/orders/${order.id}`}>{order.tracking_id}</Link></td>
                    <td><span className="badge badge-status">{order.status}</span></td>
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

      <div className="card p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="h5 mb-0">Latest updates</h2>
          <Link href="/dashboard/notifications" className="small">All notifications</Link>
        </div>
        {notifications.length === 0 ? (
          <p className="text-secondary mb-0">No notifications yet.</p>
        ) : (
          <ul className="list-unstyled d-grid gap-3 mb-0">
            {notifications.map((note) => (
              <li key={note.id} className="border-bottom border-secondary border-opacity-25 pb-2">
                <p className="mb-1">{note.message}</p>
                <span className="small text-secondary">{formatDate(note.created_at)}{Number(note.is_read) === 0 ? " · Unread" : ""}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
