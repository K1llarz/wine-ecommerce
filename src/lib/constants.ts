// Single source of truth for the "enum-like" string columns in the Prisma
// schema. SQLite has no native enums, so these arrays back both the TypeScript
// union types and the Zod validators used at the app boundary.

export const USER_ROLES = [
  "CUSTOMER",
  "INVENTORY_STAFF",
  "MANAGER",
  "SUPER_ADMIN",
] as const;
export type UserRole = (typeof USER_ROLES)[number];

/** Roles allowed to access the admin dashboard. */
export const ADMIN_ROLES: readonly UserRole[] = [
  "INVENTORY_STAFF",
  "MANAGER",
  "SUPER_ADMIN",
];

export const ADDRESS_TYPES = ["SHIPPING", "BILLING"] as const;
export type AddressType = (typeof ADDRESS_TYPES)[number];

export const WINE_TYPES = [
  "Red",
  "White",
  "Rosé",
  "Sparkling",
  "Dessert",
  "Fortified",
] as const;
export type WineType = (typeof WINE_TYPES)[number];

export const WINE_BODY = ["LIGHT", "MEDIUM", "FULL"] as const;
export type WineBody = (typeof WINE_BODY)[number];

export const WINE_SWEETNESS = ["DRY", "OFF_DRY", "MEDIUM", "SWEET"] as const;
export type WineSweetness = (typeof WINE_SWEETNESS)[number];

export const WINE_ACIDITY = ["LOW", "MEDIUM", "HIGH"] as const;
export type WineAcidity = (typeof WINE_ACIDITY)[number];

export const PRODUCT_STATUS = ["DRAFT", "ACTIVE", "ARCHIVED"] as const;
export type ProductStatus = (typeof PRODUCT_STATUS)[number];

export const ORDER_STATUS = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;
export type OrderStatus = (typeof ORDER_STATUS)[number];

export const PAYMENT_STATUS = [
  "UNPAID",
  "PAID",
  "REFUNDED",
  "PARTIALLY_REFUNDED",
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUS)[number];

export const REVIEW_STATUS = ["PENDING", "APPROVED", "REJECTED"] as const;
export type ReviewStatus = (typeof REVIEW_STATUS)[number];

export const INVENTORY_REASONS = [
  "RESTOCK",
  "SALE",
  "ADJUSTMENT",
  "RETURN",
  "DAMAGE",
] as const;
export type InventoryReason = (typeof INVENTORY_REASONS)[number];

// Minimum purchase age by country (ISO code). Used by the age-gate and, later,
// shipping eligibility checks.
export const MINIMUM_AGE_BY_COUNTRY: Record<string, number> = {
  US: 21,
  DEFAULT: 18,
};

export function minimumAgeForCountry(country = "DEFAULT"): number {
  return MINIMUM_AGE_BY_COUNTRY[country] ?? MINIMUM_AGE_BY_COUNTRY.DEFAULT;
}

export const DEFAULT_CURRENCY = "USD";
export const FOOD_PAIRING_DELIMITER = "|";
