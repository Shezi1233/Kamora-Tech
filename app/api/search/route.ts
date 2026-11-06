import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  if (q.length < 2) return NextResponse.json({ items: [] });

  try {
    const like = `%${q}%`;
    const items = await query<{
      id: number;
      title: string;
      slug: string;
      category_name: string;
    }>(
      `SELECT s.id, s.title, s.slug, c.name AS category_name
       FROM services s JOIN categories c ON c.id = s.category_id
       WHERE s.is_active = 1 AND (s.title LIKE ? OR s.short_description LIKE ? OR c.name LIKE ?)
       ORDER BY s.is_featured DESC, s.title
       LIMIT 8`,
      [like, like, like],
    );
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] });
  }
}
