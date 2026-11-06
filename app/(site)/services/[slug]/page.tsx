import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { query, queryOne } from "@/lib/db";
import type { Service, ServiceImage } from "@/lib/types";
import { imageUrl, priceLabel, serviceFeatures, serviceIcon } from "@/lib/format";
import { AddToCartButton } from "@/components/ui/AddToCartButton";
import { ServiceCard } from "@/components/site/ServiceCard";

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await queryOne<Service & { category_name: string; category_slug: string }>(
    `SELECT s.*, c.name AS category_name, c.slug AS category_slug
     FROM services s JOIN categories c ON c.id = s.category_id
     WHERE s.slug = ? AND s.is_active = 1 LIMIT 1`,
    [slug],
  ).catch(() => null);
  if (!service) notFound();

  const [images, related] = await Promise.all([
    query<ServiceImage>("SELECT * FROM service_images WHERE service_id = ? ORDER BY sort_order", [service.id]).catch(() => []),
    query<Service & { category_name: string }>(
      `SELECT s.*, c.name AS category_name FROM services s
       JOIN categories c ON c.id = s.category_id
       WHERE s.category_id = ? AND s.id <> ? AND s.is_active = 1
       ORDER BY s.is_featured DESC LIMIT 3`,
      [service.category_id, service.id],
    ).catch(() => []),
  ]);

  const features = serviceFeatures(service.features);
  const technologies = (service.technologies ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const mainImage = imageUrl(service.image);

  return (
    <>
      <section className="section-alt py-5">
        <div className="container">
          <nav aria-label="Breadcrumb" className="mb-3 small">
            <Link href="/services">Services</Link>
            <span className="mx-2 text-secondary">/</span>
            <Link href={`/services?category=${service.category_slug}`}>{service.category_name}</Link>
          </nav>
          <div className="row g-4 align-items-start">
            <div className="col-lg-7">
              <span className="service-category small">{service.category_name}</span>
              <h1 className="mt-1">{service.title}</h1>
              <p className="lead text-secondary">{service.short_description}</p>
              <div className="d-flex flex-wrap gap-2 mt-4">
                <AddToCartButton serviceId={service.id} label="Add to Cart" className="btn btn-primary btn-lg" />
                <AddToCartButton serviceId={service.id} orderNow label="Order Now" className="btn btn-outline-light btn-lg" />
              </div>
              <p className="small text-secondary mt-3 mb-0">
                <i className="fa-solid fa-shield-halved me-1" aria-hidden="true" />
                Secure checkout · Order tracking included
              </p>
            </div>
            <div className="col-lg-5">
              <div className="card p-3">
                <div className="d-flex justify-content-between py-2 border-bottom border-secondary border-opacity-25">
                  <span className="text-secondary">Price</span>
                  <strong>{priceLabel(service.price)}</strong>
                </div>
                <div className="d-flex justify-content-between py-2 border-bottom border-secondary border-opacity-25">
                  <span className="text-secondary">Delivery</span>
                  <strong>{service.delivery_estimate || "Discussed after scope"}</strong>
                </div>
                <div className="d-flex justify-content-between py-2">
                  <span className="text-secondary">Category</span>
                  <strong>{service.category_name}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-8">
              {mainImage ? (
                <Image src={mainImage} alt={service.title} width={1000} height={560} className="w-100 rounded mb-4" style={{ objectFit: "cover" }} />
              ) : (
                <div className="service-icon rounded mb-4" style={{ height: 220 }}>
                  <i className={serviceIcon(service.slug)} aria-hidden="true" style={{ fontSize: "4rem" }} />
                </div>
              )}
              <h2 className="h3">Overview</h2>
              <p className="text-secondary" style={{ whiteSpace: "pre-line" }}>{service.description}</p>

              {images.length > 0 ? (
                <>
                  <h2 className="h4 mt-4">Screens</h2>
                  <div className="row g-3">
                    {images.map((image) => (
                      <div className="col-sm-6" key={image.id}>
                        <Image src={imageUrl(image.image_path) ?? ""} alt={`${service.title} screen`} width={600} height={360} className="w-100 rounded" />
                      </div>
                    ))}
                  </div>
                </>
              ) : null}
            </div>
            <aside className="col-lg-4">
              {features.length > 0 ? (
                <div className="card p-4 mb-4">
                  <h2 className="h5">What is included</h2>
                  <ul className="service-features mb-0">
                    {features.map((feature) => <li key={feature}>{feature}</li>)}
                  </ul>
                </div>
              ) : null}
              {technologies.length > 0 ? (
                <div className="card p-4 mb-4">
                  <h2 className="h5">Technologies</h2>
                  <div className="d-flex flex-wrap gap-2">
                    {technologies.map((tech) => (
                      <span className="badge badge-status" key={tech}>{tech}</span>
                    ))}
                  </div>
                </div>
              ) : null}
              <div className="card p-4">
                <h2 className="h5">Need a custom scope?</h2>
                <p className="text-secondary small">Tell us your requirements and we will prepare a clear proposal.</p>
                <Link href="/contact" className="btn btn-primary">Request a quote</Link>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {related.length > 0 ? (
        <section className="section section-alt">
          <div className="container">
            <h2 className="h3 mb-4">Related services</h2>
            <div className="row g-4">
              {related.map((item) => (
                <div className="col-md-6 col-lg-4" key={item.id}>
                  <ServiceCard service={item} />
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
