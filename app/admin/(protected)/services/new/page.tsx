import Link from "next/link";
import { apiFetch } from "@/lib/api";
import type { Category } from "@/lib/types";
import { ServiceForm } from "@/components/admin/AdminForms";

export const dynamic = "force-dynamic";

export default async function NewServicePage() {
  const categories = await apiFetch<Category[]>("/admin/categories", {
    admin: true,
  });
  return (
    <>
      <Link href="/admin/services" className="small">← Back to services</Link>
      <h1 className="h3 my-3">New service</h1>
      <div className="card p-4">
        <ServiceForm categories={categories} />
      </div>
    </>
  );
}
