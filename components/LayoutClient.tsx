"use client";

import { usePathname } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";


export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <>
      {!isAdmin && <SiteHeader />}

      {children}

    
    </>
  );
}