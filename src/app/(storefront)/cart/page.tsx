import type { Metadata } from "next";
import { CartView } from "@/components/site/cart-view";

export const metadata: Metadata = {
  title: "Your Cart",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-heading text-4xl font-semibold">Your cart</h1>
      <div className="mt-8">
        <CartView />
      </div>
    </div>
  );
}
