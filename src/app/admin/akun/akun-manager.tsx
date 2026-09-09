"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "@/components/ui";

type Account = {
  id: string;
  displayCode: string | null;
  isUsed: boolean;
  usedAt: string | null;
  createdAt: string;
};

const fmt = (s: string | null) =>
  s ? new Date(s).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) : "—";

export default function AccountsManager() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [stats, setStats] = useState({ total: 0, used: 0 });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const r = await fetch("/api/admin/akun", { cache: "no-store" });
      if (r.status === 401) {
        router.replace("/admin/login");
        return;
      }
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "Gagal memuat data.");
      setAccounts(d.accounts);
      setStats(d.stats);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  async function reset(body: object, confirmText: string) {
    if (!confirm(confirmText)) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const r = await fetch("/api/admin/akun/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (r.status === 401) {
        router.replace("/admin/login");
        return;
      }
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "Gagal mereset.");
      setNotice(`✅ ${d.reset} akun berhasil dibuka jatahnya. Akun tersebut bisa kirim lagi.`);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mereset.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-sky-500/25 to-sky-600/15 p-4 backdrop-blur">
          <p className="text-3xl font-extrabold">{stats.total}</p>
          <p className="mt-1 text-xs font-medium text-slate-300">👤 Total akun pernah login</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-amber-500/25 to-orange-500/15 p-4 backdrop-blur">
          <p className="text-3xl font-extrabold">{stats.used}</p>
          <p className="mt-1 text-xs font-medium text-slate-300">✅ Sudah pakai jatah</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-500/15 to-teal-500/10 p-4 backdrop-blur">
        <h2 className="font-[family-name:var(--font-play)] text-lg font-extrabold text-emerald-200">
          🗓️ Periode / acara baru
        </h2>
        <p className="mt-1 text-sm text-slate-300">
          Buka kembali jatah SEMUA akun sekaligus. Kritik lama tidak ikut terhapus
          (pindahkan dulu ke Riwayat dari dashboard bila perlu).
        </p>
        <button
          disabled={busy || stats.used === 0}
          onClick={() => reset({ all: true }, "Buka jatah SEMUA akun? Semua akun bisa kirim lagi.")}
          className="mt-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-emerald-900/40 transition hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Memproses… ⏳" : "🔄 Reset semua jatah"}
        </button>
      </div>

      {error && <Alert kind="error">{error}</Alert>}
      {notice && <Alert kind="success">{notice}</Alert>}

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-400">
              <th className="px-4 py-3">Kode akun</th>
              <th className="px-4 py-3">Status jatah</th>
              <th className="px-4 py-3">Terpakai</th>
              <th className="px-4 py-3">Pertama login</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">⏳ Memuat…</td></tr>
            )}
            {!loading && accounts.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">Belum ada akun.</td></tr>
            )}
            {accounts.map((a) => (
              <tr key={a.id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                <td className="px-4 py-3 font-mono font-bold text-emerald-300">{a.displayCode ?? "—"}</td>
                <td className="px-4 py-3">
                  {a.isUsed ? (
                    <span className="rounded-lg bg-amber-400/15 px-2 py-1 text-xs font-bold text-amber-200 ring-1 ring-amber-400/30">
                      Sudah kirim
                    </span>
                  ) : (
                    <span className="rounded-lg bg-emerald-400/15 px-2 py-1 text-xs font-bold text-emerald-200 ring-1 ring-emerald-400/30">
                      Belum kirim
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-300">{fmt(a.usedAt)}</td>
                <td className="px-4 py-3 text-slate-300">{fmt(a.createdAt)}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    disabled={busy || !a.isUsed}
                    onClick={() => reset({ ids: [a.id] }, `Buka jatah akun ${a.displayCode ?? ""}?`)}
                    className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold ring-1 ring-white/10 transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Reset
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-center text-xs text-slate-400">
        🔒 Minta siswa menyebutkan kode akunnya untuk reset per akun. Email tidak disimpan &amp; tidak ditampilkan.
      </p>
    </div>
  );
}
