import Link from "next/link";
import { query } from "@/lib/db";
import type { Category } from "@/lib/types";
import { ServiceForm } from "@/components/admin/AdminForms";

export default async function NewServicePage() {
  const categories = await query<Category>("SELECT * FROM categories ORDER BY name").catch(() => []);
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
