/**
 * Payload schema for WordPress webhook -> /api/revalidate.
 * Validation is explicit; no unknown fields accepted.
 */
export interface WPRevalidationPayload {
  type: "post" | "page" | "category" | "tag"
  id: number
  slug?: string
  taxonomy?: string
}

/**
 * Convert a slug into a normalized Next.js path segment.
 * WP slugs cannot contain `/` so simple mapping suffices.
 */
export function normalizePath(slug: string): string {
  const normalized = slug.replace(/^\/|\/$/g, "")
  return "/" + normalized
}

/**
 * Tag name used for cache entries that must be invalidated when
 * any listing page is touched (e.g. all-post-type archives).
 */
export const WP_CACHE_TAGS = ["posts", "pages", "categories", "tags"] as const
export type WPCacheTag = (typeof WP_CACHE_TAGS)[number]

/**
 * Build a cache tag for a post-type listing.
 */
export function postTypeListingTag(postType: string): string {
  return `posts-type-${postType}`
}
