"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/lib/actions/auth";

const LINKS = [
  { href: "/dashboard", label: "Overview", icon: "fa-gauge-high" },
  { href: "/dashboard/orders", label: "My orders", icon: "fa-box" },
  { href: "/dashboard/notifications", label: "Notifications", icon: "fa-bell" },
  { href: "/dashboard/profile", label: "Profile", icon: "fa-user" },
  { href: "/dashboard/change-password", label: "Password", icon: "fa-lock" },
];

export function DashboardNav() {
  const pathname = usePathname();
  return (
    <div className="card p-3">
      <nav aria-label="Dashboard">
        <ul className="list-unstyled d-grid gap-1 mb-3">
          {LINKS.map((link) => {
            const active = link.href === "/dashboard" ? pathname === link.href : pathname.startsWith(link.href);
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
      <form action={logoutAction}>
        <button className="btn btn-outline-light w-100">
          <i className="fa-solid fa-arrow-right-from-bracket me-1" aria-hidden="true" /> Sign out
        </button>
      </form>
    </div>
  );
}
