import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type Row = { category: string | null };

export default async function CollectionsPage() {
  const { data, error } = await supabase
    .from("products")
    .select("category")
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

  const rows = (data ?? []) as Row[];

  // count categories
  const counts = new Map<string, number>();
  for (const r of rows) {
    const c = (r.category ?? "Uncategorized").trim() || "Uncategorized";
    counts.set(c, (counts.get(c) ?? 0) + 1);
  }

  const categories = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Collections</h1>
            <p className="mt-1 text-black/60">Browse by category.</p>
          </div>
          <Link href="/shop" className="text-sm underline text-black/70 hover:text-black">
            Back to shop
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((c) => (
            <Link
              key={c.name}
              href={`/collections/${encodeURIComponent(c.name)}`}
              className="rounded-3xl border border-black/10 p-6 hover:border-black/20 transition"
            >
              <p className="text-xs font-semibold tracking-widest text-black/50 uppercase">
                Collection
              </p>
              <p className="mt-2 text-xl font-semibold">{c.name}</p>
              <p className="mt-2 text-sm text-black/60">{c.count} product(s)</p>
            </Link>
          ))}

          {categories.length === 0 ? (
            <div className="rounded-2xl border border-black/10 p-8 text-black/60">
              No categories yet. 
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}