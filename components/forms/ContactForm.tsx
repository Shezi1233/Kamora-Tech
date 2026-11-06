"use client";

import { useActionState } from "react";
import { contactAction, type ContactState } from "@/lib/actions/contact";

const initial: ContactState = {};

export function ContactForm() {
  const [state, formAction, pending] = useActionState(contactAction, initial);
  return (
    <form action={formAction} className="d-grid gap-3">
      {state.error ? <div className="alert alert-danger py-2" role="alert">{state.error}</div> : null}
      <div className="row g-3">
        <div className="col-sm-6">
          <label className="form-label" htmlFor="contact-name">Name</label>
          <input id="contact-name" name="name" required className="form-control" />
        </div>
        <div className="col-sm-6">
          <label className="form-label" htmlFor="contact-email">Email</label>
          <input id="contact-email" name="email" type="email" required className="form-control" />
        </div>
      </div>
      <div>
        <label className="form-label" htmlFor="contact-subject">Subject</label>
        <input id="contact-subject" name="subject" className="form-control" />
      </div>
      <div>
        <label className="form-label" htmlFor="contact-message">Message</label>
        <textarea id="contact-message" name="message" rows={6} required minLength={10} className="form-control" />
      </div>
      <button className="btn btn-primary" disabled={pending}>
        {pending ? "Sending…" : "Send message"}
      </button>
      <p className="small text-secondary mb-0">
        We usually reply within one business day. Your details are only used to respond to your enquiry.
      </p>
    </form>
  );
}
