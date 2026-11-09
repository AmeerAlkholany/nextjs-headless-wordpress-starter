import Link from "next/link"
import { NormalizedPost } from "@/lib/wordpress/types"
import { cn } from "@/lib/utils"
import { FeaturedImage } from "./FeaturedImage"

interface PostCardProps {
  post: NormalizedPost
  variant?: "compact" | "grid"
}

export function PostCard({ post, variant = "compact" }: PostCardProps) {
  const isCompact = variant === "compact"

  return (
    <article className={cn("group flex flex-col", isCompact ? "gap-3" : "gap-4")}>
      {!isCompact && post.featuredMedia && (
        <Link href={`/blog/${post.slug}`} className="block">
          <FeaturedImage
            media={post.featuredMedia}
            alt={post.featuredMedia.alt_text || post.title}
            width={post.featuredMedia.media_details.width}
            height={post.featuredMedia.media_details.height}
            sizes={isCompact ? "30vw" : "50vw"}
            className="rounded-lg"
          />
        </Link>
      )}

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <div className="mb-2 flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
            {post.author && (
              <Link
                href={`/author/${post.author.slug}`}
                className="hover:text-zinc-900 dark:hover:text-zinc-200"
              >
                {post.author.name}
              </Link>
            )}
            <time dateTime={post.date}>{post.formattedDate}</time>
          </div>

          <Link href={`/blog/${post.slug}`}>
            <h2 className={cn(
              "font-bold leading-snug group-hover:underline",
              isCompact ? "text-xl" : "text-2xl"
            )}>
              {post.title}
            </h2>
          </Link>
        </div>

        <div className={cn("mt-3 text-zinc-600 dark:text-zinc-300", isCompact ? "line-clamp-3" : "line-clamp-4")}>
          <p>{post.excerpt}</p>
        </div>

        {!isCompact && post.categories.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {post.categories.slice(0, 3).map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </article>
  )
}
