import Link from "next/link"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import {
  getPostBySlug,
  getRelatedPosts,
  PostNotFoundError,
  type NormalizedPost,
} from "@/lib/wordpress"
import { FeaturedImage } from "@/components/wp/FeaturedImage"
import { AuthorAvatar } from "@/components/wp/AuthorAvatar"
import { PostSkeleton, ErrorFallback } from "@/components/wp/Skeleton"

const REVALIDATE = 300

interface PostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  let post: NormalizedPost
  try {
    post = await getPostBySlug((await params).slug, { revalidate: REVALIDATE })
  } catch {
    notFound()
  }

  const ogImage = post.featuredMedia?.source_url ?? undefined

  return {
    title: `${post.title} | Blog`,
    description: post.excerpt.slice(0, 160),
    alternates: { canonical: post.link },
    openGraph: {
      title: post.title,
      description: post.excerpt.slice(0, 160),
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.modified,
      authors: [post.author?.name ?? ""],
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630 }] : undefined,
    },
  }
}

export default async function PostPage({ params }: PostPageProps) {
  let post: NormalizedPost
  let related: NormalizedPost[]
  let error: Error | null = null

  try {
    post = await getPostBySlug((await params).slug, { revalidate: REVALIDATE })
    related = await getRelatedPosts(post.id, 3)
  } catch (e) {
    if (e instanceof PostNotFoundError) {
      notFound()
    }
    error = e as Error
    post = null!
    related = []
  }

  if (error) {
    return <ErrorFallback message={error.message} />
  }

  if (!post) {
    return <PostSkeleton />
  }

  return (
    <article className="max-w-4xl">
      {post.featuredMedia && (
        <FeaturedImage
          media={post.featuredMedia}
          alt={post.featuredMedia.alt_text || post.title}
          width={post.featuredMedia.media_details.width}
          height={post.featuredMedia.media_details.height}
          sizes="100vw"
          priority
          className="mb-6 rounded-xl"
        />
      )}

      <header className="mb-8">
        <h1 className="mb-4 text-3xl font-bold md:text-4xl">{post.title}</h1>
        <div className="flex items-center gap-6 text-sm text-zinc-500 dark:text-zinc-400">
          {post.author && <AuthorAvatar author={post.author} size="sm" />}
          <time dateTime={post.date}>{post.formattedDate}</time>
        </div>
      </header>

      <div
        className="prose dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-4 text-2xl font-bold">Related posts</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {related.map((r) => (
              <Link key={r.id} href={`/blog/${r.slug}`}>
                <div className="rounded-lg bg-zinc-100 p-4 dark:bg-zinc-800">
                  <h3 className="font-semibold hover:underline">{r.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  )
}
