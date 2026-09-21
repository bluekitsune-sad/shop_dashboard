/**
 * Seeds the initial top-level categories and their subcategories.
 * Idempotent: skips categories that already exist.
 * Run with: npm run db:seed
 */
import { inArray } from "drizzle-orm";

import { INITIAL_CATEGORIES } from "@/lib/constants";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";

async function seed() {
  const existing = await db.select({ id: categories.id, name: categories.name }).from(categories);

  let created = 0;

  for (const root of INITIAL_CATEGORIES) {
    let rootId = existing.find((c) => c.name === root.name)?.id;
    if (!rootId) {
      const inserted = await db
        .insert(categories)
        .values({ name: root.name })
        .onConflictDoNothing()
        .returning({ id: categories.id });
      rootId = inserted[0]?.id;
      created++;
    }
    if (!rootId) continue;

    const existingChildren = await db
      .select({ name: categories.name })
      .from(categories)
      .where(inArray(categories.name, root.children ?? []));

    for (const childName of root.children ?? []) {
      if (existingChildren.some((c) => c.name === childName)) continue;
      await db.insert(categories).values({ name: childName, parentId: rootId }).onConflictDoNothing();
      created++;
    }
  }

  console.log(`Seed complete. ${created} categories created.`);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});