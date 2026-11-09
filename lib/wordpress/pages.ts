/**
 * Page retrieval functions.
 */

import { wpPath, wpFetchRevalidate, parseWPPaginationHeaders } from "./client"
import { WPPage, WPNotFound, WPQueryOptions, NormalizedPage, WPPaginationMeta } from "./types"

const PAGE_REVALIDATE = 300

export async function getPages(
  options: WPQueryOptions = {}
): Promise<{ pages: NormalizedPage[]; pagination: WPPaginationMeta | null }> {
  const { embed = true, revalidate = PAGE_REVALIDATE, page = 1, per_page = 100, ...params } = options

  const searchParams = new URLSearchParams({
    status: "publish",
    orderby: "menu_order,title",
    order: "asc",
    per_page: String(per_page),
    page: String(page),
  })
  if (embed) searchParams.set("_embed", "author")
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue
    searchParams.append(key, String(value))
  }

  const { data } = await wpFetchRevalidate<WPPage[]>(
    `${wpPath("pages")}?${searchParams.toString()}`,
    "/pages",
    { revalidate }
  )

  return {
    pages: (data as WPPage[]).map(normalizePage),
    pagination: { total: data.length, totalPages: 1, page, hasMore: false },
  }
}

export async function getPageBySlug(
  slug: string,
  options: WPQueryOptions = {}
): Promise<NormalizedPage> {
  const { embed = true, revalidate = PAGE_REVALIDATE, ...params } = options

  const searchParams = new URLSearchParams()
  searchParams.set("slug", slug)
  if (embed) searchParams.set("_embed", "author")
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue
    searchParams.append(key, String(value))
  }

  const { data } = await wpFetchRevalidate<WPPage[] | WPNotFound>(
    `${wpPath("pages")}?${searchParams.toString()}`,
    `/${slug}`,
    { revalidate }
  )

  if (!Array.isArray(data) || !data[0]) {
    throw new PageNotFoundError(slug)
  }

  return normalizePage(data[0])
}

export class PageNotFoundError extends Error {
  constructor(slug: string) {
    super(`Page not found: ${slug}`)
    this.name = "PageNotFoundError"
  }
}

export function normalizePage(page: WPPage): NormalizedPage {
  return {
    id: page.id,
    date: page.date,
    date_gmt: page.date_gmt,
    guid: page.guid,
    link: page.link,
    modified: page.modified,
    modified_gmt: page.modified_gmt,
    slug: page.slug,
    status: page.status,
    type: page.type,
    title: page.title.rendered,
    content: page.content.rendered,
    excerpt: page.excerpt.rendered,
    menu_order: page.menu_order,
    parent: page.parent ?? undefined,
    author: (page._embedded?.author?.[0]) ?? null,
    comment_status: page.comment_status,
    ping_status: page.ping_status,
    template: page.template,
    formattedDate: new Date(page.date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    authorId: page.author,
    meta: page.meta,
    _links: page._links,
  }
}
