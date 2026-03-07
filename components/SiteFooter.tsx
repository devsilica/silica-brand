import Link from "next/link";
import Container from "@/components/Container";

export default function SiteFooter() {
  return (
    <footer className="border-t border-black/10 bg-white">
      <Container>
        <div className="py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
          <div>
            <p className="font-semibold">Silica Store</p>
            <p className="mt-2 text-black/60">
              Silica exists for individuals who understand that style is language.
Our collections are built on precision, detail, and timeless construction.
We create wear that speaks before you do refined, confident, and intentional.
More than clothing, Silica is presence.
            </p>
          </div>

          <div>
            <p className="font-semibold">Shop</p>
            <div className="mt-2 flex flex-col gap-2 text-black/70">
              <Link href="/shop" className="hover:text-black">
                Shop all
              </Link>
              <Link href="/cart" className="hover:text-black">
                Cart
              </Link>
              <Link href="/track" className="hover:text-black">
                Track order
              </Link>
            </div>
          </div>

          <div>
            <p className="font-semibold">Socials</p>
            <div className="mt-2 flex flex-col gap-2 text-black/70">
              <Link href="https://wa.me/2347042953337" className="hover:text-black">
                Whatsapp
              </Link>
              <Link href="https://www.instagram.com/adeniyi_samuel_adekunle/" className="hover:text-black">
                Instagram
              </Link>
              <Link href="https://x.com/sadeniyi3?s=21" className="hover:text-black">
                Twitter
              </Link>
            </div>
          </div>

          <div>
            <p className="font-semibold">Support</p>
            <p className="mt-2 text-black/60">
              Need help? Use your tracking page or contact the store via WhatsApp checkout flow.
            </p>
          </div>
        </div>

        <div className="border-t border-black/10 py-6 text-xs text-black/50">
          © {new Date().getFullYear()} Silica Store. Built by Silica.
        </div>
      </Container>
    </footer>
  );
}