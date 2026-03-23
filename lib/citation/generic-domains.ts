/** Domains often used as generic background (not brand-owned proof). */
export const GENERIC_SOURCE_DOMAIN_SUFFIXES = [
  "wikipedia.org",
  "reddit.com",
  "quora.com",
  "youtube.com",
  "facebook.com",
  "twitter.com",
  "x.com",
  "linkedin.com",
  "tiktok.com",
  "instagram.com",
];

export function isGenericSourceHost(hostname: string): boolean {
  const h = hostname.toLowerCase().replace(/^www\./, "");
  return GENERIC_SOURCE_DOMAIN_SUFFIXES.some(
    (s) => h === s || h.endsWith(`.${s}`),
  );
}
