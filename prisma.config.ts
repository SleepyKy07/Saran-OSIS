// Konfigurasi Prisma (dibaca oleh Prisma CLI: generate, migrate, dsb).
// Butuh paket: prisma, dotenv
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// DIRECT_URL dipakai untuk perintah yang butuh koneksi langsung (migrasi),
// karena PgBouncer (URL pooler Neon) tidak mendukung semua operasi migrasi.
// Di lokal biasanya tidak ada pooler, jadi fallback ke DATABASE_URL.
const directUrl = process.env.DIRECT_URL || env("DATABASE_URL");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    // Runtime & perintah umum memakai URL pooler (banyak koneksi di serverless).
    url: env("DATABASE_URL"),
    // Migrasi memakai koneksi langsung.
    directUrl,
  },
});
