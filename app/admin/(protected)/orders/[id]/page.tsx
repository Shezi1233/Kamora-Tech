import Link from "next/link";
import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";
import type { Order, OrderItem, Payment, StatusHistory } from "@/lib/types";
import { formatDateTime, money } from "@/lib/format";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/lib/constants";
import { updateOrderAction } from "@/lib/actions/admin";

export const dynamic = "force-dynamic";

function one(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export default async function AdminOrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const { id } = await params;
  const queryParams = await searchParams;
  const orderId = Number.parseInt(id, 10);
  if (!Number.isFinite(orderId)) notFound();

  const order = await apiFetch<
    Order & { items: OrderItem[]; history: StatusHistory[]; payments: Payment[] }
  >(`/admin/orders/${orderId}`, { admin: true });
  if (!order) notFound();

  const items = order.items ?? [];
  const history = order.history ?? [];
  const payments = order.payments ?? [];

  return (
    <>
      <Link href="/admin/orders" className="small">← Back to orders</Link>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 my-3">
        <h1 className="h3 mb-0">{order.tracking_id}</h1>
        <span className="text-secondary small">{formatDateTime(order.created_at)}</span>
      </div>
      {one(queryParams.success) ? <div className="alert alert-success py-2">{one(queryParams.success)}</div> : null}
      {one(queryParams.error) ? <div className="alert alert-danger py-2">{one(queryParams.error)}</div> : null}

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card p-4 mb-4">
            <h2 className="h5">Order items</h2>
            <div className="table-responsive">
              <table className="table">
                <thead><tr><th>Service</th><th>Unit</th><th>Qty</th><th>Total</th></tr></thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.service_title}</td>
                      <td>{item.unit_price === null ? "Quote" : money(item.unit_price)}</td>
                      <td>{item.quantity}</td>
                      <td>{item.unit_price === null ? "Quote" : money(item.line_total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="row justify-content-end small">
              <div className="col-sm-6">
                <div className="d-flex justify-content-between"><span className="text-secondary">Subtotal</span><span>{money(order.subtotal)}</span></div>
                <div className="d-flex justify-content-between"><span className="text-secondary">Discount</span><span>{money(order.discount)}</span></div>
                <div className="d-flex justify-content-between fs-6"><strong>Total</strong><strong>{money(order.total)}</strong></div>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <h2 className="h5">Update order</h2>
            <form action={updateOrderAction} className="d-grid gap-3">
              <input type="hidden" name="id" value={order.id} />
              <div className="row g-3">
                <div className="col-sm-6">
                  <label className="form-label" htmlFor="order-status">Status</label>
                  <select id="order-status" name="status" defaultValue={order.status} className="form-select">
                    {ORDER_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                </div>
                <div className="col-sm-6">
                  <label className="form-label" htmlFor="payment-status">Payment status</label>
                  <select id="payment-status" name="payment_status" defaultValue={order.payment_status} className="form-select">
                    {PAYMENT_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="form-label" htmlFor="expected">Expected completion</label>
                <input id="expected" name="expected_completion" type="date" defaultValue={order.expected_completion ?? ""} className="form-control" />
              </div>
              <div>
                <label className="form-label" htmlFor="customer-note">Customer-visible note (optional)</label>
                <textarea id="customer-note" name="customer_note" rows={3} className="form-control" />
              </div>
              <div>
                <label className="form-label" htmlFor="internal-note">Internal note (never shown to customer)</label>
                <textarea id="internal-note" name="internal_note" rows={3} defaultValue={order.internal_note ?? ""} className="form-control" />
              </div>
              <button className="btn btn-primary">Save order</button>
            </form>
          </div>
        </div>

        <aside className="col-lg-5">
          <div className="card p-4 mb-4">
            <h2 className="h5">Customer</h2>
            <p className="mb-1"><strong>{order.full_name}</strong></p>
            <p className="small text-secondary mb-1">{order.email}</p>
            {order.phone ? <p className="small text-secondary mb-0">{order.phone}</p> : null}
            {order.company ? <p className="small mt-2 mb-0">Company: {order.company}</p> : null}
            {order.coupon_code ? <p className="small mt-2 mb-0">Coupon: {order.coupon_code}</p> : null}
          </div>
          <div className="card p-4 mb-4">
            <h2 className="h5">Brief</h2>
            <p className="small text-secondary mb-1">Requirements</p>
            <p className="small" style={{ whiteSpace: "pre-line" }}>{order.requirements || "—"}</p>
            <p className="small text-secondary mb-1">Customer notes</p>
            <p className="small mb-0" style={{ whiteSpace: "pre-line" }}>{order.notes || "—"}</p>
          </div>
          <div className="card p-4 mb-4">
            <h2 className="h5">Payments</h2>
            {payments.length === 0 ? <p className="small text-secondary mb-0">None recorded.</p> : (
              <ul className="small list-unstyled d-grid gap-2 mb-0">
                {payments.map((payment) => (
                  <li key={payment.id} className="d-flex justify-content-between gap-2">
                    <span>{payment.method}</span><span>{money(payment.amount)} · {payment.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="card p-4">
            <h2 className="h5">Status history</h2>
            <div className="timeline">
              {history.map((entry) => (
                <div className="timeline-item" key={entry.id}>
                  <strong>{entry.new_status}</strong>
                  <span className="small text-secondary d-block">{formatDateTime(entry.created_at)}{entry.admin_name ? ` · ${entry.admin_name}` : ""}</span>
                  {entry.customer_note ? <p className="small mb-0">{entry.customer_note}</p> : null}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
