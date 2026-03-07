"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";

export default function CartPage() {
  const { items, total, removeItem, setQty, clear } = useCart();

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Cart</h1>
            <p className="mt-1 text-black/60">Review your items before checkout.</p>
          </div>
          <Link href="/shop" className="text-sm underline text-black/70 hover:text-black">
            Continue shopping
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-black/10 p-8">
            <p className="text-black/70">Your cart is empty.</p>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              {items.map((it) => (
                <div key={it.id} className="flex gap-4 rounded-2xl border border-black/10 p-4">
                  <div className="h-24 w-24 overflow-hidden rounded-xl bg-gray-100">
                    <img
                      src={it.image_url ?? "/placeholder.svg"}
                      alt={it.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <Link href={`/product/${it.slug}`} className="font-semibold hover:underline">
                      {it.name}
                    </Link>
                    <p className="mt-1 text-sm text-black/60">₦{Number(it.price).toLocaleString()}</p>

                    <div className="mt-3 flex items-center gap-3">
                      <label className="text-sm text-black/70">Qty</label>
                      <input
                        className="w-20 rounded-xl border border-black/15 px-3 py-2 text-sm"
                        type="number"
                        min={1}
                        value={it.qty}
                        onChange={(e) => setQty(it.id, Number(e.target.value))}
                      />

                      <button
                        onClick={() => removeItem(it.id)}
                        className="ml-auto text-sm font-semibold text-red-700 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="text-right font-semibold">
                    ₦{Number(it.price * it.qty).toLocaleString()}
                  </div>
                </div>
              ))}

              <button
                onClick={clear}
                className="text-sm font-semibold text-black/70 hover:text-black hover:underline"
              >
                Clear cart
              </button>
            </div>

            <div className="rounded-2xl border border-black/10 p-5 h-fit">
              <h2 className="font-semibold">Summary</h2>

              <div className="mt-4 flex justify-between text-sm">
                <span className="text-black/70">Subtotal</span>
                <span className="font-semibold">₦{Number(total).toLocaleString()}</span>
              </div>

              <p className="mt-2 text-xs text-black/60">
                Taxes & delivery will be calculated at checkout.
              </p>
  <button>
  <Link
  href="/checkout"
  className="mt-5 block w-full rounded-xl bg-black px-5 py-3 text-center text-sm font-semibold text-white hover:opacity-90"
>
  Proceed to Checkout
</Link>
</button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}