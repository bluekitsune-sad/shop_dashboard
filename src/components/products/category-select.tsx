"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CategoryNode } from "@/lib/db/repository";

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

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full text-left" aria-invalid={invalid || undefined}>
        <SelectValue placeholder="Select a category" />
      </SelectTrigger>
      <SelectContent>
        {roots.map((root) => {
          const children = childrenByParent.get(root.id) ?? [];
          if (children.length === 0) {
            return (
              <SelectItem key={root.id} value={String(root.id)}>
                {root.name}
              </SelectItem>
            );
          }
          return (
            <SelectGroup key={root.id}>
              <SelectLabel>{root.name}:</SelectLabel>
              {children.map((child) => (
                <SelectItem key={child.id} value={String(child.id)}>
                  {child.name}
                </SelectItem>
              ))}
            </SelectGroup>
          );
        })}
      </SelectContent>
    </Select>
  );
}