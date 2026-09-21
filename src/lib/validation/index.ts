import { z } from "zod";

const optionalText = (max: number, message: string) =>
  z
    .string()
    .trim()
    .max(max, message)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined));

const ruipesPositiveInt = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `Select a ${label}`)
    .transform((v) => Number(v))
    .refine((n) => Number.isInteger(n) && n > 0, { message: `Select a valid ${label}` });

/**
 * Numeric fields are entered as strings by HTML inputs and parsed server-side.
 * Validating from strings keeps the RHF input type exact and matches the
 * browser behaviour (empty field → "" instead of an unhelpful NaN).
 */
const rupeesInput = (label: string, extra?: (n: number) => boolean, extraMessage?: string) =>
  z
    .string()
    .trim()
    .min(1, `Enter a valid ${label}`)
    .transform((v) => Number(v))
    .refine((n) => Number.isFinite(n), { message: `Enter a valid ${label}` })
    .refine((n) => n >= 0, { message: `${label} cannot be negative` })
    .refine((n) => n <= 1_000_000_000, { message: `${label} is too large` })
    .refine((n) => !extra || extra(n), { message: extraMessage ?? `Enter a valid ${label}` });

export const productFormSchema = z.object({
  name: z.string().trim().min(1, "Product name is required").max(200, "Keep the name under 200 characters"),
  categoryId: ruipesPositiveInt("category"),
  brand: optionalText(120, "Keep the brand under 120 characters"),
  sku: optionalText(80, "Keep the SKU under 80 characters"),
  /** Prices are entered in whole rupees and converted to paisa when stored. */
  purchasePrice: rupeesInput("purchase price"),
  sellingPrice: rupeesInput("selling price"),
  stockQuantity: rupeesInput("quantity", (n) => Number.isInteger(n), "Quantity must be a whole number"),
  minimumStock: rupeesInput("minimum stock", (n) => Number.isInteger(n), "Minimum stock must be a whole number"),
  imageUrl: optionalText(500, "Image URLs must be under 500 characters"),
  notes: optionalText(2000, "Notes must be under 2000 characters"),
});

export type ProductFormValues = z.input<typeof productFormSchema>;
export type ProductFormOutput = z.output<typeof productFormSchema>;

export const categoryFormSchema = z.object({
  name: z.string().trim().min(1, "Category name is required").max(80, "Keep the name under 80 characters"),
  parentId: z
    .string()
    .optional()
    .transform((v) => (v && v.length > 0 ? Number(v) : undefined))
    .refine((v) => v === undefined || (Number.isInteger(v) && v > 0), { message: "Select a valid parent category" }),
});

export type CategoryFormValues = z.input<typeof categoryFormSchema>;
export type CategoryFormOutput = z.output<typeof categoryFormSchema>;