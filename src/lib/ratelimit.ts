import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Rate limiting.
//
// Di serverless (Vercel) memori per-instance tidak dibagi, jadi penghitung
// in-memory TIDAK efektif (limit bocor antar instance). Bila Upstash Redis
// dikonfigurasi, kita pakai itu (penghitung bersama & akurat).
//
// Bila tidak dikonfigurasi (mis. dev lokal), fallback ke in-memory supaya
// aplikasi tetap jalan — dengan catatan proteksinya hanya per-instance.

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = url && token ? new Redis({ url, token }) : null;

// Cache limiter per (limit, window) agar tidak membuat objek berulang.
const limiters = new Map<string, Ratelimit>();

function getLimiter(limit: number, windowMs: number): Ratelimit | null {
  if (!redis) return null;
  const k = `${limit}:${windowMs}`;
  let l = limiters.get(k);
  if (!l) {
    l = new Ratelimit({
      redis,
      // Sliding window lebih adil dibanding fixed window.
      limiter: Ratelimit.slidingWindow(limit, `${Math.max(1, Math.round(windowMs / 1000))} s`),
      // Beri prefix agar mudah dibedakan di dashboard Upstash.
      prefix: "ratelimit",
      analytics: false,
    });
    limiters.set(k, l);
  }
  return l;
}

// --- Fallback in-memory (per-instance) ---
type Entry = { count: number; resetAt: number };
const store = new Map<string, Entry>();

function rateLimitMemory(key: string, limit: number, windowMs: number): boolean {
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

/**
 * Kembalikan `true` bila permintaan diizinkan, `false` bila melewati limit.
 * Aman dipakai sebagai `await rateLimit(...)`.
 */
export async function rateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  const limiter = getLimiter(limit, windowMs);
  if (!limiter) return rateLimitMemory(key, limit, windowMs);
  try {
    const { success } = await limiter.limit(key);
    return success;
  } catch {
    // Bila Redis bermasalah, jangan blokir pengguna — pakai fallback lokal.
    return rateLimitMemory(key, limit, windowMs);
  }
}

export function clientIp(req: Request): string {
  const h = req.headers.get("x-forwarded-for");
  if (h) return h.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
