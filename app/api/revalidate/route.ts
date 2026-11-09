import { NextRequest, NextResponse } from "next/server"
import { revalidatePath, revalidateTag } from "next/cache"
import { normalizePath, WPRevalidationPayload } from "@/lib/revalidation"

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = request.headers.get("authorization") ?? request.headers.get("x-revalidate-secret")
    if (!auth || auth !== process.env.WORDPRESS_REVALIDATE_SECRET) {
      return NextResponse.json({ error: "Invalid secret" }, { status: 401 })
    }

    let payload: WPRevalidationPayload
    try {
      payload = await request.json() as WPRevalidationPayload
    } catch {
      return NextResponse.json({ error: "Malformed JSON" }, { status: 400 })
    }

    const { type, slug } = payload

    if (!type || !["post", "page", "category", "tag"].includes(type)) {
      return NextResponse.json(
        { error: `Unsupported type: ${type}` },
        { status: 400 }
      )
    }

    const revalidated = new Set<string>()

    switch (type) {
      case "post":
        if (slug) revalidated.add(normalizePath(`/blog/${slug}`))
        revalidated.add("/blog")
        revalidated.add("/")
        revalidated.add("/sitemap.xml")
        break
      case "page":
        if (slug) revalidated.add(normalizePath(`/${slug}`))
        revalidated.add("/sitemap.xml")
        break
      case "category":
      case "tag":
        const taxPrefix = type === "category" ? "category" : "tag"
        if (slug) revalidated.add(normalizePath(`/${taxPrefix}s/${slug}`))
        revalidated.add("/sitemap.xml")
        break
    }

    revalidated.forEach((pathOrTag) => {
      if (pathOrTag.startsWith("/")) {
        revalidatePath(pathOrTag, "layout")
      } else {
        revalidateTag(pathOrTag)
      }
    })

    return NextResponse.json({
      revalidated: Array.from(revalidated),
      count: revalidated.size,
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    )
  }
}

export async function OPTIONS(): Promise<NextResponse> {
  return NextResponse.json({}, { headers: { Allow: "POST, OPTIONS" } })
}
