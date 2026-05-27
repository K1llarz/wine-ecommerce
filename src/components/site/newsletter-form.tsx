"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { subscribeToNewsletter, type NewsletterResult } from "@/app/actions/newsletter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="shrink-0">
      {pending ? "Joining…" : "Subscribe"}
    </Button>
  );
}

export function NewsletterForm({ idPrefix = "newsletter" }: { idPrefix?: string }) {
  const [state, formAction] = useActionState<NewsletterResult | null, FormData>(
    subscribeToNewsletter,
    null,
  );
  const emailId = `${idPrefix}-email`;
  const statusId = `${idPrefix}-status`;

  return (
    <div>
      <form action={formAction} className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor={emailId} className="sr-only">
          Email address
        </label>
        <Input
          id={emailId}
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          autoComplete="email"
          className="sm:max-w-xs"
          aria-describedby={statusId}
        />
        <SubmitButton />
      </form>
      <p
        id={statusId}
        role="status"
        aria-live="polite"
        className={`mt-2 min-h-5 text-sm ${
          state ? (state.ok ? "text-gold" : "text-destructive") : "text-transparent"
        }`}
      >
        {state?.message ?? "placeholder"}
      </p>
    </div>
  );
}
