"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import QuickAddButton from "@/components/QuickAddButton";
import type { Product } from "@/types/product";


function cls(...a: Array<string | false | null | undefined>) {
  return a.filter(Boolean).join(" ");
}

export default function ShopCatalog({ products }: { products: Product[] }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) {
      if (p.category) set.add(p.category);
    }
    return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [products]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    return products.filter((p) => {
      const okCat = cat === "all" ? true : (p.category ?? "") === cat;
      const okQ =
        query.length === 0 ? true : p.name.toLowerCase().includes(query);
      return okCat && okQ;
    });
  }, [products, q, cat]);

  return (
    <section className="mt-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products..."
            className="w-full sm:w-80 rounded-xl border border-black/15 px-4 py-2 text-sm outline-none focus:border-black/30"
          />

          <select
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            className="rounded-xl border border-black/15 px-4 py-2 text-sm outline-none focus:border-black/30"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "All categories" : c}
              </option>
            ))}
          </select>
        </div>

        <p className="text-sm text-black/60">
          Showing <span className="font-semibold">{filtered.length}</span> of{" "}
          <span className="font-semibold">{products.length}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {filtered.map((product) => (
          <Link
            key={product.id}
            href={`/product/${product.slug}`}
            className="group rounded-3xl border border-black/10 overflow-hidden hover:border-black/20 transition"
          >
            <div className="h-60 bg-gray-100 overflow-hidden">
              <img
                src={product.image_url ?? "/placeholder.png"}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-[1.03] transition"
              />
            </div>

            <div className="p-5 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="font-medium truncate">{product.name}</p>
                <p className="mt-1 font-semibold">
                  ₦{Number(product.price).toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-black/50">
                  {product.category ?? "Uncategorized"}
                </p>
              </div>

              <QuickAddButton
                id={product.id}
                name={product.name}
                slug={product.slug}
                price={Number(product.price)}
                image_url={product.image_url ?? null}
              />
            </div>
          </Link>
        ))}

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-black/10 p-8 text-black/60">
            No matching products.
          </div>
        ) : null}
      </div>
    </section>
  );
}