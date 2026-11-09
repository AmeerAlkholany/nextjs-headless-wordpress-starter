/**
 * Category retrieval functions.
 */

import { wpPath, wpFetchRevalidate } from "./client"
import { WPCategory, WPNotFound, WPQueryOptions, NormalizedPost, WPPaginationMeta } from "./types"
import { getPosts } from "./posts"

const CATEGORY_REVALIDATE = 300 // 5 minutes

/**
 * List all categories.
 */
export async function getCategories(options: WPQueryOptions = {}): Promise<WPCategory[]> {
  const { revalidate = CATEGORY_REVALIDATE, ...params } = options

  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue
    searchParams.append(key, String(value))
  }

  const { data } = await wpFetchRevalidate<WPCategory[]>(
    `${wpPath("categories")}?${searchParams.toString()}`,
    "/categories",
    { revalidate }
  )

  return data
}

/**
 * Resolve a category archive by slug.
 *
 * - published category only; otherwise notFound.
 */
export async function getCategoryBySlug(slug: string): Promise<WPCategory> {
  const { data } = await wpFetchRevalidate<WPCategory | WPNotFound>(
    `${wpPath("categories")}?slug=${slug}`,
    `/category/${slug}`,
    { revalidate: CATEGORY_REVALIDATE }
  )

  if ("code" in data) {
    throw new CategoryNotFoundError(slug)
  }

  return data
}

/**
 * Get posts filtered by a category slug.
 */
export async function getPostsByCategory(
  slug: string,
  options: Omit<WPQueryOptions, "categories"> = {}
): Promise<{ posts: NormalizedPost[]; pagination: WPPaginationMeta | null }> {
  const category = await getCategoryBySlug(slug)
  const { posts, pagination } = await getPosts({
    ...options,
    categories: [category.id],
  })
  return { posts, pagination }
}

export class CategoryNotFoundError extends Error {
  constructor(slug: string) {
    super(`Category not found: ${slug}`)
    this.name = "CategoryNotFoundError"
  }
}
