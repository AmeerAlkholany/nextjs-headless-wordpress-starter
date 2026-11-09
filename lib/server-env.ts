/**
 * Server-only environment access.
 *
 * Next.js 13+ can inline non-special env vars into the client bundle if they
 * lack the NEXT_PUBLIC_ prefix. These helpers read env on the server and never
 * ship values to the client.
 */

export interface ServerEnv {
  WORDPRESS_API_URL: string
  WORDPRESS_REVALIDATE_SECRET: string
}

export async function getServerSideEnv(): Promise<ServerEnv> {
  return {
    WORDPRESS_API_URL: process.env.WORDPRESS_API_URL ?? "",
    WORDPRESS_REVALIDATE_SECRET: process.env.WORDPRESS_REVALIDATE_SECRET ?? "",
  }
}
