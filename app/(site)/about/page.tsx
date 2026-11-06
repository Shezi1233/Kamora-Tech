import Link from "next/link";
import { AGENCY } from "@/lib/constants";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <>
      <section className="section-alt py-5">
        <div className="container">
          <p className="section-eyebrow mb-1">About</p>
          <h1 className="mb-2">{AGENCY.name}</h1>
          <p className="lead text-secondary mb-0">{AGENCY.tagline}</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-7">
              <h2>We build practical digital products, not just pages.</h2>
              <p className="text-secondary">
                Kamora Tech is a web development studio focused on websites, e-commerce, dashboards,
                and custom software for small and growing businesses. Every project starts with a clear
                scope and a realistic plan, so you know what you are getting before work begins.
              </p>
              <p className="text-secondary">
                We care about the details that matter after launch: fast loading, mobile usability,
                security, clean structure, and content you can actually maintain. When a project is
                done, you get a handover you can understand.
              </p>
              <div className="row g-3 mt-4">
                {[
                  ["Clear scope", "Fixed deliverables and written proposals."],
                  ["Visible progress", "Regular updates and order tracking."],
                  ["Maintainable code", "Clean structure, documented handover."],
                  ["Ongoing support", "Maintenance plans when you need them."],
                ].map(([title, body]) => (
                  <div className="col-sm-6" key={title}>
                    <div className="card h-100 p-3">
                      <strong>{title}</strong>
                      <span className="text-secondary small mt-1">{body}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-lg-5">
              <div className="card p-4 mb-4">
                <h2 className="h5">What we do</h2>
                <ul className="text-secondary mb-0">
                  <li>Business and corporate websites</li>
                  <li>E-commerce stores</li>
                  <li>Management systems and portals</li>
                  <li>Dashboards and internal tools</li>
                  <li>Maintenance, speed, and SEO setup</li>
                </ul>
              </div>
              <div className="card p-4">
                <h2 className="h5">Start a conversation</h2>
                <p className="text-secondary small">Tell us what you need and we will suggest a sensible path forward.</p>
                <Link href="/contact" className="btn btn-primary">Contact us</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
