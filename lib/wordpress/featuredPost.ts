/**
 * Homepage-focused data fetch: a featured post (sticky or random published)
 * plus the latest N posts. Single place where homepage data is assembled.
 */

import { getPosts } from "./posts"
import { NormalizedPost, WPQueryOptions, WPPaginationMeta } from "./types"

export interface FeaturedPost {
  post: NormalizedPost
}

export interface HomepageData {
  featured: FeaturedPost
  latest: { posts: NormalizedPost[]; pagination: WPPaginationMeta | null }
}

const FEATURED_REVALIDATE = 300
const LATEST_REVALIDATE = 60

/**
 * Get a featured post: sticky published post, otherwise random published.
 */
export async function getFeaturedPost(): Promise<FeaturedPost> {
  try {
    const { posts } = await getPosts({
      sticky: true,
      per_page: 1,
      embed: true,
      revalidate: FEATURED_REVALIDATE,
    })

    if (posts.length > 0) {
      return { post: posts[0] }
    }

    // No sticky post: pick a random published post.
    // WP has no true random; fetch page 2 and take a middle row deterministically.
    const { posts: pageTwo } = await getPosts({
      per_page: 20,
      page: 2,
      embed: true,
      revalidate: FEATURED_REVALIDATE,
    })

    if (pageTwo.length > 0) {
      const index = Math.floor(Math.random() * pageTwo.length)
      return { post: pageTwo[index] }
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Post not found")) {
      throw error
    }
  }

  throw new FeaturedPostUnavailableError()
}

/**
 * Assemble full homepage data.
 */
export async function getHomepageData(
  options: { featuredRevalidate?: number; latestRevalidate?: number; latestLimit?: number } = {}
): Promise<HomepageData> {
  const {
    featuredRevalidate = FEATURED_REVALIDATE,
    latestRevalidate = LATEST_REVALIDATE,
    latestLimit = 6,
  } = options

  const [featured, latest] = await Promise.all([
    getFeaturedPost(),
    getPosts({
      per_page: latestLimit,
      embed: true,
      revalidate: latestRevalidate,
    }),
  ])

  return { featured, latest }
}

export class FeaturedPostUnavailableError extends Error {
  constructor() {
    super("A featured post could not be loaded from WordPress.")
    this.name = "FeaturedPostUnavailableError"
  }
}
