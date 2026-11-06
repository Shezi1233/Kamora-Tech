"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomBytes } from "node:crypto";
import { execute, queryOne, withTransaction } from "@/lib/db";
import {
  createSession,
  destroySession,
  getCurrentAdmin,
  hashPassword,
  requireAdmin,
  verifyPassword,
} from "@/lib/session";
import { saveUpload } from "@/lib/uploads";
import { email as isEmail, lengthBetween, passwordOk, text } from "@/lib/validation";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/lib/constants";
import { slugify } from "@/lib/format";
import type { Admin } from "@/lib/types";

export type AdminState = { error?: string; success?: string };

export async function adminLoginAction(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  const email = text(formData.get("email")).toLowerCase();
  const password = text(formData.get("password"));
  if (!isEmail(email) || password === "") {
    return { error: "Please enter your email and password." };
  }
  const admin = await queryOne<Admin & { password_hash: string }>(
    "SELECT id, full_name, email, is_active, password_hash FROM admins WHERE email = ?",
    [email],
  );
  if (!admin || !(await verifyPassword(password, admin.password_hash))) {
    return { error: "Email or password is incorrect." };
  }
  if (Number(admin.is_active) !== 1) return { error: "Admin account is deactivated." };
  await createSession("admin", admin.id);
  redirect("/admin");
}

export async function adminLogoutAction(): Promise<void> {
  await destroySession("admin");
  redirect("/admin/login");
}

