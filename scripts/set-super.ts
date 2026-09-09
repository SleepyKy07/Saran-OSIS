import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const superUsername = process.env.SUPER_ADMIN_USERNAME || process.env.ADMIN_USERNAME || "admin";
  const all = await prisma.admin.findMany({
    select: { id: true, username: true, name: true, isSuper: true },
  });
  console.log("Semua admin saat ini:", JSON.stringify(all, null, 2));

  // Jadikan akun superUsername jadi super; admin lain tidak super.
  const target = all.find((a) => a.username === superUsername);
  if (!target) {
    console.log(`Tidak ada akun dengan username '${superUsername}'. Tidak ada yang ditandai super.`);
    return;
  }
  await prisma.$transaction([
    prisma.admin.updateMany({ where: { id: { not: target.id } }, data: { isSuper: false } }),
    prisma.admin.update({ where: { id: target.id }, data: { isSuper: true } }),
  ]);
  console.log(`Akun '${superUsername}' (${target.name}) kini menjadi SUPER admin.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
