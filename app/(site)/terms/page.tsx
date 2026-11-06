import { AGENCY } from "@/lib/constants";

export const metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 820 }}>
        <p className="section-eyebrow mb-1">Legal</p>
        <h1>Terms of Service</h1>
        <p className="text-secondary">Last updated: November 2026</p>
        <h2 className="h4 mt-4">Using this website</h2>
        <p className="text-secondary">
          By using this website you agree to provide accurate account information and to use the site
          lawfully. You are responsible for keeping your login credentials secure.
        </p>
        <h2 className="h4 mt-4">Orders and scope</h2>
        <p className="text-secondary">
          Placing an order starts a conversation about scope. Final deliverables, timelines, and pricing
          are confirmed in writing before work begins. Services marked “Request a Quote” require a
          tailored proposal.
        </p>
        <h2 className="h4 mt-4">Payments</h2>
        <p className="text-secondary">
          Payment terms are agreed per project. Any payment shown on an order is indicative until a
          written confirmation is issued.
        </p>
        <h2 className="h4 mt-4">Intellectual property</h2>
        <p className="text-secondary">
          Unless agreed otherwise, project deliverables are handed over after final payment. We may
          reference completed work in our portfolio unless you request otherwise.
        </p>
        <h2 className="h4 mt-4">Liability</h2>
        <p className="text-secondary">
          We provide services with reasonable care and skill. We are not liable for indirect losses or
          for issues caused by third-party services outside our control.
        </p>
        <h2 className="h4 mt-4">Contact</h2>
        <p className="text-secondary mb-0">
          Questions? Email <a href={`mailto:${AGENCY.email}`}>{AGENCY.email}</a>.
        </p>
      </div>
    </section>
  );
}
