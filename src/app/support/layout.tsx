import Link from "next/link";
import type { Metadata } from "next";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Easy Click Support",
  description: "Portal de soporte para clientes"
};

export default function SupportLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/support" className="flex items-center gap-2 font-semibold">
            <span className="rounded-md bg-primary px-2 py-1 text-xs text-primary-foreground">
              EC
            </span>
            <span>Easy Click Support</span>
          </Link>
          <Button asChild size="sm">
            <Link href="/support/new">Levantar ticket</Link>
          </Button>
        </div>
      </header>
      <main className="container py-10">{children}</main>
    </div>
  );
}
