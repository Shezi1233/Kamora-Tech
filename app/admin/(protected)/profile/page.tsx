import { requireAdmin } from "@/lib/session";
import { AdminProfileForm } from "@/components/admin/AdminForms";

export default async function AdminProfilePage() {
  const admin = await requireAdmin();
  return (
    <>
      <h1 className="h3 mb-3">Admin profile</h1>
      <div className="card p-4" style={{ maxWidth: 620 }}>
        <AdminProfileForm admin={{ full_name: admin.full_name, email: admin.email }} />
      </div>
    </>
  );
}
