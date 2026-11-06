"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  changePasswordAction,
  forgotPasswordAction,
  loginAction,
  resetPasswordAction,
  signupAction,
  updateProfileAction,
  type AuthState,
} from "@/lib/actions/auth";

const initial: AuthState = {};

function Alert({ state }: { state: AuthState }) {
  if (state.error) {
    return <div className="alert alert-danger py-2" role="alert">{state.error}</div>;
  }
  if (state.success) {
    return (
      <div className="alert alert-success py-2" role="status">
        {state.success}
        {state.resetLink ? (
          <div className="mt-2">
            <a href={state.resetLink} className="alert-link">Open reset link</a>
            <div className="small mt-1">Development mode: this link is shown because email sending is not configured.</div>
          </div>
        ) : null}
      </div>
    );
  }
  return null;
}

export function LoginForm({ next = "/dashboard" }: { next?: string }) {
  const [state, formAction, pending] = useActionState(loginAction, initial);
  return (
    <form action={formAction} className="d-grid gap-3">
      <Alert state={state} />
      <input type="hidden" name="next" value={next} />
      <div>
        <label className="form-label" htmlFor="login-email">Email</label>
        <input id="login-email" name="email" type="email" required autoComplete="email" className="form-control" />
      </div>
      <div>
        <label className="form-label" htmlFor="login-password">Password</label>
        <input id="login-password" name="password" type="password" required autoComplete="current-password" className="form-control" />
      </div>
      <button className="btn btn-primary" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
      <div className="d-flex justify-content-between small">
        <Link href="/forgot-password">Forgot password?</Link>
        <Link href="/signup">Create account</Link>
      </div>
    </form>
  );
}

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signupAction, initial);
  return (
    <form action={formAction} className="d-grid gap-3">
      <Alert state={state} />
      <div>
        <label className="form-label" htmlFor="signup-name">Full name</label>
        <input id="signup-name" name="full_name" required autoComplete="name" className="form-control" />
      </div>
      <div>
        <label className="form-label" htmlFor="signup-email">Email</label>
        <input id="signup-email" name="email" type="email" required autoComplete="email" className="form-control" />
      </div>
      <div>
        <label className="form-label" htmlFor="signup-phone">Phone (optional)</label>
        <input id="signup-phone" name="phone" autoComplete="tel" className="form-control" />
      </div>
      <div>
        <label className="form-label" htmlFor="signup-password">Password</label>
        <input id="signup-password" name="password" type="password" required minLength={8} autoComplete="new-password" className="form-control" />
      </div>
      <div>
        <label className="form-label" htmlFor="signup-confirm">Confirm password</label>
        <input id="signup-confirm" name="password_confirm" type="password" required minLength={8} autoComplete="new-password" className="form-control" />
      </div>
      <div className="form-check">
        <input className="form-check-input" type="checkbox" name="terms" id="signup-terms" required />
        <label className="form-check-label small" htmlFor="signup-terms">
          I agree to the <Link href="/terms">terms</Link> and <Link href="/privacy">privacy policy</Link>.
        </label>
      </div>
      <button className="btn btn-primary" disabled={pending}>{pending ? "Creating account…" : "Create account"}</button>
      <p className="small mb-0">Already have an account? <Link href="/login">Sign in</Link></p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(forgotPasswordAction, initial);
  return (
    <form action={formAction} className="d-grid gap-3">
      <Alert state={state} />
      <div>
        <label className="form-label" htmlFor="forgot-email">Email</label>
        <input id="forgot-email" name="email" type="email" required autoComplete="email" className="form-control" />
      </div>
      <button className="btn btn-primary" disabled={pending}>{pending ? "Sending…" : "Send reset link"}</button>
      <p className="small mb-0"><Link href="/login">Back to login</Link></p>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(resetPasswordAction, initial);
  return (
    <form action={formAction} className="d-grid gap-3">
      <Alert state={state} />
      <input type="hidden" name="token" value={token} />
      <div>
        <label className="form-label" htmlFor="reset-password">New password</label>
        <input id="reset-password" name="password" type="password" required minLength={8} autoComplete="new-password" className="form-control" />
      </div>
      <div>
        <label className="form-label" htmlFor="reset-confirm">Confirm new password</label>
        <input id="reset-confirm" name="password_confirm" type="password" required minLength={8} autoComplete="new-password" className="form-control" />
      </div>
      <button className="btn btn-primary" disabled={pending}>{pending ? "Updating…" : "Update password"}</button>
    </form>
  );
}

export function ProfileForm({
  user,
}: {
  user: { full_name: string; email: string; phone: string | null };
}) {
  const [state, formAction, pending] = useActionState(updateProfileAction, initial);
  return (
    <form action={formAction} className="d-grid gap-3">
      <Alert state={state} />
      <div>
        <label className="form-label" htmlFor="profile-name">Full name</label>
        <input id="profile-name" name="full_name" defaultValue={user.full_name} required className="form-control" />
      </div>
      <div>
        <label className="form-label" htmlFor="profile-email">Email</label>
        <input id="profile-email" value={user.email} readOnly disabled className="form-control" />
      </div>
      <div>
        <label className="form-label" htmlFor="profile-phone">Phone</label>
        <input id="profile-phone" name="phone" defaultValue={user.phone ?? ""} className="form-control" />
      </div>
      <button className="btn btn-primary" disabled={pending}>{pending ? "Saving…" : "Save profile"}</button>
    </form>
  );
}

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, initial);
  return (
    <form action={formAction} className="d-grid gap-3">
      <Alert state={state} />
      <div>
        <label className="form-label" htmlFor="current-password">Current password</label>
        <input id="current-password" name="current_password" type="password" required autoComplete="current-password" className="form-control" />
      </div>
      <div>
        <label className="form-label" htmlFor="new-password">New password</label>
        <input id="new-password" name="password" type="password" required minLength={8} autoComplete="new-password" className="form-control" />
      </div>
      <div>
        <label className="form-label" htmlFor="confirm-password">Confirm new password</label>
        <input id="confirm-password" name="password_confirm" type="password" required minLength={8} autoComplete="new-password" className="form-control" />
      </div>
      <button className="btn btn-primary" disabled={pending}>{pending ? "Updating…" : "Change password"}</button>
    </form>
  );
}
