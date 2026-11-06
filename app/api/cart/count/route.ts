import { NextResponse } from "next/server";
import { cartCount } from "@/lib/cart";

export async function GET() {
  return NextResponse.json({ count: await cartCount() });
}
