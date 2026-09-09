import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/admin-auth";
import { hashPassword } from "@/lib/security";
import { adminUpdateSchema } from "@/lib/validation";

async function guard() {
  const me = await requireSuperAdmin();
  if (!me) return null;
  return me;
}

// Ubah nama dan/atau password admin lain.
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const me = await guard();
  if (!me) {
    return NextResponse.json({ error: "Hanya super admin yang berhak." }, { status: 403 });
  }
  const { id } = await ctx.params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Format data tidak valid." }, { status: 400 });
  }
  const parsed = adminUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
      { status: 400 },
    );
  }
  const target = await prisma.admin.findUnique({ where: { id } });
  if (!target) {
    return NextResponse.json({ error: "Admin tidak ditemukan." }, { status: 404 });
  }
  const data: { name?: string; passwordHash?: string } = {};
  if (parsed.data.name) data.name = parsed.data.name;
  if (parsed.data.password) data.passwordHash = await hashPassword(parsed.data.password);

  const updated = await prisma.admin.update({
    where: { id },
    data,
    select: { id: true, username: true, name: true, isSuper: true },
  });
  return NextResponse.json({ ok: true, admin: updated });
}

// Hapus admin lain. Super tidak bisa menghapus diri sendiri / super lain,
// sehingga minimal selalu ada satu super admin.
export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const me = await guard();
  if (!me) {
    return NextResponse.json({ error: "Hanya super admin yang berhak." }, { status: 403 });
  }
  const { id } = await ctx.params;
  if (id === me.id) {
    return NextResponse.json({ error: "Tidak bisa menghapus akun super yang sedang dipakai." }, { status: 400 });
  }
  const target = await prisma.admin.findUnique({ where: { id } });
  if (!target) {
    return NextResponse.json({ error: "Admin tidak ditemukan." }, { status: 404 });
  }
  if (target.isSuper) {
    return NextResponse.json({ error: "Tidak bisa menghapus akun super." }, { status: 400 });
  }
  await prisma.admin.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
