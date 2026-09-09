"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert, FieldLabel, PrimaryButton, inputCls } from "@/components/ui";
import { OsisLogo, SchoolLogo } from "@/components/school-logo";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "Login gagal.");
      router.replace("/admin");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login gagal.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-bg flex min-h-full items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        {/* dek */}
        <div className="pointer-events-none absolute" aria-hidden="true">
          <span className="animate-floaty absolute text-2xl opacity-60">⭐</span>
        </div>

        <div className="card-fun animate-pop rounded-3xl p-6 shadow-2xl sm:p-7">
          <div className="flex items-center justify-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-md">
              <SchoolLogo className="h-9 w-9" />
            </span>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-md">
              <OsisLogo className="h-9 w-9" />
            </span>
          </div>
          <p className="mt-4 text-center text-xs font-extrabold uppercase tracking-widest text-slate-400">
            Area Admin OSIS
          </p>
          <h1 className="mt-1 text-center font-[family-name:var(--font-play)] text-2xl font-extrabold text-slate-800">
            Login Admin
          </h1>
          {error && (
            <div className="mt-3">
              <Alert kind="error">{error}</Alert>
            </div>
          )}
          <form onSubmit={onSubmit} className="mt-4 space-y-4">
            <div>
              <FieldLabel>Username</FieldLabel>
              <input
                className={inputCls}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
            <div>
              <FieldLabel>Password</FieldLabel>
              <input
                className={inputCls}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            <PrimaryButton disabled={busy}>{busy ? "Memeriksa… ⏳" : "🔐 Masuk Dashboard"}</PrimaryButton>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-slate-300/80">
          <Link href="/" className="underline underline-offset-2 hover:text-white">
            ← Kembali ke halaman siswa
          </Link>
        </p>
      </div>
    </div>
  );
}
