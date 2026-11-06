import Link from "next/link";
import { query } from "@/lib/db";
import type { Service } from "@/lib/types";
import { ServiceCard } from "@/components/site/ServiceCard";

export const metadata = { title: "Search" };

function one(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const q = one((await searchParams).q).trim();
  const services = q
    ? await query<Service & { category_name: string }>(
        `SELECT s.*, c.name AS category_name FROM services s
         JOIN categories c ON c.id = s.category_id
         WHERE s.is_active = 1 AND (s.title LIKE ? OR s.short_description LIKE ? OR s.description LIKE ?)
         ORDER BY s.is_featured DESC, s.title LIMIT 24`,
        [`%${q}%`, `%${q}%`, `%${q}%`],
      ).catch(() => [])
    : [];

  return (
    <section className="section">
      <div className="container">
        <p className="section-eyebrow mb-1">Search</p>
        <h1 className="mb-3">{q ? `Results for “${q}”` : "Search services"}</h1>
        <form action="/search" method="get" className="row g-2 mb-4" style={{ maxWidth: 620 }}>
          <div className="col">
            <input name="q" defaultValue={q} className="form-control" placeholder="Search services…" required />
          </div>
          <div className="col-auto">
            <button className="btn btn-primary">Search</button>
          </div>
        </form>
        {q ? <p className="text-secondary">{services.length} matching service(s)</p> : null}
        {!q ? (
          <p className="text-secondary">Enter a keyword like “school”, “store”, or “dashboard”.</p>
        ) : services.length === 0 ? (
          <div className="card p-4">
            <h2 className="h5">No results</h2>
            <p className="text-secondary">Try a shorter keyword or browse all services.</p>
            <Link href="/services" className="btn btn-outline-light align-self-start">Browse services</Link>
          </div>
        ) : (
          <div className="row g-4">
            {services.map((service) => (
              <div className="col-md-6 col-lg-4" key={service.id}>
                <ServiceCard service={service} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
