"use client";

import { useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SearchIcon, XIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CategoryNode } from "@/lib/db/repository";

const STATUS_OPTIONS = [
  { value: "all", label: "All stock" },
  { value: "IN_STOCK", label: "In Stock" },
  { value: "LOW_STOCK", label: "Low Stock" },
  { value: "OUT_OF_STOCK", label: "Out of Stock" },
] as const;

export function InventoryFilters({
  search,
  categoryId,
  status,
  categories,
}: {
  search: string;
  categoryId: string;
  status: string;
  categories: CategoryNode[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(search);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function update(next: Partial<{ q: string; category: string; status: string }>) {
    const params = new URLSearchParams(searchParams.toString());
    if (next.q !== undefined) {
      if (next.q) params.set("q", next.q);
      else params.delete("q");
    }
    if (next.category !== undefined) {
      if (next.category) params.set("category", next.category);
      else params.delete("category");
    }
    if (next.status !== undefined) {
      if (next.status !== "all" && next.status) params.set("status", next.status);
      else params.delete("status");
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function handleSearch(value: string) {
    setQ(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => update({ q: value.trim() }), 300);
  }

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center">
      <div className="relative flex-1 md:max-w-xs">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={q}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search name, brand, or SKU"
          className="pl-8"
          aria-label="Search products"
        />
        {q ? (
          <button
            type="button"
            onClick={() => handleSearch("")}
            className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <XIcon className="size-4" />
          </button>
        ) : null}
      </div>

      <div className="flex gap-3">
        <Select value={categoryId || null} onValueChange={(v) => update({ category: v ?? "" })}>
          <SelectTrigger className="w-[8.5rem] justify-between text-left" aria-label="Filter by category">
            <SelectValue>
              {(value) => (
                <span>
                  {value
                    ? (categories.find((c) => String(c.id) === value)?.name ?? "All categories")
                    : "All categories"}
                </span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All categories</SelectItem>
            {categories
              .filter((c) => c.parentId === null)
              .map((root) => (
                <SelectItem key={root.id} value={String(root.id)}>
                  {root.name}
                </SelectItem>
              ))}
            {categories
              .filter((c) => c.parentId !== null)
              .map((child) => (
                <SelectItem key={child.id} value={String(child.id)}>
                  {child.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        <Select value={status || "all"} onValueChange={(v) => update({ status: v ?? "all" })}>
          <SelectTrigger className="w-[8.5rem] justify-between text-left" aria-label="Filter by stock status">
            <SelectValue>
              {(value) => (
                <span>{STATUS_OPTIONS.find((s) => s.value === value)?.label ?? "All stock"}</span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}