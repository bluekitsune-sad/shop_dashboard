"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PlusIcon, Loader2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createCategoryAction } from "@/app/(app)/inventory/categories/actions";
import type { CategoryNode } from "@/lib/db/repository";

export function CategoryManager({ categories }: { categories: CategoryNode[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const roots = categories.filter((c) => c.parentId === null);
  const childrenByParent = new Map<number, CategoryNode[]>();
  for (const c of categories) {
    if (c.parentId !== null) {
      const list = childrenByParent.get(c.parentId) ?? [];
      list.push(c);
      childrenByParent.set(c.parentId, list);
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createCategoryAction({ name, parentId: parentId ?? undefined });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      toast.success("Category created.");
      setName("");
      setParentId(null);
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{categories.length} categories</p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button size="sm" />}>
            <PlusIcon className="size-4" />
            Add Category
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={submit}>
              <DialogHeader>
                <DialogTitle>Add Category</DialogTitle>
                <DialogDescription>
                  Pick an existing group to add a subcategory, or leave it empty to create a top-level category.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="cat-name">Name</Label>
                  <Input
                    id="cat-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Smartwatch"
                    maxLength={80}
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label>Parent category</Label>
                  <Select value={parentId} onValueChange={setParentId}>
                    <SelectTrigger className="w-full justify-between text-left">
                      <SelectValue>
                        {(value) => (
                          <span>
                            {value
                              ? (roots.find((r) => String(r.id) === value)?.name ?? "Top-level (no parent)")
                              : "Top-level (no parent)"}
                          </span>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Top-level (no parent)</SelectItem>
                      {roots.map((r) => (
                        <SelectItem key={r.id} value={String(r.id)}>
                          {r.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending || !name.trim()}>
                  {isPending ? <Loader2Icon className="size-4 animate-spin" /> : <PlusIcon className="size-4" />}
                  Create Category
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="divide-y p-0">
          {roots.map((root) => {
            const children = childrenByParent.get(root.id) ?? [];
            return (
              <div key={root.id} className="p-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{root.name}</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {children.length} {children.length === 1 ? "sub" : "subs"}
                  </span>
                </div>
                {children.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {children.map((child) => (
                      <span key={child.id} className="rounded-full border bg-secondary px-2.5 py-0.5 text-xs">
                        {child.name}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}