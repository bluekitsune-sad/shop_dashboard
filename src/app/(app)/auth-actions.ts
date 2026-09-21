"use server";

import { clearSession, getPin, setSession } from "@/lib/auth";

export type LoginState = { error?: string };

export async function login(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const entered = String(formData.get("pin") ?? "").trim();

  if (!entered || entered !== getPin()) {
    return { error: "Incorrect PIN. Please try again." };
  }

  await setSession();
  return {};
}

export async function logout(): Promise<void> {
  await clearSession();
}