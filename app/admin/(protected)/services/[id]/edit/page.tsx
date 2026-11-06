import Link from "next/link";
import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";
import type { Category, Service } from "@/lib/types";
import { ServiceForm } from "@/components/admin/AdminForms";

export const dynamic = "force-dynamic";

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const serviceId = Number.parseInt(id, 10);
  if (!Number.isFinite(serviceId)) notFound();
  const [service, categories] = await Promise.all([
    apiFetch<Service>(`/admin/services/${serviceId}`, { admin: true }),
    apiFetch<Category[]>("/admin/categories", { admin: true }),
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
