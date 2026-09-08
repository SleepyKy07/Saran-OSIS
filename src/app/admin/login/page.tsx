"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert, Card, FieldLabel, PrimaryButton, inputCls } from "@/components/ui";
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
    <div className="flex min-h-full items-center justify-center bg-slate-900 px-4 py-10">
      <Card className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-3">
          <SchoolLogo />
          <OsisLogo />
        </div>
        <p className="mt-3 text-xs font-bold uppercase tracking-widest text-slate-400">Area Admin OSIS</p>
        <h1 className="mt-1 text-xl font-extrabold">Login Admin</h1>
        {error && (
          <div className="mt-3">
            <Alert kind="error">{error}</Alert>
          </div>
        )}
        <form onSubmit={onSubmit} className="mt-4 space-y-4">
          <div>
            <FieldLabel>Username</FieldLabel>
            <input className={inputCls} value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required />
          </div>
          <div>
            <FieldLabel>Password</FieldLabel>
            <input className={inputCls} type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
          </div>
          <PrimaryButton disabled={busy}>{busy ? "Memeriksa…" : "Masuk Dashboard"}</PrimaryButton>
        </form>
      </Card>
    </div>
  );
}
