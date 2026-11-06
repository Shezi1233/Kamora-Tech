"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SearchBox } from "./SearchBox";
import { CartBadge } from "./CartBadge";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteNavbar({
  user,
  cartCount,
}: {
  user: { full_name: string } | null;
  cartCount: number;
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <nav className={`navbar navbar-expand-lg navbar-dark site-navbar sticky-top ${scrolled ? "scrolled" : ""}`}>
      <div className="container gap-2">
        <Link className="navbar-brand d-flex align-items-center gap-2" href="/">
          <span className="brand-mark" aria-hidden="true">K</span>
          <span className="brand-name">
            <span className="d-block text-secondary small lh-1">Kamora</span>
            Tech
          </span>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNav"
          aria-controls="mainNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="mainNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {LINKS.map((link) => (
              <li className="nav-item" key={link.href}>
                <Link
                  className={`nav-link ${isActive(link.href) ? "active" : ""}`}
                  href={link.href}
                  aria-current={isActive(link.href) ? "page" : undefined}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            {user ? (
              <li className="nav-item">
                <Link
                  className={`nav-link ${isActive("/track") ? "active" : ""}`}
                  href="/track"
                  aria-current={isActive("/track") ? "page" : undefined}
                >
                  Track Order
                </Link>
              </li>
            ) : null}
          </ul>
          <div className="d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center gap-2 pb-3 pb-lg-0">
            <div className="d-none d-xl-block" style={{ width: 230 }}>
              <SearchBox compact />
            </div>
            <div className="d-flex align-items-center gap-2">
              <CartBadge initialCount={cartCount} />
              {user ? (
                <Link href="/dashboard" className="btn btn-primary">
                  <i className="fa-regular fa-user me-1" aria-hidden="true" />
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/login" className="btn btn-outline-light">
                    Login
                  </Link>
                  <Link href="/signup" className="btn btn-primary">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
