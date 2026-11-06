import { NextResponse } from "next/server";

import { apiFetch } from "@/lib/api";
import type { Service } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  if (q.length < 2) return NextResponse.json({ items: [] });

  try {
    const data = await apiFetch<{ items: Service[] }>(
      `/services?${new URLSearchParams({
        active_only: "true",
        q,
        page_size: "8",
        sort: "featured",
      }).toString()}`,
    );
    return NextResponse.json({
      items: data.items.map((item) => ({
        id: item.id,
        title: item.title,
        slug: item.slug,
        category_name: item.category_name ?? "",
      })),
    });
  } catch (error) {
    console.error("[api/search] failed", error);
    return NextResponse.json({ items: [] }, { status: 503 });
  }
}
