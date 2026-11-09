import type { MetadataRoute } from "next"
import { getPages } from "@/lib/wordpress/pages"
import { getPosts } from "@/lib/wordpress/posts"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
const REVALIDATE = 3600 // 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = []

  entries.push({
    url: SITE_URL,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 1,
  })

  entries.push({
    url: `${SITE_URL}/blog`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.9,
  })

  try {
    const perPage = 100
    let page = 1
    let hasMore = true
    while (hasMore && page <= 50) {
      const { posts, pagination } = await getPosts({
        per_page: perPage,
        page,
        embed: false,
        revalidate: REVALIDATE,
      })
      for (const post of posts) {
        entries.push({
          url: `${SITE_URL}/blog/${post.slug}`,
          lastModified: new Date(post.modified),
          changeFrequency: "weekly",
          priority: 0.8,
        })
      }
      hasMore = pagination?.hasMore ?? false
      page += 1
    }
  } catch (error) {
    console.error("Failed to fetch posts for sitemap:", error)
  }

  try {
    const { pages } = await getPages({
      per_page: 100,
      embed: false,
      revalidate: REVALIDATE,
    })
    for (const page of pages) {
      entries.push({
        url: `${SITE_URL}/${page.slug}`,
        lastModified: new Date(page.modified),
        changeFrequency: "weekly",
        priority: 0.7,
      })
    }
  } catch (error) {
    console.error("Failed to fetch pages for sitemap:", error)
  }

  return entries
}