function parsePrice(value: FormDataEntryValue | null): number | null | undefined {
  const raw = text(value);
  if (raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

export async function saveServiceAction(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  await requireAdmin();
  const id = Number.parseInt(text(formData.get("id")), 10) || 0;
  const title = text(formData.get("title"));
  const categoryId = Number.parseInt(text(formData.get("category_id")), 10) || 0;
  const shortDescription = text(formData.get("short_description"));
  const description = text(formData.get("description"));
  const price = parsePrice(formData.get("price"));
  const delivery = text(formData.get("delivery_estimate"));
  const features = text(formData.get("features"));
  const technologies = text(formData.get("technologies"));
  const isActive = formData.get("is_active") ? 1 : 0;
  const isFeatured = formData.get("is_featured") ? 1 : 0;
  const imageFile = formData.get("image");

  if (!lengthBetween(title, 2, 200)) return { error: "Please enter a title." };
  if (!categoryId) return { error: "Please choose a category." };
  if (price === undefined) return { error: "Price must be a valid number." };

  let image: string | null = null;
  if (id) {
    const existing = await queryOne<{ image: string | null }>(
      "SELECT image FROM services WHERE id = ?",
      [id],
    );
    image = existing?.image ?? null;
  }
  if (imageFile instanceof File && imageFile.size > 0) {
    const uploaded = await saveUpload(imageFile);
    if (uploaded.error) return { error: uploaded.error };
    image = uploaded.name ?? image;
  }

  try {
    if (id) {
      await execute(
        `UPDATE services SET category_id = ?, title = ?, short_description = ?, description = ?,
         price = ?, delivery_estimate = ?, features = ?, technologies = ?, image = ?,
         is_active = ?, is_featured = ? WHERE id = ?`,
        [
          categoryId,
          title,
          shortDescription || null,
          description || null,
          price,
          delivery || null,
          features || null,
          technologies || null,
          image,
          isActive,
          isFeatured,
          id,
        ],
      );
    } else {
      const slug = `${slugify(title) || "service"}-${randomBytes(3).toString("hex")}`;
      await execute(
        `INSERT INTO services
         (category_id, title, slug, short_description, description, price, delivery_estimate,
          features, technologies, image, is_active, is_featured)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          categoryId,
          title,
          slug,
          shortDescription || null,
          description || null,
          price,
          delivery || null,
          features || null,
          technologies || null,
          image,
          isActive,
          isFeatured,
        ],
      );
    }
  } catch {
    return { error: "Could not save. Check the category and try again." };
  }

  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath("/");
  redirect(`/admin/services?success=${id ? "Service%20updated." : "Service%20created."}`);
}

export async function deleteServiceAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number.parseInt(text(formData.get("id")), 10) || 0;
  if (!id) redirect("/admin/services");
  const used = await queryOne<{ total: number }>(
    "SELECT COUNT(*) AS total FROM order_items WHERE service_id = ?",
    [id],
  );
  if (Number(used?.total ?? 0) > 0) {
    await execute("UPDATE services SET is_active = 0 WHERE id = ?", [id]);
    redirect("/admin/services?success=Service%20is%20used%20in%20orders%2C%20so%20it%20was%20deactivated.");
  }
  await execute("DELETE FROM services WHERE id = ?", [id]);
  revalidatePath("/admin/services");
  redirect("/admin/services?success=Service%20deleted.");
}

export async function saveCategoryAction(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  await requireAdmin();
  const id = Number.parseInt(text(formData.get("id")), 10) || 0;
  const name = text(formData.get("name"));
  const description = text(formData.get("description"));
  const isActive = formData.get("is_active") ? 1 : 0;
  if (!lengthBetween(name, 2, 150)) return { error: "Please enter a category name." };

  try {
    if (id) {
      await execute("UPDATE categories SET name = ?, description = ?, is_active = ? WHERE id = ?", [
        name,
        description || null,
        isActive,
        id,
      ]);
    } else {
      const slug = `${slugify(name) || "category"}-${randomBytes(3).toString("hex")}`;
      await execute(
        "INSERT INTO categories (name, slug, description, is_active) VALUES (?, ?, ?, ?)",
        [name, slug, description || null, isActive],
      );
    }
  } catch {
    return { error: "A category with that name already exists." };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/services");
  redirect(`/admin/categories?success=${id ? "Category%20updated." : "Category%20created."}`);
}

export async function deleteCategoryAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number.parseInt(text(formData.get("id")), 10) || 0;
  if (!id) redirect("/admin/categories");
  const used = await queryOne<{ total: number }>(
    "SELECT COUNT(*) AS total FROM services WHERE category_id = ?",
    [id],
  );
  if (Number(used?.total ?? 0) > 0) {
    redirect("/admin/categories?error=Cannot%20delete%3A%20services%20still%20use%20this%20category.");
  }
  await execute("DELETE FROM categories WHERE id = ?", [id]);
  revalidatePath("/admin/categories");
  redirect("/admin/categories?success=Category%20deleted.");
}

export async function updateOrderAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = Number.parseInt(text(formData.get("id")), 10) || 0;
  const newStatus = text(formData.get("status"));
  const paymentStatus = text(formData.get("payment_status"));
  const customerNote = text(formData.get("customer_note"));
  const internalNote = text(formData.get("internal_note"));
  const expected = text(formData.get("expected_completion"));

  if (!id) redirect("/admin/orders");
  if (!(ORDER_STATUSES as readonly string[]).includes(newStatus)) {
    redirect(`/admin/orders/${id}?error=Invalid%20status.`);
  }
  if (!(PAYMENT_STATUSES as readonly string[]).includes(paymentStatus)) {
    redirect(`/admin/orders/${id}?error=Invalid%20payment%20status.`);
  }

  const order = await queryOne<{
    id: number;
    user_id: number;
    tracking_id: string;
    status: string;
  }>("SELECT id, user_id, tracking_id, status FROM orders WHERE id = ?", [id]);
  if (!order) redirect("/admin/orders");

  await withTransaction(async (connection) => {
    await connection.execute(
      `UPDATE orders SET status = ?, payment_status = ?, internal_note = ?, expected_completion = ?
       WHERE id = ?`,
      [newStatus, paymentStatus, internalNote || null, expected || null, id],
    );
    await connection.execute("UPDATE payments SET status = ? WHERE order_id = ?", [
      paymentStatus === "Paid" ? "Paid" : paymentStatus === "Failed" ? "Failed" : "Pending",
      id,
    ]);
    if (newStatus !== order.status) {
      await connection.execute(
        `INSERT INTO order_status_history
         (order_id, previous_status, new_status, customer_note, admin_id)
         VALUES (?, ?, ?, ?, ?)`,
        [id, order.status, newStatus, customerNote || null, admin.id],
      );
      await connection.execute(
        "INSERT INTO notifications (user_id, type, message) VALUES (?, 'order_update', ?)",
        [
          order.user_id,
          `Your order ${order.tracking_id} is now: ${newStatus}${customerNote ? ` — ${customerNote}` : ""}`,
        ],
      );
    }
  });

  revalidatePath(`/admin/orders/${id}`);
  redirect(`/admin/orders/${id}?success=Order%20updated.`);
}

export async function toggleCustomerAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const userId = Number.parseInt(text(formData.get("user_id")), 10) || 0;
  if (!userId) redirect("/admin/customers");
  const user = await queryOne<{ is_active: number }>("SELECT is_active FROM users WHERE id = ?", [
    userId,
  ]);
  if (user) {
    await execute("UPDATE users SET is_active = ? WHERE id = ?", [
      Number(user.is_active) === 1 ? 0 : 1,
      userId,
    ]);
  }
  revalidatePath("/admin/customers");
  redirect("/admin/customers?success=Customer%20updated.");
}

export async function savePortfolioAction(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  await requireAdmin();
  const id = Number.parseInt(text(formData.get("id")), 10) || 0;
  const title = text(formData.get("title"));
  const category = text(formData.get("category"));
  const description = text(formData.get("description"));
  const projectUrl = text(formData.get("project_url"));
  const isFeatured = formData.get("is_featured") ? 1 : 0;
  const isActive = formData.get("is_active") ? 1 : 0;
  const imageFile = formData.get("image");

  if (!lengthBetween(title, 2, 200)) return { error: "Please enter a title." };

  let image: string | null = null;
  if (id) {
    const existing = await queryOne<{ image: string | null }>(
      "SELECT image FROM portfolio_projects WHERE id = ?",
      [id],
    );
    image = existing?.image ?? null;
  }
  if (imageFile instanceof File && imageFile.size > 0) {
    const uploaded = await saveUpload(imageFile);
    if (uploaded.error) return { error: uploaded.error };
    image = uploaded.name ?? image;
  }

  if (id) {
    await execute(
      `UPDATE portfolio_projects SET title = ?, category = ?, description = ?, image = ?,
       project_url = ?, is_featured = ?, is_active = ? WHERE id = ?`,
      [title, category || null, description || null, image, projectUrl || null, isFeatured, isActive, id],
    );
  } else {
    await execute(
      `INSERT INTO portfolio_projects
       (title, category, description, image, project_url, is_featured, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, category || null, description || null, image, projectUrl || null, isFeatured, isActive],
    );
  }

  revalidatePath("/admin/portfolio");
  revalidatePath("/portfolio");
  revalidatePath("/");
  redirect(`/admin/portfolio?success=${id ? "Project%20updated." : "Project%20created."}`);
}

export async function deletePortfolioAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number.parseInt(text(formData.get("id")), 10) || 0;
  if (id) await execute("DELETE FROM portfolio_projects WHERE id = ?", [id]);
  revalidatePath("/admin/portfolio");
  revalidatePath("/portfolio");
  redirect("/admin/portfolio?success=Project%20deleted.");
}

export async function messageAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number.parseInt(text(formData.get("id")), 10) || 0;
  const action = text(formData.get("do"));
  if (!id) redirect("/admin/messages");
  if (action === "read") {
    await execute("UPDATE contact_messages SET status = 'read' WHERE id = ?", [id]);
  } else if (action === "archive") {
    await execute("UPDATE contact_messages SET status = 'archived' WHERE id = ?", [id]);
  } else if (action === "delete") {
    await execute("DELETE FROM contact_messages WHERE id = ?", [id]);
  }
  revalidatePath("/admin/messages");
  redirect("/admin/messages?success=Message%20updated.");
}

export async function testimonialAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const action = text(formData.get("do"));
  const id = Number.parseInt(text(formData.get("id")), 10) || 0;

  if (action === "add") {
    const name = text(formData.get("client_name"));
    const role = text(formData.get("client_role"));
    const quote = text(formData.get("quote"));
    const approved = formData.get("is_approved") ? 1 : 0;
    if (!lengthBetween(name, 2, 150) || !lengthBetween(quote, 10, 2000)) {
      redirect("/admin/testimonials?error=Please%20enter%20a%20name%20and%20quote.");
    }
    await execute(
      "INSERT INTO testimonials (client_name, client_role, quote, is_approved) VALUES (?, ?, ?, ?)",
      [name, role || null, quote, approved],
    );
  } else if (action === "toggle" && id) {
    const row = await queryOne<{ is_approved: number }>(
      "SELECT is_approved FROM testimonials WHERE id = ?",
      [id],
    );
    if (row) {
      await execute("UPDATE testimonials SET is_approved = ? WHERE id = ?", [
        Number(row.is_approved) === 1 ? 0 : 1,
        id,
      ]);
    }
  } else if (action === "delete" && id) {
    await execute("DELETE FROM testimonials WHERE id = ?", [id]);
  }

  revalidatePath("/admin/testimonials");
  revalidatePath("/");
  redirect("/admin/testimonials?success=Testimonial%20saved.");
}

export async function saveSettingsAction(formData: FormData): Promise<void> {
  await requireAdmin();
  for (const key of ["site_notice", "support_email"]) {
    const value = text(formData.get(key));
    await execute(
      `INSERT INTO settings (setting_key, setting_value) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
      [key, value],
    );
  }
  revalidatePath("/admin/settings");
  redirect("/admin/settings?success=Settings%20saved.");
}

export async function updateAdminProfileAction(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  const name = text(formData.get("full_name"));
  const password = text(formData.get("password"));
  if (!lengthBetween(name, 2, 150)) return { error: "Please enter your full name." };
  if (password !== "" && !passwordOk(password)) {
    return { error: "New password must be at least 8 characters." };
  }

  await execute("UPDATE admins SET full_name = ? WHERE id = ?", [name, admin.id]);
  if (password !== "") {
    await execute("UPDATE admins SET password_hash = ? WHERE id = ?", [
      await hashPassword(password),
      admin.id,
    ]);
  }
  revalidatePath("/admin/profile");
  return { success: "Profile updated." };
}
