"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/CartProvider";

function cls(...a: Array<string | false | null | undefined>) {
  return a.filter(Boolean).join(" ");
}

export default function SiteHeader() {
  const pathname = usePathname();
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  const nav = [
    { href: "/shop", label: "Shop" },
    { href: "/track", label: "Track" },
    { href: "/collections", label: "Collections" },
  ];

  function isActive(href: string) {
    return pathname === href || pathname?.startsWith(href + "/");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-white/85 backdrop-blur">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">

        {/* LOGO */}
      <Link href="/" className="flex items-center gap-2">
  <Image
    src="/silica-logo.png"
    alt="Silica Brand Logo"
    width={50}
    height={50}
    className="h-15 w-auto"
    priority
  />
<span className="text-lg font-semibold tracking-wide color-black">
    SILICA
  </span>

</Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {nav.map((x) => (
            <Link
              key={x.href}
              href={x.href}
              className={cls(
                "text-black/70 hover:text-black transition",
                isActive(x.href) && "text-black font-semibold"
              )}
            >
              {x.label}
            </Link>
          ))}

          <Link
            href="/cart"
            className={cls(
              "inline-flex items-center gap-2 rounded-xl border border-black/15 px-4 py-2 font-semibold hover:border-black/25 text-black",
              isActive("/cart") && "border-black/30"
            )}
          >
            Cart
            <span className="rounded-full bg-black text-white text-xs px-2 py-0.5">
              {count}
            </span>
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button
          className="md:hidden rounded-xl border border-black/15 px-3 py-2 text-sm font-semibold"
          onClick={() => setOpen((s) => !s)}
          aria-label="Toggle menu"
        >
          Menu
        </button>
      </div>

      {/* Mobile menu */}
      {open ? (
        <div className="md:hidden border-t border-black/10 bg-white">
          <div className="mx-auto max-w-6xl px-6 py-4 flex flex-col gap-3 text-sm">

            {nav.map((x) => (
              <Link
                key={x.href}
                href={x.href}
                onClick={() => setOpen(false)}
                className={cls(
                  "text-black/70 hover:text-black",
                  isActive(x.href) && "text-black font-semibold"
                )}
              >
                {x.label}
              </Link>
            ))}

            <Link
              href="/cart"
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-between rounded-xl border border-black/15 px-4 py-3 font-semibold hover:border-black/25"
            >
              Cart
              <span className="rounded-full bg-black text-white text-xs px-2 py-0.5">
                {count}
              </span>
            </Link>

          </div>
        </div>
      ) : null}
    </header>
  );
}