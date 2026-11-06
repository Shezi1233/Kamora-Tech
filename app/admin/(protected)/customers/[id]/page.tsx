import Link from "next/link";
import { notFound } from "next/navigation";
import { query, queryOne } from "@/lib/db";
import type { Order, User } from "@/lib/types";
import { formatDate, formatDateTime, money } from "@/lib/format";
import { toggleCustomerAction } from "@/lib/actions/admin";

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = Number.parseInt(id, 10);
  if (!Number.isFinite(userId)) notFound();
  const customer = await queryOne<User>("SELECT * FROM users WHERE id = ? LIMIT 1", [userId]).catch(() => null);
  if (!customer) notFound();
  const orders = await query<Order>("SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC", [userId]).catch(() => []);

  return (
    <>
      <Link href="/admin/customers" className="small">← Back to customers</Link>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 my-3">
        <h1 className="h3 mb-0">{customer.full_name}</h1>
        <form action={toggleCustomerAction}>
          <input type="hidden" name="user_id" value={customer.id} />
          <button className="btn btn-outline-light">{Number(customer.is_active) === 1 ? "Disable account" : "Enable account"}</button>
        </form>
      </div>
      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card p-4">
            <h2 className="h5">Details</h2>
            <p className="small mb-1"><span className="text-secondary">Email:</span> {customer.email}</p>
            <p className="small mb-1"><span className="text-secondary">Phone:</span> {customer.phone || "—"}</p>
            <p className="small mb-1"><span className="text-secondary">Joined:</span> {formatDate(customer.created_at)}</p>
            <p className="small mb-0"><span className="text-secondary">Status:</span> {Number(customer.is_active) === 1 ? "Active" : "Disabled"}</p>
          </div>
        </div>
        <div className="col-lg-8">
          <div className="card p-4">
            <h2 className="h5">Orders ({orders.length})</h2>
            {orders.length === 0 ? <p className="text-secondary small mb-0">No orders.</p> : (
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead><tr><th>Tracking</th><th>Status</th><th>Total</th><th>Date</th><th /></tr></thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td>{order.tracking_id}</td>
                        <td><span className="badge badge-status">{order.status}</span></td>
                        <td>{money(order.total)}</td>
                        <td className="small">{formatDateTime(order.created_at)}</td>
                        <td className="text-end"><Link href={`/admin/orders/${order.id}`} className="btn btn-sm btn-outline-light">Open</Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
