/**
 * Author retrieval functions.
 */

import { wpPath, wpFetchRevalidate } from "./client"
import { WPAuthor, WPQueryOptions, NormalizedPost, WPPaginationMeta } from "./types"
import { getPosts } from "./posts"

const AUTHOR_REVALIDATE = 600 // 10 minutes — author data changes rarely

/**
 * Resolve an author by id.
 */
export async function getAuthorById(id: number): Promise<WPAuthor> {
  const { data } = await wpFetchRevalidate<WPAuthor>(
    `${wpPath("authors")}/${id}`,
    "/authors",
    { revalidate: AUTHOR_REVALIDATE }
  )

  if (!data || ("code" in (data as any))) {
    throw new AuthorNotFoundError(String(id))
  }

  return data
}

/**
 * Resolve an author by slug.
 */
export async function getAuthorBySlug(slug: string): Promise<WPAuthor> {
  const { data } = await wpFetchRevalidate<WPAuthor[]>(
    `${wpPath("authors")}?slug=${slug}`,
    "/authors",
    { revalidate: AUTHOR_REVALIDATE }
  )

  if (!Array.isArray(data) || !data[0]) {
    throw new AuthorNotFoundError(slug)
  }

  return data[0]
}

/**
 * Get posts by a specific author.
 */
export async function getPostsByAuthor(
  authorId: number,
  options: Omit<WPQueryOptions, "author"> = {}
): Promise<{ posts: NormalizedPost[]; pagination: WPPaginationMeta | null }> {
  const { posts, pagination } = await getPosts({
    ...options,
    author: authorId,
  })
  return { posts, pagination }
}

export class AuthorNotFoundError extends Error {
  constructor(identifier: string) {
    super(`Author not found: ${identifier}`)
    this.name = "AuthorNotFoundError"
  }
}
