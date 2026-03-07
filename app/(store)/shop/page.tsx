import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import QuickAddButton from "@/components/QuickAddButton";
import ShopCatalog from "@/components/ShopCatalog";


type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  image_url: string | null;
};

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
