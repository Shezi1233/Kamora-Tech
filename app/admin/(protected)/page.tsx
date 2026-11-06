import Link from "next/link";
import { apiFetch } from "@/lib/api";
import type { ContactMessage, OrderWithCustomer } from "@/lib/types";
import { formatDate, money } from "@/lib/format";

export const dynamic = "force-dynamic";

type AdminDashboard = {
  stats: {
    total: number;
    active: number;
    customers: number;
    new_messages: number;
    paid_revenue: string | number;
  };
  recent_orders: OrderWithCustomer[];
  latest_messages: ContactMessage[];
};

export default async function AdminDashboardPage() {
  let data: AdminDashboard = {
    stats: { total: 0, active: 0, customers: 0, new_messages: 0, paid_revenue: 0 },
    recent_orders: [],
    latest_messages: [],
  };
  try {
    data = await apiFetch<AdminDashboard>("/admin/dashboard", { admin: true });
  } catch (error) {
    console.error("[admin] dashboard failed", error);
  }
  const recent = data.recent_orders;
  const latestMessages = data.latest_messages;

  const stats = [
    { label: "Total orders", value: Number(data.stats.total), href: "/admin/orders" },
    { label: "Active orders", value: Number(data.stats.active), href: "/admin/orders" },
    { label: "Customers", value: Number(data.stats.customers), href: "/admin/customers" },
    { label: "New messages", value: Number(data.stats.new_messages), href: "/admin/messages" },
    { label: "Paid revenue", value: money(data.stats.paid_revenue), href: "/admin/payments" },
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
