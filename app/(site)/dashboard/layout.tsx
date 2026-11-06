import { requireUser } from "@/lib/session";
import { DashboardNav } from "@/components/site/DashboardNav";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("/dashboard");
  return (
    <section className="section">
      <div className="container">
        <div className="d-flex flex-wrap justify-content-between align-items-end gap-2 mb-4">
          <div>
            <p className="section-eyebrow mb-1">Client area</p>
            <h1 className="h2 mb-0">Hello, {user.full_name.split(" ")[0]}</h1>
          </div>
          <span className="small text-secondary">{user.email}</span>
        </div>
        <div className="row g-4">
          <aside className="col-lg-3">
            <div className="sticky-lg-top" style={{ top: 90 }}>
              <DashboardNav />
            </div>
          </aside>
          <div className="col-lg-9">{children}</div>
        </div>
      </div>
    </section>
  );
}
