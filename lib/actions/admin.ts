"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { ApiError, apiFetch } from "@/lib/api";
import { clearAdminCookie, setAdminCookie } from "@/lib/cookies";
import { requireAdmin } from "@/lib/session";
import { email as isEmail, lengthBetween, passwordOk, text } from "@/lib/validation";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/lib/constants";

export type AdminState = { error?: string; success?: string };

type TokenResponse = { access_token: string };

const adminOptions = { admin: true } as const;

export async function adminLoginAction(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  const email = text(formData.get("email")).toLowerCase();
  const password = text(formData.get("password"));
  if (!isEmail(email) || password === "") {
    return { error: "Please enter your email and password." };
  }
  let token: string;
  try {
    const data = await apiFetch<TokenResponse>("/admin/auth/login", {
      method: "POST",
      body: { email, password },
      token: null,
    });
    token = data.access_token;
  } catch (error) {
    return {
      error: error instanceof ApiError ? error.message : "Email or password is incorrect.",
    };
  }
  await setAdminCookie(token);
  redirect("/admin");
}

export async function adminLogoutAction(): Promise<void> {
  try {
    await apiFetch("/admin/auth/logout", { method: "POST", ...adminOptions });
  } catch (error) {
    console.error("[admin] logout failed", error);
  } finally {
    await clearAdminCookie();
  }
  redirect("/admin/login");
}

