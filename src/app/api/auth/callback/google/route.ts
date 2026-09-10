import { NextRequest, NextResponse } from "next/server";
import { hashGoogleSub } from "@/lib/security";
import { ensureDisplayCode } from "@/lib/account-code";
import { sessionCookieOptions, signSiswaToken } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { clientIp, rateLimit } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

function homeWithError(req: NextRequest, message: string) {
  const url = req.nextUrl.clone();
  url.pathname = "/";
  url.search = "";
  url.searchParams.set("auth_error", message);
  const res = NextResponse.redirect(url);
  res.cookies.delete("oauth_state");
  return res;
}

// Callback OAuth Google: tukar code -> token -> userinfo (sub) ->
// simpan HANYA hash sub -> buat sesi siswa -> redirect ke "/".
// Nilai mentah `sub`/email TIDAK disimpan di DB (tetap anonim ke admin).
export async function GET(req: NextRequest) {
  if (!(await rateLimit(`google-callback:${clientIp(req)}`, 20, 60_000))) {
    return homeWithError(req, "Terlalu banyak percobaan. Coba lagi semenit.");
  }

  const params = req.nextUrl.searchParams;
  if (params.get("error")) {
    return homeWithError(req, "Login Google dibatalkan. Silakan coba lagi.");
  }

  const code = params.get("code");
  const state = params.get("state");
  const expectedState = req.cookies.get("oauth_state")?.value;
  if (!code || !state || !expectedState || state !== expectedState) {
    return homeWithError(req, "Sesi login tidak valid. Silakan coba lagi.");
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return homeWithError(req, "Login Google belum dikonfigurasi.");
  }

  const origin = req.nextUrl.origin;
  const redirectUri = `${origin}/api/auth/callback/google`;

  // 1. Tukar authorization code dengan access token.
  let accessToken: string | null = null;
  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    });
    const tokenJson = (await tokenRes.json()) as {
      access_token?: string;
      error?: string;
    };
    if (!tokenRes.ok || !tokenJson.access_token) {
      return homeWithError(req, "Gagal verifikasi ke Google. Coba lagi.");
    }
    accessToken = tokenJson.access_token;
  } catch {
    return homeWithError(req, "Gagal menghubungi Google. Coba lagi.");
  }

  // 2. Ambil identitas stabil (sub) via userinfo.
  let sub: string | null = null;
  try {
    const meRes = await fetch(
      "https://openidconnect.googleapis.com/v1/userinfo",
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    const me = (await meRes.json()) as { sub?: string };
    if (!meRes.ok || !me.sub) {
      return homeWithError(req, "Gagal membaca akun Google. Coba lagi.");
    }
    sub = me.sub;
  } catch {
    return homeWithError(req, "Gagal membaca akun Google. Coba lagi.");
  }

  // 3. Upsert penanda jatah by hash sub (tanpa simpan email/sub mentah).
  let studentId: string;
  try {
    const student = await prisma.student.upsert({
      where: { googleSubHash: hashGoogleSub(sub) },
      update: {},
      create: { googleSubHash: hashGoogleSub(sub) },
    });
    studentId = student.id;
    // Akun lama belum punya kode — isi sekali, dipakai untuk reset jatah.
    if (!student.displayCode) {
      await ensureDisplayCode(student.id);
    }
  } catch {
    return homeWithError(req, "Gagal menyiapkan sesi. Coba lagi.");
  }

  const token = await signSiswaToken(studentId);
  const res = NextResponse.redirect(new URL("/", origin));
  res.cookies.delete("oauth_state");
  res.cookies.set("siswa_session", token, sessionCookieOptions(12 * 60 * 60));
  return res;
}
