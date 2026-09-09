"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "@/components/ui";

type AdminUser = {
  id: string;
  username: string;
  name: string;
  isSuper: boolean;
  createdAt: string;
};

const fmt = (s: string) =>
  s ? new Date(s).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) : "—";

export default function ManageAdmins({ meId }: { meId: string }) {
  const router = useRouter();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Form tambah admin
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Form ubah admin yang sedang diedit
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPassword, setEditPassword] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const r = await fetch("/api/admin/manage", { cache: "no-store" });
      if (r.status === 403 || r.status === 401) {
        router.replace("/admin/login");
        return;
      }
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "Gagal memuat data.");
      setAdmins(d.admins);
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

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const r = await fetch("/api/admin/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, password }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "Gagal menambah admin.");
      setName("");
      setUsername("");
      setPassword("");
      setNotice(`✅ Admin "${d.admin.name}" (${d.admin.username}) berhasil dibuat.`);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menambah admin.");
    } finally {
      setBusy(false);
    }
  }

  function startEdit(a: AdminUser) {
    setEditId(a.id);
    setEditName(a.name);
    setEditPassword("");
  }

  async function saveEdit() {
    if (!editId) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const body: { name?: string; password?: string } = {};
      if (editName.trim()) body.name = editName.trim();
      if (editPassword) body.password = editPassword;
      const r = await fetch(`/api/admin/manage/${editId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "Gagal menyimpan perubahan.");
      setEditId(null);
      setEditPassword("");
      setNotice("✅ Perubahan admin tersimpan.");
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan perubahan.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(a: AdminUser) {
    if (!confirm(`Hapus admin "${a.name}" (${a.username})? Dia tidak akan bisa login lagi.`)) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const r = await fetch(`/api/admin/manage/${a.id}`, { method: "DELETE" });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "Gagal menghapus admin.");
      setNotice(`🗑️ Admin "${a.name}" telah dihapus.`);
      if (editId === a.id) {
        setEditId(null);
        setEditPassword("");
      }
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menghapus admin.");
    } finally {
      setBusy(false);
    }
  }

  const inputCls =
    "w-full rounded-xl border-2 border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100";

  return (
    <div className="mt-5 space-y-5">
      {error && <Alert kind="error">{error}</Alert>}
      {notice && <Alert kind="success">{notice}</Alert>}

      {/* Form tambah admin */}
      <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-500/15 to-teal-500/10 p-4 backdrop-blur">
        <h2 className="font-[family-name:var(--font-play)] text-lg font-extrabold text-emerald-200">
          ➕ Tambah Admin Baru
        </h2>
        <p className="mt-1 text-sm text-slate-300">
          Admin baru bisa login ke dashboard &amp; mengelola kritik, tapi tidak bisa mengelola akun admin.
        </p>
        <form onSubmit={create} className="mt-3 grid gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-300">Nama tampilan</label>
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="cth: Bu Sari" required />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-300">Username</label>
            <input className={inputCls} value={username} onChange={(e) => setUsername(e.target.value)} placeholder="cth: sari_osis" autoComplete="off" required />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-300">Password (min 6)</label>
            <input className={inputCls} type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" placeholder="••••••" required />
          </div>
          <div className="sm:col-span-3">
            <button
              type="submit"
              disabled={busy}
              className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-emerald-900/40 transition hover:brightness-110 active:scale-95 disabled:opacity-50"
            >
              {busy ? "Memproses… ⏳" : "💾 Simpan Admin"}
            </button>
          </div>
        </form>
      </section>

      {/* Daftar admin */}
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
        <div className="border-b border-white/10 px-4 py-3">
          <h2 className="font-[family-name:var(--font-play)] text-lg font-extrabold text-slate-100">
            👥 Daftar Admin ({admins.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Dibuat</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">⏳ Memuat…</td></tr>
              )}
              {!loading && admins.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">Belum ada admin.</td></tr>
              )}
              {admins.map((a) => {
                const isMe = a.id === meId;
                return (
                  <tr key={a.id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                    <td className="px-4 py-3">
                      {editId === a.id ? (
                        <input className={inputCls} value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Nama baru" />
                      ) : (
                        <span className="font-semibold text-slate-100">
                          {a.name} {isMe && <span className="ml-1 text-xs text-emerald-300">(kamu)</span>}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-300">{a.username}</td>
                    <td className="px-4 py-3">
                      {a.isSuper ? (
                        <span className="rounded-lg bg-violet-400/15 px-2 py-1 text-xs font-bold text-violet-200 ring-1 ring-violet-400/30">👑 Super</span>
                      ) : (
                        <span className="rounded-lg bg-white/10 px-2 py-1 text-xs font-semibold text-slate-300 ring-1 ring-white/10">Admin</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-400">{fmt(a.createdAt)}</td>
                    <td className="px-4 py-3">
                      {editId === a.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <input
                            className={`${inputCls} w-40`}
                            type="password"
                            value={editPassword}
                            onChange={(e) => setEditPassword(e.target.value)}
                            placeholder="Password baru (opsional)"
                            autoComplete="new-password"
                          />
                          <button onClick={saveEdit} disabled={busy} className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-400">Simpan</button>
                          <button onClick={() => { setEditId(null); setEditPassword(""); }} className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold ring-1 ring-white/10 hover:bg-white/20">Batal</button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => startEdit(a)}
                            disabled={busy}
                            className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold ring-1 ring-white/10 transition hover:bg-white/20 disabled:opacity-40"
                          >
                            ✏️ Ubah
                          </button>
                          {!a.isSuper && (
                            <button
                              onClick={() => remove(a)}
                              disabled={busy}
                              className="rounded-lg bg-rose-500/20 px-3 py-1.5 text-xs font-bold text-rose-200 ring-1 ring-rose-400/30 transition hover:bg-rose-500/40 disabled:opacity-40"
                            >
                              🗑️ Hapus
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      <p className="text-center text-xs text-slate-400">
        👑 Akun <b>super</b> (kamu) adalah satu-satunya yang dapat mengelola admin. Akun super tidak bisa dihapus.
      </p>
    </div>
  );
}
