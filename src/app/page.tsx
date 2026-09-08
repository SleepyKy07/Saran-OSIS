"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Alert,
  Card,
  FieldLabel,
  PrimaryButton,
  SiteHeader,
  inputCls,
} from "@/components/ui";
import { PRIORITIES } from "@/lib/constants";

type Phase = "loading" | "login" | "form" | "used" | "success";

export default function SiswaPage() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState<string>("BIASA");
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
        body: JSON.stringify({ message, priority, consent }),
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
    <div className="flex min-h-full flex-col">
      <SiteHeader
        right={
          <>
            <Link href="/privasi" className="rounded-lg px-3 py-2 font-medium text-slate-600 hover:bg-slate-100">
              Privasi
            </Link>
            {(phase === "form" || phase === "used") && (
              <button onClick={onLogout} className="rounded-lg px-3 py-2 font-medium text-slate-600 hover:bg-slate-100">
                Keluar
              </button>
            )}
          </>
        }
      />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:py-10">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Kotak Saran Digital OSIS
          </h1>
          <p className="mt-1 text-[15px] text-slate-600">
            Sampaikan kritik dan saranmu secara anonim
          </p>
        </div>

        <Card className="mb-4 border-sky-200 bg-sky-50/60">
          <h2 className="text-sm font-bold text-slate-800">Cara pakai (baca dulu)</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>Kritik/saran bersifat <b>anonim</b>: OSIS tidak melihat siapa pengirimnya.</li>
            <li>Jangan menulis nama, kelas, nomor HP, atau info pribadi di isi kritik.</li>
            <li>Setiap akun Google hanya punya <b>1 kesempatan</b> mengirim. Masuk dengan akun Google (Gmail apa saja).</li>
            <li>Catat <b>kode akunmu</b> yang muncul setelah login untuk minta reset jatah ke admin bila ada acara berikutnya.</li>
          </ul>
        </Card>

        {error && (
          <div className="mb-4">
            <Alert kind="error">{error}</Alert>
          </div>
        )}

        {phase === "loading" && (
          <Card><p className="text-sm text-slate-500">Memuat…</p></Card>
        )}

        {phase === "login" && (
          <Card>
            <h2 className="text-lg font-bold">Masuk dengan Google</h2>
            <p className="mt-1 text-sm text-slate-600">
              Akun Google hanya dipakai untuk memastikan jatah 1x kirim. Email tidak disimpan bersama kritikmu.
            </p>
            <a
              href="/api/auth/google"
              className="mt-4 flex w-full items-center justify-center gap-2.5 rounded-xl bg-emerald-600 px-4 py-3.5 text-[15px] font-bold text-white transition hover:bg-emerald-700 active:scale-[0.99]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#fff" d="M21.35 11.1H12v2.9h5.35c-.5 2.4-2.55 3.5-5.35 3.5a5.9 5.9 0 0 1 0-11.8c1.5 0 2.85.55 3.9 1.45l2.1-2.1A8.9 8.9 0 0 0 12 2a9 9 0 0 0 0 18c4.6 0 8.4-3.15 8.4-8.35 0-.5-.05-1.05-.15-1.55Z" />
              </svg>
              Masuk dengan Google
            </a>
            <p className="mt-3 text-center text-xs text-slate-400">
              1 akun Google = 1 kesempatan mengirim.
            </p>
          </Card>
        )}

        {phase === "form" && (
          <Card>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h2 className="text-lg font-bold">Tulis kritik & saran</h2>
              {displayCode && (
                <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-xs font-bold text-slate-600">
                  Kode: {displayCode}
                </span>
              )}
            </div>
            <form onSubmit={onSend} className="mt-4 space-y-4">
              <div>
                <FieldLabel>Kritik/saran (min. 10 karakter)</FieldLabel>
                <textarea
                  className={`${inputCls} min-h-36 resize-y`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tulis masukanmu di sini tanpa nama/kelas/nomor HP…"
                  maxLength={2000}
                  required
                />
                <p className="mt-1 text-right text-xs text-slate-400">{message.length}/2000</p>
              </div>
              <div>
                <FieldLabel>Tingkat prioritas</FieldLabel>
                <div className="grid grid-cols-3 gap-2">
                  {PRIORITIES.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setPriority(p.value)}
                      className={`rounded-xl border px-2 py-2.5 text-sm font-semibold transition ${
                        priority === p.value
                          ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                          : "border-slate-300 bg-white text-slate-600"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-4 w-4 accent-emerald-600" />
                Saya memahami bahwa kritik/saran ini dikirim secara anonim dan saya hanya dapat mengirim satu kali.
              </label>
              <PrimaryButton disabled={busy || !consent}>
                {busy ? "Mengirim…" : "Kirim Kritik & Saran"}
              </PrimaryButton>
            </form>
          </Card>
        )}

        {phase === "used" && (
          <Card className="border-amber-200 bg-amber-50 text-center">
            <p className="text-lg font-bold text-slate-900">Jatah sudah terpakai</p>
            <p className="mx-auto mt-2 max-w-md text-[15px] text-slate-700">
              Kamu sudah menggunakan jatah pengiriman kritik/saran. Terima kasih atas partisipasimu.
            </p>
            {displayCode && (
              <p className="mx-auto mt-3 max-w-md rounded-xl bg-white/70 px-3 py-2 text-sm text-slate-600">
                Kode akunmu: <b className="font-mono">{displayCode}</b>
                <br />
                <span className="text-xs">Tunjukkan kode ini ke admin jika jatahmu perlu dibuka lagi untuk acara berikutnya.</span>
              </p>
            )}
          </Card>
        )}

        {phase === "success" && (
          <Card className="border-emerald-200 bg-emerald-50 text-center">
            <p className="text-lg font-bold text-emerald-900">Berhasil terkirim</p>
            <p className="mx-auto mt-2 max-w-md text-[15px] text-emerald-900">
              Kritik/saran berhasil dikirim secara anonim. Terima kasih sudah ikut membantu memperbaiki sekolah.
            </p>
            {displayCode && (
              <p className="mx-auto mt-3 max-w-md text-sm text-emerald-800">
                Kode akunmu: <b className="font-mono">{displayCode}</b>
              </p>
            )}
            <button onClick={onLogout} className="mt-4 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700">
              Selesai & Keluar
            </button>
          </Card>
        )}

        <p className="mt-6 text-center text-xs text-slate-400">
          <Link href="/privasi" className="underline">Bagaimana anonimitas dijaga?</Link>
          {" · "}
          <Link href="/admin/login" className="underline">Login admin OSIS</Link>
        </p>
      </main>
    </div>
  );
}
