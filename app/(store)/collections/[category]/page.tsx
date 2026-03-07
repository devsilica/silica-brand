import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  image_url: string | null;
  category: string | null;
};

function formatNaira(n: number) {
  return `₦${Number(n).toLocaleString()}`;
}

export default async function CollectionCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: raw } = await params;
  const category = decodeURIComponent(raw);
  
  const { data, error } = await supabase
    .from("products")
    .select("id, name, slug, price, image_url, category")
    .eq("category", category)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="min-h-screen bg-white text-black">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <p className="text-red-700">Error: {error.message}</p>
        </div>
      </main>
    );
  }

  const products = (data ?? []) as Product[];

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">{category}</h1>
            <p className="mt-1 text-black/60">{products.length} product(s)</p>
          </div>
          <div className="flex gap-3">
            <Link href="/collections" className="text-sm underline text-black/70 hover:text-black">
              All collections
            </Link>
            <Link href="/shop" className="text-sm underline text-black/70 hover:text-black">
              Shop
            </Link>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/product/${p.slug}`}
              className="group rounded-3xl border border-black/10 overflow-hidden hover:border-black/20 transition"
            >
              <div className="h-60 bg-gray-100 overflow-hidden">
                <img
                  src={p.image_url ?? "/placeholder.png"}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition"
                />
              </div>
              <div className="p-5 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium truncate">{p.name}</p>
                  <p className="mt-1 font-semibold">{formatNaira(Number(p.price))}</p>
                </div>
                <span className="text-xs rounded-full border border-black/15 px-3 py-1 text-black/70">
                  View
                </span>
              </div>
            </Link>
          ))}

          {products.length === 0 ? (
            <div className="rounded-2xl border border-black/10 p-8 text-black/60">
              No products in this collection yet.
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}