/**
 * WordPress REST API client.
 */

import { WPRequestError } from "./types"

export const WORDPRESS_API_URL = (() => {
  const url = process.env.WORDPRESS_API_URL?.trim()
  if (!url) {
    throw new Error(
      "WORDPRESS_API_URL is required. Add it to .env.local (not committed) or your hosting platform environment variables."
    )
  }
  return new URL(url).href
})()

const BASE_HEADERS = new Headers({
  "Content-Type": "application/json",
  Accept: "application/json",
})

export function wpPath(path: string): string {
  const cleanBase = WORDPRESS_API_URL.replace(/\/$/, "")
  const cleanPath = path.replace(/^\//, "")
  return `${cleanBase}/${cleanPath}`
}

export async function wpFetch<T>(
  path: string,
  init?: RequestInit & { revalidate?: number }
): Promise<{ data: T; revalidate: number | undefined }> {
  const url = wpPath(path)
  const signal = init?.signal

  const response = await fetch(url, {
    ...init,
    headers: new Headers({ ...BASE_HEADERS, ...init?.headers }),
    signal,
  })

  const raw = await response.text()

  if (response.headers.get("content-type")?.includes("text/html")) {
    throw new WPRequestError("wpFetch", "WordPress returned HTML (possible 404 or bot-block).", response.status, { url, raw: raw.slice(0, 200) })
  }

  let data: T
  try {
    data = JSON.parse(raw) as T
  } catch {
    throw new WPRequestError(
      "wpFetch",
      raw.length > 200 ? raw.slice(0, 200) : raw,
      response.status,
      { url }
    )
  }

  return {
    data,
    revalidate: init?.revalidate ?? Number(response.headers.get("x-revalidate")),
  }
}

export async function wpFetchRevalidate<T>(
  path: string,
  nextPath: string,
  init?: RequestInit & { revalidate?: number }
): Promise<{ data: T; revalidated: string }> {
  const { data } = await wpFetch<T>(path, {
    ...init,
    revalidate: init?.revalidate ?? 0,
  })
  return { data, revalidated: nextPath }
}

export function parseWPPaginationHeaders(
  headers: Headers,
  page: number
): import("./types").WPPaginationMeta | null {
  const total = Number(headers.get("X-WP-Total") ?? 0)
  const totalPages = Number(headers.get("X-WP-TotalPages") ?? 1)

  if (total <= 0 && totalPages <= 0) return null

  return {
    total,
    totalPages,
    page,
    hasMore: page < totalPages,
  }
}

export function mapWpStatus(status: number): import("./types").WPErrorCode {
  if (status === 404) return "NOT_FOUND"
  if (status === 403) return "FORBIDDEN"
  if (status === 401) return "AUTHENTICATION_REQUIRED"
  if (status === 422) return "UNPROCESSABLE_CONTENT"
  if (status >= 500) return "API_UNAVAILABLE"
  return "MALFORMED_RESPONSE"
}

export { WPRequestErrorBase as WPRequestError } from "./types"
export type { WPPaginationMeta, WPErrorCode } from "./types"
