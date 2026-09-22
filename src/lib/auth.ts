import { createHash } from "node:crypto";

import { cookies } from "next/headers";

import { getStoredPin, storePin } from "@/lib/pin-store";

export const AUTH_COOKIE_NAME = "shop_auth";
const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const PIN_SECRET = "shop-dashboard";

/**
 * Lightweight PIN gate. The PIN is a number of 1–6 digits. It can be changed
 * from the Settings page (persisted in the `settings` table); until then the
 * SHOP_PIN environment variable is the seed value. The session cookie stores
 * an HMAC-style hash of the PIN so the raw PIN is never exposed and the cookie
 * cannot be forged without knowing the PIN.
 */
export async function getPin(): Promise<string> {
  const stored = await getStoredPin();
  if (stored) return stored;
  const pin = process.env.SHOP_PIN;
  if (!pin) {
    throw new Error("SHOP_PIN environment variable is not set");
  }
  return pin;
}

export async function setPin(pin: string): Promise<void> {
  await storePin(pin);
}

export function pinToken(pin: string): string {
  return createHash("sha256").update(`${PIN_SECRET}:${pin}`).digest("hex");
}

export async function hasValidSession(): Promise<boolean> {
  try {
    const store = await cookies();
    const value = store.get(AUTH_COOKIE_NAME)?.value;
    return Boolean(value) && value === pinToken(await getPin());
  } catch {
    return false;
  }
}

export async function setSession(): Promise<void> {
  const store = await cookies();
  store.set(AUTH_COOKIE_NAME, pinToken(await getPin()), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: AUTH_COOKIE_MAX_AGE,
  });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(AUTH_COOKIE_NAME);
}