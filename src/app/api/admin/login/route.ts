import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyPassword } from "@/lib/security";
import { ADMIN_COOKIE, sessionCookieOptions, signAdminToken } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { adminLoginSchema } from "@/lib/validation";

export async function POST(req: Request) {
  if (!(await rateLimit(`admin-login:${clientIp(req)}`, 8, 60_000))) {
    return NextResponse.json({ error: "Terlalu banyak percobaan. Coba lagi semenit." }, { status: 429 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Format data tidak valid." }, { status: 400 });
  }
  const parsed = adminLoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Username atau password tidak valid." }, { status: 400 });
  }
  const admin = await prisma.admin.findUnique({ where: { username: parsed.data.username } });
  if (!admin || !(await verifyPassword(parsed.data.password, admin.passwordHash))) {
    return NextResponse.json({ error: "Username atau password salah." }, { status: 401 });
  }
  const token = await signAdminToken(admin.id);
  const store = await cookies();
  store.set(ADMIN_COOKIE, token, sessionCookieOptions(12 * 60 * 60));
  return NextResponse.json({ ok: true, name: admin.name });
}
