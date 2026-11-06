import Link from "next/link";
import { apiFetch } from "@/lib/api";
import type { User } from "@/lib/types";
import { formatDate, money } from "@/lib/format";
import { toggleCustomerAction } from "@/lib/actions/admin";

export const dynamic = "force-dynamic";

function one(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; q?: string }>;
}) {
  const params = await searchParams;
  const q = one(params.q).trim();
  const path = q
    ? `/admin/customers?${new URLSearchParams({ q }).toString()}`
    : "/admin/customers";
  const customers = await apiFetch<(User & { order_count: number; total_spent: string })[]>(
    path,
    { admin: true },
  );

  return (
    <>
      <h1 className="h3 mb-3">Customers</h1>
      {one(params.success) ? <div className="alert alert-success py-2">{one(params.success)}</div> : null}
      <form action="/admin/customers" method="get" className="row g-2 mb-3">
        <div className="col-sm"><input name="q" defaultValue={q} className="form-control" placeholder="Name or email…" /></div>
        <div className="col-auto"><button className="btn btn-outline-light">Search</button></div>
      </form>
      <div className="card p-3">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead><tr><th>Name</th><th>Contact</th><th>Orders</th><th>Total</th><th>Joined</th><th>Status</th><th /></tr></thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td><Link href={`/admin/customers/${customer.id}`}><strong>{customer.full_name}</strong></Link></td>
                  <td className="small">{customer.email}<span className="d-block text-secondary">{customer.phone || "—"}</span></td>
                  <td>{Number(customer.order_count)}</td>
                  <td>{money(customer.total_spent)}</td>
                  <td className="small">{formatDate(customer.created_at)}</td>
                  <td><span className={`badge ${Number(customer.is_active) === 1 ? "bg-success" : "bg-secondary"}`}>{Number(customer.is_active) === 1 ? "Active" : "Disabled"}</span></td>
                  <td className="text-end text-nowrap">
                    <Link href={`/admin/customers/${customer.id}`} className="btn btn-sm btn-outline-light">View</Link>
                    <form action={toggleCustomerAction} className="d-inline ms-1">
                      <input type="hidden" name="user_id" value={customer.id} />
                      <button className="btn btn-sm btn-outline-light">{Number(customer.is_active) === 1 ? "Disable" : "Enable"}</button>
                    </form>
                  </td>
                </tr>
              ))}
              {customers.length === 0 ? <tr><td colSpan={7} className="text-secondary">No customers found.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
