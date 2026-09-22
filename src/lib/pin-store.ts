import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";

export const PIN_SETTING_KEY = "shop_pin";

/**
 * Persisted-PIN storage (kept separate from the session logic so it can be
 * tested without Next's request-scoped `cookies()`).
 *
 * The PIN set through the UI is stored in the `settings` table and takes
 * precedence over the SHOP_PIN environment seed.
 */
export async function getStoredPin(): Promise<string | null> {
  try {
    const [row] = await db
      .select({ value: settings.value })
      .from(settings)
      .where(eq(settings.key, PIN_SETTING_KEY))
      .limit(1);
    return row?.value ?? null;
  } catch {
    // settings table not present yet (e.g. a deploy before the schema update
    // landed) → fall back to the environment seed.
    return null;
  }
}

export async function storePin(pin: string): Promise<void> {
  await db
    .insert(settings)
    .values({ key: PIN_SETTING_KEY, value: pin })
    .onConflictDoUpdate({ target: settings.key, set: { value: pin } });
}