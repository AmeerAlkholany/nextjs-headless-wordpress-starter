import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { PostCard } from "./PostCard"
import { normalizePost } from "@/lib/wordpress/posts"

const MOCK_POST = normalizePost({
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
  featured_media: 0,
  comment_status: "open",
  ping_status: "open",
  sticky: false,
  template: "",
  format: "standard",
  categories: [],
  tags: [],
  meta: [],
  _links: {
    self: [{ href: "http://localhost/wp-json/wp/v2/posts/1" }],
    collection: [{ href: "http://localhost/wp-json/wp/v2/posts" }],
    about: [{ href: "http://localhost/wp-json/wp/v2/types/post" }],
    author: [{ embeddable: true, href: "http://localhost/wp-json/wp/v2/users/1" }],
    replies: [{ embeddable: true, href: "http://localhost/wp-json/wp/v2/comments?post=1" }],
    "version-history": [{ href: "http://localhost/wp-json/wp/v2/posts/1/revisions" }],
  },
})

describe("PostCard", () => {
  it("renders post title and excerpt", () => {
    render(<PostCard post={MOCK_POST} />)
    expect(screen.getByRole("heading", { name: /Hello world/i })).toBeTruthy()
    expect(screen.getByText(/An excerpt/i)).toBeTruthy()
  })

  it("links to post detail page", () => {
    render(<PostCard post={MOCK_POST} />)
    const link = screen.getByRole("link", { name: /Hello world/i })
    expect(link.getAttribute("href")).toBe("/blog/hello-world")
  })
})
