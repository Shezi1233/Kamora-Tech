import Link from "next/link";
import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { requireUser } from "@/lib/session";
import type { Order, OrderItem, Payment, StatusHistory } from "@/lib/types";
import { formatDate, formatDateTime, money } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DashboardOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser("/dashboard/orders");
  const { id } = await params;
  const orderId = Number.parseInt(id, 10);
  if (!Number.isFinite(orderId)) notFound();

  const order = await apiFetch<
    Order & { items: OrderItem[]; history: StatusHistory[]; payments: Payment[] }
  >(`/orders/${orderId}`);
  if (!order) notFound();

  const items = order.items ?? [];
  const history = order.history ?? [];
  const payments = order.payments ?? [];

  return (
    <div className="d-grid gap-4">
      <div className="card p-4">
        <div className="d-flex flex-wrap justify-content-between gap-2">
          <div>
            <Link href="/dashboard/orders" className="small">← Back to orders</Link>
            <h2 className="h4 mt-2 mb-1">{order.tracking_id}</h2>
            <span className="text-secondary small">Placed {formatDateTime(order.created_at)}</span>
          </div>
          <div className="text-sm-end">
            <span className="badge badge-status me-1">{order.status}</span>
            <span className="badge badge-status">{order.payment_status}</span>
          </div>
        </div>
        {order.expected_completion ? (
          <p className="small text-secondary mt-3 mb-0">Expected completion: {formatDate(order.expected_completion)}</p>
        ) : null}
      </div>

      <div className="card p-4">
        <h3 className="h5">Services</h3>
        <div className="table-responsive">
          <table className="table">
            <thead><tr><th>Service</th><th>Unit price</th><th>Qty</th><th>Total</th></tr></thead>
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
        <div className="row justify-content-end">
          <div className="col-sm-6 col-lg-4">
            <div className="d-flex justify-content-between py-1"><span className="text-secondary">Subtotal</span><span>{money(order.subtotal)}</span></div>
            <div className="d-flex justify-content-between py-1"><span className="text-secondary">Discount</span><span>{money(order.discount)}</span></div>
            <div className="d-flex justify-content-between py-1 fs-5"><strong>Total</strong><strong>{money(order.total)}</strong></div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card p-4 h-100">
            <h3 className="h5">Progress</h3>
            <div className="timeline">
              {history.map((entry) => (
                <div className="timeline-item" key={entry.id}>
                  <strong>{entry.new_status}</strong>
                  <span className="small text-secondary d-block">{formatDateTime(entry.created_at)}</span>
                  {entry.customer_note ? <p className="small mb-0">{entry.customer_note}</p> : null}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="col-lg-5">
          <div className="card p-4 mb-4">
            <h3 className="h5">Project brief</h3>
            {order.company ? <p className="mb-1"><span className="text-secondary">Company:</span> {order.company}</p> : null}
            <p className="small text-secondary mb-1">Requirements</p>
            <p className="mb-2" style={{ whiteSpace: "pre-line" }}>{order.requirements || "—"}</p>
            {order.notes ? <><p className="small text-secondary mb-1">Notes</p><p className="mb-0" style={{ whiteSpace: "pre-line" }}>{order.notes}</p></> : null}
          </div>
          <div className="card p-4">
            <h3 className="h5">Payments</h3>
            {payments.length === 0 ? <p className="text-secondary small mb-0">No payment records.</p> : (
              <ul className="list-unstyled small mb-0 d-grid gap-2">
                {payments.map((payment) => (
                  <li key={payment.id} className="d-flex justify-content-between gap-2">
                    <span>{payment.method}</span>
                    <span>{money(payment.amount)} · {payment.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
