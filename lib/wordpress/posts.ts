/**
 * Post retrieval functions.
 */

import {
  wpFetch,
  wpFetchRevalidate,
  wpPath,
  parseWPPaginationHeaders,
  WORDPRESS_API_URL,
} from "./client"
import {
  WPPost,
  WPNotFound,
  WPQueryOptions,
  NormalizedPost,
  WPPaginationMeta,
} from "./types"

export async function getPostBySlug(
  slug: string,
  options: WPQueryOptions = {}
): Promise<NormalizedPost> {
  const { embed = true, revalidate = 60, ...params } = options

  const searchParams = new URLSearchParams()
  searchParams.set("slug", slug)
  if (embed) searchParams.set("_embed", "author,wp:post_thumbnail,wp:term")
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue
    searchParams.append(key, String(value))
  }

  const { data } = await wpFetchRevalidate<WPPost | WPNotFound>(
    `${wpPath("posts")}?${searchParams.toString()}`,
    `/blog/${slug}`,
    { revalidate }
  )

  if ("code" in data) {
    throw new PostNotFoundError(slug)
  }

  return normalizePost(data)
}

export async function getPosts(
  options: WPQueryOptions = {}
): Promise<{ posts: NormalizedPost[]; pagination: WPPaginationMeta | null }> {
  const { embed = true, revalidate = 60, page = 1, per_page = 9, ...params } = options

  const searchParams = new URLSearchParams({
    status: "publish",
    orderby: "date",
    order: "desc",
    per_page: String(per_page),
    page: String(page),
  })
  if (embed) searchParams.set("_embed", "author,wp:post_thumbnail,wp:term")
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue
    searchParams.append(key, String(value))
  }

  const response = await fetch(
    `${WORDPRESS_API_URL.replace(/\/$/, "")}/posts?${searchParams.toString()}`,
    {
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      next: { revalidate, tags: ["posts"] },
    }
  )

  const data = (await response.json()) as WPPost[]
  const meta = parseWPPaginationHeaders(response.headers, page)
  return {
    posts: data.map(normalizePost),
    pagination: meta,
  }
}

export async function getRelatedPosts(
  postId: number,
  limit: number = 3
): Promise<NormalizedPost[]> {
  const { posts } = await getPosts({
    embed: false,
    per_page: limit,
    exclude: [postId],
    revalidate: 300,
  })

  return posts.slice(0, limit)
}

export async function getPostsByPostType<T extends string>(
  postType: T,
  options: Omit<WPQueryOptions, "embed"> & { revalidate?: number } = {}
): Promise<{ posts: NormalizedPost[]; pagination: WPPaginationMeta | null }> {
  const { page = 1, per_page = 10, ...params } = options
  const searchParams = new URLSearchParams({
    status: "publish",
    per_page: String(per_page),
    page: String(page),
  })
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue
    searchParams.append(key, String(value))
  }

  const { data } = await wpFetch<any[]>(
    wpPath(`${postType}?${searchParams.toString()}`),
    { revalidate: options.revalidate }
  )

  return {
    posts: (data as WPPost[]).map(normalizePost),
    pagination: null,
  }
}

export class PostNotFoundError extends Error {
  constructor(slug: string) {
    super(`Post not found: ${slug}`)
    this.name = "PostNotFoundError"
  }
}

export function normalizePost(post: WPPost): NormalizedPost {
  return {
    id: post.id,
    date: post.date,
    date_gmt: post.date_gmt,
    guid: post.guid,
    link: post.link,
    modified: post.modified,
    modified_gmt: post.modified_gmt,
    slug: post.slug,
    status: post.status,
    type: post.type,
    title: post.title.rendered,
    content: post.content.rendered,
    excerpt: post.excerpt.rendered,
    author: (post._embedded?.author?.[0]) ?? null,
    featured_media: post.featured_media,
    comment_status: post.comment_status,
    ping_status: post.ping_status,
    sticky: post.sticky,
    template: post.template,
    format: post.format,
    categories: (post._embedded?.["wp:term"]?.[0] ?? []) as any,
    tags: (post._embedded?.["wp:term"]?.[1] ?? []) as any,
    publishedDate: post.date,
    formattedDate: new Date(post.date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    authorId: post.author,
    featuredMedia: post._embedded?.["wp:featuredmedia"]?.[0] ?? null,
    meta: post.meta,
    _links: post._links,
  }
}
