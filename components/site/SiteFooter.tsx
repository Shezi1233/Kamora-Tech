import Link from "next/link";
import { AGENCY, SERVICE_CATEGORY_FOOTER } from "@/lib/constants";
import type { User } from "@/lib/types";

export function SiteFooter({ user }: { user: User | null }) {
  return (
    <footer className="site-footer mt-auto pt-5 pb-4">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-4">
            <Link className="navbar-brand d-inline-flex align-items-center gap-2 mb-2" href="/">
              <span className="brand-mark" aria-hidden="true">K</span>
              <span className="brand-name">
                <span className="d-block text-secondary small lh-1">Kamora</span>
                Tech
              </span>
            </Link>
            <p className="text-secondary mb-3">
              {AGENCY.tagline} We design, build, and maintain websites, software, and
              digital systems that help businesses grow with confidence.
            </p>
            <a href={`mailto:${AGENCY.email}`} className="d-inline-flex align-items-center gap-2">
              <i className="fa-regular fa-envelope" aria-hidden="true" />
              {AGENCY.email}
            </a>
          </div>
          <div className="col-6 col-lg-2">
            <h2 className="h6 text-uppercase mb-3">Company</h2>
            <ul className="list-unstyled d-grid gap-2">
              <li><Link href="/about">About</Link></li>
              <li><Link href="/portfolio">Portfolio</Link></li>
              <li><Link href="/contact">Contact</Link></li>
              {user ? <li><Link href="/track">Track Order</Link></li> : null}
            </ul>
          </div>
          <div className="col-6 col-lg-3">
            <h2 className="h6 text-uppercase mb-3">Services</h2>
            <ul className="list-unstyled d-grid gap-2">
              {SERVICE_CATEGORY_FOOTER.map((item) => (
                <li key={item.href}><Link href={item.href}>{item.label}</Link></li>
              ))}
            </ul>
          </div>
          <div className="col-lg-3">
            <h2 className="h6 text-uppercase mb-3">Legal</h2>
            <ul className="list-unstyled d-grid gap-2">
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <li><Link href="/terms">Terms of Service</Link></li>
              <li><Link href="/refund">Refund Policy</Link></li>
              {user ? (
                <li><Link href="/dashboard">My Dashboard</Link></li>
              ) : (
                <li><Link href="/login">Client Login</Link></li>
              )}
            </ul>
          </div>
        </div>
        <hr className="border-secondary opacity-25 my-4" />
        <div className="d-flex flex-column flex-sm-row justify-content-between gap-2 small text-secondary">
          <span>© {new Date().getFullYear()} {AGENCY.name}. All rights reserved.</span>
          <span>Built with Next.js · Designed for performance and accessibility.</span>
        </div>
      </div>
    </footer>
  );
}
