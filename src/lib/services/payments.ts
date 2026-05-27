import "server-only";

// Payment provider seam. The app talks to this interface; swap the stub for a
// real Stripe implementation by adding a StripePaymentProvider and selecting it
// via PAYMENTS_PROVIDER=stripe (see ./index.ts).

export type PaymentIntent = {
  id: string;
  clientSecret: string;
  amountCents: number;
  currency: string;
  status: "requires_payment_method" | "processing" | "succeeded" | "canceled";
};

export type CreateIntentInput = {
  amountCents: number;
  currency?: string;
  metadata?: Record<string, string>;
};

export interface PaymentProvider {
  readonly name: string;
  createPaymentIntent(input: CreateIntentInput): Promise<PaymentIntent>;
  retrievePaymentIntent(id: string): Promise<PaymentIntent>;
  refund(input: { paymentIntentId: string; amountCents?: number }): Promise<{
    id: string;
    status: "succeeded" | "pending" | "failed";
  }>;
}

const rand = () => Math.random().toString(36).slice(2, 12);

/** In-memory stub. Pretends every payment succeeds. No network calls. */
export class StubPaymentProvider implements PaymentProvider {
  readonly name = "stub";

  async createPaymentIntent(input: CreateIntentInput): Promise<PaymentIntent> {
    const id = `pi_stub_${rand()}`;
    console.info(`[payments:stub] createPaymentIntent ${input.amountCents} ${input.currency ?? "USD"}`);
    return {
      id,
      clientSecret: `${id}_secret_${rand()}`,
      amountCents: input.amountCents,
      currency: input.currency ?? "USD",
      status: "requires_payment_method",
    };
  }

  async retrievePaymentIntent(id: string): Promise<PaymentIntent> {
    return {
      id,
      clientSecret: `${id}_secret_${rand()}`,
      amountCents: 0,
      currency: "USD",
      status: "succeeded",
    };
  }

  async refund(input: { paymentIntentId: string; amountCents?: number }) {
    console.info(`[payments:stub] refund ${input.paymentIntentId}`);
    return { id: `re_stub_${rand()}`, status: "succeeded" as const };
  }
}
