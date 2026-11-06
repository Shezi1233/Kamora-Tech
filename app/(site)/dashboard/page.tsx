import Link from "next/link";
import { requireUser } from "@/lib/session";
import { query, queryOne } from "@/lib/db";
import type { Notification, Order } from "@/lib/types";
import { formatDate, money } from "@/lib/format";

export default async function DashboardPage() {
  const user = await requireUser("/dashboard");
  const [orderCount, activeCount, unread, recent, notifications] = await Promise.all([
    queryOne<{ total: number }>("SELECT COUNT(*) AS total FROM orders WHERE user_id = ?", [user.id]).catch(() => null),
    queryOne<{ total: number }>(
      "SELECT COUNT(*) AS total FROM orders WHERE user_id = ? AND status NOT IN ('Delivered','Completed','Cancelled')",
      [user.id],
    ).catch(() => null),
    queryOne<{ total: number }>("SELECT COUNT(*) AS total FROM notifications WHERE user_id = ? AND is_read = 0", [user.id]).catch(() => null),
    query<Order>("SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC LIMIT 5", [user.id]).catch(() => []),
    query<Notification>("SELECT * FROM notifications WHERE user_id = ? ORDER BY id DESC LIMIT 4", [user.id]).catch(() => []),
  ]);

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
