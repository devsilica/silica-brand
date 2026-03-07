"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();

  const orderId = searchParams.get("order");
  const total = searchParams.get("total");

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">

        <div className="text-6xl mb-4">🎉</div>

        <h1 className="text-3xl font-semibold">
          Order placed successfully
        </h1>

        {orderId && (
          <p className="mt-4 text-lg">
            Order ID: <span className="font-bold">{orderId}</span>
          </p>
        )}

        {total && (
          <p className="mt-2 text-lg">
            Total: <span className="font-bold">₦{Number(total).toLocaleString()}</span>
          </p>
        )}

        <p className="mt-4 text-black/60">
          Continue the order conversation on WhatsApp.
        </p>

        <Link
          href="/shop"
          className="mt-8 inline-block rounded-xl bg-black px-6 py-3 text-white"
        >
          Continue Shopping
        </Link>

      </div>
    </main>
  );
}