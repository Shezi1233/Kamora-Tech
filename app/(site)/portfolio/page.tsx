import Image from "next/image";
import { query } from "@/lib/db";
import type { PortfolioProject } from "@/lib/types";
import { imageUrl } from "@/lib/format";
import { Reveal } from "@/components/ui/Reveal";

export const metadata = { title: "Portfolio" };

export default async function PortfolioPage() {
  const projects = await query<PortfolioProject>(
    "SELECT * FROM portfolio_projects WHERE is_active = 1 ORDER BY is_featured DESC, id DESC",
  ).catch(() => []);

  return (
    <>
      <section className="section-alt py-5">
        <div className="container">
          <p className="section-eyebrow mb-1">Portfolio</p>
          <h1 className="mb-2">Work we are proud to put our name on</h1>
          <p className="text-secondary mb-0">
            A selection of websites, dashboards, and systems built around real business needs.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          {projects.length === 0 ? (
            <div className="card p-5 text-center">
              <h2 className="h4">Portfolio coming soon</h2>
              <p className="text-secondary mb-0">Project examples will appear here once added from the admin panel.</p>
            </div>
          ) : (
            <div className="row g-4">
              {projects.map((project, index) => {
                const src = imageUrl(project.image);
                return (
                  <div className="col-md-6 col-lg-4" key={project.id}>
                    <Reveal delay={index * 50}>
                      <article className="card h-100 overflow-hidden">
                        {src ? (
                          <Image src={src} alt={project.title} width={700} height={420} className="w-100" style={{ height: 220, objectFit: "cover" }} />
                        ) : (
                          <div className="service-icon"><i className="fa-solid fa-images" aria-hidden="true" /></div>
                        )}
                        <div className="p-4">
                          <span className="service-category small">{project.category ?? "Project"}</span>
                          <h2 className="h5 mt-1">{project.title}</h2>
                          {project.description ? <p className="text-secondary small mb-3">{project.description}</p> : null}
                          {project.project_url ? (
                            <a href={project.project_url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-light">
                              Visit project <i className="fa-solid fa-arrow-up-right-from-square ms-1" aria-hidden="true" />
                            </a>
                          ) : null}
                        </div>
                      </article>
                    </Reveal>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
