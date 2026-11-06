import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getCartLines } from "@/lib/cart";
import { CheckoutForm } from "@/components/forms/CheckoutForm";

export const metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/checkout");
  const cart = await getCartLines();
  if (cart.lines.length === 0) redirect("/cart");

  const lines = cart.lines.map((line) => ({
    id: line.id,
    title: line.title,
    price: line.price === null ? null : String(line.price),
    quantity: line.quantity,
  }));

  return (
    <section className="section">
      <div className="container">
        <nav aria-label="Breadcrumb" className="mb-3 small">
          <Link href="/cart">Cart</Link>
          <span className="mx-2 text-secondary">/</span>
          <span>Checkout</span>
        </nav>
        <p className="section-eyebrow mb-1">Checkout</p>
        <h1 className="mb-4">Review and place your order</h1>
        <CheckoutForm lines={lines} subtotal={cart.subtotal} hasQuote={cart.hasQuote} />
      </div>
    </section>
  );
}
