import { requireUser } from "@/lib/session";
import { ProfileForm } from "@/components/forms/AuthForms";

export default async function ProfilePage() {
  const user = await requireUser("/dashboard/profile");
  return (
    <div className="card p-4">
      <h2 className="h4 mb-1">Profile</h2>
      <p className="text-secondary">Keep your contact details up to date.</p>
      <ProfileForm user={{ full_name: user.full_name, email: user.email, phone: user.phone }} />
    </div>
  );
}
