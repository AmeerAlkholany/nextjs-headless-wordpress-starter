import { PostCard } from "./PostCard"
import { Pagination } from "./Pagination"
import { NormalizedPost, WPPaginationMeta } from "@/lib/wordpress/types"

interface PostListProps {
  posts: NormalizedPost[]
  pagination?: WPPaginationMeta | null
  hrefBase?: string
}

export function PostList({ posts, pagination, hrefBase = "/blog" }: PostListProps) {
  if (posts.length === 0) {
    return <p className="text-zinc-500">No posts found.</p>
  }

  return (
    <div>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-12">
          <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} hrefBase={hrefBase} />
        </div>
      )}
    </div>
  )
}
