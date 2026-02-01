"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Menu,
  PlusCircle,
  ShieldCheck,
  Ticket
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItems = [
  {
    title: "Tickets",
    href: "/app/tickets",
    icon: Ticket
  },
  {
    title: "Crear Ticket",
    href: "/app/tickets/new",
    icon: PlusCircle
  },
  {
    title: "Admin Overview",
    href: "/app/admin/overview",
    icon: ShieldCheck
  }
] as const;

type AppShellProps = {
  children: React.ReactNode;
};

const moduleTitles: Record<string, string> = {
  "/app/tickets": "Tickets",
  "/app/tickets/new": "Crear Ticket",
  "/app/admin/overview": "Admin Overview"
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const moduleTitle = moduleTitles[pathname] ?? "Tickets";

  return (
    <div className="min-h-screen bg-background">
      <DesktopSidebar />
      <div className="flex min-h-screen flex-col md:pl-64">
        <Topbar title={moduleTitle} />
        <main className="flex-1 p-6 md:p-10">{children}</main>
      </div>
    </div>
  );
}

function Topbar({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <MobileSidebarTrigger />
      <div className="flex items-center gap-2 text-lg font-semibold">
        <LayoutGrid className="h-5 w-5 text-muted-foreground" />
        <span>{title}</span>
      </div>
      <div className="ml-auto hidden w-full max-w-md items-center md:flex">
        <Input placeholder="Buscar..." />
      </div>
      <div className="ml-auto flex items-center gap-3 md:ml-0">
        <div className="md:hidden">
          <Input placeholder="Buscar..." className="h-9 w-40" />
        </div>
        <Avatar className="h-9 w-9">
          <AvatarImage src="https://ui.shadcn.com/avatars/01.png" alt="Avatar" />
          <AvatarFallback>EC</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}

function DesktopSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-background md:flex md:flex-col">
      <div className="flex h-16 items-center gap-2 border-b px-6 text-sm font-semibold">
        <span className="rounded-md bg-primary px-2 py-1 text-primary-foreground">
          EC
        </span>
        <span>Easy Click</span>
      </div>
      <nav className="flex-1 space-y-1 px-4 py-6">
        {navItems.map((item) => (
          <SidebarLink key={item.href} {...item} />
        ))}
      </nav>
      <div className="border-t px-6 py-4 text-xs text-muted-foreground">
        v1.0
      </div>
    </aside>
  );
}

function MobileSidebarTrigger() {
  return (
    <div className="md:hidden">
      <Dialog>
        <DialogTrigger asChild>
          <Button size="icon" variant="outline" aria-label="Abrir menú">
            <Menu className="h-5 w-5" />
          </Button>
        </DialogTrigger>
        <DialogContent className="left-0 top-0 h-full w-72 max-w-none translate-x-0 translate-y-0 rounded-none p-0">
          <div className="flex h-16 items-center gap-2 border-b px-6 text-sm font-semibold">
            <span className="rounded-md bg-primary px-2 py-1 text-primary-foreground">
              EC
            </span>
            <span>Easy Click</span>
          </div>
          <nav className="space-y-1 px-4 py-6">
            {navItems.map((item) => (
              <SidebarLink key={item.href} {...item} />
            ))}
          </nav>
        </DialogContent>
      </Dialog>
    </div>
  );
}

type SidebarLinkProps = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

function SidebarLink({ title, href, icon: Icon }: SidebarLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-muted text-foreground"
          : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{title}</span>
    </Link>
  );
}
