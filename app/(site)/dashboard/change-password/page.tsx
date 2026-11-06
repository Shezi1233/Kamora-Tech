import { requireUser } from "@/lib/session";
import { PasswordForm } from "@/components/forms/AuthForms";

export default async function ChangePasswordPage() {
  await requireUser("/dashboard/change-password");
  return (
    <div className="card p-4">
      <h2 className="h4 mb-1">Change password</h2>
      <p className="text-secondary">Use at least 8 characters and avoid reusing old passwords.</p>
      <PasswordForm />
    </div>
  );
}
