import { SellProduct } from "@/components/sell/sell-product";
import { listProductsForSell } from "@/lib/db/repository";

export const dynamic = "force-dynamic";

export const metadata = { title: "Sell" };

export default async function SellPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string }>;
}) {
  const params = await searchParams;
  const productId = params.product ? Number(params.product) || null : null;
  const products = await listProductsForSell();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Sell</h1>
        <p className="text-sm text-muted-foreground">
          Record a sale quickly — stock adjusts and activity is logged automatically.
        </p>
      </div>

      <SellProduct products={products} initialProductId={productId} />
    </div>
  );
}