import Link from "next/link";
import { notFound } from "next/navigation";
import { query, queryOne } from "@/lib/db";
import type { Category, Service } from "@/lib/types";
import { ServiceForm } from "@/components/admin/AdminForms";

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const serviceId = Number.parseInt(id, 10);
  if (!Number.isFinite(serviceId)) notFound();
  const [service, categories] = await Promise.all([
    queryOne<Service>("SELECT * FROM services WHERE id = ? LIMIT 1", [serviceId]).catch(() => null),
    query<Category>("SELECT * FROM categories ORDER BY name").catch(() => []),
  ]);
  if (!service) notFound();

  return (
    <>
      <Link href="/admin/services" className="small">← Back to services</Link>
      <h1 className="h3 my-3">Edit service</h1>
      <div className="card p-4">
        <ServiceForm categories={categories} service={service} />
      </div>
    </>
  );
}
