"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "@/components/ui";
import { SchoolLogo } from "@/components/school-logo";
import { STATUSES, statusLabel } from "@/lib/constants";

type Item = {
  id: string;
  publicId: string;
  message: string;
  status: string;
  isFlagged: boolean;
  archived: boolean;
  createdAt: string;
};

const statusColor: Record<string, string> = {
  BARU: "bg-sky-400/15 text-sky-300 ring-sky-400/30",
  DIBACA: "bg-slate-400/15 text-slate-300 ring-slate-400/30",
  DIPROSES: "bg-amber-400/15 text-amber-300 ring-amber-400/30",
  SELESAI: "bg-emerald-400/15 text-emerald-300 ring-emerald-400/30",
};

export default function AdminDashboard({ name, isSuper }: { name: string; isSuper: boolean }) {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [stats, setStats] = useState({ total: 0, baru: 0, diproses: 0, selesai: 0, arsip: 0 });
  const [tab, setTab] = useState<"aktif" | "arsip">("aktif");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const p = new URLSearchParams();
      p.set("archived", tab === "arsip" ? "1" : "0");
      if (q) p.set("q", q);
      if (status) p.set("status", status);
      if (flaggedOnly) p.set("flagged", "1");
      const r = await fetch(`/api/admin/saran?${p.toString()}`, { cache: "no-store" });
      if (r.status === 401) {
        router.replace("/admin/login");
        return;
      }
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "Gagal memuat data.");
      setItems(d.items);
      setStats(d.stats);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  }, [q, status, flaggedOnly, tab, router]);

  useEffect(() => {
    const t = setTimeout(load, q ? 400 : 0);
    return () => clearTimeout(t);
  }, [load, q]);

  async function patch(id: string, data: object) {
    const r = await fetch(`/api/admin/saran/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (r.status === 401) {
      router.replace("/admin/login");
      return;
    }
    if (!r.ok) {
      const d = await r.json().catch(() => ({}));
      setError(d.error ?? "Gagal menyimpan.");
      return;
    }
    load();
  }

  async function remove(id: string) {
    if (!confirm("Hapus kritik ini? Hanya untuk konten tidak pantas.")) return;
    const r = await fetch(`/api/admin/saran/${id}`, { method: "DELETE" });
    if (r.status === 401) {
      router.replace("/admin/login");
      return;
    }
    load();
  }

  async function archiveAll(scope: "selesai" | "all") {
    const label = scope === "selesai" ? "semua kritik SELESAI" : "SEMUA kritik aktif";
    if (!confirm(`Arsipkan ${label} ke Riwayat? Data tidak dihapus, hanya dipindah.`)) return;
    const r = await fetch("/api/admin/saran", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scope }),
    });
    if (r.status === 401) {
      router.replace("/admin/login");
      return;
    }
    const d = await r.json().catch(() => ({}));
    if (!r.ok) {
      setError(d.error ?? "Gagal mengarsipkan.");
      return;
    }
    load();
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  const sel =
    "rounded-xl border border-white/10 bg-slate-800/80 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20";

  return (
    <div className="admin-bg min-h-full text-slate-100">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-900/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2.5 px-3.5 py-3 sm:px-6 sm:py-3.5">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <span className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-2xl bg-white/10 p-1.5 ring-1 ring-white/15">
              <SchoolLogo className="h-full w-full" />
            </span>
            <div>
              <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-emerald-300">
                Dashboard OSIS
              </p>
              <h1 className="text-base sm:text-lg font-extrabold leading-tight">
                Kotak Saran <span className="text-gradient-ocean">Masuk</span>
              </h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
            <span className="hidden items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-slate-200 ring-1 ring-white/10 md:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              {name}
            </span>
            {isSuper && (
              <Link
                href="/admin/kelola"
                className="rounded-xl bg-violet-500 px-2.5 sm:px-3.5 py-1.5 sm:py-2 font-bold text-white shadow-lg shadow-violet-900/40 transition hover:bg-violet-400"
              >
                👑 Kelola
              </Link>
            )}
            <Link
              href="/admin/akun"
              className="rounded-xl bg-emerald-500 px-2.5 sm:px-3.5 py-1.5 sm:py-2 font-bold text-white shadow-lg shadow-emerald-900/40 transition hover:bg-emerald-400"
            >
              ⚙️ Akun
            </Link>
            <button
              onClick={logout}
              className="rounded-xl bg-white/10 px-2.5 sm:px-3.5 py-1.5 sm:py-2 font-semibold ring-1 ring-white/10 transition hover:bg-white/20"
            >
              Keluar
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {/* Tab + aksi arsip */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-2xl bg-white/5 p-1 text-sm font-bold ring-1 ring-white/10">
            <button
              onClick={() => setTab("aktif")}
              className={`rounded-xl px-4 py-2 transition ${tab === "aktif" ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow" : "text-slate-300 hover:text-white"}`}
            >
              Aktif ({stats.total})
            </button>
            <button
              onClick={() => setTab("arsip")}
              className={`rounded-xl px-4 py-2 transition ${tab === "arsip" ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow" : "text-slate-300 hover:text-white"}`}
            >
              Riwayat ({stats.arsip})
            </button>
          </div>
          {tab === "aktif" && (
            <div className="ml-auto flex flex-wrap gap-2 text-sm">
              <button
                onClick={() => archiveAll("selesai")}
                className="rounded-xl bg-white/10 px-3 py-2 font-semibold ring-1 ring-white/10 transition hover:bg-white/20"
              >
                📦 Arsipkan yang SELESAI
              </button>
              <button
                onClick={() => archiveAll("all")}
                className="rounded-xl bg-white/10 px-3 py-2 font-semibold ring-1 ring-white/10 transition hover:bg-white/20"
              >
                🗄️ Arsipkan semua
              </button>
            </div>
          )}
        </div>

        {/* Filter */}
        <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="🔍 Cari isi kritik…"
              className="rounded-xl border border-white/10 bg-slate-800/80 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 sm:col-span-2"
            />
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={sel}>
              <option value="">Semua status</option>
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-slate-800/80 px-3 py-2 text-sm">
              <input type="checkbox" checked={flaggedOnly} onChange={(e) => setFlaggedOnly(e.target.checked)} className="h-4 w-4 accent-emerald-500" />
              ⭐ Penting saja
            </label>
          </div>
        </div>

        {error && (
          <div className="mt-4">
            <Alert kind="error">{error}</Alert>
          </div>
        )}

        {/* Daftar item */}
        <div className="mt-4 space-y-3">
          {loading && <p className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center text-sm text-slate-300">⏳ Memuat…</p>}
          {!loading && items.length === 0 && (
            <p className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-8 text-center text-sm text-slate-300">
              {tab === "aktif"
                ? "Belum ada kritik yang cocok dengan filter. 🎉"
                : "Riwayat kosong. Kritik yang diarsipkan akan tampil di sini."}
            </p>
          )}
          {items.map((it) => (
            <article
              key={it.id}
              className="animate-pop rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur transition hover:border-white/20"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                <span className="rounded-lg bg-white/10 px-2 py-1 font-mono text-slate-100 ring-1 ring-white/10">
                  {it.publicId}
                </span>
                <span className={`rounded-lg px-2 py-1 ring-1 ${statusColor[it.status] ?? ""}`}>
                  {statusLabel(it.status)}
                </span>
                {it.isFlagged && (
                  <span className="rounded-lg bg-yellow-300/20 px-2 py-1 text-yellow-200 ring-1 ring-yellow-300/30">
                    ⭐ Ditandai penting
                  </span>
                )}
                <span className="ml-auto font-normal text-slate-400">
                  🕒 {new Date(it.createdAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                </span>
              </div>
              <p className="mt-2.5 whitespace-pre-wrap text-[15px] leading-relaxed text-slate-100">{it.message}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <select
                  value={it.status}
                  onChange={(e) => patch(it.id, { status: e.target.value })}
                  className="rounded-xl border border-white/10 bg-slate-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400"
                >
                  {STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <button
                  onClick={() => patch(it.id, { isFlagged: !it.isFlagged })}
                  className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold ring-1 ring-white/10 transition hover:bg-white/20"
                >
                  {it.isFlagged ? "Batal tanda" : "⭐ Tandai penting"}
                </button>
                {tab === "aktif" ? (
                  <button
                    onClick={() => patch(it.id, { archived: true })}
                    className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold ring-1 ring-white/10 transition hover:bg-white/20"
                  >
                    📦 Arsipkan
                  </button>
                ) : (
                  <button
                    onClick={() => patch(it.id, { archived: false })}
                    className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold ring-1 ring-white/10 transition hover:bg-white/20"
                  >
                    ↩️ Kembalikan
                  </button>
                )}
                <button
                  onClick={() => remove(it.id)}
                  className="rounded-xl bg-rose-500/20 px-3 py-2 text-sm font-semibold text-rose-200 ring-1 ring-rose-400/30 transition hover:bg-rose-500/40"
                >
                  🗑️ Hapus
                </button>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-slate-400">
          🔒 Data pengirim tidak ditampilkan — halaman ini hanya berisi kritik anonim.
        </p>
      </main>
    </div>
  );
}
