"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * Returns false during SSR and the first client render, then true once
 * hydrated. Hydration-aware (no setState-in-effect, no hydration warnings) —
 * use to gate rendering of client-only state such as a persisted store.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
