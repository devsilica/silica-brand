import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import AddToCartButton from "@/components/AddToCartButton";
import QuickAddButton from "@/components/QuickAddButton";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  description: string | null;
  image_url: string | null;
  category: string | null;
  in_stock: boolean;
};

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data, error } = await supabase
    .from("products")
    .select("id, name, slug, price, description, image_url, category, in_stock")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    return (
      <main className="min-h-screen bg-white text-black p-10">
        <p className="mb-4">Product not found.</p>
        <p className="text-sm text-black/60">slug: {slug}</p>
        <Link href="/shop" className="mt-6 inline-block underline">
          Back to shop
        </Link>
      </main>
    );
  }

  const p = data as Product;
  // Fetch related products (same category, exclude current)
let related: Product[] = [];

if (p.category) {
  const { data: relatedData } = await supabase
    .from("products")
    .select("id, name, slug, price, image_url")
    .eq("category", p.category)
    .neq("slug", p.slug)
    .limit(4);

  related = (relatedData ?? []) as Product[];
}

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <Link href="/shop" className="text-sm underline text-black/80 hover:text-black">
          ← Back to shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-8">
          <div className="aspect-[4/5] bg-gray-100 rounded-2xl overflow-hidden">
            <img
              src={p.image_url ?? "/placeholder.svg"}
              alt={p.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <h1 className="text-3xl font-semibold">{p.name}</h1>
            <p className="mt-2 text-black/60">{p.category ?? "Apparel"}</p>

            <div className="mt-5 flex items-center gap-3">
              <p className="text-2xl font-semibold">₦{Number(p.price).toLocaleString()}</p>
              <span className="text-xs px-3 py-1 rounded-full border border-black/15 text-black/70">
                {p.in_stock ? "In stock" : "Out of stock"}
              </span>
            </div>

            {/* CART BUTTONS */}
            <div className="mt-6 flex gap-3">
              <AddToCartButton
                id={p.id}
                name={p.name}
                slug={p.slug}
                price={Number(p.price)}
                image_url={p.image_url ?? null}
              />

              <Link
                href="/cart"
                className="inline-flex rounded-xl border border-black/15 px-5 py-3 text-sm font-semibold hover:border-black/25"
              >
                View Cart
              </Link>
            </div>

            {p.description ? (
              <p className="mt-6 text-black/80 leading-relaxed">{p.description}</p>
            ) : (
              <p className="mt-6 text-black/50">No description yet.</p>
            )}
          </div>
        </div>
        {related.length > 0 && (
  <div className="mt-16">
    <h2 className="text-2xl font-semibold">Related products</h2>

    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {related.map((rp) => (
        <Link
          key={rp.id}
          href={`/product/${rp.slug}`}
          className="group rounded-3xl border border-black/10 overflow-hidden hover:border-black/20 transition"
        >
          <div className="aspect-[4/5] bg-gray-100 overflow-hidden">
            <img
              src={rp.image_url ?? "/placeholder.png"}
              alt={rp.name}
              className="h-full w-full object-cover group-hover:scale-[1.03] transition"
            />
          </div>

          <div className="p-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-medium truncate">{rp.name}</p>
              <p className="text-sm text-black/60">
                ₦{Number(rp.price).toLocaleString()}
              </p>
            </div>

            <QuickAddButton
              id={rp.id}
              name={rp.name}
              slug={rp.slug}
              price={Number(rp.price)}
              image_url={rp.image_url ?? null}
            />
          </div>
        </Link>
      ))}
    </div>
  </div>
)}
      </div>
    </main>
    
  );
}