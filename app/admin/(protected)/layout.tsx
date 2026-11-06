import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import { AdminNav } from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <div className="min-vh-100 d-flex flex-column">
      <header className="site-navbar py-2">
        <div className="container d-flex justify-content-between align-items-center">
          <Link href="/admin" className="navbar-brand mb-0 d-inline-flex align-items-center gap-2">
            <span className="brand-mark" aria-hidden="true">K</span>
            <span className="brand-name"><span className="d-block text-secondary small lh-1">Kamora</span>Admin</span>
          </Link>
          <Link href="/" className="btn btn-sm btn-outline-light">View site</Link>
        </div>
      </header>
      <div className="container py-4 flex-grow-1">
        <div className="row g-4">
          <aside className="col-lg-3">
            <div className="sticky-lg-top" style={{ top: 20 }}>
              <AdminNav name={admin.full_name} />
            </div>
          </aside>
          <div className="col-lg-9">{children}</div>
        </div>
      </div>
    </div>
  );
}
