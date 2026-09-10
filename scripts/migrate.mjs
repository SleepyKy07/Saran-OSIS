// Jalankan `prisma migrate deploy` memakai koneksi LANGSUNG (DIRECT_URL)
// bila tersedia; jika tidak, pakai DATABASE_URL seperti biasa.
//
// Kenapa perlu: saat runtime memakai URL pooler (PgBouncer, mis. Neon),
// perintah migrasi sebaiknya lewat koneksi langsung. Prisma 6 belum
// menerapkan `directUrl` dari prisma.config.ts untuk perintah migrate,
// jadi kita set DATABASE_URL secara eksplisit untuk proses ini saja.
import { spawnSync } from "node:child_process";
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

const r = spawnSync("prisma", ["migrate", "deploy"], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, DATABASE_URL: url },
});

process.exit(r.status ?? 1);
