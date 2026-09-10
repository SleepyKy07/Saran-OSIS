import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { customAlphabet } from "nanoid";
import { verifySiswaToken } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { personalDataWarning, sanitizeMessage } from "@/lib/security";
import { suggestionSchema } from "@/lib/validation";

const publicIdGen = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);

export async function POST(req: Request) {
  if (!(await rateLimit(`kirim:${clientIp(req)}`, 5, 60_000))) {
    return NextResponse.json({ error: "Terlalu banyak percobaan. Coba lagi semenit." }, { status: 429 });
  }
  const store = await cookies();
  const sid = await verifySiswaToken(store.get("siswa_session")?.value ?? "");
  if (!sid) {
    return NextResponse.json({ error: "Sesi tidak valid. Silakan login ulang dengan Google." }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Format data tidak valid." }, { status: 400 });
  }
  const parsed = suggestionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data tidak valid." }, { status: 400 });
  }
  const message = sanitizeMessage(parsed.data.message);
  if (message.length < 10) {
    return NextResponse.json({ error: "Isi kritik minimal 10 karakter." }, { status: 400 });
  }
  const warning = personalDataWarning(message);
  if (warning) {
    return NextResponse.json({ error: warning }, { status: 422 });
  }
  try {
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const student = await tx.student.findUnique({ where: { id: sid } });
      if (!student || student.isUsed) throw new Error("USED");
      // Kritik disimpan TANPA relasi ke identitas siswa mana pun.
      // Prioritas ditentukan oleh admin; semua kiriman baru default "BIASA".
      await tx.suggestion.create({
        data: {
          publicId: `KS-${publicIdGen()}`,
          message,
        },
      });
      await tx.student.update({
        where: { id: sid },
        data: { isUsed: true, usedAt: new Date() },
      });
    });
  } catch (e) {
    if (e instanceof Error && e.message === "USED") {
      return NextResponse.json(
        { error: "Kamu sudah menggunakan jatah pengiriman kritik/saran. Terima kasih atas partisipasimu." },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: "Gagal mengirim. Silakan coba lagi." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
