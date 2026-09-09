import Link from "next/link";
import { Card, ConfettiBlob, SiteHeader } from "@/components/ui";

export default function PrivasiPage() {
  return (
    <div className="siswa-bg flex min-h-full flex-col">
      <SiteHeader
        right={
          <Link
            href="/"
            className="rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-bold text-emerald-700 transition hover:bg-emerald-200"
          >
            ← Kembali
          </Link>
        }
      />
      <main className="relative mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <ConfettiBlob className="-z-0" />

        <div className="relative z-10">
          <span className="inline-block text-5xl" aria-hidden="true">🛡️</span>
          <h1 className="mt-2 font-[family-name:var(--font-play)] text-4xl font-extrabold tracking-tight text-slate-800">
            Privasi &amp; <span className="text-gradient-ocean">Anonimitas</span>
          </h1>
          <p className="mt-2 max-w-xl text-[15px] font-medium text-slate-600">
            Penjelasan sederhana tentang bagaimana sistem menjaga identitasmu tetap aman. 🤫
          </p>
        </div>

        <div className="relative z-10 mt-6 space-y-4">
          <InfoCard icon="👀" title="1. Yang dilihat OSIS">
            Admin OSIS hanya melihat: ID kritik acak, isi kritik, tanggal masuk, dan status
            penanganan. <b>Tidak ada</b> nama, NIS, email, kelas, nomor HP, atau IP address di halaman admin.
          </InfoCard>
          <InfoCard icon="🔑" title="2. Kenapa harus login Google?">
            Login Google dipakai server untuk memastikan setiap akun hanya mengirim <b>1 kali</b>. ID akun
            disimpan dalam bentuk <b>hash satu arah</b> (tidak bisa dibaca balik, email mentah tidak disimpan)
            di tabel yang <b>terpisah dan tanpa relasi</b> ke tabel kritik, sehingga admin tidak bisa menelusuri
            kritik mana milik siapa.
          </InfoCard>
          <InfoCard icon="✅" title="3. Yang perlu kamu lakukan">
            <ul className="mt-1 list-none space-y-2 pl-0">
              {[
                "Jangan menulis nama, kelas, nomor HP, email, atau akun media sosial di isi kritik.",
                "Sistem otomatis menolak kiriman yang terdeteksi memuat email, nomor panjang, atau tautan identitas.",
                "Setelah terkirim, isi kritik tidak ditampilkan lagi kepadamu.",
                "Kode akunmu hanya dipakai untuk minta reset jatah ke admin bila ada acara berikutnya.",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5">
                  <span className="mt-0.5 text-emerald-500">✔</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </InfoCard>
          <InfoCard icon="💬" title="4. Catatan jujur">
            Anonim di sini berarti identitasmu tidak ditampilkan kepada OSIS. Server tetap menyimpan data
            teknis minimum (misalnya penanda jatah sudah dipakai) untuk keamanan sistem. Sistem ini bukan
            klaim &quot;100% tidak dapat dilacak&quot;.
          </InfoCard>
        </div>
      </main>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-white/60">
      <div className="flex items-center gap-3">
        <span
          className="flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-emerald-100 text-2xl"
          aria-hidden="true"
        >
          {icon}
        </span>
        <h2 className="font-[family-name:var(--font-play)] text-lg font-extrabold text-slate-800">
          {title}
        </h2>
      </div>
      <div className="mt-3 text-sm leading-relaxed text-slate-700">{children}</div>
    </Card>
  );
}
