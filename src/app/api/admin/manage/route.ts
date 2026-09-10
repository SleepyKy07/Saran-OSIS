import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/admin-auth";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { hashPassword } from "@/lib/security";
import { adminCreateSchema } from "@/lib/validation";

// Khusus SUPER admin: daftar & buat akun admin lain.
export async function GET() {
  const me = await requireSuperAdmin();
  if (!me) {
    return NextResponse.json({ error: "Hanya super admin yang berhak." }, { status: 403 });
  }
  const admins = await prisma.admin.findMany({
    orderBy: [{ isSuper: "desc" }, { createdAt: "asc" }],
    select: {
      id: true,
      username: true,
      name: true,
      isSuper: true,
      createdAt: true,
    },
  });
  return NextResponse.json({ admins, me });
}

export async function POST(req: Request) {
  const me = await requireSuperAdmin();
  if (!me) {
    return NextResponse.json({ error: "Hanya super admin yang berhak." }, { status: 403 });
  }
  if (!(await rateLimit(`admin-create:${clientIp(req)}`, 10, 60_000))) {
    return NextResponse.json({ error: "Terlalu banyak percobaan. Coba lagi semenit." }, { status: 429 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Format data tidak valid." }, { status: 400 });
  }
  const parsed = adminCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
      { status: 400 },
    );
  }
  const existing = await prisma.admin.findUnique({ where: { username: parsed.data.username } });
  if (existing) {
    return NextResponse.json({ error: "Username sudah dipakai. Pilih username lain." }, { status: 409 });
  }
  const admin = await prisma.admin.create({
    data: {
      name: parsed.data.name,
      username: parsed.data.username,
      passwordHash: await hashPassword(parsed.data.password),
    },
    select: { id: true, username: true, name: true, isSuper: true, createdAt: true },
  });
  return NextResponse.json({ ok: true, admin });
}
