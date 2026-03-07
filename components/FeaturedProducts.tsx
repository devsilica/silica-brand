export const dynamic = "force-dynamic";

import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import Container from "@/components/Container";
import SectionTitle from "@/components/SectionTitle";
import QuickAddButton from "@/components/QuickAddButton";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  image_url: string | null;
};

function formatNaira(n: number) {
  return `₦${Number(n).toLocaleString()}`;
}

export default async function FeaturedProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, slug, price, image_url")
    .order("created_at", { ascending: false })
    .limit(6);

  const products = (data ?? []) as Product[];

  return (
    <section className="bg-white">
      <Container>
        <div className="py-14">
          <div className="flex items-end justify-between gap-6">
            <SectionTitle
              eyebrow="Featured"
              title="New arrivals"
              subtitle="Fresh drops designed for bold expression."
            />
            <Link href="/shop" className="text-sm underline text-black/70 hover:text-black">
              View all
            </Link>
          </div>

          {error ? (
            <p className="mt-6 text-sm text-red-700">Failed to load products: {error.message}</p>
          ) : null}

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
              <Link
                key={p.id}
                href={`/product/${p.slug}`}
                className="group rounded-3xl border border-black/10 overflow-hidden hover:border-black/20 transition"
              >
                <div className="aspect-4/5 bg-gray-100 overflow-hidden">
                  <img
                    src={p.image_url ?? "/placeholder.svg"}
                    alt={p.name}
                    className="h-full w-full object-cover group-hover:scale-[1.03] transition"
                  />
                </div>
                <div className="p-5 flex items-start justify-between gap-4">
  <div className="min-w-0">
    <p className="font-semibold truncate">{p.name}</p>
    <p className="mt-1 text-sm text-black/60">{formatNaira(Number(p.price))}</p>
  </div>

  <QuickAddButton
    id={p.id}
    name={p.name}
    slug={p.slug}
    price={Number(p.price)}
    image_url={p.image_url ?? null}
  />
</div>

              </Link>
            ))}

          </div>
        </div>
      </Container>
    </section>
  );
}