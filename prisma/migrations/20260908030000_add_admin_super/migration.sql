-- AlterTable: tambahkan kolom isSuper untuk menandai super admin (pengelola akun admin).
ALTER TABLE "admins" ADD COLUMN "isSuper" BOOLEAN NOT NULL DEFAULT false;
