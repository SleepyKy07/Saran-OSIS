# Kotak Saran Digital OSIS

Website kritik & saran anonim untuk siswa. Satu akun Google hanya bisa mengirim **1 kali**.
Identitas siswa **tidak ditampilkan** kepada admin OSIS.

## Cara anonim 1x kirim bekerja

- Siswa login dengan **akun Google** (Gmail apa saja, tombol "Masuk dengan Google").
- ID akun Google (`sub`) disimpan sebagai **hash satu arah (HMAC-SHA256)** di tabel `students` yang
  **terpisah tanpa relasi** ke tabel `suggestions`. Email mentah tidak disimpan.
- Saat kirim, server dalam **satu transaksi**: cek `is_used=false` → simpan kritik
  (tanpa identitas apa pun) → tandai `is_used=true`.
- Admin hanya melihat: ID acak, isi, prioritas, tanggal, status.
- Tidak ada nama, NIS, email, kelas, nomor HP, atau IP di halaman/API admin.

## Syarat

- Node.js 20+
- Database PostgreSQL (lokal, Neon, atau Supabase)
- OAuth Client Google (Client ID + Secret) dari Google Cloud Console

## Jalankan lokal

```bash
npm install
# isi .env (lihat .env.example): DATABASE_URL + 3 secret + GOOGLE_CLIENT_ID/SECRET
# redirect URI Google: http://localhost:3000/api/auth/callback/google
npx prisma migrate dev
npm run db:seed
npm run dev
```

Buka http://localhost:3000

- Halaman siswa: `/`
- Privasi & anonimitas: `/privasi`
- Login admin: `/admin/login` (default `admin` / `admin123`, ganti setelah login)

Akun siswa dibuat otomatis saat pertama kali login Google (1 akun = 1 jatah).

## Logo sekolah & OSIS

Taruh file berikut di folder `public/` (nama persis, huruf kecil):

- `logo-sekolah.png` (atau `.jpg`) — logo sekolah, tampil di kiri header
- `logo-osis.png` (atau `.jpg`) — logo OSIS, tampil di kanan header

Tidak perlu ubah kode atau rebuild — cukup refresh halaman. Kalau file belum
ada, header otomatis menampilkan kotak inisial sebagai pengganti.
Nama sekolah diatur via `NEXT_PUBLIC_SCHOOL_NAME` di `.env`
(ubah lalu restart `npm run dev` / rebuild agar terbaca).

## Acara berikutnya: reset jatah & arsip

- Setiap akun punya **kode akun** (`AK-XXXXXX`) yang terlihat oleh pemiliknya
  setelah login. Kode ini dipakai untuk reset jatah tanpa membuka email.
- Dashboard admin → **Kelola Akun**: tabel kode + status jatah, tombol **Reset**
  per akun, dan **Reset semua jatah** untuk periode/acara baru.
- Dashboard admin → tab **Aktif / Riwayat**: arsipkan kritik per item,
  **Arsipkan yang SELESAI**, atau **Arsipkan semua**. Yang diarsip tetap bisa
  dibaca di tab Riwayat dan tidak mengganggu statistik aktif.

## Deploy online (Vercel + Neon, gratis)

1. Buat database Postgres gratis di Neon/Supabase, salin `DATABASE_URL`.
2. Buat OAuth Client di Google Cloud Console, tambahkan redirect URI produksi:
   `https://domain-kamu/api/auth/callback/google`.
3. Push project ke GitHub, import di Vercel.
4. Isi Environment Variables di Vercel:
   `DATABASE_URL`, `NIS_HASH_SECRET`, `SISWA_SESSION_SECRET`,
   `ADMIN_SESSION_SECRET` (masing-masing 64 hex acak), `NEXT_PUBLIC_SCHOOL_NAME`,
   `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, plus variabel `ADMIN_*` untuk seed awal.
5. Generate secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
6. Setelah deploy: jalankan migrate + seed sekali via Vercel CLI atau lokal dengan
   `DATABASE_URL` produksi:
   ```bash
   npx prisma migrate deploy
   npm run db:seed
   ```
7. Vercel otomatis menyediakan **HTTPS**. Ganti password admin setelah seed.

## Keamanan

- Password admin di-hash **bcrypt**; ID akun Google di-hash HMAC-SHA256.
- Sesi memakai **JWT httpOnly cookie** (siswa & admin terpisah), `Secure` aktif di produksi.
- Validasi **Zod di backend**, sanitasi HTML untuk cegah XSS, Prisma cegah SQL injection.
- Rate limiting login & pengiriman, penolakan isi yang memuat email/nomor/URL identitas.
- State CSRF (`oauth_state` httpOnly, 10 menit) untuk alur OAuth Google.
- Security headers (nosniff, DENY frame, referrer policy).

## Banyak admin (Super Admin)

- Login admin dibuat dari env saat seed (`ADMIN_USERNAME/PASSWORD/NAME`) dan otomatis menjadi
  **super admin** (bisa diatur ulang via `SUPER_ADMIN_USERNAME` di `.env`).
- Super admin melihat tombol **"Kelola Admin"** di dashboard (halaman `/admin/kelola`) untuk
  menambah, mengubah nama/password, atau menghapus admin lain. Admin biasa tidak melihat tombol itu
  dan tidak bisa mengakses halaman tersebut.
- Hanya **satu super admin**; akun super tidak bisa dihapus (melindungi dari kehilangan akses).
- Menandai ulang siapa super admin secara manual (mis. jika username super berubah):
  ```bash
  npm run db:set-super   # memakai SUPER_ADMIN_USERNAME (default = ADMIN_USERNAME)
  ```

