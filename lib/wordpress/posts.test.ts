import { describe, it, expect, vi, afterEach } from "vitest"
import * as client from "./client"
import { getPosts, getPostBySlug, normalizePost, PostNotFoundError } from "./posts"
import { WPPost, WPNotFound } from "./types"

const MOCK_POST: WPPost = {
  id: 1,
  date: "2025-01-15T10:00:00",
  date_gmt: "2025-01-15T10:00:00",
  guid: { rendered: "http://localhost/?p=1" },
  link: "http://localhost/blog/hello-world",
  modified: "2025-01-16T09:00:00",
  modified_gmt: "2025-01-16T09:00:00",
  slug: "hello-world",
  status: "publish",
  type: "post",
  title: { rendered: "Hello world!", protected: false },
  content: { rendered: "<p>Hello content</p>", protected: false },
  excerpt: { rendered: "An excerpt.", protected: false },
  author: 1,
  featured_media: 42,
  comment_status: "open",
  ping_status: "open",
  sticky: false,
  template: "",
  format: "standard",
  categories: [1, 2],
  tags: [3],
  meta: [],
  _links: {
    self: [{ href: "http://localhost/wp-json/wp/v2/posts/1" }],
    collection: [{ href: "http://localhost/wp-json/wp/v2/posts" }],
    about: [{ href: "http://localhost/wp-json/wp/v2/types/post" }],
    author: [{ embeddable: true, href: "http://localhost/wp-json/wp/v2/users/1" }],
    replies: [{ embeddable: true, href: "http://localhost/wp-json/wp/v2/comments?post=1" }],
    "version-history": [{ href: "http://localhost/wp-json/wp/v2/posts/1/revisions" }],
  },
}

describe("normalizePost", () => {
  it("flattens WP post into normalized shape", () => {
    const normalized = normalizePost(MOCK_POST)
    expect(normalized.slug).toBe("hello-world")
    expect(normalized.title).toBe("Hello world!")
    expect(normalized.content).toBe("<p>Hello content</p>")
    expect(normalized.excerpt).toBe("An excerpt.")
  })
})

describe("getPosts", () => {
  afterEach(() => vi.restoreAllMocks())

  it("returns posts", async () => {
    // Mock the fetch call inside getPosts
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([MOCK_POST]),
      headers: new Headers({ "X-WP-Total": "1", "X-WP-TotalPages": "1" }),
    })

    const result = await getPosts({ per_page: 10, page: 1 })
    expect(result.posts).toHaveLength(1)
  })

  it("throws when slug is not found", async () => {
    vi.spyOn(client, "wpFetchRevalidate").mockResolvedValueOnce({
      data: {
        code: "post_not_found",
        message: "No post found",
        data: { status: 404 },
      } as WPNotFound,
      revalidated: "/blog/missing",
    })

    await expect(getPostBySlug("missing")).rejects.toThrow(PostNotFoundError)
  })
})
