// Jalankan `prisma migrate deploy` memakai koneksi LANGSUNG (DIRECT_URL)
// bila tersedia; jika tidak, pakai DATABASE_URL seperti biasa.
//
// Kenapa:
// 1. Runtime memakai URL pooler (PgBouncer, mis. Neon). Perintah migrasi lebih
//    benar lewat koneksi langsung; Prisma 6 belum menerapkan `directUrl` dari
//    prisma.config.ts untuk perintah migrate, jadi kita set DATABASE_URL khusus
//    untuk proses ini.
// 2. PgBouncer mode transaksi berbagi PID sehingga advisory lock Prisma bisa
//    menggantung (error P1002 "advisory lock timeout"). Saat build otomatis
//    hanya ada satu proses migrasi, jadi advisory lock tidak diperlukan dan
//    kita nonaktifkan agar tidak pernah menggantung.
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import "dotenv/config";

const direct = process.env.DIRECT_URL;
const base = process.env.DATABASE_URL;

if (!direct && !base) {
  console.error("DATABASE_URL / DIRECT_URL tidak diisi.");
  process.exit(1);
}

const url = direct || base;
const label = direct ? "DIRECT_URL" : "DATABASE_URL";
console.log(`[migrate] memakai koneksi: ${label}`);

// Cari binari Prisma lokal agar jalan di Windows maupun Linux (Vercel).
const binDir = join(process.cwd(), "node_modules", ".bin");
const local = join(binDir, process.platform === "win32" ? "prisma.cmd" : "prisma");
const cmd = existsSync(local) ? local : "prisma";

const r = spawnSync(cmd, ["migrate", "deploy"], {
  stdio: "inherit",
  shell: true,
  env: {
    ...process.env,
    DATABASE_URL: url,
    PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK: "true",
  },
});

process.exit(r.status ?? 1);
