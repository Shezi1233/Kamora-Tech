import { query } from "@/lib/db";
import type { ContactMessage } from "@/lib/types";
import { formatDateTime } from "@/lib/format";
import { messageAction } from "@/lib/actions/admin";

function one(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; status?: string }>;
}) {
  const params = await searchParams;
  const status = one(params.status);
  const messages = await query<ContactMessage>(
    `SELECT * FROM contact_messages ${status ? "WHERE status = ?" : ""} ORDER BY id DESC LIMIT 200`,
    status ? [status] : [],
  ).catch(() => []);

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h1 className="h3 mb-0">Messages</h1>
        <form method="get" action="/admin/messages" className="d-flex gap-2">
          <select name="status" defaultValue={status} className="form-select">
            <option value="">All</option>
            <option value="new">New</option>
            <option value="read">Read</option>
            <option value="archived">Archived</option>
          </select>
          <button className="btn btn-outline-light text-nowrap">Filter</button>
        </form>
      </div>
      {one(params.success) ? <div className="alert alert-success py-2">{one(params.success)}</div> : null}
      {messages.length === 0 ? <div className="card p-4 text-secondary">No messages.</div> : (
        <div className="d-grid gap-3">
          {messages.map((message) => (
            <article className={`card p-4 ${message.status === "new" ? "muted-card" : ""}`} key={message.id}>
              <div className="d-flex flex-wrap justify-content-between gap-2 mb-2">
                <div>
                  <h2 className="h5 mb-1">{message.subject || "No subject"}</h2>
                  <span className="small text-secondary">{message.name} · {message.email} · {formatDateTime(message.created_at)}</span>
                </div>
                <span className={`badge ${message.status === "new" ? "bg-warning text-dark" : "badge-status"}`}>{message.status}</span>
              </div>
              <p style={{ whiteSpace: "pre-line" }}>{message.message}</p>
              <div className="d-flex flex-wrap gap-2">
                {message.status !== "read" ? (
                  <form action={messageAction}>
                    <input type="hidden" name="id" value={message.id} />
                    <input type="hidden" name="do" value="read" />
                    <button className="btn btn-sm btn-outline-light">Mark read</button>
                  </form>
                ) : null}
                {message.status !== "archived" ? (
                  <form action={messageAction}>
                    <input type="hidden" name="id" value={message.id} />
                    <input type="hidden" name="do" value="archive" />
                    <button className="btn btn-sm btn-outline-light">Archive</button>
                  </form>
                ) : null}
                <form action={messageAction}>
                  <input type="hidden" name="id" value={message.id} />
                  <input type="hidden" name="do" value="delete" />
                  <button className="btn btn-sm btn-outline-light">Delete</button>
                </form>
                <a href={`mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject || "Your enquiry"}`)}`} className="btn btn-sm btn-primary">Reply by email</a>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
