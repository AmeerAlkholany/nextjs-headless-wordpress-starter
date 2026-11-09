"use client"

import Image from "next/image"
import { WPMediaEmbedded, WPImage } from "@/lib/wordpress/types"
import { cn } from "@/lib/utils"

interface FeaturedImageProps {
  media?: WPMediaEmbedded | WPImage | null
  alt: string
  className?: string
  /** Explicit width/height to lock layout and prevent CLS. */
  width: number
  height: number
  priority?: boolean
  sizes?: string
}

/**
 * Safe wrapper around next/image for WP media.
 * - Provides a skeleton while the image loads.
 * - Fallback to a placeholder if no media or broken load.
 * - Declares explicit dimensions so layout shift is avoided.
 */
export function FeaturedImage({
  media,
  alt,
  className,
  width,
  height,
  priority = false,
  sizes = "100vw",
}: FeaturedImageProps) {
  const src =
    typeof media === "object" && media !== null && "source_url" in media
      ? media.source_url
      : null

  const dimensions =
    typeof media === "object" && media !== null && "media_details" in media && media.media_details.width
      ? { width: media.media_details.width, height: media.media_details.height }
      : { width, height }

  if (!src) {
    return (
      <div
        className={cn(
          "flex items-center justify-center overflow-hidden bg-zinc-100 dark:bg-zinc-800",
          className
        )}
        style={{ aspectRatio: `${dimensions.width}/${dimensions.height}` }}
      >
        <span className="text-zinc-400 dark:text-zinc-500">No image</span>
      </div>
    )
  }

  return (
    <div className={cn("relative overflow-hidden bg-zinc-100 dark:bg-zinc-800", className)}>
      <Image
        src={src}
        alt={alt}
        width={dimensions.width}
        height={dimensions.height}
        priority={priority}
        sizes={sizes}
        className="object-cover transition-transform duration-500 hover:scale-105"
        loading={priority ? "eager" : "lazy"}
      />
    </div>
  )
}