function parsePrice(value: FormDataEntryValue | null): number | null | undefined {
  const raw = text(value);
  if (raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

async function uploadImage(value: FormDataEntryValue | null): Promise<string | null> {
  if (!(value instanceof File) || value.size === 0) return null;
  const form = new FormData();
  form.append("file", value);
  const data = await apiFetch<{ name: string; url: string }>("/admin/uploads", {
    method: "POST",
    form,
    ...adminOptions,
  });
  return data.url || data.name;
}

export async function saveServiceAction(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  await requireAdmin();
  const id = Number.parseInt(text(formData.get("id")), 10) || 0;
  const title = text(formData.get("title"));
  const categoryId = Number.parseInt(text(formData.get("category_id")), 10) || 0;
  const price = parsePrice(formData.get("price"));

  if (!lengthBetween(title, 2, 200)) return { error: "Please enter a title." };
  if (!categoryId) return { error: "Please choose a category." };
  if (price === undefined) return { error: "Price must be a valid number." };

  try {
    const image = await uploadImage(formData.get("image"));
    const payload: Record<string, unknown> = {
      category_id: categoryId,
      title,
      short_description: text(formData.get("short_description")) || null,
      description: text(formData.get("description")) || null,
      price,
      delivery_estimate: text(formData.get("delivery_estimate")) || null,
      features: text(formData.get("features")) || null,
      technologies: text(formData.get("technologies")) || null,
      is_active: formData.get("is_active") ? 1 : 0,
      is_featured: formData.get("is_featured") ? 1 : 0,
    };
    if (image) payload.image = image;

    if (id) {
      await apiFetch(`/admin/services/${id}`, {
        method: "PUT",
        body: payload,
        ...adminOptions,
      });
    } else {
      await apiFetch("/admin/services", {
        method: "POST",
        body: payload,
        ...adminOptions,
      });
    }
  } catch (error) {
    return {
      error: error instanceof ApiError ? error.message : "Could not save. Please try again.",
    };
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
  let success = "Service%20deleted.";
  try {
    const result = await apiFetch<{ detail: string }>(`/admin/services/${id}`, {
      method: "DELETE",
      ...adminOptions,
    });
    if (result.detail.toLowerCase().includes("deactivated")) {
      success = "Service%20is%20used%20in%20orders%2C%20so%20it%20was%20deactivated.";
    }
  } catch (error) {
    console.error("[admin] delete service failed", error);
  }
  revalidatePath("/admin/services");
  redirect(`/admin/services?success=${success}`);
}

export async function saveCategoryAction(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  await requireAdmin();
  const id = Number.parseInt(text(formData.get("id")), 10) || 0;
  const name = text(formData.get("name"));
  if (!lengthBetween(name, 2, 150)) return { error: "Please enter a category name." };

  const payload = {
    name,
    description: text(formData.get("description")) || null,
    is_active: formData.get("is_active") ? 1 : 0,
  };

  try {
    if (id) {
      await apiFetch(`/admin/categories/${id}`, {
        method: "PUT",
        body: payload,
        ...adminOptions,
      });
    } else {
      await apiFetch("/admin/categories", {
        method: "POST",
        body: payload,
        ...adminOptions,
      });
    }
  } catch (error) {
    return {
      error:
        error instanceof ApiError ? error.message : "A category with that name already exists.",
    };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/services");
  redirect(`/admin/categories?success=${id ? "Category%20updated." : "Category%20created."}`);
}

export async function deleteCategoryAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number.parseInt(text(formData.get("id")), 10) || 0;
  if (!id) redirect("/admin/categories");
  try {
    await apiFetch(`/admin/categories/${id}`, { method: "DELETE", ...adminOptions });
  } catch (error) {
    const message =
      error instanceof ApiError
        ? error.message
        : "Cannot delete this category.";
    redirect(`/admin/categories?error=${encodeURIComponent(message)}`);
  }
  revalidatePath("/admin/categories");
  redirect("/admin/categories?success=Category%20deleted.");
}

export async function updateOrderAction(formData: FormData): Promise<void> {
  await requireAdmin();
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

  try {
    await apiFetch(`/admin/orders/${id}`, {
      method: "PATCH",
      body: {
        status: newStatus,
        payment_status: paymentStatus,
        customer_note: customerNote || null,
        internal_note: internalNote || null,
        expected_completion: expected || null,
      },
      ...adminOptions,
    });
  } catch (error) {
    const message = error instanceof ApiError ? error.message : "Could not update the order.";
    redirect(`/admin/orders/${id}?error=${encodeURIComponent(message)}`);
  }

  revalidatePath(`/admin/orders/${id}`);
  redirect(`/admin/orders/${id}?success=Order%20updated.`);
}

export async function toggleCustomerAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const userId = Number.parseInt(text(formData.get("user_id")), 10) || 0;
  if (!userId) redirect("/admin/customers");
  try {
    await apiFetch(`/admin/customers/${userId}/toggle`, {
      method: "PATCH",
      ...adminOptions,
    });
  } catch (error) {
    console.error("[admin] toggle customer failed", error);
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
  if (!lengthBetween(title, 2, 200)) return { error: "Please enter a title." };

  try {
    const image = await uploadImage(formData.get("image"));
    const payload: Record<string, unknown> = {
      title,
      category: text(formData.get("category")) || null,
      description: text(formData.get("description")) || null,
      project_url: text(formData.get("project_url")) || null,
      is_featured: formData.get("is_featured") ? 1 : 0,
      is_active: formData.get("is_active") ? 1 : 0,
    };
    if (image) payload.image = image;

    if (id) {
      await apiFetch(`/admin/portfolio/${id}`, {
        method: "PUT",
        body: payload,
        ...adminOptions,
      });
    } else {
      await apiFetch("/admin/portfolio", {
        method: "POST",
        body: payload,
        ...adminOptions,
      });
    }
  } catch (error) {
    return {
      error: error instanceof ApiError ? error.message : "Could not save the project.",
    };
  }

  revalidatePath("/admin/portfolio");
  revalidatePath("/portfolio");
  revalidatePath("/");
  redirect(`/admin/portfolio?success=${id ? "Project%20updated." : "Project%20created."}`);
}

export async function deletePortfolioAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number.parseInt(text(formData.get("id")), 10) || 0;
  if (id) {
    try {
      await apiFetch(`/admin/portfolio/${id}`, { method: "DELETE", ...adminOptions });
    } catch (error) {
      console.error("[admin] delete portfolio failed", error);
    }
  }
  revalidatePath("/admin/portfolio");
  revalidatePath("/portfolio");
  redirect("/admin/portfolio?success=Project%20deleted.");
}

export async function messageAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number.parseInt(text(formData.get("id")), 10) || 0;
  const action = text(formData.get("do"));
  if (!id) redirect("/admin/messages");
  try {
    if (action === "read" || action === "archive") {
      await apiFetch(`/admin/messages/${id}`, {
        method: "PATCH",
        body: { status: action === "read" ? "read" : "archived" },
        ...adminOptions,
      });
    } else if (action === "delete") {
      await apiFetch(`/admin/messages/${id}`, {
        method: "DELETE",
        ...adminOptions,
      });
    }
  } catch (error) {
    console.error("[admin] message action failed", error);
  }
  revalidatePath("/admin/messages");
  redirect("/admin/messages?success=Message%20updated.");
}

export async function testimonialAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const action = text(formData.get("do"));
  const id = Number.parseInt(text(formData.get("id")), 10) || 0;
  const name = text(formData.get("client_name"));
  const quote = text(formData.get("quote"));

  if (action === "add" && (!lengthBetween(name, 2, 150) || !lengthBetween(quote, 10, 2000))) {
    redirect("/admin/testimonials?error=Please%20enter%20a%20name%20and%20quote.");
  }

  try {
    if (action === "add") {
      await apiFetch("/admin/testimonials", {
        method: "POST",
        body: {
          client_name: name,
          client_role: text(formData.get("client_role")) || null,
          quote,
          is_approved: formData.get("is_approved") ? 1 : 0,
        },
        ...adminOptions,
      });
    } else if (action === "toggle" && id) {
      await apiFetch(`/admin/testimonials/${id}/toggle`, {
        method: "POST",
        ...adminOptions,
      });
    } else if (action === "delete" && id) {
      await apiFetch(`/admin/testimonials/${id}`, {
        method: "DELETE",
        ...adminOptions,
      });
    }
  } catch (error) {
    console.error("[admin] testimonial action failed", error);
  }

  revalidatePath("/admin/testimonials");
  revalidatePath("/");
  redirect("/admin/testimonials?success=Testimonial%20saved.");
}

export async function saveSettingsAction(formData: FormData): Promise<void> {
  await requireAdmin();
  try {
    await apiFetch("/admin/settings", {
      method: "PUT",
      body: {
        site_notice: text(formData.get("site_notice")),
        support_email: text(formData.get("support_email")),
      },
      ...adminOptions,
    });
  } catch (error) {
    console.error("[admin] save settings failed", error);
  }
  revalidatePath("/admin/settings");
  redirect("/admin/settings?success=Settings%20saved.");
}

export async function updateAdminProfileAction(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  await requireAdmin();
  const name = text(formData.get("full_name"));
  const password = text(formData.get("password"));
  if (!lengthBetween(name, 2, 150)) return { error: "Please enter your full name." };
  if (password !== "" && !passwordOk(password)) {
    return { error: "New password must be at least 8 characters." };
  }

  try {
    await apiFetch("/admin/auth/profile", {
      method: "PATCH",
      body: { full_name: name, password: password || null },
      ...adminOptions,
    });
  } catch (error) {
    return {
      error: error instanceof ApiError ? error.message : "Could not update your profile.",
    };
  }
  revalidatePath("/admin/profile");
  return { success: "Profile updated." };
}
