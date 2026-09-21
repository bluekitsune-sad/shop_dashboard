"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CategoryNode } from "@/lib/db/repository";

/**
 * Two-step category picker:
 *   1. choose a top-level category (e.g. Phones)
 *   2. if that category has subcategories (e.g. Apple, Samsung), choose one
 *
 * A single `categoryId` is emitted: the subcategory when one exists, otherwise
 * the chosen top-level category directly.
 */
export function CategorySelect({
  categories,
  value,
  onChange,
  invalid,
}: {
  categories: CategoryNode[];
  value: string | null;
  onChange: (value: string | null) => void;
  invalid?: boolean;
}) {
  const roots = categories.filter((c) => c.parentId === null);
  const childrenByParent = new Map<number, CategoryNode[]>();
  for (const c of categories) {
    if (c.parentId !== null) {
      const list = childrenByParent.get(c.parentId) ?? [];
      list.push(c);
      childrenByParent.set(c.parentId, list);
    }
  }
  const findById = (id: number | null) => categories.find((c) => c.id === id);

  const current = value ? categories.find((c) => String(c.id) === value) : undefined;
  const currentParentId =
    current === undefined
      ? null
      : current.parentId !== null
        ? current.parentId
        : (childrenByParent.get(current.id) ?? []).length > 0
          ? null
          : current.id;

  const [parentOverride, setParentOverride] = useState<string | null>(null);
  const parentId = parentOverride ?? (currentParentId !== null ? String(currentParentId) : null);

  const parent = parentId ? findById(Number(parentId)) : undefined;
  const children = parent ? (childrenByParent.get(parent.id) ?? []) : [];
  const needsChild = children.length > 0;

  const childCurrent = current && current.parentId !== null ? String(current.id) : null;

  function handleParentChange(next: string | null) {
    setParentOverride(next);
    const nextParent = next ? findById(Number(next)) : undefined;
    const nextChildren = nextParent ? (childrenByParent.get(nextParent.id) ?? []) : [];
    if (nextParent && nextChildren.length === 0) {
      onChange(next);
    } else {
      onChange(null);
    }
  }

  function handleChildChange(next: string | null) {
    onChange(next);
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Category</Label>
        <Select value={parentId} onValueChange={handleParentChange}>
          <SelectTrigger
            className="w-full justify-between text-left"
            aria-invalid={invalid || undefined}
            aria-label="Category"
          >
            <SelectValue>
              {(value) => (
                <span>{value ? (findById(Number(value))?.name ?? "Select") : parent?.name ?? "Select a category"}</span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {roots.map((root) => (
              <SelectItem key={root.id} value={String(root.id)}>
                {root.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {needsChild ? (
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Subcategory</Label>
          <Select value={childCurrent} onValueChange={handleChildChange}>
            <SelectTrigger
              className="w-full justify-between text-left"
              aria-invalid={invalid || undefined}
              aria-label="Subcategory"
            >
              <SelectValue>
                {(value) => (
                  <span>
                    {value
                      ? (findById(Number(value))?.name ?? "Select")
                      : "Select company / type"}
                  </span>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {children.map((child) => (
                <SelectItem key={child.id} value={String(child.id)}>
                  {child.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}
    </div>
  );
}