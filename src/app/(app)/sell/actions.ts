"use server";

import { revalidatePath } from "next/cache";

import { sellProduct } from "@/lib/db/repository";
import { sellFormSchema } from "@/lib/validation";
import { paisaFromRupees } from "@/lib/money";

export type SellActionResult = { ok: true } | { ok: false; error: string };

export async function sellProductAction(input: unknown): Promise<SellActionResult> {
  const parsed = sellFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check the sale and try again." };
  }

  try {
    await sellProduct(
      parsed.data.productId,
      parsed.data.quantity,
      paisaFromRupees(parsed.data.unitPrice),
    );
    revalidatePath("/");
    revalidatePath("/inventory");
    revalidatePath(`/inventory/${parsed.data.productId}`);
    revalidatePath("/sell");
    revalidatePath("/activity");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not complete the sale. Please try again.",
    };
  }
}