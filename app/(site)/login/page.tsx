import { redirect } from "next/navigation";
import { getCurrentAdmin, getCurrentUser } from "@/lib/session";
import { LoginForm } from "@/components/forms/AuthForms";

export const metadata = { title: "Client Login" };

function one(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; registered?: string; reset?: string }>;
}) {
  const [user, admin] = await Promise.all([getCurrentUser(), getCurrentAdmin()]);
  if (admin) redirect("/admin");
  if (user) redirect("/dashboard");
  const params = await searchParams;
  const next = one(params.next);
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 520 }}>
        <div className="card p-4 p-md-5">
          <p className="section-eyebrow mb-1">Client area</p>
          <h1 className="h2 mb-2">Welcome back</h1>
          <p className="text-secondary">Sign in to track orders, manage your profile, and view updates.</p>
          {params.registered ? <div className="alert alert-success py-2">Account created. Please sign in.</div> : null}
          {params.reset ? <div className="alert alert-success py-2">Password updated. Please sign in.</div> : null}
          <LoginForm next={safeNext} />
        </div>
      </div>
    </section>
  );
}
