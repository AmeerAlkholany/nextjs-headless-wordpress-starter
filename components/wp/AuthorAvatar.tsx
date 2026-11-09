import Image from "next/image"
import { WPAuthor } from "@/lib/wordpress/types"
import { cn } from "@/lib/utils"

interface AuthorAvatarProps {
  author: WPAuthor
  size?: "sm" | "md" | "lg"
  showName?: boolean
  className?: string
}

export function AuthorAvatar({ author, size = "md", showName = true, className }: AuthorAvatarProps) {
  const sizes = { sm: 24, md: 40, lg: 64 } as const
  const targetSize = sizes[size] as 12 | 24 | 48 | 96
  const url = author.avatar_urls[targetSize]

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {url && (
        <Image
          src={url}
          alt={author.name}
          width={sizes[size]}
          height={sizes[size]}
          className="rounded-full object-cover"
        />
      )}
      {showName && <span className="font-medium">{author.name}</span>}
    </div>
  )
}
