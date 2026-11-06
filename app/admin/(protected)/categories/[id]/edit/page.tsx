import Link from "next/link";
import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";
import type { Category } from "@/lib/types";
import { CategoryForm } from "@/components/admin/AdminForms";

export const dynamic = "force-dynamic";

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const categoryId = Number.parseInt(id, 10);
  if (!Number.isFinite(categoryId)) notFound();
  const category = await apiFetch<Category>(`/admin/categories/${categoryId}`, {
    admin: true,
  });
  if (!category) notFound();
  return (
    <>
      <Link href="/admin/categories" className="small">← Back to categories</Link>
      <h1 className="h3 my-3">Edit category</h1>
      <div className="card p-4"><CategoryForm category={category} /></div>
    </>
  );
}
