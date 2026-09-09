import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function requireAdmin() {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  const aid = await verifyAdminToken(token);
  if (!aid) return null;
  const admin = await prisma.admin.findUnique({
    where: { id: aid },
    select: { id: true, username: true, name: true, isSuper: true },
  });
  return admin;
}

// Hanya super admin yang boleh memanggil. Mengembalikan objek super, atau null.
export async function requireSuperAdmin() {
  const admin = await requireAdmin();
  if (!admin?.isSuper) return null;
  return admin;
}
