import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/security";

const prisma = new PrismaClient();

// Seed opsi ringan (login Google): hanya siapkan akun admin.
// Akun siswa dibuat otomatis saat pertama kali login Google
// (upsert by hash Google `sub` di /api/auth/callback/google).
async function main() {
  const username = process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const name = process.env.ADMIN_NAME || "Admin OSIS";
  // Akun super dibuat dari konfigurasi env (SUPER_ADMIN_USERNAME default ke ADMIN_USERNAME).
  const superUsername = process.env.SUPER_ADMIN_USERNAME || username;

  const admin = await prisma.admin.upsert({
    where: { username },
    update: { name, isSuper: username === superUsername },
    create: {
      username,
      name,
      isSuper: username === superUsername,
      passwordHash: await hashPassword(password),
    },
  });
  console.log(`Admin siap: ${username}${admin.isSuper ? " (SUPER)" : ""}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
