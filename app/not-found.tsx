import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container section text-center" style={{ maxWidth: 620 }}>
      <p className="section-eyebrow mb-1">404</p>
      <h1 className="display-5 mb-3">Page not found</h1>
      <p className="text-secondary">
        The page you are looking for may have moved, or the link may be incorrect.
      </p>
      <div className="d-flex flex-wrap justify-content-center gap-2 mt-4">
        <Link href="/" className="btn btn-primary">Back to home</Link>
        <Link href="/services" className="btn btn-outline-light">Browse services</Link>
      </div>
    </div>
  );
}
