import Link from "next/link";
import { getCartLines } from "@/lib/cart";
import { money, priceLabel } from "@/lib/format";
import { clearCartAction, updateCartAction } from "@/lib/actions/cart";
import { RemoveCartLineButton } from "@/components/ui/RemoveCartLineButton";

export const metadata = { title: "Cart" };

export default async function CartPage() {
  const cart = await getCartLines();

  return (
    <section className="section">
      <div className="container">
        <p className="section-eyebrow mb-1">Your cart</p>
        <h1 className="mb-4">Review your services</h1>

        {cart.lines.length === 0 ? (
          <div className="card p-5 text-center">
            <i className="fa-solid fa-cart-shopping display-5 text-secondary mb-3" aria-hidden="true" />
            <h2 className="h4">Your cart is empty</h2>
            <p className="text-secondary">Browse our services and add what fits your project.</p>
            <Link href="/services" className="btn btn-primary align-self-center">Browse services</Link>
          </div>
        ) : (
          <div className="row g-4">
            <div className="col-lg-8">
              <form action={updateCartAction} className="card p-3 p-md-4">
                {cart.lines.map((line) => (
                  <div className="cart-row d-flex flex-wrap align-items-center gap-3 py-3 border-bottom border-secondary border-opacity-25" key={line.item_id}>
                    <div className="cart-thumb">
                      <i className="fa-solid fa-layer-group" aria-hidden="true" />
                    </div>
                    <div className="flex-grow-1" style={{ minWidth: 180 }}>
                      <Link href={`/services/${line.slug}`} className="fw-bold text-reset">{line.title}</Link>
                      <span className="d-block small text-secondary">{line.category_name}</span>
                      <span className="d-block small">{priceLabel(line.price)}</span>
                    </div>
                    <div style={{ width: 90 }}>
                      <label className="visually-hidden" htmlFor={`qty-${line.item_id}`}>Quantity</label>
                      <input
                        id={`qty-${line.item_id}`}
                        type="number"
                        name={`qty[${line.item_id}]`}
                        defaultValue={line.quantity}
                        min={0}
                        max={99}
                        className="form-control"
                      />
                    </div>
                    <div className="text-end" style={{ minWidth: 90 }}>
                      <strong>{line.price === null ? "Quote" : money(Number(line.price) * line.quantity)}</strong>
                    </div>
                    <RemoveCartLineButton itemId={line.item_id} title={line.title} />
                  </div>
                ))}
                <div className="d-flex flex-wrap justify-content-between gap-2 pt-3">
                  <button type="submit" className="btn btn-outline-light">
                    <i className="fa-solid fa-rotate me-1" aria-hidden="true" /> Update quantities
                  </button>
                  <button type="submit" className="btn btn-outline-light" formAction={clearCartAction}>
                    <i className="fa-solid fa-trash-can me-1" aria-hidden="true" /> Clear cart
                  </button>
                </div>
              </form>
            </div>
            <aside className="col-lg-4">
              <div className="card p-4 sticky-lg-top" style={{ top: 90 }}>
                <h2 className="h5">Summary</h2>
                <div className="d-flex justify-content-between py-2 border-bottom border-secondary border-opacity-25">
                  <span className="text-secondary">Subtotal</span>
                  <strong>{money(cart.subtotal)}</strong>
                </div>
                <div className="d-flex justify-content-between py-2">
                  <span className="text-secondary">Items</span>
                  <strong>{cart.lines.reduce((sum, line) => sum + line.quantity, 0)}</strong>
                </div>
                {cart.hasQuote ? (
                  <p className="small text-secondary">
                    Some items require a custom quote. Final pricing will be confirmed after review.
                  </p>
                ) : null}
                <Link href="/checkout" className="btn btn-primary w-100 mt-2">
                  Proceed to checkout
                </Link>
                <Link href="/services" className="btn btn-outline-light w-100 mt-2">Continue browsing</Link>
              </div>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
