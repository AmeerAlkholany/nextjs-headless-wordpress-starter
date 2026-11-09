import Link from "next/link"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getPageBySlug, PageNotFoundError, type NormalizedPage } from "@/lib/wordpress"
import { AuthorAvatar } from "@/components/wp/AuthorAvatar"
import { PostSkeleton, ErrorFallback } from "@/components/wp/Skeleton"

interface PagePageProps {
  params: Promise<{ pageSlug: string }>
}

export async function generateStaticParams(): Promise<{ pageSlug: string }[]> {
  try {
    const { getPages } = await import("@/lib/wordpress")
    const { pages } = await getPages({ per_page: 100, embed: false })
    return pages.map((p) => ({ pageSlug: p.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: PagePageProps): Promise<Metadata> {
  const { pageSlug } = await params

  try {
    const page = await getPageBySlug(pageSlug)

    return {
      title: `${page.title} | Site`,
      description: page.excerpt.slice(0, 160),
      alternates: { canonical: page.link },
      openGraph: {
        title: page.title,
        description: page.excerpt.slice(0, 160),
        type: "website",
        url: page.link,
      },
    }
  } catch {
    return { title: "Page not found" }
  }
}

export default async function PagePage({ params }: PagePageProps) {
  let page: NormalizedPage | null = null
  let error: Error | null = null

  try {
    page = await getPageBySlug((await params).pageSlug, { revalidate: 300 })
  } catch (e) {
    if (e instanceof PageNotFoundError) {
      notFound()
    }
    error = e as Error
  }

  if (error || !page) {
    return <ErrorFallback message={error?.message ?? "Page not found"} />
  }

  return (
    <article className="max-w-4xl">
      <header className="mb-8">
        <Link href="/" className="mb-4 inline-block text-sm text-zinc-500 hover:underline">
          &larr; Back to home
        </Link>
        <h1 className="mb-4 text-3xl font-bold md:text-4xl">{page.title}</h1>
        <div className="flex items-center gap-6 text-sm text-zinc-500 dark:text-zinc-400">
          {page.author && <AuthorAvatar author={page.author} size="sm" />}
          <time dateTime={page.date}>{page.formattedDate}</time>
        </div>
      </header>

      <div
        className="prose dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </article>
  )
}
