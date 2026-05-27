"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartLine = {
  productId: string;
  slug: string;
  name: string;
  priceCents: number;
  image: string;
  maxQuantity: number;
  quantity: number;
};

type CartState = {
  items: CartLine[];
  add: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (line, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === line.productId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === line.productId
                  ? { ...i, quantity: clamp(i.quantity + quantity, 1, i.maxQuantity) }
                  : i,
              ),
            };
          }
          return {
            items: [
              ...state.items,
              { ...line, quantity: clamp(quantity, 1, line.maxQuantity) },
            ],
          };
        }),
      setQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId
              ? { ...i, quantity: clamp(quantity, 1, i.maxQuantity) }
              : i,
          ),
        })),
      remove: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: "mdv-cart" },
  ),
);

export const cartCount = (items: CartLine[]) =>
  items.reduce((sum, i) => sum + i.quantity, 0);

export const cartSubtotal = (items: CartLine[]) =>
  items.reduce((sum, i) => sum + i.quantity * i.priceCents, 0);
