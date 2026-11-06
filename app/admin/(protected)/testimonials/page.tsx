import { apiFetch } from "@/lib/api";
import type { Testimonial } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { testimonialAction } from "@/lib/actions/admin";

export const dynamic = "force-dynamic";

function one(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export default async function AdminTestimonialsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const params = await searchParams;
  const testimonials = await apiFetch<Testimonial[]>("/admin/testimonials", {
    admin: true,
  });

  return (
    <>
      <h1 className="h3 mb-3">Testimonials</h1>
      {one(params.success) ? <div className="alert alert-success py-2">{one(params.success)}</div> : null}
      {one(params.error) ? <div className="alert alert-danger py-2">{one(params.error)}</div> : null}

      <div className="card p-4 mb-4">
        <h2 className="h5">Add testimonial</h2>
        <form action={testimonialAction} className="d-grid gap-3">
          <input type="hidden" name="do" value="add" />
          <div className="row g-3">
            <div className="col-sm-6"><label className="form-label" htmlFor="t-name">Client name</label><input id="t-name" name="client_name" required className="form-control" /></div>
            <div className="col-sm-6"><label className="form-label" htmlFor="t-role">Role / company</label><input id="t-role" name="client_role" className="form-control" /></div>
          </div>
          <div><label className="form-label" htmlFor="t-quote">Quote</label><textarea id="t-quote" name="quote" rows={4} required className="form-control" /></div>
          <label className="form-check">
            <input className="form-check-input" type="checkbox" name="is_approved" defaultChecked />
            <span className="form-check-label">Approved (show on website)</span>
          </label>
          <button className="btn btn-primary align-self-start">Add testimonial</button>
        </form>
      </div>

      <div className="d-grid gap-3">
        {testimonials.map((testimonial) => (
          <article className="card p-4" key={testimonial.id}>
            <div className="d-flex justify-content-between gap-2">
              <div>
                <strong>{testimonial.client_name}</strong>
                {testimonial.client_role ? <span className="small text-secondary"> · {testimonial.client_role}</span> : null}
                <span className="small text-secondary d-block">{formatDate(testimonial.created_at)}</span>
              </div>
              <span className={`badge ${Number(testimonial.is_approved) === 1 ? "bg-success" : "bg-secondary"}`}>
                {Number(testimonial.is_approved) === 1 ? "Approved" : "Hidden"}
              </span>
            </div>
            <p className="mt-2 mb-3">{testimonial.quote}</p>
            <div className="d-flex gap-2">
              <form action={testimonialAction}>
                <input type="hidden" name="do" value="toggle" />
                <input type="hidden" name="id" value={testimonial.id} />
                <button className="btn btn-sm btn-outline-light">{Number(testimonial.is_approved) === 1 ? "Hide" : "Approve"}</button>
              </form>
              <form action={testimonialAction}>
                <input type="hidden" name="do" value="delete" />
                <input type="hidden" name="id" value={testimonial.id} />
                <button className="btn btn-sm btn-outline-light">Delete</button>
              </form>
            </div>
          </article>
        ))}
        {testimonials.length === 0 ? <div className="card p-4 text-secondary">No testimonials yet.</div> : null}
      </div>
    </>
  );
}
