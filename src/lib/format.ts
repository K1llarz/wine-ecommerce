import { DEFAULT_CURRENCY, FOOD_PAIRING_DELIMITER } from "@/lib/constants";

/** Format integer cents as a localized currency string, e.g. 4599 -> "$45.99". */
export function formatPrice(
  cents: number,
  currency: string = DEFAULT_CURRENCY,
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

/** Convert a decimal amount (e.g. 45.99) to integer cents. */
export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

/** URL-safe slug, e.g. "Châteauneuf-du-Pape 2019" -> "chateauneuf-du-pape-2019". */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip combining diacritical marks
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function serializeFoodPairings(pairings: string[]): string {
  return pairings
    .map((p) => p.trim())
    .filter(Boolean)
    .join(FOOD_PAIRING_DELIMITER);
}

export function parseFoodPairings(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split(FOOD_PAIRING_DELIMITER)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function vintageLabel(vintage: number | null | undefined): string {
  return vintage ? String(vintage) : "NV";
}
