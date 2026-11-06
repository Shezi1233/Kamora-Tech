import Link from "next/link";
import { query } from "@/lib/db";
import type { Category } from "@/lib/types";
import { deleteCategoryAction } from "@/lib/actions/admin";

function one(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const params = await searchParams;
  const categories = await query<Category & { service_count: number }>(
    `SELECT c.*, COUNT(s.id) AS service_count FROM categories c
     LEFT JOIN services s ON s.category_id = c.id
     GROUP BY c.id ORDER BY c.name`,
  ).catch(() => []);

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h1 className="h3 mb-0">Categories</h1>
        <Link href="/admin/categories/new" className="btn btn-primary">New category</Link>
      </div>
      {params.success ? <div className="alert alert-success py-2">{one(params.success)}</div> : null}
      {params.error ? <div className="alert alert-danger py-2">{one(params.error)}</div> : null}
      <div className="card p-3">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead><tr><th>Name</th><th>Slug</th><th>Services</th><th>Status</th><th /></tr></thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td><strong>{category.name}</strong><span className="d-block small text-secondary">{category.description}</span></td>
                  <td className="small">{category.slug}</td>
                  <td>{Number(category.service_count)}</td>
                  <td><span className={`badge ${Number(category.is_active) === 1 ? "bg-success" : "bg-secondary"}`}>{Number(category.is_active) === 1 ? "Active" : "Inactive"}</span></td>
                  <td className="text-end text-nowrap">
                    <Link href={`/admin/categories/${category.id}/edit`} className="btn btn-sm btn-outline-light">Edit</Link>
                    <form action={deleteCategoryAction} className="d-inline ms-1">
                      <input type="hidden" name="id" value={category.id} />
                      <button className="btn btn-sm btn-outline-light" aria-label={`Delete ${category.name}`}>
                        <i className="fa-solid fa-trash-can" aria-hidden="true" />
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
