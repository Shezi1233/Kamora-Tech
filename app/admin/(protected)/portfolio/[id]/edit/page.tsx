import Link from "next/link";
import { notFound } from "next/navigation";
import { queryOne } from "@/lib/db";
import type { PortfolioProject } from "@/lib/types";
import { PortfolioForm } from "@/components/admin/AdminForms";

export default async function EditPortfolioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const projectId = Number.parseInt(id, 10);
  if (!Number.isFinite(projectId)) notFound();
  const project = await queryOne<PortfolioProject>(
    "SELECT * FROM portfolio_projects WHERE id = ? LIMIT 1",
    [projectId],
  ).catch(() => null);
  if (!project) notFound();
  return (
    <>
      <Link href="/admin/portfolio" className="small">← Back to portfolio</Link>
      <h1 className="h3 my-3">Edit project</h1>
      <div className="card p-4"><PortfolioForm project={project} /></div>
    </>
  );
}
