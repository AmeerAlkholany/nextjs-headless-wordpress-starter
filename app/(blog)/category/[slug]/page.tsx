import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getCategoryBySlug, getPostsByCategory, CategoryNotFoundError, WPCategory } from "@/lib/wordpress"
import { PostList } from "@/components/wp/PostList"
import { ErrorFallback } from "@/components/wp/Skeleton"

interface CategoryPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params, searchParams }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  try {
    const category = await getCategoryBySlug(slug)
    return {
      title: `${category.name} | Blog`,
      description: category.description.slice(0, 160),
    }
  } catch {
    notFound()
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params
  const { page = "1" } = await searchParams

  let category: WPCategory | null = null
  let result: Awaited<ReturnType<typeof getPostsByCategory>> | null = null
  let error: Error | null = null

  try {
    category = await getCategoryBySlug(slug)
    result = await getPostsByCategory(slug, { page: Number(page), per_page: 10 })
  } catch (e) {
    if (e instanceof CategoryNotFoundError) {
      notFound()
    }
    error = e as Error
  }

  if (error || !category) {
    return <ErrorFallback message={error?.message ?? "Category not found"} />
  }

  if (!result || result.posts.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 p-8 text-center dark:border-zinc-700">
        <h2 className="mb-2 text-lg font-semibold">No posts in this category</h2>
      </div>
    )
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">{category.name}</h1>
        <p className="text-zinc-600 dark:text-zinc-300">{category.description}</p>
      </header>
      <PostList posts={result.posts} pagination={result.pagination} hrefBase={`/category/${slug}`} />
    </div>
  )
}
