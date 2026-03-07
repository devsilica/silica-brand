
import { supabase } from "@/lib/supabaseClient";
import ShopCatalog from "@/components/ShopCatalog";
import type { Product } from "@/types/product";



export default async function ShopPage() {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, slug, price, image_url, category")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="p-10">
        <p>Error loading products: {error.message}</p>
      </main>
    );
  }

  const products = (data ?? []) as Product[];

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-semibold">Shop</h1>

<ShopCatalog products={products} />
      </div>
    </main>
  );
}
