export const siteConfig = {
  name: "Maison du Vin",
  shortName: "Maison",
  tagline: "Curated fine wine, delivered",
  description:
    "A curated wine boutique — structured reds, mineral whites, grower Champagne and rare fortified wines, hand-selected from the world's great cellars.",
  url: "https://maisonduvin.example",
};

/** Primary storefront navigation. */
export const mainNav: { label: string; href: string }[] = [
  { label: "All Wines", href: "/wines" },
  { label: "Red", href: "/wines?type=red" },
  { label: "White", href: "/wines?type=white" },
  { label: "Sparkling", href: "/wines?type=sparkling" },
  { label: "Rosé", href: "/wines?type=rose" },
  { label: "Regions", href: "/#regions" },
];

export const footerNav: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Shop",
    links: [
      { label: "All Wines", href: "/wines" },
      { label: "Red", href: "/wines?type=red" },
      { label: "White", href: "/wines?type=white" },
      { label: "Sparkling", href: "/wines?type=sparkling" },
      { label: "Dessert & Fortified", href: "/wines?type=dessert" },
    ],
  },
  {
    title: "Maison",
    links: [
      { label: "Our Story", href: "/about" },
      { label: "Wine of the Month", href: "/#wine-of-the-month" },
      { label: "Account", href: "/account" },
      { label: "Order Tracking", href: "/account/orders" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Shipping & Returns", href: "/shipping" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Contact", href: "/contact" },
    ],
  },
];
