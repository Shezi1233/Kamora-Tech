import Link from "next/link";
import { query } from "@/lib/db";
import type { Service } from "@/lib/types";
import { priceLabel } from "@/lib/format";
import { deleteServiceAction } from "@/lib/actions/admin";

function one(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export default async function AdminServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; q?: string }>;
}) {
  const params = await searchParams;
  const q = one(params.q).trim();
  const services = await query<Service & { category_name: string }>(
    `SELECT s.*, c.name AS category_name FROM services s
     JOIN categories c ON c.id = s.category_id
     ${q ? "WHERE s.title LIKE ?" : ""}
     ORDER BY s.id DESC`,
    q ? [`%${q}%`] : [],
  ).catch(() => []);

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h1 className="h3 mb-0">Services</h1>
        <Link href="/admin/services/new" className="btn btn-primary">New service</Link>
      </div>
      {params.success ? <div className="alert alert-success py-2">{one(params.success)}</div> : null}
      <form className="row g-2 mb-3" action="/admin/services" method="get">
        <div className="col-sm"><input name="q" defaultValue={q} className="form-control" placeholder="Search services…" /></div>
        <div className="col-auto"><button className="btn btn-outline-light">Search</button></div>
      </form>
      <div className="card p-3">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead><tr><th>Title</th><th>Category</th><th>Price</th><th>Status</th><th>Featured</th><th /></tr></thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id}>
                  <td><strong>{service.title}</strong><span className="d-block small text-secondary">{service.slug}</span></td>
                  <td className="small">{service.category_name}</td>
                  <td className="small">{priceLabel(service.price)}</td>
                  <td><span className={`badge ${Number(service.is_active) === 1 ? "bg-success" : "bg-secondary"}`}>{Number(service.is_active) === 1 ? "Active" : "Inactive"}</span></td>
                  <td>{Number(service.is_featured) === 1 ? "Yes" : "—"}</td>
                  <td className="text-end text-nowrap">
                    <Link href={`/admin/services/${service.id}/edit`} className="btn btn-sm btn-outline-light">Edit</Link>
                    <form action={deleteServiceAction} className="d-inline ms-1">
                      <input type="hidden" name="id" value={service.id} />
                      <button className="btn btn-sm btn-outline-light" aria-label={`Delete ${service.title}`}>
                        <i className="fa-solid fa-trash-can" aria-hidden="true" />
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {services.length === 0 ? <tr><td colSpan={6} className="text-secondary">No services found.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
