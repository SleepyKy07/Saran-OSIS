"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "@/components/ui";
import { OsisLogo, SchoolLogo } from "@/components/school-logo";
import { PRIORITIES, STATUSES, priorityLabel, statusLabel } from "@/lib/constants";

type Item = {
  id: string;
  publicId: string;
  message: string;
  priority: string;
  status: string;
  isFlagged: boolean;
  archived: boolean;
  createdAt: string;
};

const statusColor: Record<string, string> = {
  BARU: "bg-sky-100 text-sky-700",
  DIBACA: "bg-slate-200 text-slate-700",
  DIPROSES: "bg-amber-100 text-amber-800",
  SELESAI: "bg-emerald-100 text-emerald-700",
};

const priorityColor: Record<string, string> = {
  BIASA: "bg-slate-100 text-slate-600",
  PENTING: "bg-orange-100 text-orange-700",
  SANGAT_PENTING: "bg-red-100 text-red-700",
};

export default function AdminDashboard({ name }: { name: string }) {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [stats, setStats] = useState({ total: 0, baru: 0, diproses: 0, selesai: 0, arsip: 0 });
  const [tab, setTab] = useState<"aktif" | "arsip">("aktif");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
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
      if (priority) p.set("priority", priority);
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
  }, [q, status, priority, flaggedOnly, tab, router]);

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

  const sel = "rounded-lg border border-slate-600 bg-slate-800 px-2.5 py-2 text-sm text-white outline-none focus:border-emerald-400";

  return (
    <div className="min-h-full bg-slate-900 text-slate-100">
      <header className="border-b border-slate-700">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4">
          <div className="flex items-center gap-3">
            <SchoolLogo className="h-9 w-9 rounded-lg bg-white object-contain" />
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400">Dashboard OSIS</p>
              <h1 className="text-lg font-extrabold">Kotak Saran Masuk</h1>
            </div>
            <OsisLogo className="h-9 w-9 rounded-lg bg-white object-contain" />
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="hidden text-slate-300 sm:inline">Halo, {name}</span>
            <Link href="/admin/akun" className="rounded-lg bg-emerald-700 px-3 py-2 font-semibold hover:bg-emerald-600">
              Kelola Akun
            </Link>
            <button onClick={logout} className="rounded-lg bg-slate-700 px-3 py-2 font-semibold hover:bg-slate-600">
              Keluar
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: "Total kritik/saran", value: stats.total },
            { label: "Kritik baru", value: stats.baru },
            { label: "Sedang ditangani", value: stats.diproses },
            { label: "Selesai", value: stats.selesai },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl bg-slate-800 p-4">
              <p className="text-2xl font-extrabold">{s.value}</p>
              <p className="text-xs text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl bg-slate-800 p-1 text-sm font-semibold">
            <button
              onClick={() => setTab("aktif")}
              className={`rounded-lg px-4 py-2 ${tab === "aktif" ? "bg-emerald-600 text-white" : "text-slate-300 hover:text-white"}`}
            >
              Aktif ({stats.total})
            </button>
            <button
              onClick={() => setTab("arsip")}
              className={`rounded-lg px-4 py-2 ${tab === "arsip" ? "bg-emerald-600 text-white" : "text-slate-300 hover:text-white"}`}
            >
              Riwayat ({stats.arsip})
            </button>
          </div>
          {tab === "aktif" && (
            <div className="ml-auto flex flex-wrap gap-2 text-sm">
              <button
                onClick={() => archiveAll("selesai")}
                className="rounded-lg bg-slate-700 px-3 py-2 font-semibold hover:bg-slate-600"
              >
                Arsipkan yang SELESAI
              </button>
              <button
                onClick={() => archiveAll("all")}
                className="rounded-lg bg-slate-700 px-3 py-2 font-semibold hover:bg-slate-600"
              >
                Arsipkan semua
              </button>
            </div>
          )}
        </div>

        <div className="mt-4 rounded-2xl bg-slate-800 p-4">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari isi kritik…"
              className="rounded-lg border border-slate-600 bg-slate-900 px-2.5 py-2 text-sm outline-none focus:border-emerald-400 sm:col-span-2"
            />
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={sel}>
              <option value="">Semua status</option>
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <select value={priority} onChange={(e) => setPriority(e.target.value)} className={sel}>
              <option value="">Semua prioritas</option>
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
            <label className="flex items-center gap-2 rounded-lg border border-slate-600 px-2.5 py-2 text-sm">
              <input type="checkbox" checked={flaggedOnly} onChange={(e) => setFlaggedOnly(e.target.checked)} className="h-4 w-4 accent-emerald-500" />
              Penting saja
            </label>
          </div>
        </div>

        {error && (
          <div className="mt-4">
            <Alert kind="error">{error}</Alert>
          </div>
        )}

        <div className="mt-4 space-y-3">
          {loading && <p className="text-sm text-slate-400">Memuat…</p>}
          {!loading && items.length === 0 && (
            <p className="rounded-2xl bg-slate-800 p-6 text-center text-sm text-slate-400">
              Belum ada kritik yang cocok dengan filter.
            </p>
          )}
          {items.map((it) => (
            <article key={it.id} className="rounded-2xl bg-slate-800 p-4">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                <span className="rounded-md bg-slate-700 px-2 py-1 font-mono">{it.publicId}</span>
                <span className={`rounded-md px-2 py-1 ${priorityColor[it.priority] ?? ""}`}>{priorityLabel(it.priority)}</span>
                <span className={`rounded-md px-2 py-1 ${statusColor[it.status] ?? ""}`}>{statusLabel(it.status)}</span>
                {it.isFlagged && <span className="rounded-md bg-yellow-300 px-2 py-1 text-yellow-900">Ditandai penting</span>}
                <span className="ml-auto font-normal text-slate-400">
                  {new Date(it.createdAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                </span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed">{it.message}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <select
                  value={it.status}
                  onChange={(e) => patch(it.id, { status: e.target.value })}
                  className="rounded-lg border border-slate-600 bg-slate-900 px-2.5 py-2 text-sm"
                >
                  {STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <button
                  onClick={() => patch(it.id, { isFlagged: !it.isFlagged })}
                  className="rounded-lg bg-slate-700 px-3 py-2 text-sm font-semibold hover:bg-slate-600"
                >
                  {it.isFlagged ? "Batalkan tanda" : "Tandai penting"}
                </button>
                {tab === "aktif" ? (
                  <button
                    onClick={() => patch(it.id, { archived: true })}
                    className="rounded-lg bg-slate-700 px-3 py-2 text-sm font-semibold hover:bg-slate-600"
                  >
                    Arsipkan
                  </button>
                ) : (
                  <button
                    onClick={() => patch(it.id, { archived: false })}
                    className="rounded-lg bg-slate-700 px-3 py-2 text-sm font-semibold hover:bg-slate-600"
                  >
                    Kembalikan
                  </button>
                )}
                <button
                  onClick={() => remove(it.id)}
                  className="rounded-lg bg-red-900/60 px-3 py-2 text-sm font-semibold text-red-200 hover:bg-red-900"
                >
                  Hapus
                </button>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-slate-500">
          Data pengirim tidak ditampilkan — halaman ini hanya berisi kritik anonim.
        </p>
      </main>
    </div>
  );
}
