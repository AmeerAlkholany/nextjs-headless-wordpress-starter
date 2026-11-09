import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Site",
  description: "WordPress-managed pages.",
}

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return children
}
