import Link from "next/link";
import { siteConfig, footerNav } from "@/lib/site";
import { NewsletterForm } from "@/components/site/newsletter-form";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-sm">
            <h2 className="font-heading text-2xl font-semibold">
              {siteConfig.name}
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              {siteConfig.description}
            </p>
            <div className="mt-6">
              <p className="eyebrow mb-3">Join the cellar list</p>
              <NewsletterForm idPrefix="footer-newsletter" />
            </div>
          </div>

          {footerNav.map((group) => (
            <div key={group.title}>
              <p className="eyebrow mb-4">{group.title}</p>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-burgundy"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <p>
            Please enjoy responsibly. You must be of legal drinking age to
            purchase. Shipping restrictions apply by region.
          </p>
        </div>
      </div>
    </footer>
  );
}
