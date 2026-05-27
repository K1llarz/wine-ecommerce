import Link from "next/link";
import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";

type ButtonProps = ComponentProps<typeof Button>;

/**
 * A Button that navigates. Renders as an anchor (<Link>) with correct button
 * styling and ARIA. `nativeButton={false}` tells Base UI the rendered element
 * is not a native <button>, preserving anchor semantics.
 */
export function ButtonLink({
  href,
  children,
  ...props
}: { href: string } & Omit<ButtonProps, "render">) {
  return (
    <Button render={<Link href={href} />} nativeButton={false} {...props}>
      {children}
    </Button>
  );
}
