export function PostSkeleton({ featured = false }: { featured?: boolean }) {
  return (
    <div className="flex flex-col gap-4">
      <div
        className={
          "flex animate-pulse flex-col gap-4 overflow-hidden rounded-lg bg-zinc-200 dark:bg-zinc-700" +
          (featured ? " aspect-video w-full" : " aspect-[16/9] w-full")
        }
      />
      <div className="space-y-2">
        <div className="h-4 w-1/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="h-7 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="h-7 w-5/6 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
      </div>
    </div>
  )
}

export function ErrorFallback({
  message,
  onRetry,
}: {
  message?: string
  onRetry?: () => void
}) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
      <p className="font-medium">Something went wrong</p>
      {message && <p className="mt-1 text-sm">{message}</p>}
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Try again
        </button>
      )}
    </div>
  )
}
