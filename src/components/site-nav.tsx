"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HistoryIcon, LayoutDashboardIcon, LogOutIcon, PackageIcon, SettingsIcon, ShoppingCartIcon, StoreIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { logout } from "@/app/(app)/auth-actions";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/inventory", label: "Inventory", icon: PackageIcon },
  { href: "/sell", label: "Sell", icon: ShoppingCartIcon },
  { href: "/activity", label: "Activity", icon: HistoryIcon },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
] as const;

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function SiteNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Top bar — laptop/desktop */}
      <header className="sticky top-0 z-40 hidden border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:block">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-6 px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="rounded-md bg-primary p-1.5 text-primary-foreground">
              <StoreIcon className="size-4" />
            </span>
            Shop Dashboard
          </Link>
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                  isActive(pathname, item.href) && "bg-accent text-accent-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <form action={logout}>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              aria-label="Lock dashboard"
            >
              <LogOutIcon className="size-4" />
              Lock
            </button>
          </form>
        </div>
      </header>

      {/* Bottom nav — mobile */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <div className="grid h-16 grid-cols-5">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <item.icon className="size-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}