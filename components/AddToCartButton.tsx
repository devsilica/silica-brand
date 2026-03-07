"use client";

import { useCart } from "@/components/CartProvider";

type Props = {
  id: string;
  name: string;
  slug: string;
  price: number;
  image_url: string | null;
};

export default function AddToCartButton(p: Props) {
  const { addItem } = useCart();

  return (
    <button
      onClick={() => addItem({ ...p })}
      className="inline-flex rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
    >
      Add to Cart
    </button>
  );
}