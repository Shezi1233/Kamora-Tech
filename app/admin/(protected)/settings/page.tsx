import { query } from "@/lib/db";
import { saveSettingsAction } from "@/lib/actions/admin";

function one(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const params = await searchParams;
  const rows = await query<{ setting_key: string; setting_value: string | null }>(
    "SELECT setting_key, setting_value FROM settings",
  ).catch(() => []);
  const settings = Object.fromEntries(rows.map((row) => [row.setting_key, row.setting_value ?? ""]));

  return (
    <>
      <h1 className="h3 mb-3">Settings</h1>
      {one(params.success) ? <div className="alert alert-success py-2">{one(params.success)}</div> : null}
      <div className="card p-4" style={{ maxWidth: 720 }}>
        <form action={saveSettingsAction} className="d-grid gap-3">
          <div>
            <label className="form-label" htmlFor="site-notice">Site notice</label>
            <textarea id="site-notice" name="site_notice" rows={3} defaultValue={settings.site_notice ?? ""} className="form-control" />
            <div className="form-text">Reserved for a short public notice. Leave blank to hide.</div>
          </div>
          <div>
            <label className="form-label" htmlFor="support-email">Support email</label>
            <input id="support-email" name="support_email" type="email" defaultValue={settings.support_email ?? "smith14580@gmail.com"} className="form-control" />
          </div>
          <button className="btn btn-primary align-self-start">Save settings</button>
        </form>
      </div>
    </>
  );
}
