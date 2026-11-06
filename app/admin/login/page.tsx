import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/session";
import { AdminLoginForm } from "@/components/admin/AdminForms";

export const metadata = { title: "Admin Login" };

export default async function AdminLoginPage() {
  const admin = await getCurrentAdmin();
  if (admin) redirect("/admin");
  return (
    <div className="min-vh-100 d-flex align-items-center py-5">
      <div className="container" style={{ maxWidth: 460 }}>
        <div className="card p-4 p-md-5">
          <p className="section-eyebrow mb-1">Kamora Tech</p>
          <h1 className="h3 mb-2">Admin sign in</h1>
          <p className="text-secondary small">Manage orders, services, and site content.</p>
          <AdminLoginForm />
          <hr className="border-secondary opacity-25 my-4" />
          <p className="small mb-0"><Link href="/">← Back to website</Link></p>
        </div>
      </div>
    </div>
  );
}
