import Link from "next/link";
import { AGENCY } from "@/lib/constants";

export function Topbar() {
  return (
    <div className="topbar">
      <div className="container d-flex justify-content-between align-items-center gap-2">
        <div className="d-flex flex-wrap align-items-center gap-3">
          <a href={`mailto:${AGENCY.email}`}>
            <i className="fa-regular fa-envelope me-1" aria-hidden="true" />
            {AGENCY.email}
          </a>
          <span className="d-none d-md-inline text-white-50">Mon–Sat · 10:00–19:00 PKT</span>
        </div>
        <div className="topbar-social align-items-center">
          <Link href="/track">Track Order</Link>
          <Link href="/login">Client Login</Link>
          <Link href="/admin/login">Admin</Link>
        </div>
      </div>
    </div>
  );
}
