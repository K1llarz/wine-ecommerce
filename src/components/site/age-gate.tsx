"use client";

import { useEffect, useRef, useState } from "react";
import { siteConfig } from "@/lib/site";
import { useHydrated } from "@/lib/use-hydrated";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "mdv-age-verified";

function isVerified(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function AgeGate() {
  const hydrated = useHydrated();
  const [dismissed, setDismissed] = useState(false);
  const [declined, setDeclined] = useState(false);
  const confirmRef = useRef<HTMLButtonElement>(null);

  const open = hydrated && !dismissed && !isVerified();

  useEffect(() => {
    if (open && !declined) confirmRef.current?.focus();
  }, [open, declined]);

  if (!open) return null;

  function confirm() {
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      /* storage may be unavailable; still allow entry for this session */
    }
    setDismissed(true);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
      aria-describedby="age-gate-desc"
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 text-center shadow-2xl">
        <p className="eyebrow mb-3">{siteConfig.name}</p>
        {declined ? (
          <>
            <h2 id="age-gate-title" className="text-2xl">
              Come back soon
            </h2>
            <p id="age-gate-desc" className="mt-3 text-sm text-muted-foreground">
              We&apos;re sorry — you must be of legal drinking age to enter this
              site.
            </p>
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => setDeclined(false)}
            >
              Go back
            </Button>
          </>
        ) : (
          <>
            <h2 id="age-gate-title" className="text-2xl">
              Are you of legal drinking age?
            </h2>
            <p id="age-gate-desc" className="mt-3 text-sm text-muted-foreground">
              You must be 21 or older (18+ in many countries) to browse and
              purchase wine. Please verify your age to continue.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button ref={confirmRef} onClick={confirm}>
                Yes, I&apos;m of age
              </Button>
              <Button variant="outline" onClick={() => setDeclined(true)}>
                No
              </Button>
            </div>
            <p className="mt-5 text-xs text-muted-foreground">
              By entering you accept our Terms of Service and Privacy Policy.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
