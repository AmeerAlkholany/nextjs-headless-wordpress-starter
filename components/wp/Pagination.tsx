import Link from "next/link"
import { cn } from "@/lib/utils"

interface PaginationProps {
  currentPage: number
  totalPages: number
  hrefBase?: string
}

export function Pagination({ currentPage, totalPages, hrefBase = "/blog" }: PaginationProps) {
  const pages: (number | string)[] = []

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...")
    }
  }

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-2">
      {currentPage > 1 && (
        <Link
          href={`${hrefBase}/page/${currentPage - 1}`}
          className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          Previous
        </Link>
      )}

      {pages.map((page, idx) =>
        typeof page === "number" ? (
          <Link
            key={idx}
            href={page === 1 ? hrefBase : `${hrefBase}/page/${page}`}
            className={cn(
              "min-w-[2.25rem] rounded-lg border px-3 py-1.5 text-center text-sm",
              page === currentPage
                ? "border-zinc-900 bg-zinc-900 font-semibold text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                : "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            )}
          >
            {page}
          </Link>
        ) : (
          <span key={idx} className="px-2 text-zinc-500">
            {page}
          </span>
        )
      )}

      {currentPage < totalPages && (
        <Link
          href={`${hrefBase}/page/${currentPage + 1}`}
          className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          Next
        </Link>
      )}
    </nav>
  )
}
