import Link from "next/link";
import { apiFetch } from "@/lib/api";
import type { OrderWithCustomer } from "@/lib/types";
import { formatDate, money } from "@/lib/format";
import { ORDER_STATUSES } from "@/lib/constants";

export const dynamic = "force-dynamic";

function one(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const params = await searchParams;
  const q = one(params.q).trim();
  const status = one(params.status).trim();

  const query = new URLSearchParams();
  if (q) query.set("q", q);
  if (status) query.set("status_filter", status);
  const orders = await apiFetch<OrderWithCustomer[]>(
    `/admin/orders${query.toString() ? `?${query.toString()}` : ""}`,
    { admin: true },
  );

  return (
    <>
      <h1 className="h3 mb-3">Orders</h1>
      <form action="/admin/orders" method="get" className="row g-2 mb-3">
        <div className="col-sm"><input name="q" defaultValue={q} className="form-control" placeholder="Tracking, name, email…" /></div>
        <div className="col-sm-4">
          <select name="status" defaultValue={status} className="form-select">
            <option value="">All statuses</option>
            {ORDER_STATUSES.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
        <div className="col-auto"><button className="btn btn-outline-light">Filter</button></div>
      </form>
      <div className="card p-3">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead><tr><th>Tracking</th><th>Customer</th><th>Status</th><th>Payment</th><th>Total</th><th>Placed</th><th /></tr></thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td><Link href={`/admin/orders/${order.id}`}><strong>{order.tracking_id}</strong></Link></td>
                  <td className="small">{order.full_name}<span className="d-block text-secondary">{order.email}</span></td>
                  <td><span className="badge badge-status">{order.status}</span></td>
                  <td><span className="badge badge-status">{order.payment_status}</span></td>
                  <td>{money(order.total)}</td>
                  <td className="small">{formatDate(order.created_at)}</td>
                  <td className="text-end"><Link href={`/admin/orders/${order.id}`} className="btn btn-sm btn-outline-light">Manage</Link></td>
                </tr>
              ))}
              {orders.length === 0 ? <tr><td colSpan={7} className="text-secondary">No orders found.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
