import Link from "next/link";
import { ResetPasswordForm } from "@/components/forms/AuthForms";

export const metadata = { title: "Reset Password" };

function one(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const token = one((await searchParams).token);

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 520 }}>
        <div className="card p-4 p-md-5">
          <p className="section-eyebrow mb-1">Account recovery</p>
          <h1 className="h2 mb-2">Choose a new password</h1>
          {token ? (
            <ResetPasswordForm token={token} />
          ) : (
            <>
              <div className="alert alert-danger py-2">This reset link is missing its token.</div>
              <Link href="/forgot-password" className="btn btn-primary">Request a new link</Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
