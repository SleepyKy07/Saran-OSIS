import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { archiveScopeSchema } from "@/lib/validation";
import { PRIORITIES, STATUSES } from "@/lib/constants";

const pris = new Set(PRIORITIES.map((p) => p.value));
const stats = new Set(STATUSES.map((s) => s.value));

export async function GET(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
  }
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim().slice(0, 100);
  const status = url.searchParams.get("status") ?? "";
  const priority = url.searchParams.get("priority") ?? "";
  const flagged = url.searchParams.get("flagged") ?? "";
  // Tab dashboard: "0" = Aktif (default), "1" = Arsip/Riwayat, "all" = keduanya.
  const archivedParam = url.searchParams.get("archived") ?? "0";
  const archivedFilter =
    archivedParam === "1" ? true : archivedParam === "all" ? undefined : false;
  // Admin hanya menerima field anonim. Tidak ada identitas pengirim.
  const items = await prisma.suggestion.findMany({
    where: {
      ...(archivedFilter === undefined ? {} : { archived: archivedFilter }),
      ...(status && stats.has(status as never) ? { status: status as never } : {}),
      ...(priority && pris.has(priority as never) ? { priority: priority as never } : {}),
      ...(flagged === "1" ? { isFlagged: true } : {}),
      ...(q ? { message: { contains: q, mode: "insensitive" } } : {}),
    },
    select: {
      id: true,
      publicId: true,
      message: true,
      priority: true,
      status: true,
      isFlagged: true,
      archived: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 500,
  });
  const [total, baru, diproses, selesai, arsip] = await Promise.all([
    prisma.suggestion.count({ where: { archived: false } }),
    prisma.suggestion.count({ where: { archived: false, status: "BARU" } }),
    prisma.suggestion.count({ where: { archived: false, status: "DIPROSES" } }),
    prisma.suggestion.count({ where: { archived: false, status: "SELESAI" } }),
    prisma.suggestion.count({ where: { archived: true } }),
  ]);
  return NextResponse.json({ items, stats: { total, baru, diproses, selesai, arsip } });
}

// Arsipkan massal ke Riwayat: scope "selesai" (yang SELESAI saja)
// atau "all" (semua yang masih aktif). Tidak menghapus data.
export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
  }
  if (!rateLimit(`arsip:${clientIp(req)}`, 10, 60_000)) {
    return NextResponse.json({ error: "Terlalu banyak percobaan. Coba lagi semenit." }, { status: 429 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Format data tidak valid." }, { status: 400 });
  }
  const parsed = archiveScopeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Data tidak valid." }, { status: 400 });
  }
  const r = await prisma.suggestion.updateMany({
    where:
      parsed.data.scope === "selesai"
        ? { archived: false, status: "SELESAI" }
        : { archived: false },
    data: { archived: true, archivedAt: new Date() },
  });
  return NextResponse.json({ ok: true, archived: r.count });
}
