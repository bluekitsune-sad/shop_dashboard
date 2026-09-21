"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createProduct, setProductArchived, updateProduct } from "@/lib/db/repository";
import { productFormSchema } from "@/lib/validation";

export type ActionResult = { ok: true } | { ok: false; error: string };

function firstError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Please check the form and try again.";
}

export async function createProductAction(input: unknown): Promise<ActionResult> {
  const parsed = productFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: firstError(parsed.error) };
  }
  try {
    await createProduct(parsed.data);
    revalidatePath("/inventory");
    revalidatePath("/");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: messageFrom(err) };
  }
}

export async function updateProductAction(id: number, input: unknown): Promise<ActionResult> {
  const parsed = productFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: firstError(parsed.error) };
  }
  try {
    await updateProduct(id, parsed.data);
    revalidatePath(`/inventory/${id}`);
    revalidatePath("/inventory");
    revalidatePath("/");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: messageFrom(err) };
  }
}

export async function archiveProductAction(id: number, archived: boolean): Promise<ActionResult> {
  try {
    await setProductArchived(id, archived);
    revalidatePath("/inventory");
    revalidatePath("/");
    if (archived) {
      revalidatePath(`/inventory/${id}`);
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: messageFrom(err) };
  }
}

function messageFrom(err: unknown): string {
  if (err instanceof Error) {
    return err.message;
  }
  return "Something went wrong. Please try again.";
}