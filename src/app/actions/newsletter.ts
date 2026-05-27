"use server";

import { z } from "zod";
import { db } from "@/lib/db";

const schema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

export type NewsletterResult = { ok: boolean; message: string };

export async function subscribeToNewsletter(
  _prev: NewsletterResult | null,
  formData: FormData,
): Promise<NewsletterResult> {
  const parsed = schema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid email." };
  }

  const email = parsed.data.email.toLowerCase();
  try {
    await db.newsletterSubscriber.upsert({
      where: { email },
      create: { email },
      update: {},
    });
    return { ok: true, message: "You're on the list. Welcome to the Maison." };
  } catch {
    return { ok: false, message: "Something went wrong. Please try again." };
  }
}
