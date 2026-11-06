import Link from "next/link";
import { query, queryOne } from "@/lib/db";
import type { ContactMessage, OrderWithCustomer } from "@/lib/types";
import { formatDate, money } from "@/lib/format";

export default async function AdminDashboardPage() {
  const [orders, active, customers, messages, revenue, recent, latestMessages] = await Promise.all([
    queryOne<{ total: number }>("SELECT COUNT(*) AS total FROM orders").catch(() => null),
    queryOne<{ total: number }>("SELECT COUNT(*) AS total FROM orders WHERE status NOT IN ('Delivered','Completed','Cancelled')").catch(() => null),
    queryOne<{ total: number }>("SELECT COUNT(*) AS total FROM users").catch(() => null),
    queryOne<{ total: number }>("SELECT COUNT(*) AS total FROM contact_messages WHERE status = 'new'").catch(() => null),
    queryOne<{ total: string }>("SELECT COALESCE(SUM(total),0) AS total FROM orders WHERE payment_status = 'Paid'").catch(() => null),
    query<OrderWithCustomer>(
      `SELECT o.*, u.full_name, u.email FROM orders o JOIN users u ON u.id = o.user_id ORDER BY o.id DESC LIMIT 6`,
    ).catch(() => []),
    query<ContactMessage>("SELECT * FROM contact_messages ORDER BY id DESC LIMIT 4").catch(() => []),
  ]);

  const stats = [
    { label: "Total orders", value: Number(orders?.total ?? 0), href: "/admin/orders" },
    { label: "Active orders", value: Number(active?.total ?? 0), href: "/admin/orders" },
    { label: "Customers", value: Number(customers?.total ?? 0), href: "/admin/customers" },
    { label: "New messages", value: Number(messages?.total ?? 0), href: "/admin/messages" },
    { label: "Paid revenue", value: money(revenue?.total ?? 0), href: "/admin/payments" },
  ];

  return (
    <>
      <h1 className="h3 mb-4">Dashboard</h1>
      <div className="row g-3 mb-4">
        {stats.map((stat) => (
          <div className="col-6 col-lg-4 col-xl" key={stat.label}>
            <Link href={stat.href} className="card p-3 h-100 text-reset text-decoration-none">
              <span className="small text-secondary">{stat.label}</span>
              <strong className="fs-4">{stat.value}</strong>
            </Link>
          </div>
        ))}
      </div>
      <div className="card p-4 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="h5 mb-0">Recent orders</h2>
          <Link href="/admin/orders" className="small">View all</Link>
        </div>
        {recent.length === 0 ? <p className="text-secondary mb-0">No orders yet.</p> : (
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead><tr><th>Tracking</th><th>Customer</th><th>Status</th><th>Total</th><th>Date</th><th /></tr></thead>
              <tbody>
                {recent.map((order) => (
                  <tr key={order.id}>
                    <td><Link href={`/admin/orders/${order.id}`}>{order.tracking_id}</Link></td>
                    <td className="small">{order.full_name}<span className="d-block text-secondary">{order.email}</span></td>
                    <td><span className="badge badge-status">{order.status}</span></td>
                    <td>{money(order.total)}</td>
                    <td className="small">{formatDate(order.created_at)}</td>
                    <td className="text-end"><Link href={`/admin/orders/${order.id}`} className="btn btn-sm btn-outline-light">Open</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className="card p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="h5 mb-0">Latest messages</h2>
          <Link href="/admin/messages" className="small">Inbox</Link>
        </div>
        {latestMessages.length === 0 ? <p className="text-secondary mb-0">No messages yet.</p> : (
          <ul className="list-unstyled d-grid gap-3 mb-0">
            {latestMessages.map((message) => (
              <li key={message.id} className="border-bottom border-secondary border-opacity-25 pb-2">
                <div className="d-flex justify-content-between gap-2">
                  <strong>{message.subject || "No subject"}</strong>
                  <span className="badge badge-status">{message.status}</span>
                </div>
                <span className="small text-secondary">{message.name} · {message.email} · {formatDate(message.created_at)}</span>
                <p className="small mb-0">{message.message.slice(0, 140)}{message.message.length > 140 ? "…" : ""}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
