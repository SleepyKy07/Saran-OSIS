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
      setNotice(`${d.reset} akun berhasil dibuka jatahnya. Akun tersebut bisa kirim lagi.`);
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
        <div className="rounded-2xl bg-slate-800 p-4">
          <p className="text-2xl font-extrabold">{stats.total}</p>
          <p className="text-xs text-slate-400">Total akun pernah login</p>
        </div>
        <div className="rounded-2xl bg-slate-800 p-4">
          <p className="text-2xl font-extrabold">{stats.used}</p>
          <p className="text-xs text-slate-400">Sudah pakai jatah</p>
        </div>
      </div>

      <div className="rounded-2xl bg-slate-800 p-4">
        <h2 className="font-bold">Periode / acara baru</h2>
        <p className="mt-1 text-sm text-slate-400">
          Buka kembali jatah SEMUA akun sekaligus. Kritik lama tidak ikut terhapus
          (pindahkan dulu ke Riwayat dari dashboard bila perlu).
        </p>
        <button
          disabled={busy || stats.used === 0}
          onClick={() =>
            reset({ all: true }, "Buka jatah SEMUA akun? Semua akun bisa kirim lagi.")
          }
          className="mt-3 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Memproses…" : "Reset semua jatah"}
        </button>
      </div>

      {error && <Alert kind="error">{error}</Alert>}
      {notice && <Alert kind="success">{notice}</Alert>}

      <div className="overflow-x-auto rounded-2xl bg-slate-800">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-xs uppercase tracking-wide text-slate-400">
              <th className="px-4 py-3">Kode akun</th>
              <th className="px-4 py-3">Status jatah</th>
              <th className="px-4 py-3">Terpakai</th>
              <th className="px-4 py-3">Pertama login</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">Memuat…</td></tr>
            )}
            {!loading && accounts.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">Belum ada akun.</td></tr>
            )}
            {accounts.map((a) => (
              <tr key={a.id} className="border-b border-slate-700/50 last:border-0">
                <td className="px-4 py-3 font-mono font-bold">{a.displayCode ?? "—"}</td>
                <td className="px-4 py-3">
                  {a.isUsed ? (
                    <span className="rounded-md bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">Sudah kirim</span>
                  ) : (
                    <span className="rounded-md bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800">Belum kirim</span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-300">{fmt(a.usedAt)}</td>
                <td className="px-4 py-3 text-slate-300">{fmt(a.createdAt)}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    disabled={busy || !a.isUsed}
                    onClick={() =>
                      reset({ ids: [a.id] }, `Buka jatah akun ${a.displayCode ?? ""}?`)
                    }
                    className="rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-semibold hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Reset
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-center text-xs text-slate-500">
        Minta siswa menyebutkan kode akunnya untuk reset per akun. Email tidak disimpan &amp; tidak ditampilkan.
      </p>
    </div>
  );
}
