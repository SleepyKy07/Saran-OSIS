import Link from "next/link";
import { Card, SiteHeader } from "@/components/ui";

export default function PrivasiPage() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader
        right={
          <Link href="/" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
            Kembali
          </Link>
        }
      />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:py-10">
        <h1 className="text-2xl font-extrabold tracking-tight">Privasi & Anonimitas</h1>
        <p className="mt-1 text-[15px] text-slate-600">
          Penjelasan sederhana tentang bagaimana sistem menjaga identitasmu.
        </p>

        <div className="mt-5 space-y-4">
          <Card>
            <h2 className="font-bold">1. Yang dilihat OSIS</h2>
            <p className="mt-1 text-sm text-slate-700">
              Admin OSIS hanya melihat: ID kritik acak, isi kritik, prioritas,
              tanggal masuk, dan status penanganan. Tidak ada nama, NIS, email, kelas,
              nomor HP, atau IP address di halaman admin.
            </p>
          </Card>
          <Card>
            <h2 className="font-bold">2. Kenapa harus login Google?</h2>
            <p className="mt-1 text-sm text-slate-700">
              Login Google dipakai server untuk memastikan setiap akun hanya mengirim{" "}
              <b>1 kali</b>. ID akun disimpan dalam bentuk <b>hash satu arah</b> (tidak bisa
              dibaca balik, email mentah tidak disimpan) di tabel yang <b>terpisah dan tanpa relasi</b> ke tabel kritik,
              sehingga admin tidak bisa menelusuri kritik mana milik siapa.
            </p>
          </Card>
          <Card>
            <h2 className="font-bold">3. Yang perlu kamu lakukan</h2>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700">
              <li>Jangan menulis nama, kelas, nomor HP, email, atau akun media sosial di isi kritik.</li>
              <li>Sistem otomatis menolak kiriman yang terdeteksi memuat email, nomor panjang, atau tautan identitas.</li>
              <li>Setelah terkirim, isi kritik tidak ditampilkan lagi kepadamu.</li>
              <li>Kode akunmu hanya dipakai untuk minta reset jatah ke admin bila ada acara berikutnya.</li>
            </ul>
          </Card>
          <Card>
            <h2 className="font-bold">4. Catatan jujur</h2>
            <p className="mt-1 text-sm text-slate-700">
              Anonim di sini berarti identitasmu tidak ditampilkan kepada OSIS. Server tetap
              menyimpan data teknis minimum (misalnya penanda jatah sudah dipakai) untuk
              keamanan sistem. Sistem ini bukan klaim &quot;100% tidak dapat dilacak&quot;.
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
}
