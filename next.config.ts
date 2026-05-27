import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project. There is an unrelated lockfile in a
  // parent directory; without this, Next infers the wrong root and over-traces.
  turbopack: { root: path.resolve() },
  // Keep the Postgres driver + Prisma adapter external so the server bundler
  // doesn't try to inline node-postgres (which uses dynamic requires).
  serverExternalPackages: ["pg", "@prisma/adapter-pg"],
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
