import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import {
  getHomepageData,
  FeaturedPostUnavailableError,
  type HomepageData,
} from "@/lib/wordpress"
import { FeaturedImage } from "@/components/wp/FeaturedImage"
import { PostCard } from "@/components/wp/PostCard"
import { cn } from "@/lib/utils"

const REVALIDATE = 60

interface HomepageProps {
  params: Promise<{ slug?: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params }: HomepageProps): Promise<Metadata> {
  try {
    await getHomepageData({
      featuredRevalidate: REVALIDATE,
      latestRevalidate: REVALIDATE,
    })
    return {
      title: "Latest from the blog",
      description: "Latest posts from our WordPress-powered blog.",
    }
  } catch {
    return { title: "Loading..." }
  }
}

export default async function Homepage({ params, searchParams }: HomepageProps) {
  let homepageData: HomepageData | null = null
  let error: Error | null = null

  try {
    homepageData = await getHomepageData({
      featuredRevalidate: REVALIDATE,
      latestRevalidate: REVALIDATE,
    })
  } catch (err) {
    if (err instanceof FeaturedPostUnavailableError) {
      notFound()
    }
    console.error("Homepage data fetch failed:", err)
    error = err as Error
  }

  if (error || !homepageData) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center dark:border-red-900 dark:bg-red-950">
        <h2 className="mb-2 text-lg font-semibold text-red-800 dark:text-red-200">Failed to load homepage</h2>
        <p className="text-red-600 dark:text-red-300">{error?.message ?? "Unknown error"}</p>
      </div>
    )
  }

  const data = homepageData

  return (
    <div className="grid gap-8 md:grid-cols-3">
      <section
        className={cn(
          "rounded-xl bg-zinc-100 dark:bg-zinc-800",
          data.featured.post.featuredMedia
            ? "md:col-span-1 md:row-span-2"
            : "md:col-span-3"
        )}
      >
        <div className="flex h-full flex-col gap-4 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Featured
          </h2>

          {data.featured.post.featuredMedia && (
            <Link href={`/blog/${data.featured.post.slug}`} className="block">
              <FeaturedImage
                media={data.featured.post.featuredMedia}
                alt={data.featured.post.featuredMedia.alt_text || data.featured.post.title}
                width={data.featured.post.featuredMedia.media_details.width}
                height={data.featured.post.featuredMedia.media_details.height}
                sizes="100vw"
                priority
                className="mb-3 rounded-lg"
              />
            </Link>
          )}

          <Link href={`/blog/${data.featured.post.slug}`}>
            <h1 className="text-2xl font-bold leading-tight hover:underline">
              {data.featured.post.title}
            </h1>
          </Link>

          <div className="mt-auto flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
            {data.featured.post.author && (
              <Link
                href={`/author/${data.featured.post.author.slug}`}
                className="hover:text-zinc-900 dark:hover:text-zinc-200"
              >
                {data.featured.post.author.name}
              </Link>
            )}
            <time dateTime={data.featured.post.date}>{data.featured.post.formattedDate}</time>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold">Latest posts</h2>
        <div className="flex flex-col gap-6">
          {data.latest.posts.slice(0, 6).map((post) => (
            <PostCard key={post.id} post={post} variant="compact" />
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link
            href="/blog"
            className="inline-block rounded-lg border border-zinc-300 px-5 py-2.5 font-medium hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-800"
          >
            View all posts
          </Link>
        </div>
      </section>
    </div>
  )
}
