import Link from "next/link";
import { apiFetch } from "@/lib/api";
import type { PortfolioProject } from "@/lib/types";
import { deletePortfolioAction } from "@/lib/actions/admin";

export const dynamic = "force-dynamic";

function one(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export default async function AdminPortfolioPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const params = await searchParams;
  const projects = await apiFetch<PortfolioProject[]>("/admin/portfolio", {
    admin: true,
  });

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h1 className="h3 mb-0">Portfolio</h1>
        <Link href="/admin/portfolio/new" className="btn btn-primary">New project</Link>
      </div>
      {one(params.success) ? <div className="alert alert-success py-2">{one(params.success)}</div> : null}
      <div className="card p-3">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead><tr><th>Title</th><th>Category</th><th>Status</th><th>Featured</th><th /></tr></thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id}>
                  <td><strong>{project.title}</strong>{project.project_url ? <span className="d-block small text-secondary">{project.project_url}</span> : null}</td>
                  <td className="small">{project.category || "—"}</td>
                  <td><span className={`badge ${Number(project.is_active) === 1 ? "bg-success" : "bg-secondary"}`}>{Number(project.is_active) === 1 ? "Active" : "Hidden"}</span></td>
                  <td>{Number(project.is_featured) === 1 ? "Yes" : "—"}</td>
                  <td className="text-end text-nowrap">
                    <Link href={`/admin/portfolio/${project.id}/edit`} className="btn btn-sm btn-outline-light">Edit</Link>
                    <form action={deletePortfolioAction} className="d-inline ms-1">
                      <input type="hidden" name="id" value={project.id} />
                      <button className="btn btn-sm btn-outline-light" aria-label={`Delete ${project.title}`}>
                        <i className="fa-solid fa-trash-can" aria-hidden="true" />
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {projects.length === 0 ? <tr><td colSpan={5} className="text-secondary">No projects yet.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
