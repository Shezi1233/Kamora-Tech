import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { SignupForm } from "@/components/forms/AuthForms";

export const metadata = { title: "Create Account" };

export default async function SignupPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 560 }}>
        <div className="card p-4 p-md-5">
          <p className="section-eyebrow mb-1">Get started</p>
          <h1 className="h2 mb-2">Create your account</h1>
          <p className="text-secondary">
            Create an account to order services, track progress, and keep all project communication in one place.
          </p>
          <SignupForm />
        </div>
      </div>
    </section>
  );
}
