"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";

export default function CartButton() {
  const { count } = useCart();

  return (
    <Link
      href="/cart"
      className="relative rounded-xl border border-black/15 px-4 py-2 text-sm font-semibold hover:border-black/25"
    >
      Cart
      {count > 0 ? (
        <span className="ml-2 inline-flex min-w-[1.5rem] justify-center rounded-full bg-black px-2 py-0.5 text-xs text-white">
          {count}
        </span>
      ) : null}
    </Link>
  );
}