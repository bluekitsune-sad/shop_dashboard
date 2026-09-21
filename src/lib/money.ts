/**
 * Money is stored as integer minor units (paisa) to avoid floating-point errors.
 * 1 PKR = 100 paisa.
 */
export const MINOR_UNIT = 100;
export const CURRENCY_CODE = "PKR";
export const CURRENCY_SYMBOL = "Rs";

/** Convert a whole-rupee amount (as entered in a form) to paisa. */
export function paisaFromRupees(rupees: number): number {
  return Math.round(rupees * MINOR_UNIT);
}

/** Convert paisa back to whole rupees (for form fields). */
export function rupeesFromPaisa(paisa: number): number {
  return paisa / MINOR_UNIT;
}

/** Format paisa as a readable PKR string, e.g. Rs 1,250 or Rs 1,250.50. */
export function formatMoney(paisa: number): string {
  const amount = paisa / MINOR_UNIT;
  const hasFractional = Math.round(amount * MINOR_UNIT) % MINOR_UNIT !== 0;
  const formatted = amount.toLocaleString("en-PK", {
    minimumFractionDigits: hasFractional ? 2 : 0,
    maximumFractionDigits: 2,
  });
  return `${CURRENCY_SYMBOL} ${formatted}`;
}