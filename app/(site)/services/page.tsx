import Link from "next/link";
import { query } from "@/lib/db";
import type { Category, Service } from "@/lib/types";
import { ServiceCard } from "@/components/site/ServiceCard";

export const metadata = { title: "Services" };

type Params = {
  q?: string;
  category?: string;
  sort?: string;
  page?: string;
};

function one(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

const PAGE_SIZE = 9;

export default async function ServicesPage({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const q = one(params.q).trim();
  const category = one(params.category).trim();
  const sort = one(params.sort) === "title" ? "title" : "featured";
  const page = Math.max(1, Number.parseInt(one(params.page), 10) || 1);

  const categories = await query<Category>(
    "SELECT * FROM categories WHERE is_active = 1 ORDER BY name",
  ).catch(() => []);

  const conditions = ["s.is_active = 1"];
  const values: (string | number)[] = [];
  if (q) {
    conditions.push("(s.title LIKE ? OR s.short_description LIKE ? OR s.description LIKE ?)");
    values.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  if (category) {
    conditions.push("c.slug = ?");
    values.push(category);
  }
  const where = conditions.join(" AND ");
  const order = sort === "title" ? "s.title ASC" : "s.is_featured DESC, s.id ASC";

  const [{ total }] = await query<{ total: number }>(
    `SELECT COUNT(*) AS total FROM services s JOIN categories c ON c.id = s.category_id WHERE ${where}`,
    values,
  ).catch(() => [{ total: 0 }]);
  const totalPages = Math.max(1, Math.ceil(Number(total) / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const offset = (currentPage - 1) * PAGE_SIZE;

  const services = await query<Service & { category_name: string }>(
    `SELECT s.*, c.name AS category_name FROM services s
     JOIN categories c ON c.id = s.category_id
     WHERE ${where} ORDER BY ${order} LIMIT ${PAGE_SIZE} OFFSET ${offset}`,
    values,
  ).catch(() => []);

  function pageHref(nextPage: number) {
    const search = new URLSearchParams();
    if (q) search.set("q", q);
    if (category) search.set("category", category);
    if (sort === "title") search.set("sort", sort);
    if (nextPage > 1) search.set("page", String(nextPage));
    const suffix = search.toString();
    return suffix ? `/services?${suffix}` : "/services";
  }

  return (
    <>
      <section className="section-alt py-5">
        <div className="container">
          <p className="section-eyebrow mb-1">Services</p>
          <h1 className="mb-2">Find the right build for your goal</h1>
          <p className="text-secondary mb-0">
            {Number(total)} services across websites, software, and maintenance. Prices are shown where
            available; otherwise request a quote.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="row g-4">
            <aside className="col-lg-3">
              <div className="card p-3 sticky-lg-top" style={{ top: 90 }}>
                <h2 className="h6 text-uppercase text-secondary">Categories</h2>
                <ul className="list-unstyled d-grid gap-2 mb-4">
                  <li>
                    <Link href={q ? `/services?q=${encodeURIComponent(q)}` : "/services"} className={!category ? "fw-bold" : ""}>
                      All categories
                    </Link>
                  </li>
                  {categories.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={`/services?category=${encodeURIComponent(item.slug)}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                        className={category === item.slug ? "fw-bold" : ""}
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
                <form action="/services" method="get" className="d-grid gap-2">
                  <label className="form-label small" htmlFor="service-search">Search</label>
                  <input id="service-search" name="q" defaultValue={q} className="form-control" placeholder="e.g. school" />
                  {category ? <input type="hidden" name="category" value={category} /> : null}
                  <label className="form-label small mt-1" htmlFor="service-sort">Sort</label>
                  <select id="service-sort" name="sort" defaultValue={sort} className="form-select">
                    <option value="featured">Featured first</option>
                    <option value="title">Title A–Z</option>
                  </select>
                  <button type="submit" className="btn btn-primary mt-2">
                    <i className="fa-solid fa-filter me-1" aria-hidden="true" /> Apply
                  </button>
                </form>
              </div>
            </aside>

            <div className="col-lg-9">
              <div className="row g-4">
                {services.map((service) => (
                  <div className="col-md-6 col-xl-4" key={service.id}>
                    <ServiceCard service={service} />
                  </div>
                ))}
              </div>
              {services.length === 0 ? (
                <div className="card p-4 text-center">
                  <h2 className="h5">No services found</h2>
                  <p className="text-secondary mb-3">Try a different search or category.</p>
                  <Link href="/contact" className="btn btn-primary align-self-center">Tell us what you need</Link>
                </div>
              ) : null}

              {totalPages > 1 ? (
                <nav className="mt-4" aria-label="Services pagination">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                      <Link className="page-link" href={pageHref(currentPage - 1)}>Previous</Link>
                    </li>
                    {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => (
                      <li className={`page-item ${number === currentPage ? "active" : ""}`} key={number}>
                        <Link className="page-link" href={pageHref(number)}>{number}</Link>
                      </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                      <Link className="page-link" href={pageHref(currentPage + 1)}>Next</Link>
                    </li>
                  </ul>
                </nav>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
