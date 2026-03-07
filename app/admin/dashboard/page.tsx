"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { toSlug } from "@/lib/slug";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  description: string | null;
  category: string | null;
  image_url: string | null;
  in_stock: boolean;
  created_at: string;
};

function cls(...a: Array<string | false | null | undefined>) {
  return a.filter(Boolean).join(" ");
}

export default function AdminDashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [inStock, setInStock] = useState(true);

  // Upload state
  const [uploading, setUploading] = useState(false);

  const formValid = useMemo(() => {
    const p = Number(price);
    return name.trim().length >= 2 && Number.isFinite(p) && p > 0;
  }, [name, price]);

  async function requireAuth() {
  const { data } = await supabase.auth.getSession();
  if (!data.session) {
    router.replace("/admin/login");
    return;
  }

  const { data: u } = await supabase.auth.getUser();
  const email = u.user?.email ?? null;

  // ✅ allowlist check
  const allowed = ["hadekunleadeniyi27@gmail.com"].includes((email || "").toLowerCase());

  if (!allowed) {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  }
}

  async function loadProducts() {
    setError(null);
    setLoading(true);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setProducts((data ?? []) as Product[]);
  }

  useEffect(() => {
    requireAuth().then(loadProducts);

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace("/admin/login");
    });

    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function resetForm() {
    setEditingId(null);
    setName("");
    setPrice("");
    setCategory("");
    setImageUrl("");
    setDescription("");
    setInStock(true);
  }

  function startEdit(p: Product) {
    setEditingId(p.id);
    setName(p.name);
    setPrice(String(p.price));
    setCategory(p.category ?? "");
    setImageUrl(p.image_url ?? "");
    setDescription(p.description ?? "");
    setInStock(!!p.in_stock);
  }

  async function uploadImage(file: File) {
    setError(null);
    setUploading(true);

    try {
      const ext = file.name.split(".").pop() || "png";
      const fileName = `${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(fileName, file, {
          upsert: false,
          contentType: file.type || "image/*",
        });

      if (uploadError) {
        setError(uploadError.message);
        return;
      }

      const { data } = supabase.storage.from("product-images").getPublicUrl(fileName);

      // store public URL into imageUrl which will be saved to DB
      setImageUrl(data.publicUrl);
    } finally {
      setUploading(false);
    }
  }

  async function saveProduct() {
    if (!formValid) return;

    setSaving(true);
    setError(null);

    const payload = {
      name: name.trim(),
      slug: toSlug(name),
      price: Number(price),
      category: category.trim() || null,
      image_url: imageUrl.trim() || null,
      description: description.trim() || null,
      in_stock: inStock,
    };

    const res = editingId
      ? await supabase.from("products").update(payload).eq("id", editingId)
      : await supabase.from("products").insert(payload);

    setSaving(false);

    if (res.error) {
      setError(res.error.message);
      return;
    }

    resetForm();
    await loadProducts();
  }

  async function deleteProduct(id: string) {
    const yes = window.confirm("Delete this product?");
    if (!yes) return;

    setError(null);
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      setError(error.message);
      return;
    }

    await loadProducts();
  }

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  }

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
            <p className="mt-1 text-black/70">Create, edit, and delete products.</p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/shop"
              className="rounded-xl border border-black/15 px-4 py-2 text-sm font-semibold hover:border-black/25"
            >
              View Shop
            </Link>
            <Link
  href="/admin/orders"
  className="rounded-xl border border-black/15 px-4 py-2 text-sm font-semibold hover:border-black/25"
>
  Orders
</Link>
            <button
              onClick={logout}
              className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              Logout
            </button>
          </div>
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Form */}
          <div className="rounded-2xl border border-black/10 p-5 lg:col-span-1">
            <h2 className="font-semibold">{editingId ? "Edit product" : "New product"}</h2>

            <div className="mt-4 space-y-3">
              <input
                className="w-full rounded-xl border border-black/15 px-4 py-3 outline-none focus:border-black/30"
                placeholder="Name (e.g. Black Hoodie)"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <input
                className="w-full rounded-xl border border-black/15 px-4 py-3 outline-none focus:border-black/30"
                placeholder="Price (e.g. 25000)"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                inputMode="numeric"
              />

              <input
                className="w-full rounded-xl border border-black/15 px-4 py-3 outline-none focus:border-black/30"
                placeholder="Category (optional)"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />

              {/* Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Product image</label>

                <input
                  type="file"
                  accept="image/*"
                  className="w-full rounded-xl border border-black/15 px-4 py-3"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadImage(f);
                  }}
                />

                {uploading ? (
                  <p className="text-xs text-black/60">Uploading image…</p>
                ) : imageUrl ? (
                  <div className="overflow-hidden rounded-xl border border-black/10">
                    <img src={imageUrl} alt="Preview" className="h-48 w-full object-cover" />
                  </div>
                ) : (
                  <p className="text-xs text-black/60">No image uploaded yet.</p>
                )}
              </div>

              <textarea
                className="min-h-[120px] w-full rounded-xl border border-black/15 px-4 py-3 outline-none focus:border-black/30"
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={(e) => setInStock(e.target.checked)}
                />
                In stock
              </label>

              <div className="flex gap-2 pt-2">
                <button
                  disabled={!formValid || saving || uploading}
                  onClick={saveProduct}
                  className={cls(
                    "flex-1 rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white",
                    (!formValid || saving || uploading) && "opacity-60"
                  )}
                >
                  {saving ? "Saving..." : editingId ? "Update" : "Create"}
                </button>

                <button
                  onClick={resetForm}
                  className="rounded-xl border border-black/15 px-4 py-3 text-sm font-semibold hover:border-black/25"
                >
                  Clear
                </button>
              </div>

              <p className="text-xs text-black/60">
                Slug auto-generates from the name: <b>{toSlug(name || "example product")}</b>
              </p>

              {imageUrl ? (
                <p className="text-xs text-black/60 break-all">
                  Image URL saved: <b>{imageUrl}</b>
                </p>
              ) : null}
            </div>
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-black/10 p-5 lg:col-span-2">
            <h2 className="font-semibold">Products</h2>

            {loading ? (
              <p className="mt-4 text-black/70">Loading…</p>
            ) : (
              <div className="mt-4 overflow-hidden rounded-2xl border border-black/10">
                <div className="grid grid-cols-12 gap-2 bg-black/5 px-4 py-3 text-xs font-semibold text-black/70">
                  <div className="col-span-6 sm:col-span-5">Name</div>
                  <div className="col-span-3 sm:col-span-2">Price</div>
                  <div className="hidden sm:block sm:col-span-3">Slug</div>
                  <div className="col-span-3 sm:col-span-2 text-right">Actions</div>
                </div>

                <div className="divide-y divide-black/10">
                  {products.map((p) => (
                    <div key={p.id} className="grid grid-cols-12 gap-2 px-4 py-3 text-sm">
                      <div className="col-span-6 sm:col-span-5">
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-black/50">
                          ₦{Number(p.price).toLocaleString()}
                        </p>
                      </div>

                      <div className="col-span-3 sm:col-span-2 font-semibold">
                        ₦{Number(p.price).toLocaleString()}
                      </div>

                      <div className="hidden sm:block sm:col-span-3 text-black/70">
                        {p.slug}
                      </div>

                      <div className="col-span-3 sm:col-span-2 flex justify-end gap-2">
                        <button
                          onClick={() => startEdit(p)}
                          className="rounded-lg border border-black/15 px-3 py-1 text-xs font-semibold hover:border-black/25"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteProduct(p.id)}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}

                  

                  {products.length === 0 ? (
                    <div className="p-6 text-sm text-black/70">No products yet.</div>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}