import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-black">
      <header className="sticky top-0 z-50 border-b border-black/10 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/admin/dashboard" className="font-semibold tracking-tight">
            Admin Panel
          </Link>

          <nav className="flex items-center gap-4 text-sm">
            <Link href="/shop" className="text-black/70 hover:text-black">
              Back to Shop
            </Link>
          </nav>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}