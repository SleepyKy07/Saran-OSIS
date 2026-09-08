import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { updateSuggestionSchema } from "@/lib/validation";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
  }
  const { id } = await ctx.params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Format data tidak valid." }, { status: 400 });
  }
  const parsed = updateSuggestionSchema.safeParse(body);
  if (!parsed.success || Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: "Data tidak valid." }, { status: 400 });
  }
  try {
    const { archived, ...rest } = parsed.data;
    const item = await prisma.suggestion.update({
      where: { id },
      data: {
        ...rest,
        ...(archived === undefined
          ? {}
          : archived
            ? { archived: true, archivedAt: new Date() }
            : { archived: false, archivedAt: null }),
      },
    });
    return NextResponse.json({
      ok: true,
      item: { id: item.id, status: item.status, isFlagged: item.isFlagged, archived: item.archived },
    });
  } catch {
    return NextResponse.json({ error: "Kritik tidak ditemukan." }, { status: 404 });
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
  }
  const { id } = await ctx.params;
  try {
    await prisma.suggestion.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Kritik tidak ditemukan." }, { status: 404 });
  }
}
