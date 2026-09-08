import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

// Daftar akun untuk reset jatah. HANYA kode + status —
// hash identitas tidak pernah dikirim ke client.
export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
  }
  const [accounts, total, used] = await Promise.all([
    prisma.student.findMany({
      select: {
        id: true,
        displayCode: true,
        isUsed: true,
        usedAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 2000,
    }),
    prisma.student.count(),
    prisma.student.count({ where: { isUsed: true } }),
  ]);
  return NextResponse.json({ accounts, stats: { total, used } });
}
