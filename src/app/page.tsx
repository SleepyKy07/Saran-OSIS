"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Alert,
  Card,
  ConfettiBlob,
  FieldLabel,
  PrimaryButton,
  SiteHeader,
  inputCls,
} from "@/components/ui";
type Phase = "loading" | "login" | "form" | "used" | "success";

export default function SiswaPage() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [displayCode, setDisplayCode] = useState<string | null>(null);
  const [error, setError] = useState(() => {
    if (typeof window === "undefined") return "";
    try {
      return new URLSearchParams(window.location.search).get("auth_error") ?? "";
    } catch {
      return "";
    }
  });

  useEffect(() => {
    let aktif = true;
    try {
      const q = new URLSearchParams(window.location.search);
      if (q.get("auth_error")) {
        window.history.replaceState(null, "", window.location.pathname);
      }
    } catch {
      /* abaikan */
    }
    (async () => {
      try {
        const r = await fetch("/api/siswa/status", { cache: "no-store" });
        const d = await r.json();
        if (!aktif) return;
        if (d.loggedIn) {
          if (d.displayCode) setDisplayCode(d.displayCode);
          setPhase(d.used ? "used" : "form");
        } else setPhase("login");
      } catch {
        if (aktif) setPhase("login");
      }
    })();
    return () => {
      aktif = false;
    };
  }, []);

  async function onSend(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/saran", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, consent }),
      });
      const d = await r.json();
      if (!r.ok) {
        if (r.status === 409) {
          setPhase("used");
          return;
        }
        throw new Error(d.error ?? "Gagal mengirim.");
      }
      setMessage("");
      setConsent(false);
      setPhase("success");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mengirim.");
    } finally {
      setBusy(false);
    }
  }

  async function onLogout() {
    await fetch("/api/siswa/logout", { method: "POST" });
    setDisplayCode(null);
    setPhase("login");
  }

  return (
    <div className="siswa-bg flex min-h-full flex-col">
      {/* lapisan deco ringan */}
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-60" aria-hidden="true" />

      <SiteHeader
        right={
          <>
            <Link
              href="/privasi"
              className="rounded-full bg-amber-100 px-3 py-1.5 font-bold text-amber-700 transition hover:bg-amber-200"
            >
              🔒 Privasi
            </Link>
            {(phase === "form" || phase === "used") && (
              <button
                onClick={onLogout}
                className="rounded-full bg-slate-100 px-3 py-1.5 font-bold text-slate-600 transition hover:bg-slate-200"
              >
                Keluar
              </button>
            )}
          </>
        }
      />

      <main className="relative mx-auto w-full max-w-3xl flex-1 px-3.5 py-5 sm:px-6 sm:py-10">
        <ConfettiBlob className="-z-0" />

        {/* Hero */}
        <div className="relative z-10 text-center">
          <span className="animate-wiggle inline-block text-4xl sm:text-6xl" aria-hidden="true">🗳️</span>
          <h1 className="mt-2 font-[family-name:var(--font-play)] text-2xl font-extrabold leading-snug tracking-tight text-slate-800 sm:text-4xl md:text-5xl">
            Kotak Saran <span className="text-gradient-play">Digital OSIS</span>
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm font-medium text-slate-600 sm:text-base">
            Suaramu penting! Sampaikan kritik &amp; saran secara <b>anonim</b> — bantu OSIS membuat sekolah makin seru dan lebih baik. 🚀
          </p>
        </div>

        {/* Cara pakai */}
        <Card className="relative z-10 mt-4 sm:mt-6 border-amber-200/70 bg-gradient-to-br from-amber-50/90 to-orange-50/80 p-4 sm:p-6">
          <h2 className="font-[family-name:var(--font-play)] text-base sm:text-lg font-bold text-amber-800">
            📌 Cara pakai — baca dulu ya!
          </h2>
          <ul className="mt-2.5 space-y-2 text-xs sm:text-sm text-slate-700">
            <Step n="1" text="Kritik/saran bersifat anonim: OSIS tidak melihat siapa pengirimnya." />
            <Step n="2" text="Jangan menulis nama, kelas, nomor HP, atau info pribadi di isi kritik." />
            <Step n="3" text="Setiap akun Google hanya punya 1 kesempatan mengirim. Masuk dengan akun Google (Gmail apa saja)." />
            <Step n="4" text="Catat kode akunmu yang muncul setelah login untuk minta reset jatah ke admin bila ada acara berikutnya." />
          </ul>
        </Card>

        {error && (
          <div className="relative z-10 mt-4">
            <Alert kind="error">{error}</Alert>
          </div>
        )}

        {phase === "loading" && (
          <Card className="relative z-10 mt-4 text-center">
            <p className="text-sm text-slate-500">⏳ Memuat…</p>
          </Card>
        )}

        {phase === "login" && (
          <Card className="relative z-10 mt-4 sm:mt-6 border-sky-200/60 p-5 sm:p-6">
            <div className="flex flex-col items-center gap-1 text-center">
              <span className="text-3xl sm:text-4xl" aria-hidden="true">👋</span>
              <h2 className="font-[family-name:var(--font-play)] text-xl sm:text-2xl font-extrabold text-slate-800">
                Halo, kawan OSIS!
              </h2>
              <p className="mt-1 max-w-md text-xs sm:text-sm text-slate-600">
                Masuk dengan akun Google untuk memulai. Akun hanya dipakai memastikan jatah <b>1x kirim</b> — email tidak disimpan bersama kritikmu.
              </p>
            </div>
            <a
              href="/api/auth/google"
              className="mt-4 sm:mt-5 flex min-h-[46px] w-full items-center justify-center gap-2.5 rounded-2xl bg-white px-4 py-3 text-sm sm:text-[15px] font-bold text-slate-700 shadow-md ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.99]"
            >
              <GoogleG />
              Masuk dengan Google
            </a>
            <p className="mt-2.5 text-center text-[11px] sm:text-xs font-semibold text-slate-400">
              1 akun Google = 1 kesempatan mengirim 🙌
            </p>
          </Card>
        )}

        {phase === "form" && (
          <Card className="relative z-10 mt-4 sm:mt-6 border-emerald-200/60 p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-[family-name:var(--font-play)] text-lg sm:text-xl font-extrabold text-slate-800">
                Tulis kritik &amp; saranmu ✍️
              </h2>
              {displayCode && (
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 font-mono text-[11px] sm:text-xs font-bold text-emerald-700">
                  🎟️ Kode: {displayCode}
                </span>
              )}
            </div>
            <form onSubmit={onSend} className="mt-3.5 space-y-3.5 sm:space-y-4">
              <div>
                <FieldLabel>Kritik/saran (min. 10 karakter)</FieldLabel>
                <textarea
                  className={`${inputCls} min-h-32 sm:min-h-36 resize-y text-sm`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tulis masukanmu di sini tanpa nama/kelas/nomor HP… 💬"
                  maxLength={2000}
                  required
                />
                <p className="mt-1 text-right text-xs text-slate-400">{message.length}/2000</p>
              </div>
              <label className="flex cursor-pointer items-start gap-2.5 rounded-2xl bg-emerald-50/70 p-3.5 text-sm font-medium text-slate-700 ring-1 ring-emerald-100">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-4 w-4 accent-emerald-600" />
                Saya memahami bahwa kritik/saran ini dikirim secara anonim dan saya hanya dapat mengirim satu kali.
              </label>
              <PrimaryButton disabled={busy || !consent}>
                {busy ? "Mengirim… ⏳" : "🚀 Kirim Kritik & Saran"}
              </PrimaryButton>
            </form>
          </Card>
        )}

        {phase === "used" && (
          <Card className="relative z-10 mt-6 border-amber-300/60 bg-gradient-to-br from-amber-50/90 to-yellow-50/80 text-center">
            <span className="text-5xl" aria-hidden="true">🙏</span>
            <p className="mt-3 font-[family-name:var(--font-play)] text-2xl font-extrabold text-slate-900">
              Jatah sudah terpakai
            </p>
            <p className="mx-auto mt-2 max-w-md text-[15px] text-slate-700">
              Kamu sudah menggunakan jatah pengiriman kritik/saran. Terima kasih atas partisipasimu!
            </p>
            {displayCode && (
              <p className="mx-auto mt-4 max-w-md rounded-2xl bg-white/80 px-4 py-3 text-sm text-slate-600 ring-1 ring-amber-200">
                Kode akunmu: <b className="font-mono">{displayCode}</b>
                <br />
                <span className="text-xs">
                  Tunjukkan kode ini ke admin jika jatahmu perlu dibuka lagi untuk acara berikutnya.
                </span>
              </p>
            )}
            <button
              onClick={onLogout}
              className="btn-play mt-5 rounded-2xl px-6 py-3 text-sm font-extrabold text-white active:scale-95"
            >
              Selesai &amp; Keluar
            </button>
          </Card>
        )}

        {phase === "success" && (
          <Card className="relative z-10 mt-6 border-emerald-300/60 bg-gradient-to-br from-emerald-50/90 to-teal-50/80 text-center">
            <span className="text-5xl" aria-hidden="true">🎉</span>
            <p className="mt-3 font-[family-name:var(--font-play)] text-2xl font-extrabold text-emerald-900">
              Berhasil terkirim!
            </p>
            <p className="mx-auto mt-2 max-w-md text-[15px] text-emerald-900">
              Kritik/saran berhasil dikirim secara anonim. Terima kasih sudah ikut membantu memperbaiki sekolah!
            </p>
            {displayCode && (
              <p className="mx-auto mt-3 max-w-md text-sm font-medium text-emerald-800">
                Kode akunmu: <b className="font-mono">{displayCode}</b>
              </p>
            )}
            <button
              onClick={onLogout}
              className="btn-play mt-5 rounded-2xl px-6 py-3 text-sm font-extrabold text-white active:scale-95"
            >
              Selesai &amp; Keluar
            </button>
          </Card>
        )}

        <p className="relative z-10 mt-8 text-center text-xs font-semibold text-slate-400">
          <Link href="/privasi" className="underline decoration-amber-400 underline-offset-2 hover:text-slate-600">
            Bagaimana anonimitas dijaga?
          </Link>
          {" · "}
          <Link href="/admin/login" className="underline decoration-slate-300 underline-offset-2 hover:text-slate-600">
            Login admin OSIS
          </Link>
        </p>
      </main>
    </div>
  );
}

/* Langkah bernomor utk daftar "cara pakai" */
function Step({ n, text }: { n: string; text: string }) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-xs font-extrabold text-white shadow-sm">
        {n}
      </span>
      <span className="flex-1">{text}</span>
    </li>
  );
}

/* Ikon Google warna (SVG) */
function GoogleG() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34.1 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.7l6.2 5.2C36.8 40.6 44 36 44 24c0-1.3-.1-2.6-.4-3.9z"/>
    </svg>
  );
}
