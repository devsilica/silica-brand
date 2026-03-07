"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import { supabase } from "@/lib/supabaseClient";

function formatNaira(n: number) {
  return `₦${Number(n).toLocaleString()}`;
}

function calcDeliveryFee(subtotal: number) {
  return subtotal >= 100000 ? 0 : 2000;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clear } = useCart();

  const deliveryFee = calcDeliveryFee(total);
  const grandTotal = total + deliveryFee;

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [placing, setPlacing] = useState(false);

  const isValid = useMemo(() => {
    return (
      items.length > 0 &&
      fullName.trim().length >= 2 &&
      phone.trim().length >= 8 &&
      address.trim().length >= 6
    );
  }, [items.length, fullName, phone, address]);

  function buildMessage(orderId?: string) {
    const lines: string[] = [];

    lines.push(`🛍️ *New Silica Brand Order*`);
    lines.push("");

    if (orderId) lines.push(`*Order ID:* ${orderId}`);
    lines.push(`*Customer Name:* ${fullName}`);
    lines.push(`*Phone Number:* ${phone}`);
    lines.push(`*Delivery Address:* ${address}`);

    if (note.trim()) {
      lines.push(`*Order Note:* ${note.trim()}`);
    }

    lines.push("");
    lines.push(`*Items Ordered:*`);

    items.forEach((it, idx) => {
      lines.push(
        `${idx + 1}. ${it.name} x${it.qty} — ${formatNaira(it.price * it.qty)}`
      );
    });

    lines.push("");
    lines.push(`*Subtotal:* ${formatNaira(total)}`);
    lines.push(`*Delivery Fee:* ${formatNaira(deliveryFee)}`);
    lines.push(`*Grand Total:* ${formatNaira(grandTotal)}`);
    lines.push("");
    lines.push("Please process this order.");

    return lines.join("\n");
  }

  async function placeOrder() {
    if (!isValid || placing) return;

    setPlacing(true);

    const WHATSAPP_NUMBER = "2347042953337";

    try {
      // 1) Save order
      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .insert({
          customer_name: fullName.trim(),
          customer_phone: phone.trim(),
          delivery_address: address.trim(),
          note: note.trim() || null,
          subtotal: total,
          delivery_fee: deliveryFee,
          total: grandTotal,
          currency: "NGN",
          status: "pending",
        })
        .select("id")
        .single();

      if (orderErr || !order) {
        alert(`Failed to create order: ${orderErr?.message || "Unknown error"}`);
        setPlacing(false);
        return;
      }

      // 2) Save order items
      const itemsPayload = items.map((it) => ({
        order_id: order.id,
        product_id: it.id,
        name: it.name,
        slug: it.slug,
        price: it.price,
        qty: it.qty,
        image_url: it.image_url ?? null,
      }));

      const { error: itemsErr } = await supabase
        .from("order_items")
        .insert(itemsPayload);

      if (itemsErr) {
        alert(`Order created but items failed: ${itemsErr.message}`);
        setPlacing(false);
        return;
      }

      // 3) Open WhatsApp
      const msg = encodeURIComponent(buildMessage(order.id));
      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
      window.open(url, "_blank", "noopener,noreferrer");

      // 4) Clear cart and redirect
      clear();
      router.push(`/order-success?order=${order.id}&total=${grandTotal}`);
    } catch (error) {
      alert("Something went wrong while placing the order.");
    } finally {
      setPlacing(false);
    }
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-white text-black">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <h1 className="text-3xl font-semibold">Checkout</h1>
          <p className="mt-4 text-black/70">Your cart is empty.</p>
          <Link href="/shop" className="mt-6 inline-block underline">
            Go to shop
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Checkout</h1>
            <p className="mt-1 text-black/60">
              Enter delivery details and confirm your order.
            </p>
          </div>
          <Link
            href="/cart"
            className="text-sm underline text-black/70 hover:text-black"
          >
            Back to cart
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="rounded-2xl border border-black/10 p-6 lg:col-span-2">
            <h2 className="font-semibold">Delivery details</h2>

            <div className="mt-4 space-y-3">
              <input
                className="w-full rounded-xl border border-black/15 px-4 py-3 outline-none focus:border-black/30"
                placeholder="Full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />

              <input
                className="w-full rounded-xl border border-black/15 px-4 py-3 outline-none focus:border-black/30"
                placeholder="Phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              <textarea
                className="min-h-[110px] w-full rounded-xl border border-black/15 px-4 py-3 outline-none focus:border-black/30"
                placeholder="Delivery address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />

              <textarea
                className="min-h-[90px] w-full rounded-xl border border-black/15 px-4 py-3 outline-none focus:border-black/30"
                placeholder="Order note (optional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <div className="mt-6 flex gap-3">
              <button
                disabled={!isValid || placing}
                onClick={placeOrder}
                className={`rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white ${
                  !isValid || placing ? "opacity-60" : "hover:opacity-90"
                }`}
              >
                {placing ? "Placing..." : "Place order (Save + WhatsApp)"}
              </button>

              <button
                onClick={() => {
                  clear();
                  router.push("/shop");
                }}
                className="rounded-xl border border-black/15 px-5 py-3 text-sm font-semibold hover:border-black/25"
              >
                Clear cart
              </button>
            </div>

            <p className="mt-3 text-xs text-black/60">
              This saves your order, then opens WhatsApp with the Order ID.
            </p>
          </div>

          <div className="h-fit rounded-2xl border border-black/10 p-6">
            <h2 className="font-semibold">Order summary</h2>

            <div className="mt-4 space-y-3">
              {items.map((it) => (
                <div
                  key={it.id}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{it.name}</p>
                    <p className="text-black/60">Qty: {it.qty}</p>
                  </div>
                  <p className="font-semibold">
                    {formatNaira(it.price * it.qty)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-3 border-t border-black/10 pt-4 text-sm">
              <div className="flex items-center justify-between">
                <p className="text-black/70">Subtotal</p>
                <p className="font-medium">{formatNaira(total)}</p>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-black/70">Delivery</p>
                <p className="font-medium">{formatNaira(deliveryFee)}</p>
              </div>

              <div className="flex items-center justify-between border-t border-black/10 pt-3">
                <p className="font-semibold">Total</p>
                <p className="text-lg font-semibold">{formatNaira(grandTotal)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}