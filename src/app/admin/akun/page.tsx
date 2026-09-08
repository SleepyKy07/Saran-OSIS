import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { OsisLogo, SchoolLogo } from "@/components/school-logo";
import AccountsManager from "./akun-manager";

export default async function AkunPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");
  return (
    <div className="min-h-full bg-slate-900 text-slate-100">
      <header className="border-b border-slate-700">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4">
          <div className="flex items-center gap-3">
            <SchoolLogo className="h-9 w-9 rounded-lg bg-white object-contain" />
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400">Dashboard OSIS</p>
              <h1 className="text-lg font-extrabold">Kelola Akun &amp; Jatah Kirim</h1>
            </div>
            <OsisLogo className="h-9 w-9 rounded-lg bg-white object-contain" />
          </div>
          <Link href="/admin" className="rounded-lg bg-slate-700 px-3 py-2 text-sm font-semibold hover:bg-slate-600">
            Kembali
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <AccountsManager />
      </main>
    </div>
  );
}
