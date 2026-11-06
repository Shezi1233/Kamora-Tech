import Link from "next/link";
import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";
import type { PortfolioProject } from "@/lib/types";
import { PortfolioForm } from "@/components/admin/AdminForms";

export const dynamic = "force-dynamic";

export default async function EditPortfolioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const projectId = Number.parseInt(id, 10);
  if (!Number.isFinite(projectId)) notFound();
  const project = await apiFetch<PortfolioProject>(`/admin/portfolio/${projectId}`, {
    admin: true,
  });
  if (!project) notFound();
  return (
    <>
      <Link href="/admin/portfolio" className="small">← Back to portfolio</Link>
      <h1 className="h3 my-3">Edit project</h1>
      <div className="card p-4"><PortfolioForm project={project} /></div>
    </>
  );
}
