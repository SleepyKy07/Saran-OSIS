import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { resetAccountsSchema } from "@/lib/validation";

// Buka kembali jatah kirim: per akun (by id) atau semua sekaligus.
// Tidak menghapus akun maupun kritik — hanya isUsed=false.
export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
  }
  if (!(await rateLimit(`reset-akun:${clientIp(req)}`, 10, 60_000))) {
    return NextResponse.json({ error: "Terlalu banyak percobaan. Coba lagi semenit." }, { status: 429 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Format data tidak valid." }, { status: 400 });
  }
  const parsed = resetAccountsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
      { status: 400 },
    );
  }
  const r = parsed.data.all
    ? await prisma.student.updateMany({
        where: { isUsed: true },
        data: { isUsed: false, usedAt: null },
      })
    : await prisma.student.updateMany({
        where: { id: { in: parsed.data.ids }, isUsed: true },
        data: { isUsed: false, usedAt: null },
      });
  return NextResponse.json({ ok: true, reset: r.count });
}
