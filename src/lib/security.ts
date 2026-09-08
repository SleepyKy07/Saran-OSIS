import { createHmac, timingSafeEqual } from "crypto";
import bcrypt from "bcryptjs";

function getSecret(name: string): string {
  const v = process.env[name];
  if (!v || v.length < 32) {
    throw new Error(`Environment variable ${name} belum diisi (min 32 karakter).`);
  }
  return v;
}

export function hashNis(nis: string): string {
  const secret = getSecret("NIS_HASH_SECRET");
  return createHmac("sha256", secret).update(nis.trim()).digest("hex");
}

// Hash satu arah untuk Google `sub` (ID unik per akun Google).
// Memakai NIS_HASH_SECRET yang sudah ada agar tidak perlu generate secret baru.
// 1 akun Google = 1 hash = 1 jatah kirim. Nilai mentah `sub`/email tidak disimpan.
export function hashGoogleSub(sub: string): string {
  const secret = getSecret("NIS_HASH_SECRET");
  return createHmac("sha256", secret).update(`google:${sub.trim()}`).digest("hex");
}

export function safeEqualHex(a: string, b: string): boolean {
  const ba = Buffer.from(a, "hex");
  const bb = Buffer.from(b, "hex");
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  if (!plain || !hash) return false;
  return bcrypt.compare(plain, hash);
}

export function sanitizeMessage(input: string): string {
  let s = input.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
  s = s.replace(/<[^>]*>/g, "");
  s = s.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n");
  return s.trim().slice(0, 2000);
}

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const LONG_DIGIT_RE = /\d[\d .\-()]{9,}\d/;
const URL_RE = /https?:\/\/|www\./i;

export function personalDataWarning(message: string): string | null {
  if (EMAIL_RE.test(message))
    return "Isi kritik terdeteksi mengandung alamat email. Hapus email agar tetap anonim.";
  if (LONG_DIGIT_RE.test(message))
    return "Isi kritik terdeteksi mengandung nomor panjang (kemungkinan HP/telepon). Hapus nomor tersebut agar tetap anonim.";
  if (URL_RE.test(message))
    return "Isi kritik terdeteksi mengandung tautan/URL. Hapus tautan yang memuat identitas.";
  return null;
}
