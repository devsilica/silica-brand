"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type Order = {
  id: string;
  status: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  note: string | null;
  created_at: string;
};

type Item = {
  id: string;
  order_id: string;
  name: string;
  price: number;
  qty: number;
  image_url: string | null;
  slug: string | null;
};

function formatNaira(n: number) {
  return `₦${Number(n).toLocaleString()}`;
}

function cls(...a: Array<string | false | null | undefined>) {
  return a.filter(Boolean).join(" ");
}

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<Item[]>([]);

  const canSubmit = useMemo(() => {
    return orderId.trim().length >= 8 && phone.trim().length >= 8;
  }, [orderId, phone]);

  async function track() {
    if (!canSubmit) return;

    setLoading(true);
    setError(null);
    setOrder(null);
    setItems([]);

    // Pass phone in headers for RLS check
    const client = supabase;
    // @ts-expect-error - supabase-js allows headers via global fetch, but typing may not show it
    client.headers = { "x-customer-phone": phone.trim() };

    const { data: o, error: oErr } = await supabase
      .from("orders")
      .select("id, status, subtotal, delivery_fee, total, customer_name, customer_phone, delivery_address, note, created_at")
      .eq("id", orderId.trim())
      .single();

    if (oErr || !o) {
      setLoading(false);
      setError("Order not found. Check Order ID and phone number.");
      return;
    }

    const { data: it, error: itErr } = await supabase
      .from("order_items")
      .select("id, order_id, name, price, qty, image_url, slug")
      .eq("order_id", orderId.trim())
      .order("created_at", { ascending: true });

    setLoading(false);

    if (itErr) {
      setError(itErr.message);
      return;
    }

    setOrder(o as Order);
    setItems((it ?? []) as Item[]);
  }

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Track your order</h1>
            <p className="mt-1 text-black/60">Enter your Order ID and phone number.</p>
          </div>
          <Link href="/shop" className="text-sm underline text-black/70 hover:text-black">
            Back to shop
          </Link>
        </div>

        <div className="mt-8 rounded-2xl border border-black/10 p-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              className="rounded-xl border border-black/15 px-4 py-3 outline-none focus:border-black/30"
              placeholder="Order ID"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
            />
            <input
              className="rounded-xl border border-black/15 px-4 py-3 outline-none focus:border-black/30"
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <button
            disabled={!canSubmit || loading}
            onClick={track}
            className={cls(
              "mt-4 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white",
              (!canSubmit || loading) && "opacity-60"
            )}
          >
            {loading ? "Checking..." : "Track order"}
          </button>

          {error ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}
        </div>

        {order ? (
          <div className="mt-8 space-y-4">
            <div className="rounded-2xl border border-black/10 p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-black/60">Order</p>
                  <p className="font-mono text-sm">{order.id}</p>
                  <p className="mt-1 text-sm text-black/60">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>

                <span className="inline-flex rounded-full border border-black/15 px-3 py-1 text-xs text-black/70">
                  Status: {order.status}
                </span>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3 text-sm">
                <div className="rounded-xl border border-black/10 p-4">
                  <p className="text-black/60">Subtotal</p>
                  <p className="mt-1 font-semibold">{formatNaira(Number(order.subtotal))}</p>
                </div>
                <div className="rounded-xl border border-black/10 p-4">
                  <p className="text-black/60">Delivery</p>
                  <p className="mt-1 font-semibold">{formatNaira(Number(order.delivery_fee || 0))}</p>
                </div>
                <div className="rounded-xl border border-black/10 p-4">
                  <p className="text-black/60">Total</p>
                  <p className="mt-1 font-semibold">{formatNaira(Number(order.total))}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-black/10 p-6">
              <h2 className="font-semibold">Items</h2>
              <div className="mt-4 space-y-3">
                {items.map((it) => (
                  <div key={it.id} className="flex items-center gap-4 rounded-2xl border border-black/10 p-3">
                    <div className="h-16 w-16 overflow-hidden rounded-xl bg-gray-100">
                      <img
                        src={it.image_url ?? "/placeholder.svg"}
                        alt={it.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{it.name}</p>
                      <p className="text-xs text-black/60">
                        {formatNaira(Number(it.price))} × {it.qty}
                      </p>
                    </div>
                    <p className="font-semibold text-sm">
                      {formatNaira(Number(it.price) * Number(it.qty))}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}