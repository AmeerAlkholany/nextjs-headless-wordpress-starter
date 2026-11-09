import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Blog",
  description: "All posts from our WordPress-powered blog.",
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children
}
