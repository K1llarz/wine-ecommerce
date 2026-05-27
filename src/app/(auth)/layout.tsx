import Link from "next/link";
import { siteConfig } from "@/lib/site";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-secondary/60 to-background px-4 py-12">
      <Link href="/" className="mb-8 flex flex-col items-center text-center">
        <span className="font-heading text-3xl font-semibold">{siteConfig.name}</span>
        <span className="mt-1 text-[0.6rem] tracking-[0.25em] text-muted-foreground uppercase">
          {siteConfig.tagline}
        </span>
      </Link>
      <div className="w-full max-w-md">{children}</div>
      <p className="mt-8 max-w-md text-center text-xs text-muted-foreground">
        By continuing you confirm you are of legal drinking age and agree to our{" "}
        <Link href="/terms" className="underline underline-offset-2 hover:text-foreground">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
