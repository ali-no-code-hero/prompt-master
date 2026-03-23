/**
 * Lightweight reachability probe for citations (use from workers or on-demand).
 */
export async function checkUrlHttpStatus(
  url: string,
  timeoutMs = 8000,
): Promise<number | null> {
  try {
    const u = new URL(url);
    if (u.protocol !== "http:" && u.protocol !== "https:") {
      return null;
    }
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), timeoutMs);
    const res = await fetch(u.href, {
      method: "HEAD",
      signal: ac.signal,
      redirect: "follow",
    });
    clearTimeout(t);
    return res.status;
  } catch {
    return null;
  }
}
