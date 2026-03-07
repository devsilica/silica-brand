"use client";

import Link from "next/link";
import Container from "@/components/Container";

export default function Hero() {
  return (
    <section className="border-b border-black/10 bg-gradient-to-b from-white via-white to-zinc-50">
      <Container>
        <div className="grid grid-cols-1 items-center gap-12 py-16 sm:py-20 lg:grid-cols-[0.95fr_1.15fr]">
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-black/45">
              Premium drops • Fast delivery • Easy tracking
            </p>

            <h1 className="mt-5 text-5xl font-semibold leading-[0.98] tracking-[-0.03em] sm:text-6xl">
              Look clean.
              <br />
              Feel confident.
              <br />
              Shop the new season.
            </h1>

            <p className="mt-6 max-w-md text-[15px] leading-7 text-black/65 sm:text-base">
              Wear Confidence. Wear Silica.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Shop now
              </Link>

              <Link
                href="/track"
                className="inline-flex items-center justify-center rounded-xl border border-black/15 px-6 py-3 text-sm font-semibold text-black transition hover:border-black/30"
              >
                Track an order
              </Link>
            </div>
          </div>

          <div className="mx-auto w-full max-w-2xl rounded-[28px] border border-black/10 bg-white p-5 shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
            <div className="overflow-hidden rounded-[22px] border border-black/10 bg-zinc-50">
              <div className="flex items-center justify-between gap-3 border-b border-black/10 p-5">
                <div>
                  <p className="text-sm font-semibold">Featured gallery</p>
                  <p className="text-xs text-black/60">Swipe or use arrows</p>
                </div>

                <div className="hidden gap-2 sm:flex">
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById("hero-gallery");
                      el?.scrollBy({ left: -420, behavior: "smooth" });
                    }}
                    className="rounded-lg border border-black/15 px-3 py-1 text-xs font-semibold transition hover:border-black/30"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById("hero-gallery");
                      el?.scrollBy({ left: 420, behavior: "smooth" });
                    }}
                    className="rounded-lg border border-black/15 px-3 py-1 text-xs font-semibold transition hover:border-black/30"
                  >
                    →
                  </button>
                </div>
              </div>

              <div
                id="hero-gallery"
                className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                {[
                  "/hero-image-for-silica-brand.jpg",
                  "/hero2.jpg",
                  "/hero3.jpg",
                  "/hero4.jpg",
                  "/hero5.jpg",
                ].map((src) => (
                  <div key={src} className="min-w-full snap-center">
                    <div className="aspect-[4/3] bg-gray-100">
                      <img
                        src={src}
                        alt="Silica featured"
                        className="h-full w-full object-cover"
                        draggable={false}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between p-5">
                <div>
                  <p className="font-semibold">Silica Essentials</p>
                  <p className="text-xs text-black/60">Swipe the gallery</p>
                </div>
                <span className="text-sm font-semibold">New season</span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}