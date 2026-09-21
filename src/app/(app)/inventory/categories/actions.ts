"use server";

import { revalidatePath } from "next/cache";
import { and, eq, isNull } from "drizzle-orm";

import { categoryFormSchema } from "@/lib/validation";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function createCategoryAction(input: unknown): Promise<ActionResult> {
  const parsed = categoryFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Please check the form and try again.",
    };
  }

  const { name, parentId } = parsed.data;

  try {
    const existing = await db
      .select({ id: categories.id })
      .from(categories)
      .where(
        and(
          eq(categories.name, name),
          parentId ? eq(categories.parentId, parentId) : isNull(categories.parentId),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      return { ok: false, error: "A category with this name already exists here." };
    }

    await db.insert(categories).values({ name, parentId: parentId ?? null });

    revalidatePath("/inventory/categories");
    revalidatePath("/inventory");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Could not create the category." };
  }
}