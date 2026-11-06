"use client";

import { useActionState } from "react";
import Link from "next/link";
import { checkoutAction, type CheckoutState } from "@/lib/actions/checkout";
import { PAYMENT_METHODS } from "@/lib/constants";
import { money } from "@/lib/format";

const initial: CheckoutState = {};

export function CheckoutForm({
  lines,
  subtotal,
  hasQuote,
}: {
  lines: { id: number; title: string; price: string | null; quantity: number }[];
  subtotal: number;
  hasQuote: boolean;
}) {
  const [state, formAction, pending] = useActionState(checkoutAction, initial);

  return (
    <form action={formAction}>
      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card p-4 mb-4">
            <h2 className="h5">Project details</h2>
            {state.error ? <div className="alert alert-danger py-2 mt-2">{state.error}</div> : null}
            <div className="d-grid gap-3">
              <div>
                <label className="form-label" htmlFor="checkout-company">Company / organisation (optional)</label>
                <input id="checkout-company" name="company" className="form-control" />
              </div>
              <div>
                <label className="form-label" htmlFor="checkout-requirements">Project requirements</label>
                <textarea
                  id="checkout-requirements"
                  name="requirements"
                  rows={6}
                  minLength={10}
                  required
                  className="form-control"
                  placeholder="What should this project do? Who is it for? Any must-have features?"
                />
                <div className="form-text">At least 10 characters. Be as specific as you can.</div>
              </div>
              <div>
                <label className="form-label" htmlFor="checkout-notes">Additional notes (optional)</label>
                <textarea id="checkout-notes" name="notes" rows={3} className="form-control" />
              </div>
            </div>
          </div>
          <div className="card p-4">
            <h2 className="h5">Payment method</h2>
            <div className="d-grid gap-2">
              {PAYMENT_METHODS.map((method, index) => (
                <label className="form-check card p-3" key={method}>
                  <input
                    className="form-check-input"
                    type="radio"
                    name="payment_method"
                    value={method}
                    defaultChecked={index === 0}
                  />
                  <span className="form-check-label ps-1">{method}</span>
                </label>
              ))}
            </div>
            <p className="small text-secondary mt-3 mb-0">
              No online payment is taken on this site. We confirm payment details with you after the order is reviewed.
            </p>
          </div>
        </div>
        <aside className="col-lg-5">
          <div className="card p-4 sticky-lg-top" style={{ top: 90 }}>
            <h2 className="h5">Order summary</h2>
            <ul className="list-unstyled d-grid gap-2 py-2">
              {lines.map((line) => (
                <li className="d-flex justify-content-between gap-2 small" key={line.id}>
                  <span>{line.title} <span className="text-secondary">× {line.quantity}</span></span>
                  <strong>{line.price === null ? "Quote" : money(Number(line.price) * line.quantity)}</strong>
                </li>
              ))}
            </ul>
            <div className="d-flex justify-content-between border-top border-secondary border-opacity-25 pt-3">
              <span className="text-secondary">Subtotal</span>
              <strong>{money(subtotal)}</strong>
            </div>
            <div className="mt-3">
              <label className="form-label small" htmlFor="checkout-coupon">Coupon code (optional)</label>
              <input id="checkout-coupon" name="coupon" className="form-control" placeholder="Enter code" />
            </div>
            {hasQuote ? (
              <p className="small text-secondary mt-2 mb-0">
                Custom-quote items are not included in the subtotal.
              </p>
            ) : null}
            <button className="btn btn-primary w-100 mt-3" disabled={pending}>
              {pending ? "Placing order…" : "Place order"}
            </button>
            <Link href="/cart" className="btn btn-outline-light w-100 mt-2">Back to cart</Link>
            <p className="small text-secondary mt-3 mb-0">
              By placing this order you agree to our <Link href="/terms">terms</Link>.
            </p>
          </div>
        </aside>
      </div>
    </form>
  );
}
