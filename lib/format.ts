export function toNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function money(value: string | number | null | undefined): string {
  const n = toNumber(value);
  if (n === null) return "Request a Quote";
  return "Rs " + n.toLocaleString("en-PK", { maximumFractionDigits: 0 });
}

export function priceLabel(price: string | number | null | undefined): string {
  return toNumber(price) === null ? "Request a Quote" : money(price);
}

export function serviceFeatures(features: string | null | undefined): string[] {
  const raw = (features ?? "").trim();
  if (!raw) return [];
  return raw
    .split(/\r\n|\r|\n|;/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 4);
}

const ICONS: Record<string, string> = {
  "e-commerce-website-service": "fa-solid fa-cart-shopping",
  "e-commerce-website": "fa-solid fa-cart-shopping",
  "hospital-website": "fa-solid fa-hospital",
  "hospital-management-system-service": "fa-solid fa-hospital-user",
  "school-website": "fa-solid fa-school",
  "school-management-system-service": "fa-solid fa-graduation-cap",
  "restaurant-website": "fa-solid fa-utensils",
  "restaurant-website-ordering-service": "fa-solid fa-bell-concierge",
  "restaurant-ordering-website": "fa-solid fa-bell-concierge",
  "blog-website-service": "fa-solid fa-blog",
  "portfolio-website-service": "fa-solid fa-images",
  "business-website-service": "fa-solid fa-briefcase",
  "corporate-website": "fa-solid fa-building",
  "landing-page": "fa-solid fa-rocket",
  "hotel-website": "fa-solid fa-hotel",
  "travel-website": "fa-solid fa-plane",
  "real-estate-website": "fa-solid fa-house",
  "car-rental-website": "fa-solid fa-car",
  "erp-system-service": "fa-solid fa-diagram-project",
  "erp-software": "fa-solid fa-diagram-project",
  "crm-system-service": "fa-solid fa-users",
  "crm-software": "fa-solid fa-users",
  "custom-software-service": "fa-solid fa-code",
  "custom-software-development": "fa-solid fa-code",
  "website-redesign": "fa-solid fa-paintbrush",
  "website-maintenance-updates-service": "fa-solid fa-screwdriver-wrench",
  "website-maintenance": "fa-solid fa-screwdriver-wrench",
  "website-speed-optimization": "fa-solid fa-gauge-high",
  "website-seo-setup": "fa-solid fa-magnifying-glass-chart",
  "admin-dashboard-development": "fa-solid fa-table-columns",
  "student-portal": "fa-solid fa-user-graduate",
  "online-admission-system": "fa-solid fa-file-signature",
  "appointment-booking-system": "fa-solid fa-calendar-check",
  "inventory-management-system": "fa-solid fa-boxes-stacked",
  "billing-pos-system": "fa-solid fa-cash-register",
  "any-website-built": "fa-solid fa-globe",
  "any-software-built": "fa-solid fa-laptop-code",
  "custom-digital-solution": "fa-solid fa-lightbulb",
};

export function serviceIcon(slug: string | null | undefined): string {
  return ICONS[slug ?? ""] ?? "fa-solid fa-globe";
}

export function imageUrl(image: string | null | undefined): string | null {
  if (!image) return null;
  if (image.startsWith("http://") || image.startsWith("https://") || image.startsWith("/")) {
    return image;
  }
  return `/uploads/${image}`;
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
