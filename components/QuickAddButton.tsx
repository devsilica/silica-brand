"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/components/CartProvider";

function cls(...a: Array<string | false | null | undefined>) {
  return a.filter(Boolean).join(" ");
}

export default function QuickAddButton({
  id,
  name,
  slug,
  price,
  image_url,
}: {
  id: string;
  name: string;
  slug: string;
  price: number;
  image_url: string | null;
}) {
  const { addItem } = useCart();
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => setDone(false), 900);
    return () => clearTimeout(t);
  }, [done]);

  return (
    <button
      onClick={(e) => {
        e.preventDefault(); // don’t open the product link
        e.stopPropagation();
        addItem({ id, name, slug, price, image_url });
        setDone(true);
      }}
      className={cls(
        "rounded-xl border border-black/15 px-3 py-2 text-xs font-semibold hover:border-black/25",
        done && "bg-black text-white border-black"
      )}
      aria-label={`Add ${name} to cart`}
    >
      {done ? "Added ✓" : "Quick add"}
    </button>
  );
}