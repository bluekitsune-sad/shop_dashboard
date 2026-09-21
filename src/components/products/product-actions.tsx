"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArchiveIcon, PencilIcon, Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { archiveProductAction } from "@/app/(app)/inventory/actions";

export function ProductActions({
  productId,
  initialArchived,
}: {
  productId: number;
  initialArchived: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);

  function toggleArchive() {
    startTransition(async () => {
      const result = await archiveProductAction(productId, !initialArchived);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setConfirmOpen(false);
      toast.success(initialArchived ? "Product restored to inventory." : "Product archived.");
      if (!initialArchived) {
        router.push("/inventory");
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        render={<a href={`/inventory/${productId}/edit`} />}
      >
        <PencilIcon className="size-4" />
        Edit
      </Button>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogTrigger render={<Button variant={initialArchived ? "outline" : "destructive"} size="sm" />}>
          {initialArchived ? <ArchiveIcon className="size-4" /> : <Trash2Icon className="size-4" />}
          {initialArchived ? "Restore" : "Archive"}
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{initialArchived ? "Restore this product?" : "Archive this product?"}</DialogTitle>
            <DialogDescription>
              {initialArchived
                ? "The product will appear in inventory again. Its history is kept."
                : "The product stays in the database and its history is kept, but it is hidden from inventory."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button variant={initialArchived ? "default" : "destructive"} onClick={toggleArchive} disabled={isPending}>
              {isPending ? "Saving..." : initialArchived ? "Restore" : "Archive"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}