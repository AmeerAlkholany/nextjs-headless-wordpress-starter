import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getPosts } from "@/lib/wordpress"
import { PostList } from "@/components/wp/PostList"

interface BlogPageProps {
  params: Promise<Record<string, string | undefined>>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params, searchParams }: BlogPageProps): Promise<Metadata> {
  const { page = "1" } = await searchParams
  const { posts } = await getPosts({ page: Number(page), per_page: 10 })

  if (posts.length === 0) {
    notFound()
  }

  return {
    title: "Blog",
    description: "All posts from our WordPress-powered blog.",
  }
}

export default async function BlogPage({ params, searchParams }: BlogPageProps) {
  const { page = "1" } = await searchParams
  const { posts, pagination } = await getPosts({ page: Number(page), per_page: 10 })

  if (posts.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 p-8 text-center dark:border-zinc-700">
        <h2 className="mb-2 text-lg font-semibold">No posts found</h2>
        <p className="text-zinc-500">Check back soon — more content is coming.</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">Blog</h1>
      <PostList posts={posts} pagination={pagination} hrefBase="/blog" />
    </div>
  )
}
