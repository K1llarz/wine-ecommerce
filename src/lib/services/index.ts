import "server-only";
import { type PaymentProvider, StubPaymentProvider } from "./payments";
import { type EmailProvider, StubEmailProvider } from "./email";
import { type StorageProvider, StubStorageProvider } from "./storage";

// Provider selection happens once at module load based on env flags. Real
// implementations (Stripe / Resend / S3) can be added behind the same
// interfaces and selected here without touching call sites.

function selectPayments(): PaymentProvider {
  switch (process.env.PAYMENTS_PROVIDER) {
    case "stripe":
      throw new Error(
        "Stripe payments not implemented yet. Add a StripePaymentProvider in src/lib/services/payments.ts.",
      );
    case "stub":
    default:
      return new StubPaymentProvider();
  }
}

function selectEmail(): EmailProvider {
  switch (process.env.EMAIL_PROVIDER) {
    case "resend":
    case "sendgrid":
      throw new Error(
        `Email provider "${process.env.EMAIL_PROVIDER}" not implemented yet. Add it in src/lib/services/email.ts.`,
      );
    case "stub":
    default:
      return new StubEmailProvider();
  }
}

function selectStorage(): StorageProvider {
  switch (process.env.STORAGE_PROVIDER) {
    case "s3":
    case "cloudinary":
      throw new Error(
        `Storage provider "${process.env.STORAGE_PROVIDER}" not implemented yet. Add it in src/lib/services/storage.ts.`,
      );
    case "stub":
    default:
      return new StubStorageProvider();
  }
}

export const payments = selectPayments();
export const email = selectEmail();
export const storage = selectStorage();

export type { PaymentProvider } from "./payments";
export type { EmailProvider } from "./email";
export type { StorageProvider } from "./storage";
