"use server";

import { revalidatePath } from "next/cache";

import { clearSession, getPin, setPin, setSession } from "@/lib/auth";
import { pinChangeSchema } from "@/lib/validation";

export type LoginState = { error?: string };

export async function login(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const entered = String(formData.get("pin") ?? "").trim();

  if (!entered || entered !== (await getPin())) {
    return { error: "Incorrect PIN. Please try again." };
  }

  await setSession();
  return {};
}

export async function logout(): Promise<void> {
  await clearSession();
}

export type ChangePinState = { error?: string; ok?: boolean };

export async function changePin(
  prevState: ChangePinState,
  formData: FormData,
): Promise<ChangePinState> {
  const parsed = pinChangeSchema.safeParse({
    currentPin: formData.get("currentPin"),
    newPin: formData.get("newPin"),
    confirmPin: formData.get("confirmPin"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the PIN and try again." };
  }

  if (parsed.data.currentPin !== (await getPin())) {
    return { error: "Current PIN is incorrect." };
  }

  await setPin(parsed.data.newPin);
  // Issue a fresh session cookie for the new PIN so the change doesn't log
  // the user out on their next request.
  await setSession();
  revalidatePath("/settings");
  return { ok: true };
}