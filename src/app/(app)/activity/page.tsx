import Link from "next/link";
import { HistoryIcon } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { listMovements } from "@/lib/db/repository";
import { formatMoney } from "@/lib/money";
import { formatActivityDate } from "@/lib/time";
import { MOVEMENT_TYPE_LABELS, signedQuantity } from "@/lib/movements";

export const dynamic = "force-dynamic";

export const metadata = { title: "Activity" };

export default async function ActivityPage() {
  const rows = await listMovements({ limit: 100 });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Activity</h1>
        <p className="text-sm text-muted-foreground">
          A running history of stock and sale movements across your shop.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <HistoryIcon className="size-4 text-muted-foreground" />
            Inventory movements
          </CardTitle>
          <CardDescription>{rows.length === 100 ? "Showing the latest 100 entries." : `${rows.length} entries.`}</CardDescription>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
              <p className="text-sm font-medium">No inventory activity yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Adding products and recording sales will show up here.
              </p>
            </div>
          ) : (
            <ul className="divide-y">
              {rows.map(({ movement, productName }) => (
                <li key={movement.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Badge
                      variant="outline"
                      className={
                        movement.type === "SOLD"
                          ? "shrink-0 text-destructive"
                          : movement.type === "STOCK_ADDED"
                            ? "shrink-0 text-emerald-600"
                            : "shrink-0 text-muted-foreground"
                      }
                    >
                      {signedQuantity(movement.quantity)}
                    </Badge>
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        <Link href={`/inventory/${movement.productId}`} className="hover:underline">
                          {productName}
                        </Link>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {MOVEMENT_TYPE_LABELS[movement.type]}
                        {movement.reason ? ` — ${movement.reason}` : ""}
                        {movement.unitPrice !== null ? ` · ${formatMoney(movement.unitPrice)}/unit` : ""}
                      </p>
                    </div>
                  </div>
                  <time className="shrink-0 text-sm text-muted-foreground">
                    {formatActivityDate(movement.createdAt.getTime())}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}