import "server-only";

// Email provider seam. Swap the stub for Resend/SendGrid by implementing this
// interface and selecting it via EMAIL_PROVIDER (see ./index.ts).

export type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
};

export interface EmailProvider {
  readonly name: string;
  send(message: EmailMessage): Promise<{ id: string }>;
}

/** Logs the email to the server console instead of sending it. */
export class StubEmailProvider implements EmailProvider {
  readonly name = "stub";

  async send(message: EmailMessage): Promise<{ id: string }> {
    console.info(
      `[email:stub] To: ${message.to} | Subject: ${message.subject}\n${message.text ?? message.html}`,
    );
    return { id: `email_stub_${Math.random().toString(36).slice(2, 12)}` };
  }
}
