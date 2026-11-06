import Link from "next/link";
import Image from "next/image";
import type { Service } from "@/lib/types";
import { imageUrl, priceLabel, serviceFeatures, serviceIcon } from "@/lib/format";
import { AddToCartButton } from "@/components/ui/AddToCartButton";

export function ServiceCard({
  service,
  showActions = true,
}: {
  service: Service;
  showActions?: boolean;
}) {
  const src = imageUrl(service.image);
  const features = serviceFeatures(service.features);

  return (
    <article className="service-card h-100 d-flex flex-column overflow-hidden">
      <Link href={`/services/${service.slug}`} className="text-decoration-none">
        {src ? (
          <Image
            src={src}
            alt={service.title}
            width={1600}
            height={900}
            className="service-card-image"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        ) : (
          <div className="service-icon">
            <i className={serviceIcon(service.slug)} aria-hidden="true" />
          </div>
        )}
      </Link>
      <div className="p-3 d-flex flex-column flex-grow-1">
        <span className="service-category small mb-1">{service.category_name}</span>
        <h3 className="h5 mb-2">
          <Link href={`/services/${service.slug}`} className="text-reset">
            {service.title}
          </Link>
        </h3>
        {service.short_description ? (
          <p className="text-secondary small slider-desc mb-2">{service.short_description}</p>
        ) : null}
        {features.length > 0 ? (
          <ul className="service-features small text-secondary mb-3">
            {features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        ) : null}
        <div className="mt-auto">
          {showActions ? (
            <>
              <div className="service-card-price">
                {priceLabel(service.price) === "Request a Quote" ? (
                  <span className="text-secondary small">Custom quote</span>
                ) : (
                  <strong>{priceLabel(service.price)}</strong>
                )}
              </div>
              <div className="service-card-actions">
                <Link href={`/services/${service.slug}`} className="btn btn-outline-light">
                  Details
                </Link>
                <AddToCartButton serviceId={service.id} className="btn btn-primary" label="Add" />
              </div>
            </>
          ) : (
            <strong>{priceLabel(service.price)}</strong>
          )}
        </div>
      </div>
    </article>
  );
}
