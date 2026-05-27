import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project. There is an unrelated lockfile in a
  // parent directory; without this, Next infers the wrong root and over-traces.
  turbopack: { root: path.resolve() },
  // Native module — keep it external so the bundler doesn't try to inline the
  // prebuilt binary. Required for the Prisma better-sqlite3 driver adapter.
  serverExternalPackages: ["better-sqlite3", "@prisma/adapter-better-sqlite3"],
  images: {
    // Our placeholder bottle art is first-party static SVG; allow next/image to
    // serve it. The CSP keeps these locked down (no scripts execute).
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

export default nextConfig;
