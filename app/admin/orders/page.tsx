"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  product_id: string | null;
  name: string;
  slug: string | null;
  price: number;
  qty: number;
  image_url: string | null;
  created_at: string;
};

const STATUS = ["pending", "confirmed", "processing", "dispatched", "delivered", "cancelled"] as const;

function formatNaira(n: number) {
  return `₦${Number(n).toLocaleString()}`;
}

function cls(...a: Array<string | false | null | undefined>) {
  return a.filter(Boolean).join(" ");
}




export default function AdminOrdersPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
const [search, setSearch] = useState("");

  const [orders, setOrders] = useState<Order[]>([]);
  const [itemsByOrder, setItemsByOrder] = useState<Record<string, OrderItem[]>>({});
  const [openOrderId, setOpenOrderId] = useState<string | null>(null);

  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function requireAuth() {
    const { data } = await supabase.auth.getSession();
    if (!data.session) router.replace("/admin/login");
  }

        async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // fallback
    const t = document.createElement("textarea");
    t.value = text;
    document.body.appendChild(t);
    t.select();
    document.execCommand("copy");
    document.body.removeChild(t);
  }
}

function csvEscape(v: any) {
  const s = String(v ?? "");
  // wrap in quotes and escape quotes
  return `"${s.replace(/"/g, '""')}"`;
}

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows.map((r) => r.map(csvEscape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}


  
  
  
  async function loadOrdersAndItems() {
    setError(null);
    setLoading(true);

    const { data: ordersData, error: ordersErr } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });


    if (ordersErr) {
      setLoading(false);
      setError(ordersErr.message);
      return;
    }

    const o = (ordersData ?? []) as Order[];
    setOrders(o);

    // Load items for all orders (one query)
    const { data: itemsData, error: itemsErr } = await supabase
      .from("order_items")
      .select("*")
      .order("created_at", { ascending: true });

    setLoading(false);

    if (itemsErr) {
      setError(itemsErr.message);
      return;
    }

    const by: Record<string, OrderItem[]> = {};
    for (const it of (itemsData ?? []) as OrderItem[]) {
      if (!by[it.order_id]) by[it.order_id] = [];
      by[it.order_id].push(it);
    }
    setItemsByOrder(by);
  }

  useEffect(() => {
    requireAuth().then(loadOrdersAndItems);

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace("/admin/login");
    });

    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalRevenue = useMemo(() => {
    return orders.reduce((sum, o) => sum + Number(o.total || 0), 0);
  }, [orders]);

  const filteredOrders = useMemo(() => {
  return orders.filter((o) => {
    const matchesStatus =
      statusFilter === "all" ? true : o.status === statusFilter;

    const q = search.trim().toLowerCase();

    const matchesSearch =
      q.length === 0
        ? true
        : o.customer_name.toLowerCase().includes(q) ||
          o.customer_phone.toLowerCase().includes(q) ||
          o.id.toLowerCase().includes(q);

    return matchesStatus && matchesSearch;
  });
}, [orders, statusFilter, search]);
  async function updateStatus(orderId: string, status: string) {
    setUpdatingId(orderId);
    setError(null);

    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);

    setUpdatingId(null);

    if (error) {
      setError(error.message);
      return;
    }

    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
  }

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Orders</h1>
            <p className="mt-1 text-black/60">Expandable order cards with items & status updates.</p>
          </div>


          <div className="flex gap-2">
            <Link
              href="/admin/dashboard"
              className="rounded-xl border border-black/15 px-4 py-2 text-sm font-semibold hover:border-black/25"
            >
              Products
            </Link>
            <Link
              href="/shop"
              className="rounded-xl border border-black/15 px-4 py-2 text-sm font-semibold hover:border-black/25"
            >
              View store
            </Link>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-black/10 p-5">
          <div className="flex flex-wrap gap-6 text-sm">
            <div>
              <p className="text-black/60">Total orders</p>
              <p className="text-xl font-semibold">{orders.length}</p>
            </div>
            <div>
              <p className="text-black/60">Total revenue (subtotal)</p>
              <p className="text-xl font-semibold">{formatNaira(totalRevenue)}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <button
  onClick={() => {
    const rows: string[][] = [
      [
        "order_id",
        "created_at",
        "status",
        "customer_name",
        "customer_phone",
        "delivery_address",
        "subtotal",
        "delivery_fee",
        "total",
        "items_count",
      ],
      ...filteredOrders.map((o) => [
        o.id,
        o.created_at,
        o.status,
        o.customer_name,
        o.customer_phone,
        o.delivery_address,
        String(o.subtotal ?? 0),
        String(o.delivery_fee ?? 0),
        String(o.total ?? 0),
        String((itemsByOrder[o.id] ?? []).length),
      ]),
    ];

    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsv(`orders_${stamp}.csv`, rows);
  }}
  className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
>
  Download CSV
</button>
  {/* Search */}
  <input
    type="text"
    placeholder="Search by name, phone, or order ID..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="w-full sm:w-80 rounded-xl border border-black/15 px-4 py-2 text-sm outline-none focus:border-black/30"
  />

  {/* Status filter */}
  <select
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
    className="rounded-xl border border-black/15 px-4 py-2 text-sm outline-none focus:border-black/30"
  >
    <option value="all">All statuses</option>
    {STATUS.map((s) => (
      <option key={s} value={s}>
        {s}
      </option>
    ))}
  </select>
