type Entry = { count: number; resetAt: number };
const store = new Map<string, Entry>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const cur = store.get(key);
  if (!cur || now > cur.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (cur.count >= limit) return false;
  cur.count += 1;
  return true;
}

export function clientIp(req: Request): string {
  const h = req.headers.get("x-forwarded-for");
  if (h) return h.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
