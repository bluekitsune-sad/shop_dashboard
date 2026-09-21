import { PackagePlusIcon, ShieldCheckIcon } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Get a quick view of your shop&apos;s inventory.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <CardDescription>Metric</CardDescription>
              <CardTitle className="text-3xl">—</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheckIcon className="size-4 text-muted-foreground" />
            Milestone 1 ready — monitoring coming in Milestone 7
          </CardTitle>
          <CardDescription>
            The database is connected and categories are seeded. Summary cards, low-stock alerts, and recent
            activity will appear here once products and inventory are live.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button size="lg" render={<Link href="/inventory" />}>
            <PackagePlusIcon className="size-4" />
            Go to Inventory
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}