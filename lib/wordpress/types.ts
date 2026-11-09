/**
 * WordPress REST API v2 type definitions.
 */

/** A REST resource plus common WP metadata. */
export interface WPBase {
  id: number
  date: string
  date_gmt: string
  guid: WPGuid
  link: string
  modified: string
  modified_gmt: string
  slug: string
  status: "publish" | "future" | "draft" | "pending" | "private"
  type: string
}

export interface WPGuid {
  rendered: string
}

export interface WPAuthor {
  id: number
  name: string
  url: string
  description: string
  link: string
  slug: string
  avatar_urls: Record<12 | 24 | 48 | 96, string>
}

export interface WPTerm {
  id: number
  count: number
  description: string
  link: string
  name: string
  slug: string
  taxonomy: string
  meta?: WPPostMeta[]
}

export interface WPComment {
  id: number
  post: number
  parent: number
  author: number
  author_name: string
  author_url: string
  date: string
  date_gmt: string
  content: WPContent
  link: string
  status: string
  type: string
}

export interface WPContent {
  rendered: string
  protected: boolean
}

export interface WPPostMeta {
  meta_key: string
  meta_value: unknown
}

/** A published WordPress post. */
export interface WPPost extends WPBase {
  type: "post"
  title: WPContent
  content: WPContent
  excerpt: WPContent
  author: number
  featured_media: number
  comment_status: "open" | "closed"
  ping_status: "open" | "closed"
  sticky: boolean
  template: string
  format:
    | "standard"
    | "aside"
    | "chat"
    | "gallery"
    | "link"
    | "image"
    | "quote"
    | "status"
    | "video"
    | "audio"
  categories: number[]
  tags: number[]
  meta: WPPostMeta[]
  _links: WPPostLinks
  _embedded?: {
    author?: WPAuthor[]
    "wp:featuredmedia"?: WPMediaEmbedded[]
    "wp:term"?: Array<WPTerm[]>
  }
}

export interface WPPostLinks {
  self: Array<{ href: string }>
  collection: Array<{ href: string }>
  about: Array<{ href: string }>
  author: Array<{ embeddable: boolean; href: string }>
  replies: Array<{ embeddable: boolean; href: string }>
  "version-history": Array<{ href: string }>
  "wp:featuredmedia"?: Array<{ embeddable: boolean; href: string }>
  "wp:term"?: Array<{ taxonomy: string; embeddable: boolean; href: string }>
}

export interface WPPageLinks {
  self: Array<{ href: string }>
  collection: Array<{ href: string }>
  about: Array<{ href: string }>
  replies: Array<{ embeddable: boolean; href: string }>
}

export interface Attachments {
  href: string
}

/** A published WordPress page. */
export interface WPPage extends WPBase {
  type: "page"
  title: WPContent
  content: WPContent
  excerpt: WPContent
  menu_order: number
  parent?: number
  author: number
  comment_status: "open" | "closed"
  ping_status: "open" | "closed"
  template: string
  meta: WPPostMeta[]
  _links: WPPageLinks
  _embedded?: {
    author?: WPAuthor[]
  }
}

/** A WordPress category. */
export interface WPCategory extends WPTerm {
  taxonomy: "category"
  parent: number
}

/** A WordPress tag. */
export interface WPTag extends WPTerm {
  taxonomy: "post_tag"
}

export interface WPImage {
  source_url: string
  media_type: string
  media_details: {
    width: number
    height: number
    file: string
    sizes?: Record<string, { source_url: string; width: number; height: number }>
  }
  alt_text?: string
}

/** A WP media attachment, embedded via `_embed`. */
export interface WPMediaEmbedded {
  id: number
  date: string
  slug: string
  type: "attachment"
  title: WPContent
  author: number
  caption: WPContent
  alt_text: string
  media_type: string
  mime_type: string
  media_details: {
    width: number
    height: number
    file: string
    sizes: Record<string, { source_url: string; width: number; height: number }>
  }
  source_url: string
}

/** Response wrapper used when an expected post/page was not found. */
export interface WPNotFound {
  code: string
  message: string
  data: { status: number }
}

/** Pagination meta. */
export interface WPPaginationMeta {
  total: number
  totalPages: number
  hasMore: boolean
  page: number
}

/** Error codes mapping. */
export type WPErrorCode =
  | "NOT_FOUND"
  | "FORBIDDEN"
  | "AUTHENTICATION_REQUIRED"
  | "UNPROCESSABLE_CONTENT"
  | "NETWORK"
  | "MALFORMED_RESPONSE"
  | "API_UNAVAILABLE"
  | "TIMEOUT"

/** Error thrown by the WP layer. */
export class WPRequestError extends Error {
  constructor(
    public origin: string,
    public body: string,
    public status: number,
    public meta: Record<string, unknown> = {}
  ) {
    super(`WordPress API request failed (${status}): ${body.slice(0, 200)}`)
    Object.setPrototypeOf(this, WPRequestError.prototype)
  }
}

/** A normalized post ready for UI consumption. */
export interface NormalizedPost extends Omit<WPPost, "title" | "content" | "excerpt" | "author" | "categories" | "tags"> {
  title: string
  content: string
  excerpt: string
  categories: WPCategory[]
  tags: WPTag[]
  author?: WPAuthor | null
  featuredMedia?: WPMediaEmbedded | null
  publishedDate: string
  formattedDate: string
  authorId: number // preserve original author id
}

/** A normalized page ready for UI consumption. */
export interface NormalizedPage
  extends Omit<WPPage, "title" | "content" | "excerpt" | "author"> {
  title: string
  content: string
  excerpt: string
  author?: WPAuthor | null
  formattedDate: string
  authorId: number
}

/** Options for content-retrieval functions. */
export interface WPQueryOptions {
  per_page?: number
  page?: number
  search?: string
  slug?: string
  categories?: number[]
  tags?: number[]
  orderby?: "date" | "id" | "include" | "modified" | "relevance" | "slug"
  order?: "asc" | "desc"
  author?: number
  sticky?: boolean
  exclude?: number[]
  /** Include embedded media (_embed query param). */
  embed?: boolean
  /** Revalidate the calling route on success (seconds). */
  revalidate?: number
}
