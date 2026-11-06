import Link from "next/link";
import { PortfolioForm } from "@/components/admin/AdminForms";

export default function NewPortfolioPage() {
  return (
    <>
      <Link href="/admin/portfolio" className="small">← Back to portfolio</Link>
      <h1 className="h3 my-3">New project</h1>
      <div className="card p-4"><PortfolioForm /></div>
    </>
  );
}
