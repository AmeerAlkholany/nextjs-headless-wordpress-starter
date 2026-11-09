import { describe, it, expect, vi, afterEach } from "vitest"
import { NextRequest } from "next/server"
import { POST as revalidateHandler } from "@/app/api/revalidate/route"
import { normalizePath } from "./revalidation"

describe("normalizePath", () => {
  it("normalizes a slug into a canonical path", () => {
    expect(normalizePath("hello-world")).toBe("/hello-world")
    expect(normalizePath("/hello-world/")).toBe("/hello-world")
    expect(normalizePath("blog/post")).toBe("/blog/post")
  })
})

describe("POST /api/revalidate", () => {
  const VALID_SECRET = "super-secret-token"

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
  })

  it("rejects requests without a secret", async () => {
    const request = new NextRequest(new URL("http://localhost/api/revalidate"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "post", id: 1, slug: "hello" }),
    })

    const response = await revalidateHandler(request)
    expect(response.status).toBe(401)
  })

  it("validates post revalidation routes", async () => {
    vi.stubEnv("WORDPRESS_REVALIDATE_SECRET", VALID_SECRET)
    const request = new NextRequest(new URL("http://localhost/api/revalidate"), {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: VALID_SECRET },
      body: JSON.stringify({ type: "post", id: 1, slug: "hello" }),
    })

    const response = await revalidateHandler(request)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.revalidated).toContain("/blog/hello")
  })
})
