import { AGENCY } from "@/lib/constants";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 820 }}>
        <p className="section-eyebrow mb-1">Legal</p>
        <h1>Privacy Policy</h1>
        <p className="text-secondary">Last updated: November 2026</p>
        <h2 className="h4 mt-4">Information we collect</h2>
        <p className="text-secondary">
          When you create an account, place an order, or contact us, we collect the details you provide:
          your name, email address, phone number, company, project requirements, and order information.
        </p>
        <h2 className="h4 mt-4">How we use it</h2>
        <p className="text-secondary">
          We use your information to respond to enquiries, deliver services, provide order tracking,
          send project updates, and maintain your account. We do not sell personal information.
        </p>
        <h2 className="h4 mt-4">Cookies and sessions</h2>
        <p className="text-secondary">
          We use a secure session cookie to keep you signed in and a cart cookie to remember your
          selections. These are required for the site to work.
        </p>
        <h2 className="h4 mt-4">Data retention</h2>
        <p className="text-secondary">
          Account and order records are kept as long as needed to provide services and meet legal or
          accounting obligations. You can request account deletion by contacting {AGENCY.email}.
        </p>
        <h2 className="h4 mt-4">Contact</h2>
        <p className="text-secondary mb-0">
          Questions about this policy? Email <a href={`mailto:${AGENCY.email}`}>{AGENCY.email}</a>.
        </p>
      </div>
    </section>
  );
}