</div>

        {error ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>

          
        ) : null}

        {loading ? (
          <p className="mt-8 text-black/70">Loading orders…</p>
        ) : orders.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-black/10 p-8 text-black/70">
            No orders yet.
          </div>

          
  ) : (

    
          <div className="mt-8 space-y-4">
           {filteredOrders.map((o) => {
              const open = openOrderId === o.id;
              const orderItems = itemsByOrder[o.id] ?? [];

              return (
                <div key={o.id} className="rounded-2xl border border-black/10 overflow-hidden">
                  <button
                    onClick={() => setOpenOrderId(open ? null : o.id)}
                    className="w-full text-left px-5 py-4 hover:bg-black/5"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold">{o.customer_name}</p>
                        <p className="text-xs text-black/60">
                          {new Date(o.created_at).toLocaleString()} • {o.customer_phone}
                        </p>
                        <p className="mt-1 text-xs text-black/60 break-all">Order ID: {o.id}</p>
                      </div>

                      

                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold">{formatNaira(Number(o.total))}</span>

                        <Link
  href={`/admin/orders/${o.id}`}
  className="no-print rounded-lg border border-black/15 px-3 py-1 text-xs font-semibold hover:border-black/25"
  onClick={(e) => e.stopPropagation()}
>
  View
</Link>

                        <span
                          className={cls(
                            "text-xs px-3 py-1 rounded-full border",
                            o.status === "pending" && "border-black/20 text-black/70",
                            o.status === "confirmed" && "border-blue-200 text-blue-700 bg-blue-50",
                            o.status === "processing" && "border-purple-200 text-purple-700 bg-purple-50",
                            o.status === "dispatched" && "border-amber-200 text-amber-700 bg-amber-50",
                            o.status === "delivered" && "border-green-200 text-green-700 bg-green-50",
                            o.status === "cancelled" && "border-red-200 text-red-700 bg-red-50"
                          )}
                        >
                          {o.status}
                        </span>

                        <span className="text-xs text-black/60">{open ? "▲" : "▼"}</span>
                      </div>
                    </div>
                  </button>

                  <div className="mt-3 flex flex-wrap gap-2">
  <button
    onClick={() => copyText(o.id)}
    className="rounded-lg border border-black/15 px-3 py-1 text-xs font-semibold hover:border-black/25"
  >
    Copy Order ID
  </button>

  <button
    onClick={() => copyText(o.customer_phone)}
    className="rounded-lg border border-black/15 px-3 py-1 text-xs font-semibold hover:border-black/25"
  >
    Copy Phone
  </button>

  <button
    onClick={() => copyText(o.delivery_address)}
    className="rounded-lg border border-black/15 px-3 py-1 text-xs font-semibold hover:border-black/25"
  >
    Copy Address
  </button>
</div>


                  {open ? (
                    <div className="px-5 py-5 border-t border-black/10 bg-white">
                      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2">
                          <h3 className="font-semibold">Items</h3>

                          <div className="mt-3 space-y-3">
                            {orderItems.length === 0 ? (
                              <p className="text-sm text-black/60">No items found for this order.</p>
                            ) : (
                              orderItems.map((it) => (
                                <div
                                  key={it.id}
                                  className="flex items-center gap-4 rounded-2xl border border-black/10 p-3"
                                >
                                  <div className="h-16 w-16 overflow-hidden rounded-xl bg-gray-100">
                                    <img
                                      src={it.image_url ?? "/placeholder.svg"}
                                      alt={it.name}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    {it.slug ? (
                                      <Link
                                        href={`/product/${it.slug}`}
                                        className="font-semibold hover:underline truncate block"
                                      >
                                        {it.name}
                                      </Link>
                                    ) : (
                                      <p className="font-semibold truncate">{it.name}</p>
                                    )}

                                    <p className="text-xs text-black/60">
                                      {formatNaira(Number(it.price))} × {it.qty}
                                    </p>
                                  </div>

                                  <div className="font-semibold text-sm">
                                    {formatNaira(Number(it.price) * Number(it.qty))}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                          <div className="mt-4 rounded-2xl border border-black/10 p-4 text-sm">
                          <div className="flex justify-between">
                            <span className="text-black/60">Subtotal</span>
                            <span className="font-semibold">{formatNaira(Number(o.subtotal))}</span>
                          </div>

                          <div className="mt-2 flex justify-between">
                            <span className="text-black/60">Delivery</span>
                            <span className="font-semibold">{formatNaira(Number(o.delivery_fee || 0))}</span>
                          </div>

                          <div className="mt-3 flex justify-between border-t border-black/10 pt-3">
                            <span className="text-black/60">Total</span>
                            <span className="text-base font-semibold">{formatNaira(Number(o.total))}</span>
                          </div>
                        </div>
                                                <div className="lg:col-span-1">
                                                  <h3 className="font-semibold">Customer</h3>

                          <div className="mt-3 rounded-2xl border border-black/10 p-4 text-sm">
                            <p className="text-black/60">Address</p>
                            <p className="mt-1">{o.delivery_address}</p>

                            {o.note ? (
                              <>
                                <p className="mt-4 text-black/60">Note</p>
                                <p className="mt-1">{o.note}</p>
                              </>
                            ) : null}

                            <p className="mt-4 text-black/60">Update status</p>
                            <select
                              className="mt-2 w-full rounded-xl border border-black/15 px-3 py-2 text-sm outline-none"
                              value={o.status}
                              disabled={updatingId === o.id}
                              onChange={(e) => updateStatus(o.id, e.target.value)}
                            >
                              {STATUS.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>

                            {updatingId === o.id ? (
                              <p className="mt-2 text-xs text-black/60">Updating…</p>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}