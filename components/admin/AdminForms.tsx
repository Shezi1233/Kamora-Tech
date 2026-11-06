"use client";

import { useActionState } from "react";
import {
  adminLoginAction,
  saveCategoryAction,
  savePortfolioAction,
  saveServiceAction,
  updateAdminProfileAction,
  type AdminState,
} from "@/lib/actions/admin";
import type { Category, PortfolioProject, Service } from "@/lib/types";

const initial: AdminState = {};

function Alert({ state }: { state: AdminState }) {
  if (state.error) return <div className="alert alert-danger py-2" role="alert">{state.error}</div>;
  if (state.success) return <div className="alert alert-success py-2">{state.success}</div>;
  return null;
}

export function AdminLoginForm() {
  const [state, formAction, pending] = useActionState(adminLoginAction, initial);
  return (
    <form action={formAction} className="d-grid gap-3">
      <Alert state={state} />
      <div>
        <label className="form-label" htmlFor="admin-email">Admin email</label>
        <input id="admin-email" name="email" type="email" required autoComplete="username" className="form-control" />
      </div>
      <div>
        <label className="form-label" htmlFor="admin-password">Password</label>
        <input id="admin-password" name="password" type="password" required autoComplete="current-password" className="form-control" />
      </div>
      <button className="btn btn-primary" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}

export function ServiceForm({ categories, service }: { categories: Category[]; service?: Service | null }) {
  const [state, formAction, pending] = useActionState(saveServiceAction, initial);
  return (
    <form action={formAction} className="d-grid gap-3">
      <Alert state={state} />
      {service ? <input type="hidden" name="id" value={service.id} /> : null}
      <div className="row g-3">
        <div className="col-md-8">
          <label className="form-label" htmlFor="service-title">Title</label>
          <input id="service-title" name="title" defaultValue={service?.title ?? ""} required className="form-control" />
        </div>
        <div className="col-md-4">
          <label className="form-label" htmlFor="service-category">Category</label>
          <select id="service-category" name="category_id" defaultValue={service?.category_id ?? ""} required className="form-select">
            <option value="">Choose…</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="form-label" htmlFor="service-short">Short description</label>
        <textarea id="service-short" name="short_description" defaultValue={service?.short_description ?? ""} rows={2} className="form-control" />
      </div>
      <div>
        <label className="form-label" htmlFor="service-description">Full description</label>
        <textarea id="service-description" name="description" defaultValue={service?.description ?? ""} rows={5} className="form-control" />
      </div>
      <div className="row g-3">
        <div className="col-md-4">
          <label className="form-label" htmlFor="service-price">Price (blank = quote)</label>
          <input id="service-price" name="price" type="number" min={0} step="0.01" defaultValue={service?.price === null || service?.price === undefined ? "" : String(service.price)} className="form-control" />
        </div>
        <div className="col-md-8">
          <label className="form-label" htmlFor="service-delivery">Delivery estimate</label>
          <input id="service-delivery" name="delivery_estimate" defaultValue={service?.delivery_estimate ?? ""} className="form-control" />
        </div>
      </div>
      <div>
        <label className="form-label" htmlFor="service-features">Features (one per line)</label>
        <textarea id="service-features" name="features" defaultValue={service?.features ?? ""} rows={4} className="form-control" />
      </div>
      <div>
        <label className="form-label" htmlFor="service-technologies">Technologies (comma separated)</label>
        <input id="service-technologies" name="technologies" defaultValue={service?.technologies ?? ""} className="form-control" />
      </div>
      <div>
        <label className="form-label" htmlFor="service-image">Image (JPG, PNG, WebP · max 2 MB)</label>
        <input id="service-image" name="image" type="file" accept=".jpg,.jpeg,.png,.webp" className="form-control" />
        {service?.image ? <div className="form-text">Current: {service.image}. Leave blank to keep it.</div> : null}
      </div>
      <div className="d-flex flex-wrap gap-3">
        <label className="form-check">
          <input className="form-check-input" type="checkbox" name="is_active" defaultChecked={service ? Number(service.is_active) === 1 : true} />
          <span className="form-check-label">Active</span>
        </label>
        <label className="form-check">
          <input className="form-check-input" type="checkbox" name="is_featured" defaultChecked={service ? Number(service.is_featured) === 1 : false} />
          <span className="form-check-label">Featured</span>
        </label>
      </div>
      <button className="btn btn-primary" disabled={pending}>{pending ? "Saving…" : service ? "Save service" : "Create service"}</button>
    </form>
  );
}

export function CategoryForm({ category }: { category?: Category | null }) {
  const [state, formAction, pending] = useActionState(saveCategoryAction, initial);
  return (
    <form action={formAction} className="d-grid gap-3">
      <Alert state={state} />
      {category ? <input type="hidden" name="id" value={category.id} /> : null}
      <div>
        <label className="form-label" htmlFor="category-name">Name</label>
        <input id="category-name" name="name" defaultValue={category?.name ?? ""} required className="form-control" />
      </div>
      <div>
        <label className="form-label" htmlFor="category-description">Description</label>
        <textarea id="category-description" name="description" defaultValue={category?.description ?? ""} rows={3} className="form-control" />
      </div>
      <label className="form-check">
        <input className="form-check-input" type="checkbox" name="is_active" defaultChecked={category ? Number(category.is_active) === 1 : true} />
        <span className="form-check-label">Active</span>
      </label>
      <button className="btn btn-primary" disabled={pending}>{pending ? "Saving…" : category ? "Save category" : "Create category"}</button>
    </form>
  );
}

export function PortfolioForm({
  project,
}: {
  project?: PortfolioProject | null;
}) {
  const [state, formAction, pending] = useActionState(savePortfolioAction, initial);
  return (
    <form action={formAction} className="d-grid gap-3">
      <Alert state={state} />
      {project ? <input type="hidden" name="id" value={project.id} /> : null}
      <div className="row g-3">
        <div className="col-md-8">
          <label className="form-label" htmlFor="project-title">Title</label>
          <input id="project-title" name="title" defaultValue={project?.title ?? ""} required className="form-control" />
        </div>
        <div className="col-md-4">
          <label className="form-label" htmlFor="project-category">Category</label>
          <input id="project-category" name="category" defaultValue={project?.category ?? ""} className="form-control" />
        </div>
      </div>
      <div>
        <label className="form-label" htmlFor="project-description">Description</label>
        <textarea id="project-description" name="description" defaultValue={project?.description ?? ""} rows={4} className="form-control" />
      </div>
      <div>
        <label className="form-label" htmlFor="project-url">Project URL</label>
        <input id="project-url" name="project_url" type="url" defaultValue={project?.project_url ?? ""} className="form-control" />
      </div>
      <div>
        <label className="form-label" htmlFor="project-image">Image (JPG, PNG, WebP · max 2 MB)</label>
        <input id="project-image" name="image" type="file" accept=".jpg,.jpeg,.png,.webp" className="form-control" />
        {project?.image ? <div className="form-text">Current: {project.image}</div> : null}
      </div>
      <div className="d-flex flex-wrap gap-3">
        <label className="form-check">
          <input className="form-check-input" type="checkbox" name="is_featured" defaultChecked={project ? Number(project.is_featured) === 1 : false} />
          <span className="form-check-label">Featured</span>
        </label>
        <label className="form-check">
          <input className="form-check-input" type="checkbox" name="is_active" defaultChecked={project ? Number(project.is_active) === 1 : true} />
          <span className="form-check-label">Active</span>
        </label>
      </div>
      <button className="btn btn-primary" disabled={pending}>{pending ? "Saving…" : project ? "Save project" : "Create project"}</button>
    </form>
  );
}

export function AdminProfileForm({ admin }: { admin: { full_name: string; email: string } }) {
  const [state, formAction, pending] = useActionState(updateAdminProfileAction, initial);
  return (
    <form action={formAction} className="d-grid gap-3">
      <Alert state={state} />
      <div>
        <label className="form-label" htmlFor="admin-name">Full name</label>
        <input id="admin-name" name="full_name" defaultValue={admin.full_name} required className="form-control" />
      </div>
      <div>
        <label className="form-label" htmlFor="admin-profile-email">Email</label>
        <input id="admin-profile-email" value={admin.email} disabled readOnly className="form-control" />
      </div>
      <div>
        <label className="form-label" htmlFor="admin-new-password">New password (optional)</label>
        <input id="admin-new-password" name="password" type="password" autoComplete="new-password" className="form-control" />
      </div>
      <button className="btn btn-primary" disabled={pending}>{pending ? "Saving…" : "Save profile"}</button>
    </form>
  );
}
