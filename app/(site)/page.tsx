import Link from "next/link";
import Image from "next/image";
import { apiFetch } from "@/lib/api";
import type { Category, PortfolioProject, Service, Testimonial } from "@/lib/types";
import { ServiceCard } from "@/components/site/ServiceCard";
import { Reveal } from "@/components/ui/Reveal";
import { imageUrl } from "@/lib/format";

export const dynamic = "force-dynamic";

type ServicePage = { items: Service[] };

export default async function HomePage() {
  const [categories, featuredPage, projects, testimonials] = await Promise.all([
    apiFetch<Category[]>("/categories?active_only=true"),
    apiFetch<ServicePage>("/services?active_only=true&page_size=8&sort=featured"),
    apiFetch<PortfolioProject[]>("/portfolio?active_only=true"),
    apiFetch<Testimonial[]>("/testimonials?approved_only=true"),
  ]);
  const categoriesShown = categories.slice(0, 8);
  const featured = featuredPage.items.slice(0, 8);
  const projectsShown = projects.slice(0, 6);
  const testimonialsShown = testimonials.slice(0, 3);

  return (
    <>
      <section className="hero hero-home">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <Reveal>
                <span className="hero-eyebrow mb-3">
                  <span className="hero-eyebrow-dot" aria-hidden="true" />
                  Digital product studio · Available for new projects
                </span>
                <h1 className="mt-3 hero-title">
                  We build <span className="hero-gradient">digital products</span> that move business forward.
                </h1>
                <p className="lead hero-lead mt-3">
                  Strategy, design, and engineering for websites, e-commerce stores, dashboards, and custom
                  software — built to look sharp and perform even better.
                </p>
                <div className="d-flex flex-wrap gap-2 mt-4 hero-actions">
                  <Link href="/services" className="btn btn-primary btn-lg">
                    Explore services
                    <i className="fa-solid fa-arrow-right ms-2" aria-hidden="true" />
                  </Link>
                  <Link href="/contact" className="btn btn-outline-light btn-lg">
                    Start a project
                  </Link>
                </div>
                <div className="hero-metrics mt-4">
                  <div>
                    <strong>32+</strong>
                    <span>Services</span>
                  </div>
                  <div>
                    <strong>98</strong>
                    <span>Avg. Lighthouse</span>
                  </div>
                  <div>
                    <strong>24/7</strong>
                    <span>Support mindset</span>
                  </div>
                </div>
                <p className="hero-trust small text-secondary mb-0">
                  <i className="fa-solid fa-shield-halved me-1" aria-hidden="true" />
                  Clear scope, transparent tracking, and ongoing support.
                </p>
              </Reveal>
            </div>
            <div className="col-lg-6">
              <Reveal delay={120}>
                <div className="hero-stage hero-visible" aria-hidden="true">
                  <div className="hero-orb hero-orb-1" />
                  <div className="hero-orb hero-orb-2" />
                  <div className="hero-window">
                    <div className="hero-window-bar">
                      <div className="hero-window-dots">
                        <span />
                        <span />
                        <span />
                      </div>
                      <span className="hero-window-url">
                        <i className="fa-solid fa-lock" aria-hidden="true" />
                        app.kamoratech.dev
                      </span>
                      <span className="hero-window-live">
                        <span className="hero-live-dot" />
                        Live
                      </span>
                    </div>
                    <div className="hero-window-body">
                      <aside className="hero-mock-sidebar">
                        <div className="hero-mock-brand">K</div>
                        <div className="hero-mock-nav">
                          <span className="active" />
                          <span />
                          <span />
                          <span />
                        </div>
                        <div className="hero-mock-avatar">KT</div>
                      </aside>
                      <div className="hero-mock-content">
                        <div className="hero-mock-heading">
                          <div>
                            <span className="hero-mock-kicker">Project overview</span>
                            <strong>Growth dashboard</strong>
                          </div>
                          <span className="hero-mock-badge">On track</span>
                        </div>
                        <div className="hero-mock-stats">
                          <div>
                            <span>Revenue</span>
                            <strong>$84.2K</strong>
                            <small className="up">+12.4%</small>
                          </div>
                          <div>
                            <span>Projects</span>
                            <strong>18</strong>
                            <small className="up">+4 new</small>
                          </div>
                          <div>
                            <span>Uptime</span>
                            <strong>99.9%</strong>
                            <small className="up">Stable</small>
                          </div>
                        </div>
                        <div className="hero-mock-chart">
                          <div className="hero-mock-chart-head">
                            <span>Traffic &amp; conversions</span>
                            <span>Last 30 days</span>
                          </div>
                          <div className="hero-mock-bars">
                            {[38, 55, 48, 72, 61, 84, 70, 92, 66, 80, 74, 96].map((height, index) => (
                              <span
                                key={index}
                                className={index === 11 ? "peak" : ""}
                                style={{ height: `${height}%` }}
                              />
                            ))}
                          </div>
                          <div className="hero-mock-axis">
                            <span>01</span>
                            <span>08</span>
                            <span>15</span>
                            <span>22</span>
                            <span>30</span>
                          </div>
                        </div>
                        <div className="hero-mock-footer">
                          <span>
                            <i className="fa-solid fa-circle-check" aria-hidden="true" />
                            All systems operational
                          </span>
                          <span>Updated 2 min ago</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="hero-float hero-float-score">
                    <span className="hero-float-icon">
                      <i className="fa-solid fa-gauge-high" aria-hidden="true" />
                    </span>
                    <div>
                      <span>Lighthouse</span>
                      <strong>98 / 100</strong>
                    </div>
                  </div>
                  <div className="hero-float hero-float-deploy">
                    <span className="hero-status-dot" />
                    <div>
                      <span>Deployment</span>
                      <strong>Live &amp; secure</strong>
                    </div>
                  </div>
                  <div className="hero-float hero-float-speed">
                    <span className="hero-float-icon">
                      <i className="fa-solid fa-bolt" aria-hidden="true" />
                    </span>
                    <div>
                      <span>Load time</span>
                      <strong>0.9s</strong>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="row align-items-end mb-4 g-3">
            <div className="col-lg-8">
              <p className="section-eyebrow mb-1">What we build</p>
              <h2 className="mb-2">Practical digital products for growing teams</h2>
              <p className="text-secondary mb-0">
                Browse our core categories, then drill into the exact service you need.
              </p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <Link href="/services" className="btn btn-outline-light">All services</Link>
            </div>
          </div>
          <div className="row g-3">
            {categoriesShown.map((category) => (
              <div className="col-6 col-md-4 col-lg-3" key={category.id}>
                <Link
                  href={`/services?category=${category.slug}`}
                  className="card h-100 p-3 text-reset text-decoration-none"
                >
                  <i className="fa-solid fa-layer-group text-secondary mb-2" aria-hidden="true" />
                  <strong>{category.name}</strong>
                  {category.description ? (
                    <span className="small text-secondary mt-1">{category.description}</span>
                  ) : null}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt" id="popular-services">
        <div className="container">
          <div className="row align-items-end mb-4 g-3">
            <div className="col-lg-8">
              <p className="section-eyebrow mb-1">Our services</p>
              <h2 className="mb-2">Websites, software, and systems that deliver</h2>
              <p className="text-secondary mb-0">
                Explore our most requested services. Every project is scoped clearly before work begins.
              </p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <Link href="/services" className="btn btn-outline-light">Browse all services</Link>
            </div>
          </div>
          <div className="row g-4">
            {featured.map((service) => (
              <div className="col-md-6 col-xl-3" key={service.id}>
                <ServiceCard service={service} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="row g-4 align-items-start">
            <div className="col-lg-5">
              <p className="section-eyebrow mb-1">How we work</p>
              <h2>Simple process, visible progress</h2>
              <p className="text-secondary">
                You always know what is happening, what comes next, and how to reach us.
              </p>
              <Link href="/contact" className="btn btn-primary">Book a consultation</Link>
            </div>
            <div className="col-lg-7">
              <ol className="process-timeline">
                <li><strong>Discover</strong><p className="text-secondary mb-0">Goals, audience, scope, and success measures.</p></li>
                <li><strong>Design</strong><p className="text-secondary mb-0">Structure, flow, and interface direction.</p></li>
                <li><strong>Build</strong><p className="text-secondary mb-0">Clean implementation with regular checkpoints.</p></li>
                <li><strong>Launch</strong><p className="text-secondary mb-0">Testing, handover, and ongoing support.</p></li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {projectsShown.length > 0 ? (
        <section className="section section-alt">
          <div className="container">
            <div className="row align-items-end mb-4 g-3">
              <div className="col-lg-8">
                <p className="section-eyebrow mb-1">Selected work</p>
                <h2 className="mb-0">Projects built to solve real problems</h2>
              </div>
              <div className="col-lg-4 text-lg-end">
                <Link href="/portfolio" className="btn btn-outline-light">View portfolio</Link>
              </div>
            </div>
            <div className="row g-4">
              {projectsShown.map((project) => {
                const src = imageUrl(project.image);
                return (
                  <div className="col-md-6 col-lg-4" key={project.id}>
                    <Reveal>
                      <article className="card h-100 overflow-hidden">
                        {src ? (
                          <Image src={src} alt={project.title} width={600} height={360} className="w-100" style={{ height: 200, objectFit: "cover" }} />
                        ) : (
                          <div className="service-icon"><i className="fa-solid fa-images" aria-hidden="true" /></div>
                        )}
                        <div className="p-3">
                          <span className="service-category small">{project.category ?? "Project"}</span>
                          <h3 className="h5 mt-1">{project.title}</h3>
                          {project.description ? <p className="text-secondary small mb-0">{project.description}</p> : null}
                        </div>
                      </article>
                    </Reveal>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {testimonialsShown.length > 0 ? (
        <section className="section">
          <div className="container">
            <p className="section-eyebrow mb-1">Client feedback</p>
            <h2 className="mb-4">What people say</h2>
            <div className="row g-4">
              {testimonialsShown.map((testimonial) => (
                <div className="col-md-4" key={testimonial.id}>
                  <Reveal>
                    <div className="card h-100 p-4">
                      <i className="fa-solid fa-quote-left text-secondary mb-2" aria-hidden="true" />
                      <p className="mb-3">{testimonial.quote}</p>
                      <strong className="mt-auto">{testimonial.client_name}</strong>
                      {testimonial.client_role ? <span className="small text-secondary">{testimonial.client_role}</span> : null}
                    </div>
                  </Reveal>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="section section-alt">
        <div className="container">
          <div className="card p-4 p-lg-5">
            <div className="row align-items-center g-4">
              <div className="col-lg-8">
                <h2 className="mb-2">Have a project in mind?</h2>
                <p className="text-secondary mb-0">Tell us what you need. We will reply with clear next steps and a realistic scope.</p>
              </div>
              <div className="col-lg-4 d-flex flex-wrap gap-2 justify-content-lg-end">
                <Link href="/contact" className="btn btn-primary btn-lg">Contact us</Link>
                <Link href="/track" className="btn btn-outline-light btn-lg">Track an order</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
