"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminLogoutAction } from "@/lib/actions/admin";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: "fa-gauge-high" },
  { href: "/admin/orders", label: "Orders", icon: "fa-box" },
  { href: "/admin/services", label: "Services", icon: "fa-layer-group" },
  { href: "/admin/categories", label: "Categories", icon: "fa-tags" },
  { href: "/admin/customers", label: "Customers", icon: "fa-users" },
  { href: "/admin/portfolio", label: "Portfolio", icon: "fa-images" },
  { href: "/admin/messages", label: "Messages", icon: "fa-envelope" },
  { href: "/admin/testimonials", label: "Testimonials", icon: "fa-quote-right" },
  { href: "/admin/payments", label: "Payments", icon: "fa-credit-card" },
  { href: "/admin/settings", label: "Settings", icon: "fa-gear" },
  { href: "/admin/profile", label: "Profile", icon: "fa-user-shield" },
];

export function AdminNav({ name }: { name: string }) {
  const pathname = usePathname();
  return (
    <div className="admin-shell card p-3">
      <p className="small text-secondary mb-2">Signed in as</p>
      <strong className="d-block mb-3">{name}</strong>
      <nav aria-label="Admin">
        <ul className="list-unstyled d-grid gap-1 mb-3">
          {LINKS.map((link) => {
            const active = link.href === "/admin" ? pathname === link.href : pathname.startsWith(link.href);
            return (
              <li key={link.href}>
                <Link className={`d-flex align-items-center gap-2 p-2 rounded ${active ? "bg-accent text-white" : "text-reset"}`} href={link.href}>
                  <i className={`fa-solid ${link.icon}`} aria-hidden="true" />
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <form action={adminLogoutAction}>
        <button className="btn btn-outline-light w-100">
          <i className="fa-solid fa-arrow-right-from-bracket me-1" aria-hidden="true" /> Sign out
        </button>
      </form>
    </div>
  );
}
