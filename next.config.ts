import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production"

/**
 * Allowed external image hosts.
 * Add the WordPress site domain here once WP is live.
 * In dev we allow localhost so the local WP instance can be used.
 */
const ALLOWED_IMAGE_DOMAINS = [
  "localhost",
  "127.0.0.1",
  "wordpress-next.local",
  "signal.byethost11.com",// replace with your WP domain in production
].filter(Boolean)

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    remotePatterns: ALLOWED_IMAGE_DOMAINS.map((domain) => ({
      protocol: "https" as const,
      hostname: domain,
      pathname: "/wp-content/**",
    })),
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
