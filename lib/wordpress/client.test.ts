import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import {
  wpPath,
  parseWPPaginationHeaders,
  mapWpStatus,
  WPRequestError,
} from "./client"

const ORIGIN = "http://localhost:8080"

describe("wpPath", () => {
  beforeEach(() => {
    vi.stubEnv("WORDPRESS_API_URL", ORIGIN)
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it("builds a clean WP REST path", () => {
    expect(wpPath("posts")).toBe(`${ORIGIN}/posts`)
    expect(wpPath("/posts")).toBe(`${ORIGIN}/posts`)
    expect(wpPath("posts?slug=hello")).toBe(`${ORIGIN}/posts?slug=hello`)
  })

  it("strips trailing slashes from the base", () => {
    vi.stubEnv("WORDPRESS_API_URL", `${ORIGIN}/`)
    expect(wpPath("posts")).toBe(`${ORIGIN}/posts`)
  })
})

describe("parseWPPaginationHeaders", () => {
  it("parses WP pagination headers into meta", () => {
    const headers = new Headers({
      "X-WP-Total": "47",
      "X-WP-TotalPages": "5",
    })
    const meta = parseWPPaginationHeaders(headers, 2)
    expect(meta).toEqual({
      total: 47,
      totalPages: 5,
      page: 2,
      hasMore: true,
    })
  })

  it("returns null when both counts are missing", () => {
    const meta = parseWPPaginationHeaders(new Headers(), 1)
    expect(meta).toBeNull()
  })

  it("computes hasMore from page vs totalPages", () => {
    const headers = new Headers({
      "X-WP-Total": "10",
      "X-WP-TotalPages": "2",
    })
    expect(parseWPPaginationHeaders(headers, 1)?.hasMore).toBe(true)
    expect(parseWPPaginationHeaders(headers, 2)?.hasMore).toBe(false)
  })
})

describe("mapWpStatus", () => {
  it("maps WP status codes to error types", () => {
    expect(mapWpStatus(404)).toBe("NOT_FOUND")
    expect(mapWpStatus(403)).toBe("FORBIDDEN")
    expect(mapWpStatus(401)).toBe("AUTHENTICATION_REQUIRED")
    expect(mapWpStatus(422)).toBe("UNPROCESSABLE_CONTENT")
    expect(mapWpStatus(500)).toBe("API_UNAVAILABLE")
    expect(mapWpStatus(503)).toBe("API_UNAVAILABLE")
    expect(mapWpStatus(400)).toBe("MALFORMED_RESPONSE")
  })
})

describe("WPRequestError", () => {
  it("carries status, body, and errorType", () => {
    const err = new WPRequestError("getPostBySlug", "Not Found", 404, {
      url: `${ORIGIN}/posts?slug=missing`,
    })
    expect(err.message).toContain("Not Found")
    expect(err.status).toBe(404)
    expect(err.errorType).toBe("NOT_FOUND")
  })
})
