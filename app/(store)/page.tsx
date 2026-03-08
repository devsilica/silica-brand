export const dynamic = "force-dynamic";
export const revalidate = 0;

import Hero from "@/components/Hero";
import TrustBar from "@/components/TrustBar";
import FeaturedProducts from "@/components/FeaturedProducts";
import SiteFooter from "@/components/SiteFooter";


export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <Hero />
      <TrustBar />
      <FeaturedProducts />
      
    </main>
  );
}
