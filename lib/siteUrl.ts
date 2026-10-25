/**
 * Public base URL, used for canonical links, the sitemap and Open Graph.
 * Set NEXT_PUBLIC_SITE_URL to the live domain; on Vercel the production
 * domain is used automatically when it isn't set.
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}
