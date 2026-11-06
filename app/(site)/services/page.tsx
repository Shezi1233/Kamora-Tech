import Link from "next/link";
import { apiFetch } from "@/lib/api";
import type { Category, Service } from "@/lib/types";
import { ServiceCard } from "@/components/site/ServiceCard";

export const metadata = { title: "Services" };
export const dynamic = "force-dynamic";

type ServicePage = {
  items: Service[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};

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

  const categories = await apiFetch<Category[]>("/categories?active_only=true");

  const apiParams = new URLSearchParams();
  if (q) apiParams.set("q", q);
  if (category) apiParams.set("category", category);
  if (sort === "title") apiParams.set("sort", sort);
  if (page > 1) apiParams.set("page", String(page));
  apiParams.set("page_size", String(PAGE_SIZE));

  const servicePage = await apiFetch<ServicePage>(`/services?${apiParams.toString()}`);

  const total = Number(servicePage.total ?? 0);
  const totalPages = Math.max(1, Number(servicePage.total_pages ?? 1));
  const currentPage = Math.min(page, totalPages);
  const services = servicePage.items;

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
