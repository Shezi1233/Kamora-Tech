import { AGENCY } from "@/lib/constants";

export const metadata = { title: "Refund Policy" };

export default function RefundPage() {
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 820 }}>
        <p className="section-eyebrow mb-1">Legal</p>
        <h1>Refund Policy</h1>
        <p className="text-secondary">Last updated: November 2026</p>
        <h2 className="h4 mt-4">Before work begins</h2>
        <p className="text-secondary">
          If you cancel a project before work has started, any deposit paid is refundable minus
          administrative costs already incurred.
        </p>
        <h2 className="h4 mt-4">After work begins</h2>
        <p className="text-secondary">
          Once design or development work has started, refunds are assessed against the work completed
          and time committed. Completed milestones are non-refundable.
        </p>
        <h2 className="h4 mt-4">Delivered work</h2>
        <p className="text-secondary">
          Digital deliverables are non-refundable after handover. If something does not match the agreed
          scope, we will fix it under the project warranty.
        </p>
        <h2 className="h4 mt-4">How to request a refund</h2>
        <p className="text-secondary">
          Email <a href={`mailto:${AGENCY.email}`}>{AGENCY.email}</a> with your order tracking ID and the
          reason for the request. We will review it and respond in writing.
        </p>
        <h2 className="h4 mt-4">Chargebacks</h2>
        <p className="text-secondary mb-0">
          Please contact us before raising a chargeback so we can resolve the issue directly.
        </p>
      </div>
    </section>
  );
}
