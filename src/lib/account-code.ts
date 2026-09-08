import { customAlphabet } from "nanoid";
import { prisma } from "@/lib/prisma";

const codeGen = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);

// Kode akun acak untuk reset jatah tanpa identitas.
// Ditunjukkan ke pemilik akun saja; admin hanya melihat kode ini (bukan email).
export function newDisplayCode(): string {
  return `AK-${codeGen()}`;
}

// Isi displayCode yang masih kosong (akun lama / race), dengan retry anti-duplikat.
export async function ensureDisplayCode(studentId: string): Promise<string> {
  const cur = await prisma.student.findUnique({
    where: { id: studentId },
    select: { displayCode: true },
  });
  if (cur?.displayCode) return cur.displayCode;
  for (let i = 0; i < 10; i++) {
    try {
      const r = await prisma.student.updateMany({
        where: { id: studentId, displayCode: null },
        data: { displayCode: newDisplayCode() },
      });
      if (r.count === 1) {
        const done = await prisma.student.findUnique({
          where: { id: studentId },
          select: { displayCode: true },
        });
        if (done?.displayCode) return done.displayCode;
      } else {
        // Sudah terisi oleh proses lain — baca ulang.
        const other = await prisma.student.findUnique({
          where: { id: studentId },
          select: { displayCode: true },
        });
        if (other?.displayCode) return other.displayCode;
      }
    } catch {
      // Kemungkinan kode duplikat (unique) — coba kode lain.
    }
  }
  throw new Error("Gagal membuat kode akun.");
}
