/**
 * Reserved route segments that should never be resolved as WordPress pages.
 *
 * Next.js reserves many paths (/_next, /api, /favicon.ico, ...) at the file
 * system level, but a catch-all `app/(site)/[pageSlug]/page.tsx` would
 * otherwise swallow any unknown single-segment path. We exclude:
 *   - built-in Next.js routes
 *   - our WP content routes (/blog, /category, /tag, /author)
 *   - reserved application paths (auth, admin, dashboard, etc.)
 */

const APPLICATION_PATHS = new Set([
  "api",
  "blog",
  "category",
  "tag",
  "author",
  "sitemap.xml",
  "robots.txt",
])

const RESERVED_PATHS = new Set([
  ...APPLICATION_PATHS,
  // Next.js built-in routes (app dir)
  "_next",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
  // Common app paths — extend as your app grows.
  "admin",
  "dashboard",
  "login",
  "logout",
  "register",
  "auth",
  "settings",
  "profile",
  "account",
])

export { RESERVED_PATHS, APPLICATION_PATHS }
