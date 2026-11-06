import { ContactForm } from "@/components/forms/ContactForm";
import { AGENCY } from "@/lib/constants";

export const metadata = { title: "Contact" };

function one(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const sent = one((await searchParams).sent);

  return (
    <>
      <section className="section-alt py-5">
        <div className="container">
          <p className="section-eyebrow mb-1">Contact</p>
          <h1 className="mb-2">Tell us what you want to build</h1>
          <p className="text-secondary mb-0">
            Share your goals, timeline, and any references. We will reply with clear next steps.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-7">
              <div className="card p-4 p-md-5">
                {sent ? (
                  <div className="alert alert-success" role="status">
                    Thanks — your message has been received. We will get back to you soon.
                  </div>
                ) : null}
                <ContactForm />
              </div>
            </div>
            <aside className="col-lg-5">
              <div className="card p-4 mb-4">
                <h2 className="h5">Email</h2>
                <a href={`mailto:${AGENCY.email}`} className="d-inline-flex align-items-center gap-2">
                  <i className="fa-regular fa-envelope" aria-hidden="true" /> {AGENCY.email}
                </a>
              </div>
              <div className="card p-4 mb-4">
                <h2 className="h5">Working hours</h2>
                <p className="text-secondary mb-0">Monday–Saturday · 10:00–19:00 PKT</p>
              </div>
              <div className="card p-4">
                <h2 className="h5">Before you write</h2>
                <ul className="text-secondary mb-0">
                  <li>What the website or system should do</li>
                  <li>Any examples you like</li>
                  <li>Your target launch window</li>
                  <li>Whether you need ongoing support</li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
