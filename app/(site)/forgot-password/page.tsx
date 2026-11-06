import { ForgotPasswordForm } from "@/components/forms/AuthForms";

export const metadata = { title: "Forgot Password" };

export default function ForgotPasswordPage() {
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 520 }}>
        <div className="card p-4 p-md-5">
          <p className="section-eyebrow mb-1">Account recovery</p>
          <h1 className="h2 mb-2">Forgot your password?</h1>
          <p className="text-secondary">
            Enter the email on your account and we will create a reset link valid for one hour.
          </p>
          <ForgotPasswordForm />
        </div>
      </div>
    </section>
  );
}
