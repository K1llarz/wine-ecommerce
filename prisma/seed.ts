import "dotenv/config";
import path from "node:path";
import bcrypt from "bcryptjs";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

// ── DB connection (mirrors src/lib/db.ts; kept self-contained so the seed runs
// under tsx without TS path-alias resolution) ────────────────────────────────
function resolveSqlitePath(url: string | undefined): string {
  const raw = (url ?? "file:./prisma/dev.db").replace(/^file:/, "");
  if (raw === ":memory:") return raw;
  return path.resolve(process.cwd(), raw);
}
const adapter = new PrismaBetterSqlite3({
  url: resolveSqlitePath(process.env.DATABASE_URL),
});
const db = new PrismaClient({ adapter });

// ── tiny helpers (inlined to avoid alias imports) ─────────────────────────────
const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
const pairings = (...items: string[]) => items.join("|");

// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log("Resetting existing data…");
  // Delete in FK-dependency order.
  await db.inventoryLog.deleteMany();
  await db.orderItem.deleteMany();
  await db.order.deleteMany();
  await db.cartItem.deleteMany();
  await db.wishlistItem.deleteMany();
  await db.review.deleteMany();
  await db.productVarietal.deleteMany();
  await db.productImage.deleteMany();
  await db.product.deleteMany();
  await db.grapeVarietal.deleteMany();
  await db.region.deleteMany();
  await db.category.deleteMany();
  await db.oAuthAccount.deleteMany();
  await db.address.deleteMany();
  await db.newsletterSubscriber.deleteMany();
  await db.user.deleteMany();

  // ── Categories (wine types) ────────────────────────────────────────────────
  console.log("Seeding categories…");
  const categoryData = [
    { name: "Red", description: "Structured, age-worthy reds from the world's great cellars.", sortOrder: 1 },
    { name: "White", description: "Crisp, mineral and aromatic whites for every table.", sortOrder: 2 },
    { name: "Rosé", description: "Pale, dry and elegant rosés.", sortOrder: 3 },
    { name: "Sparkling", description: "Champagne and traditional-method sparkling wines.", sortOrder: 4 },
    { name: "Dessert", description: "Luscious sweet wines to close the evening.", sortOrder: 5 },
    { name: "Fortified", description: "Port, sherry and other fortified classics.", sortOrder: 6 },
  ];
  const categories: Record<string, string> = {};
  for (const c of categoryData) {
    const slug = slugify(c.name);
    const cat = await db.category.create({
      data: { ...c, slug, imageUrl: `/wines/${slug}.svg` },
    });
    categories[c.name] = cat.id;
  }
  const imageFor = (categoryName: string) =>
    `/wines/${slugify(categoryName)}.svg`;

  // ── Regions ─────────────────────────────────────────────────────────────────
  console.log("Seeding regions…");
  const regionData = [
    { name: "Bordeaux", country: "France" },
    { name: "Burgundy", country: "France" },
    { name: "Champagne", country: "France" },
    { name: "Rhône Valley", country: "France" },
    { name: "Loire Valley", country: "France" },
    { name: "Provence", country: "France" },
    { name: "Tuscany", country: "Italy" },
    { name: "Piedmont", country: "Italy" },
    { name: "Veneto", country: "Italy" },
    { name: "Rioja", country: "Spain" },
    { name: "Jerez", country: "Spain" },
    { name: "Kakheti", country: "Georgia" },
    { name: "Napa Valley", country: "United States" },
    { name: "Mendoza", country: "Argentina" },
    { name: "Mosel", country: "Germany" },
    { name: "Douro", country: "Portugal" },
    { name: "Marlborough", country: "New Zealand" },
  ];
  const regions: Record<string, string> = {};
  for (const r of regionData) {
    const reg = await db.region.create({
      data: { ...r, slug: slugify(`${r.name}-${r.country}`) },
    });
    regions[r.name] = reg.id;
  }

  // ── Grape varietals ───────────────────────────────────────────────────────
  console.log("Seeding grape varietals…");
  const varietalNames = [
    "Cabernet Sauvignon", "Merlot", "Pinot Noir", "Syrah", "Grenache",
    "Sangiovese", "Nebbiolo", "Tempranillo", "Malbec", "Saperavi",
    "Chardonnay", "Sauvignon Blanc", "Riesling", "Rkatsiteli", "Glera",
    "Sémillon", "Touriga Nacional", "Palomino",
  ];
  const varietals: Record<string, string> = {};
  for (const name of varietalNames) {
    const v = await db.grapeVarietal.create({
      data: { name, slug: slugify(name) },
    });
    varietals[name] = v.id;
  }

  // ── Products ────────────────────────────────────────────────────────────────
  console.log("Seeding products…");
  type SeedProduct = {
    name: string;
    sku: string;
    category: string;
    region: string;
    producer: string;
    appellation?: string;
    vintage: number | null;
    alcohol: number;
    volumeMl?: number;
    body?: string;
    sweetness?: string;
    acidity?: string;
    tastingNotes: string;
    foodPairings: string;
    price: number; // dollars
    cost: number; // dollars
    stock: number;
    varietals: { name: string; percentage?: number }[];
    featured?: boolean;
    wineOfMonth?: boolean;
  };

  const products: SeedProduct[] = [
    {
      name: "Château Margaux Grand Cru Classé", sku: "BDX-MGX-2015",
      category: "Red", region: "Bordeaux", producer: "Château Margaux",
      appellation: "Margaux AOC", vintage: 2015, alcohol: 13.5,
      body: "FULL", sweetness: "DRY", acidity: "MEDIUM",
      tastingNotes: "A profound, silky First Growth with cassis, violet, graphite and cedar, framed by powder-fine tannins and a near-endless finish.",
      foodPairings: pairings("Roast lamb", "Aged hard cheese", "Beef Wellington"),
      price: 649, cost: 410, stock: 8,
      varietals: [{ name: "Cabernet Sauvignon", percentage: 90 }, { name: "Merlot", percentage: 10 }],
      featured: true,
    },
    {
      name: "Bourgogne Pinot Noir", sku: "BUR-PN-2020",
      category: "Red", region: "Burgundy", producer: "Maison Roche de Bellene",
      appellation: "Bourgogne AOC", vintage: 2020, alcohol: 13,
      body: "MEDIUM", sweetness: "DRY", acidity: "HIGH",
      tastingNotes: "Bright red cherry and wild strawberry with a whisper of forest floor; supple and fresh.",
      foodPairings: pairings("Roast chicken", "Mushroom risotto", "Salmon"),
      price: 38, cost: 19, stock: 60,
      varietals: [{ name: "Pinot Noir", percentage: 100 }],
    },
    {
      name: "Barolo Riserva", sku: "PIE-BAR-2016",
      category: "Red", region: "Piedmont", producer: "Giacomo Conterno",
      appellation: "Barolo DOCG", vintage: 2016, alcohol: 14.5,
      body: "FULL", sweetness: "DRY", acidity: "HIGH",
      tastingNotes: "Tar and roses, dried cherry and truffle; commanding tannic spine built for decades.",
      foodPairings: pairings("Braised beef", "Truffle pasta", "Aged Parmesan"),
      price: 189, cost: 120, stock: 14,
      varietals: [{ name: "Nebbiolo", percentage: 100 }],
      featured: true,
    },
    {
      name: "Brunello di Montalcino", sku: "TUS-BRU-2017",
      category: "Red", region: "Tuscany", producer: "Biondi-Santi",
      appellation: "Brunello di Montalcino DOCG", vintage: 2017, alcohol: 14,
      body: "FULL", sweetness: "DRY", acidity: "HIGH",
      tastingNotes: "Sour cherry, leather and balsamic herbs over firm, chalky tannins.",
      foodPairings: pairings("Bistecca alla Fiorentina", "Wild boar ragù", "Pecorino"),
      price: 145, cost: 92, stock: 18,
      varietals: [{ name: "Sangiovese", percentage: 100 }],
    },
    {
      name: "Rioja Gran Reserva", sku: "RIO-GR-2014",
      category: "Red", region: "Rioja", producer: "La Rioja Alta",
      appellation: "Rioja DOCa", vintage: 2014, alcohol: 13.5,
      body: "MEDIUM", sweetness: "DRY", acidity: "MEDIUM",
      tastingNotes: "Savoury and mature: dried fig, vanilla, tobacco and sweet American oak.",
      foodPairings: pairings("Roast suckling pig", "Manchego", "Grilled lamb chops"),
      price: 54, cost: 31, stock: 40,
      varietals: [{ name: "Tempranillo", percentage: 90 }, { name: "Grenache", percentage: 10 }],
    },
    {
      name: "Côtes du Rhône Villages", sku: "RHO-CDR-2021",
      category: "Red", region: "Rhône Valley", producer: "Domaine de la Janasse",
      appellation: "Côtes du Rhône Villages AOC", vintage: 2021, alcohol: 14,
      body: "MEDIUM", sweetness: "DRY", acidity: "MEDIUM",
      tastingNotes: "Juicy blackberry, garrigue and white pepper; generous and rounded.",
      foodPairings: pairings("Grilled sausages", "Ratatouille", "Hard cheeses"),
      price: 26, cost: 13, stock: 85,
      varietals: [{ name: "Grenache", percentage: 70 }, { name: "Syrah", percentage: 30 }],
    },
    {
      name: "Catena Zapata Malbec Argentino", sku: "MEN-MAL-2019",
      category: "Red", region: "Mendoza", producer: "Bodega Catena Zapata",
      appellation: "Mendoza", vintage: 2019, alcohol: 14.5,
      body: "FULL", sweetness: "DRY", acidity: "MEDIUM",
      tastingNotes: "Inky plum and violet with mocha and high-altitude freshness; velvety and deep.",
      foodPairings: pairings("Grilled ribeye", "Empanadas", "Dark chocolate"),
      price: 92, cost: 58, stock: 26,
      varietals: [{ name: "Malbec", percentage: 100 }],
      wineOfMonth: true, featured: true,
    },
    {
      name: "Napa Valley Cabernet Sauvignon", sku: "NAP-CAB-2018",
      category: "Red", region: "Napa Valley", producer: "Stag's Leap Cellars",
      appellation: "Napa Valley AVA", vintage: 2018, alcohol: 14.8,
      body: "FULL", sweetness: "DRY", acidity: "MEDIUM",
      tastingNotes: "Ripe cassis, espresso and toasted oak; plush, polished and powerful.",
      foodPairings: pairings("Dry-aged steak", "Braised short rib", "Blue cheese"),
      price: 118, cost: 74, stock: 22,
      varietals: [{ name: "Cabernet Sauvignon", percentage: 95 }, { name: "Merlot", percentage: 5 }],
      featured: true,
    },
    {
      name: "Saperavi Qvevri", sku: "KAK-SAP-2020",
      category: "Red", region: "Kakheti", producer: "Pheasant's Tears",
      appellation: "Kakheti", vintage: 2020, alcohol: 13,
      body: "FULL", sweetness: "DRY", acidity: "HIGH",
      tastingNotes: "Amphora-aged: brambly black fruit, pomegranate and earthy spice with a savoury grip.",
      foodPairings: pairings("Khinkali", "Grilled meats", "Walnut sauces"),
      price: 34, cost: 18, stock: 33,
      varietals: [{ name: "Saperavi", percentage: 100 }],
    },
    {
      name: "Chablis Premier Cru", sku: "BUR-CHA-2021",
      category: "White", region: "Burgundy", producer: "Domaine William Fèvre",
      appellation: "Chablis 1er Cru AOC", vintage: 2021, alcohol: 12.5,
      body: "MEDIUM", sweetness: "DRY", acidity: "HIGH",
      tastingNotes: "Steely citrus, green apple and oyster-shell minerality; taut and saline.",
      foodPairings: pairings("Oysters", "Grilled white fish", "Goat cheese"),
      price: 49, cost: 28, stock: 44,
      varietals: [{ name: "Chardonnay", percentage: 100 }],
      featured: true,
    },
    {
      name: "Sancerre", sku: "LOI-SAN-2022",
      category: "White", region: "Loire Valley", producer: "Henri Bourgeois",
      appellation: "Sancerre AOC", vintage: 2022, alcohol: 13,
      body: "LIGHT", sweetness: "DRY", acidity: "HIGH",
      tastingNotes: "Zesty grapefruit, gooseberry and flint; crisp and bone-dry.",
      foodPairings: pairings("Goat cheese", "Sushi", "Asparagus"),
      price: 36, cost: 20, stock: 50,
      varietals: [{ name: "Sauvignon Blanc", percentage: 100 }],
    },
    {
      name: "Riesling Kabinett", sku: "MOS-RIE-2021",
      category: "White", region: "Mosel", producer: "Dr. Loosen",
      appellation: "Mosel", vintage: 2021, alcohol: 8,
      body: "LIGHT", sweetness: "OFF_DRY", acidity: "HIGH",
      tastingNotes: "Lime, white peach and wet slate; featherlight with a gently sweet, racy finish.",
      foodPairings: pairings("Thai curry", "Pork belly", "Spicy tuna"),
      price: 28, cost: 15, stock: 64,
      varietals: [{ name: "Riesling", percentage: 100 }],
    },
    {
      name: "Rkatsiteli Amber", sku: "KAK-RKA-2021",
      category: "White", region: "Kakheti", producer: "Tbilvino",
      appellation: "Kakheti", vintage: 2021, alcohol: 12.5,
      body: "MEDIUM", sweetness: "DRY", acidity: "MEDIUM",
      tastingNotes: "Skin-contact amber wine: dried apricot, orange peel, tea and almond with grippy texture.",
      foodPairings: pairings("Roast poultry", "Aged cheese", "Spiced stews"),
      price: 31, cost: 16, stock: 29,
      varietals: [{ name: "Rkatsiteli", percentage: 100 }],
    },
    {
      name: "Marlborough Sauvignon Blanc", sku: "MAR-SB-2023",
      category: "White", region: "Marlborough", producer: "Cloudy Bay",
      appellation: "Marlborough", vintage: 2023, alcohol: 13,
      body: "LIGHT", sweetness: "DRY", acidity: "HIGH",
      tastingNotes: "Passionfruit, lime leaf and freshly cut grass; vivid and aromatic.",
      foodPairings: pairings("Ceviche", "Green salads", "Fresh oysters"),
      price: 27, cost: 14, stock: 72,
      varietals: [{ name: "Sauvignon Blanc", percentage: 100 }],
    },
    {
      name: "Côtes de Provence Rosé", sku: "PRO-ROS-2023",
      category: "Rosé", region: "Provence", producer: "Domaine Ott",
      appellation: "Côtes de Provence AOC", vintage: 2023, alcohol: 13,
      body: "LIGHT", sweetness: "DRY", acidity: "MEDIUM",
      tastingNotes: "Pale salmon hue with wild strawberry, peach and a saline, dry finish.",
      foodPairings: pairings("Salade niçoise", "Grilled prawns", "Soft cheeses"),
      price: 42, cost: 24, stock: 55,
      varietals: [{ name: "Grenache", percentage: 70 }, { name: "Syrah", percentage: 30 }],
      featured: true,
    },
    {
      name: "Champagne Brut Réserve", sku: "CHA-BRT-NV",
      category: "Sparkling", region: "Champagne", producer: "Pol Roger",
      appellation: "Champagne AOC", vintage: null, alcohol: 12.5,
      body: "MEDIUM", sweetness: "DRY", acidity: "HIGH",
      tastingNotes: "Brioche, green apple and almond with a fine, persistent mousse.",
      foodPairings: pairings("Oysters", "Fried chicken", "Aged Comté"),
      price: 65, cost: 39, stock: 48,
      varietals: [{ name: "Chardonnay", percentage: 34 }, { name: "Pinot Noir", percentage: 33 }, { name: "Merlot", percentage: 33 }],
      featured: true,
    },
    {
      name: "Prosecco Superiore", sku: "VEN-PRO-NV",
      category: "Sparkling", region: "Veneto", producer: "Nino Franco",
      appellation: "Valdobbiadene Prosecco Superiore DOCG", vintage: null, alcohol: 11.5,
      body: "LIGHT", sweetness: "OFF_DRY", acidity: "MEDIUM",
      tastingNotes: "Pear, white flowers and citrus with a soft, frothy sparkle.",
      foodPairings: pairings("Prosciutto", "Fritto misto", "Brunch"),
      price: 24, cost: 12, stock: 90,
      varietals: [{ name: "Glera", percentage: 100 }],
    },
    {
      name: "Sauternes", sku: "BDX-SAU-2018",
      category: "Dessert", region: "Bordeaux", producer: "Château Guiraud",
      appellation: "Sauternes AOC", vintage: 2018, alcohol: 13.5, volumeMl: 375,
      body: "FULL", sweetness: "SWEET", acidity: "MEDIUM",
      tastingNotes: "Botrytised gold: honeyed apricot, candied orange and saffron with vibrant acidity.",
      foodPairings: pairings("Foie gras", "Blue cheese", "Crème brûlée"),
      price: 58, cost: 34, stock: 30,
      varietals: [{ name: "Sémillon", percentage: 90 }, { name: "Sauvignon Blanc", percentage: 10 }],
      featured: true,
    },
    {
      name: "20 Year Old Tawny Port", sku: "DOU-TAW-20",
      category: "Fortified", region: "Douro", producer: "Taylor Fladgate",
      appellation: "Porto DOC", vintage: null, alcohol: 20, volumeMl: 750,
      body: "FULL", sweetness: "SWEET", acidity: "MEDIUM",
      tastingNotes: "Barrel-aged: dried fig, walnut, caramel and orange peel with a nutty, mellow finish.",
      foodPairings: pairings("Dark chocolate", "Walnuts", "Stilton"),
      price: 72, cost: 45, stock: 25,
      varietals: [{ name: "Touriga Nacional", percentage: 100 }],
    },
    {
      name: "Oloroso Sherry", sku: "JER-OLO-NV",
      category: "Fortified", region: "Jerez", producer: "Lustau",
      appellation: "Jerez-Xérès-Sherry DO", vintage: null, alcohol: 18,
      body: "FULL", sweetness: "DRY", acidity: "MEDIUM",
      tastingNotes: "Oxidative and dry: roasted hazelnut, leather, dried orange and a long savoury finish.",
      foodPairings: pairings("Jamón ibérico", "Roasted nuts", "Mushroom dishes"),
      price: 33, cost: 17, stock: 38,
      varietals: [{ name: "Palomino", percentage: 100 }],
    },
  ];

  const createdProducts: { id: string; name: string }[] = [];
  for (const p of products) {
    const slug = slugify(`${p.name}-${p.vintage ?? "nv"}`);
    const created = await db.product.create({
      data: {
        name: p.name,
        slug,
        sku: p.sku,
        description: p.tastingNotes,
        categoryId: categories[p.category],
        regionId: regions[p.region],
        producer: p.producer,
        appellation: p.appellation,
        country: regionData.find((r) => r.name === p.region)?.country,
        vintage: p.vintage,
        alcohol: p.alcohol,
        volumeMl: p.volumeMl ?? 750,
        body: p.body,
        sweetness: p.sweetness,
        acidity: p.acidity,
        tastingNotes: p.tastingNotes,
        foodPairings: p.foodPairings,
        priceCents: Math.round(p.price * 100),
        costCents: Math.round(p.cost * 100),
        stockQuantity: p.stock,
        lowStockThreshold: 6,
        status: "ACTIVE",
        featured: p.featured ?? false,
        wineOfMonth: p.wineOfMonth ?? false,
        metaTitle: `${p.name}${p.vintage ? ` ${p.vintage}` : ""} | Maison du Vin`,
        metaDescription: p.tastingNotes.slice(0, 155),
        images: {
          create: [
            { url: imageFor(p.category), alt: `${p.name} bottle`, sortOrder: 0, isPrimary: true },
          ],
        },
        varietals: {
          create: p.varietals.map((v) => ({
            varietalId: varietals[v.name],
            percentage: v.percentage ?? null,
          })),
        },
      },
    });
    createdProducts.push({ id: created.id, name: created.name });
  }

  // ── Users ─────────────────────────────────────────────────────────────────
  console.log("Seeding users…");
  const admin = await db.user.create({
    data: {
      email: "admin@maisonduvin.test",
      name: "Admin",
      role: "SUPER_ADMIN",
      passwordHash: await bcrypt.hash("admin1234", 10),
      emailVerified: new Date(),
      dateOfBirth: new Date("1985-06-15"),
    },
  });

  const customer = await db.user.create({
    data: {
      email: "customer@example.com",
      name: "Jordan Customer",
      role: "CUSTOMER",
      passwordHash: await bcrypt.hash("password1234", 10),
      emailVerified: new Date(),
      dateOfBirth: new Date("1990-03-22"),
      addresses: {
        create: [
          {
            type: "SHIPPING",
            fullName: "Jordan Customer",
            line1: "742 Vineyard Lane",
            city: "Napa",
            state: "CA",
            postalCode: "94558",
            country: "US",
            phone: "+1-707-555-0142",
            isDefault: true,
          },
        ],
      },
    },
  });

  // ── A few reviews (and denormalized rating rollups) ─────────────────────────
  console.log("Seeding reviews…");
  const reviewSeed = [
    { sku: "MEN-MAL-2019", rating: 5, title: "Stunning value", body: "Rich and velvety — drank beautifully with steak." },
    { sku: "BUR-CHA-2021", rating: 4, title: "Crisp and mineral", body: "Lovely Chablis, very food-friendly." },
    { sku: "CHA-BRT-NV", rating: 5, title: "House favourite", body: "Elegant bubbles, always a crowd pleaser." },
  ];
  for (const r of reviewSeed) {
    const product = await db.product.findUnique({ where: { sku: r.sku } });
    if (!product) continue;
    await db.review.create({
      data: {
        productId: product.id,
        userId: customer.id,
        rating: r.rating,
        title: r.title,
        body: r.body,
        status: "APPROVED",
      },
    });
    await db.product.update({
      where: { id: product.id },
      data: { avgRating: r.rating, reviewCount: 1 },
    });
  }

  // ── Inventory log entries for initial stock ─────────────────────────────────
  console.log("Seeding inventory logs…");
  for (const p of products) {
    const product = await db.product.findUnique({ where: { sku: p.sku } });
    if (!product) continue;
    await db.inventoryLog.create({
      data: {
        productId: product.id,
        change: p.stock,
        reason: "RESTOCK",
        note: "Initial seed stock",
        adminUserId: admin.id,
      },
    });
  }

  // ── Newsletter ──────────────────────────────────────────────────────────────
  await db.newsletterSubscriber.create({
    data: { email: "subscriber@example.com" },
  });

  console.log(
    `Seed complete: ${categoryData.length} categories, ${regionData.length} regions, ` +
      `${varietalNames.length} varietals, ${products.length} products, 2 users.`,
  );
}

main()
  .then(async () => {
    await db.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
