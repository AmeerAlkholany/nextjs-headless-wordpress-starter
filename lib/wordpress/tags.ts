/**
 * Tag retrieval functions.
 */

import { wpPath, wpFetchRevalidate } from "./client"
import { WPTag, WPNotFound, WPQueryOptions, NormalizedPost, WPPaginationMeta } from "./types"
import { getPosts } from "./posts"

const TAG_REVALIDATE = 300 // 5 minutes

/**
 * List all tags.
 */
export async function getTags(options: WPQueryOptions = {}): Promise<WPTag[]> {
  const { revalidate = TAG_REVALIDATE, ...params } = options

  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue
    searchParams.append(key, String(value))
  }

  const { data } = await wpFetchRevalidate<WPTag[]>(
    `${wpPath("tags")}?${searchParams.toString()}`,
    "/tags",
    { revalidate }
  )

  return data
}

/**
 * Resolve a tag archive by slug.
 *
 * - published tag only; otherwise notFound.
 */
export async function getTagBySlug(slug: string): Promise<WPTag> {
  const { data } = await wpFetchRevalidate<WPTag | WPNotFound>(
    `${wpPath("tags")}?slug=${slug}`,
    `/tag/${slug}`,
    { revalidate: TAG_REVALIDATE }
  )

  if ("code" in data) {
    throw new TagNotFoundError(slug)
  }

  return data
}

/**
 * Get posts tagged with a tag slug.
 */
export async function getPostsByTag(
  slug: string,
  options: Omit<WPQueryOptions, "tags"> = {}
): Promise<{ posts: NormalizedPost[]; pagination: WPPaginationMeta | null }> {
  const tag = await getTagBySlug(slug)
  const { posts, pagination } = await getPosts({
    ...options,
    tags: [tag.id],
  })
  return { posts, pagination }
}

export class TagNotFoundError extends Error {
  constructor(slug: string) {
    super(`Tag not found: ${slug}`)
    this.name = "TagNotFoundError"
  }
}
