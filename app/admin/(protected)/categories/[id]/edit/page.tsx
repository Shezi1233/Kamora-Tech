import Link from "next/link";
import { notFound } from "next/navigation";
import { queryOne } from "@/lib/db";
import type { Category } from "@/lib/types";
import { CategoryForm } from "@/components/admin/AdminForms";

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const categoryId = Number.parseInt(id, 10);
  if (!Number.isFinite(categoryId)) notFound();
  const category = await queryOne<Category>("SELECT * FROM categories WHERE id = ? LIMIT 1", [categoryId]).catch(() => null);
  if (!category) notFound();
  return (
    <>
      <Link href="/admin/categories" className="small">← Back to categories</Link>
      <h1 className="h3 my-3">Edit category</h1>
      <div className="card p-4"><CategoryForm category={category} /></div>
    </>
  );
}
