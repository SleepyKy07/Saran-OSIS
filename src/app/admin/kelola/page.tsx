import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSuperAdmin } from "@/lib/admin-auth";
import { SchoolLogo } from "@/components/school-logo";
import ManageAdmins from "./manage-admins";

export default async function KelolaAdminPage() {
  const me = await requireSuperAdmin();
  if (!me) redirect("/admin");

  return (
    <div className="admin-bg min-h-full text-slate-100">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-900/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 p-1.5 ring-1 ring-white/15">
              <SchoolLogo className="h-full w-full" />
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-violet-300">
                Super Admin
              </p>
              <h1 className="text-lg font-extrabold leading-tight">
                Kelola <span className="text-gradient-ocean">Akun Admin</span>
              </h1>
            </div>
          </div>
          <Link
            href="/admin"
            className="rounded-xl bg-white/10 px-3.5 py-2 text-sm font-semibold ring-1 ring-white/10 transition hover:bg-white/20"
          >
            ← Kembali ke Dashboard
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <p className="text-sm text-slate-300">
          Selamat datang, <b className="text-slate-100">{me.name}</b>. Halaman ini hanya bisa diakses oleh{" "}
          <span className="font-bold text-violet-300">super admin</span> untuk menambah, mengubah, atau menghapus admin lain.
        </p>
        <ManageAdmins meId={me.id} />
      </main>
    </div>
  );
}
