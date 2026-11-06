import { apiFetch } from "@/lib/api";
import { requireUser } from "@/lib/session";
import type { Notification } from "@/lib/types";
import { formatDateTime } from "@/lib/format";
import { markNotificationsReadAction } from "@/lib/actions/contact";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  await requireUser("/dashboard/notifications");
  const notifications = await apiFetch<Notification[]>("/notifications");
  const unread = notifications.filter((note) => Number(note.is_read) === 0).length;

  return (
    <div className="card p-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <h2 className="h4 mb-1">Notifications</h2>
          <p className="text-secondary mb-0">{unread} unread</p>
        </div>
        {unread > 0 ? (
          <form action={markNotificationsReadAction}>
            <button className="btn btn-outline-light btn-sm">Mark all read</button>
          </form>
        ) : null}
      </div>
      {notifications.length === 0 ? (
        <p className="text-secondary mb-0">No notifications yet.</p>
      ) : (
        <ul className="list-unstyled d-grid gap-3 mb-0">
          {notifications.map((note) => (
            <li key={note.id} className={`p-3 rounded ${Number(note.is_read) === 0 ? "muted-card" : ""}`}>
              <p className="mb-1">{note.message}</p>
              <span className="small text-secondary">{formatDateTime(note.created_at)}{Number(note.is_read) === 0 ? " · Unread" : ""}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
