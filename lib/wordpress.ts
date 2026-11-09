/**
 * WordPress integration entry point.
 *
 * Re-exports all content functions and error classes so callers can import
 * from a single clean path: `@/lib/wordpress`.
 */

export {
  WORDPRESS_API_URL,
  wpPath,
  wpFetch,
  wpFetchRevalidate,
  parseWPPaginationHeaders,
  mapWpStatus,
  WPRequestError,
} from "./wordpress/client"

export {
  getPosts,
  getPostBySlug,
  getRelatedPosts,
  getPostsByPostType,
  PostNotFoundError,
  normalizePost,
} from "./wordpress/posts"

export {
  getPages,
  getPageBySlug,
  PageNotFoundError,
  normalizePage,
} from "./wordpress/pages"

export {
  getCategories,
  getCategoryBySlug,
  getPostsByCategory,
  CategoryNotFoundError,
} from "./wordpress/categories"

export {
  getTags,
  getTagBySlug,
  getPostsByTag,
  TagNotFoundError,
} from "./wordpress/tags"

export {
  getAuthorById,
  getAuthorBySlug,
  getPostsByAuthor,
  AuthorNotFoundError,
} from "./wordpress/authors"

export {
  getHomepageData,
  getFeaturedPost,
  FeaturedPostUnavailableError,
  type HomepageData,
  type FeaturedPost,
} from "./wordpress/featuredPost"

export type * from "./wordpress/types"
