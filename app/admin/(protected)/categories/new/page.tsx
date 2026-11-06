import Link from "next/link";
import { CategoryForm } from "@/components/admin/AdminForms";

export default function NewCategoryPage() {
  return (
    <>
      <Link href="/admin/categories" className="small">← Back to categories</Link>
      <h1 className="h3 my-3">New category</h1>
      <div className="card p-4"><CategoryForm /></div>
    </>
  );
}
