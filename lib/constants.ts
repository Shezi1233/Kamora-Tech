export const AGENCY = {
  name: "Kamora Tech",
  tagline: "Web development, done properly.",
  email: "smith14580@gmail.com",
  phone: "",
  facebook: "",
  instagram: "",
  whatsapp: "",
  linkedin: "",
  x: "",
} as const;

export const ORDER_STATUSES = [
  "Order Placed",
  "Order Received",
  "Confirmed",
  "In Progress",
  "Review / Testing",
  "Completed",
  "Delivered",
  "Cancelled",
] as const;

export const PAYMENT_STATUSES = [
  "Pending",
  "Paid",
  "Partially Paid",
  "Refunded",
  "Failed",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_METHODS = [
  "Cash on Delivery",
  "Bank Transfer",
  "Card (on confirmation)",
] as const;

export const SERVICE_CATEGORY_FOOTER = [
  { label: "Business Websites", href: "/services?category=business-websites" },
  { label: "E-Commerce", href: "/services?category=e-commerce" },
  { label: "Custom Software", href: "/services?category=custom-software" },
  { label: "Web Maintenance", href: "/services?category=website-maintenance" },
] as const;
