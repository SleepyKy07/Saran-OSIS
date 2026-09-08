import * as jose from "jose";

const SISWA_COOKIE = "siswa_session";
const ADMIN_COOKIE = "admin_session";

function key(secret: string) {
  return new TextEncoder().encode(secret);
}

function siswaSecret() {
  const s = process.env.SISWA_SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SISWA_SESSION_SECRET belum diisi.");
  return s;
}

function adminSecret() {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("ADMIN_SESSION_SECRET belum diisi.");
  return s;
}

export { SISWA_COOKIE, ADMIN_COOKIE };

export async function signSiswaToken(studentId: string) {
  return new jose.SignJWT({ sid: studentId, typ: "siswa" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(key(siswaSecret()));
}

export async function verifySiswaToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jose.jwtVerify(token, key(siswaSecret()));
    if (payload.typ !== "siswa" || typeof payload.sid !== "string") return null;
    return payload.sid;
  } catch {
    return null;
  }
}

export async function signAdminToken(adminId: string) {
  return new jose.SignJWT({ aid: adminId, typ: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(key(adminSecret()));
}

export async function verifyAdminToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jose.jwtVerify(token, key(adminSecret()));
    if (payload.typ !== "admin" || typeof payload.aid !== "string") return null;
    return payload.aid;
  } catch {
    return null;
  }
}

export function sessionCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}
