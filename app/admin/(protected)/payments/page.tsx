import Link from "next/link";
import { query } from "@/lib/db";
import type { Payment } from "@/lib/types";
import { formatDate, money } from "@/lib/format";

export default async function AdminPaymentsPage() {
  const payments = await query<Payment & { tracking_id: string; customer: string }>(
    `SELECT p.*, o.tracking_id, u.full_name AS customer
     FROM payments p JOIN orders o ON o.id = p.order_id JOIN users u ON u.id = o.user_id
     ORDER BY p.id DESC LIMIT 200`,
  ).catch(() => []);

  return (
    <>
      <h1 className="h3 mb-3">Payments</h1>
      <div className="card p-3">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead><tr><th>Tracking</th><th>Customer</th><th>Method</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td><Link href={`/admin/orders/${payment.order_id}`}>{payment.tracking_id}</Link></td>
                  <td className="small">{payment.customer}</td>
                  <td className="small">{payment.method}</td>
                  <td>{money(payment.amount)}</td>
                  <td><span className={`badge ${payment.status === "Paid" ? "bg-success" : payment.status === "Failed" ? "bg-danger" : "bg-secondary"}`}>{payment.status}</span></td>
                  <td className="small">{formatDate(payment.created_at)}</td>
                </tr>
              ))}
              {payments.length === 0 ? <tr><td colSpan={6} className="text-secondary">No payments recorded.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
