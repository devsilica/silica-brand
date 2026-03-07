"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Order = {
  id: string;
  status: string;
  currency: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  note: string | null;
  created_at: string;
};

type OrderItem = {
  id: string;
  order_id: string;
  name: string;
  slug: string | null;
  price: number;
  qty: number;
  image_url: string | null;
};

function formatNaira(n: number) {
  return `₦${Number(n).toLocaleString()}`;
}

export default function AdminOrderDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);

  async function requireAuth() {
    const { data } = await supabase.auth.getSession();
    if (!data.session) router.replace("/admin/login");
  }

  async function load() {
    setLoading(true);
    setError(null);

    const { data: o, error: oErr } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    if (oErr || !o) {
      setLoading(false);
      setError(oErr?.message || "Order not found");
      return;
    }

    const { data: it, error: itErr } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", id)
      .order("created_at", { ascending: true });

    setLoading(false);

    if (itErr) {
      setError(itErr.message);
      return;
    }

    setOrder(o as Order);
    setItems((it ?? []) as OrderItem[]);
  }

  useEffect(() => {
    requireAuth().then(load);

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace("/admin/login");
    });

    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const totals = useMemo(() => {
    const subtotal = Number(order?.subtotal || 0);
    const delivery = Number(order?.delivery_fee || 0);
    const total = Number(order?.total || subtotal + delivery);
    return { subtotal, delivery, total };
  }, [order]);

  if (loading) {
    return (
      <main className="min-h-screen bg-white text-black">
        <div className="mx-auto max-w-4xl px-6 py-10">Loading…</div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-screen bg-white text-black">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <p className="text-red-700">{error || "Order not found"}</p>
          <Link href="/admin/orders" className="mt-6 inline-block underline">
            Back to orders
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-black">
      {/* Print styles */}
      <style>{`
  @page { margin: 12mm; }

  @media print {
    /* hide anything not invoice */
    .no-print, header, nav, footer { display: none !important; }

    /* show only invoice content */
    body { background: white !important; }
    .invoice { border: none !important; box-shadow: none !important; }
  }
`}</style>

      <div className="invoice print-area mt-6 rounded-2xl border border-black/10 p-6">
        <div className="no-print flex items-center justify-between">
          <Link href="/admin/orders" className="text-sm underline text-black/70 hover:text-black">
            ← Back to orders
          </Link>

          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              Print / Save PDF
            </button>
          </div>
        </div>

        <div className="print-area mt-6 rounded-2xl border border-black/10 p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Order Invoice</h1>
              <p className="mt-1 text-sm text-black/60">
                Order ID: <span className="font-mono">{order.id}</span>
              </p>
              <p className="text-sm text-black/60">
                Date: {new Date(order.created_at).toLocaleString()}
              </p>
              <p className="mt-2 inline-flex rounded-full border border-black/15 px-3 py-1 text-xs text-black/70">
                Status: {order.status}
              </p>
            </div>

            <div className="mt-4 sm:mt-0 text-right">
              <p className="text-sm text-black/60">Store</p>
              <p className="font-semibold">Silica Store</p>
              <p className="text-sm text-black/60">Currency: {order.currency}</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-black/10 p-4">
              <p className="text-sm text-black/60">Customer</p>
              <p className="mt-1 font-semibold">{order.customer_name}</p>
              <p className="text-sm text-black/70">{order.customer_phone}</p>
            </div>

            <div className="rounded-2xl border border-black/10 p-4">
              <p className="text-sm text-black/60">Delivery Address</p>
              <p className="mt-1 text-black/80 whitespace-pre-line">{order.delivery_address}</p>
            </div>
          </div>

          {order.note ? (
            <div className="mt-6 rounded-2xl border border-black/10 p-4">
              <p className="text-sm text-black/60">Note</p>
              <p className="mt-1 text-black/80 whitespace-pre-line">{order.note}</p>
            </div>
          ) : null}

          <div className="mt-8">
            <h2 className="font-semibold">Items</h2>

            <div className="mt-3 overflow-hidden rounded-2xl border border-black/10">
              <div className="grid grid-cols-12 gap-2 bg-black/5 px-4 py-3 text-xs font-semibold text-black/70">
                <div className="col-span-6">Item</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-2 text-right">Qty</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              <div className="divide-y divide-black/10">
                {items.map((it) => (
                  <div key={it.id} className="grid grid-cols-12 gap-2 px-4 py-3 text-sm">
                    <div className="col-span-6">
                      <p className="font-medium">{it.name}</p>
                      {it.slug ? <p className="text-xs text-black/50">/{it.slug}</p> : null}
                    </div>
                    <div className="col-span-2 text-right">{formatNaira(Number(it.price))}</div>
                    <div className="col-span-2 text-right">{it.qty}</div>
                    <div className="col-span-2 text-right font-semibold">
                      {formatNaira(Number(it.price) * Number(it.qty))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 ml-auto w-full max-w-sm rounded-2xl border border-black/10 p-4">
              <div className="flex justify-between text-sm">
                <span className="text-black/60">Subtotal</span>
                <span className="font-semibold">{formatNaira(totals.subtotal)}</span>
              </div>
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-black/60">Delivery</span>
                <span className="font-semibold">{formatNaira(totals.delivery)}</span>
              </div>
              <div className="mt-3 flex justify-between border-t border-black/10 pt-3">
                <span className="text-black/60">Total</span>
                <span className="text-base font-semibold">{formatNaira(totals.total)}</span>
              </div>
            </div>

            <p className="mt-6 text-xs text-black/50">
              Print this page or “Save as PDF” for dispatch/records.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}