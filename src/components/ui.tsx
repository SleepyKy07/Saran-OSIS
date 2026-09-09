import Link from "next/link";
import type { ReactNode } from "react";
import { SCHOOL_NAME } from "@/lib/constants";
import { OsisLogo, SchoolLogo } from "./school-logo";

/* ============================================================
   Elemen dasar UI bertema ceria & ramah siswa
   ============================================================ */

export function SiteHeader({ right }: { right?: ReactNode }) {
  return (
    <header className="relative z-10 border-b border-white/60 bg-white/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-3 py-2.5 sm:px-6 sm:py-3.5">
        <Link href="/" className="group flex min-w-0 items-center gap-2 sm:gap-3">
          <SchoolLogo className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0" />
          <span className="min-w-0">
            <span className="hidden sm:block text-[10px] font-bold uppercase tracking-widest text-amber-600 truncate">
              {SCHOOL_NAME}
            </span>
            <span className="block text-sm sm:text-base font-extrabold leading-tight text-slate-800 truncate">
              Kotak Saran <span className="text-emerald-600">OSIS</span>
            </span>
          </span>
        </Link>
        <nav className="flex items-center gap-1.5 text-xs sm:text-sm flex-shrink-0">
          {right}
          <div className="flex items-center gap-1.5 pl-1 border-l border-slate-200 ml-1">
            <OsisLogo className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0" />
            <span className="hidden sm:block leading-tight">
              <span className="block text-xs font-extrabold uppercase tracking-wide text-slate-800">
                OSIS
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                {SCHOOL_NAME}
              </span>
            </span>
          </div>
        </nav>
      </div>
    </header>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`card-fun animate-pop rounded-3xl p-5 sm:p-6 ${className}`}
    >
      {children}
    </div>
  );
}

export function Alert({ kind, children }: { kind: "error" | "success" | "info"; children: ReactNode }) {
  const styles =
    kind === "error"
      ? "border-rose-200 bg-rose-50 text-rose-800"
      : kind === "success"
        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
        : "border-sky-200 bg-sky-50 text-sky-800";
  return (
    <div className={`flex items-start gap-2.5 rounded-2xl border px-4 py-3 text-sm font-medium ${styles}`}>
      <span className="mt-0.5" aria-hidden="true">
        {kind === "error" ? "⚠️" : kind === "success" ? "✅" : "💡"}
      </span>
      <div className="flex-1">{children}</div>
    </div>
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="mb-1.5 block text-sm font-bold text-slate-700">
      <span className="mr-1" aria-hidden="true">✏️</span>
      {children}
    </label>
  );
}

export const inputCls =
  "w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100";

export function PrimaryButton({
  children,
  disabled,
  className = "",
}: {
  children: ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className={`btn-play w-full rounded-2xl px-4 py-3.5 text-[15px] font-extrabold text-white active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none ${className}`}
    >
      {children}
    </button>
  );
}

/* ============================================================
   Doodles & blob dekoratif utk latar halaman siswa
   ============================================================ */
export function ConfettiBlob({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {/* bintang / dot yang mengambang */}
      <span className="animate-floaty absolute left-[6%] top-[8%] text-3xl opacity-80">⭐</span>
      <span className="animate-floaty2 absolute left-[88%] top-[6%] text-4xl opacity-70">🌈</span>
      <span className="animate-floaty delay-2 absolute left-[82%] top-[38%] text-2xl opacity-70">💬</span>
      <span className="animate-floaty2 delay-1 absolute left-[4%] top-[55%] text-3xl opacity-70">✍️</span>
      <span className="animate-floaty delay-3 absolute left-[90%] bottom-[12%] text-3xl opacity-70">🎉</span>
      <span className="animate-floaty2 delay-2 absolute left-[10%] bottom-[8%] text-2xl opacity-60">🌟</span>
      {/* blob warna bulat */}
      <span className="animate-floaty absolute left-[15%] top-[22%] h-6 w-6 rounded-full bg-amber-300/50 blur-[1px]" />
      <span className="animate-floaty2 delay-1 absolute left-[70%] top-[20%] h-8 w-8 rounded-full bg-sky-300/40" />
      <span className="animate-floaty delay-2 absolute bottom-[22%] left-[55%] h-5 w-5 rounded-full bg-rose-300/40" />
      <span className="animate-floaty2 delay-3 absolute left-[40%] top-[12%] h-4 w-4 rounded-full bg-emerald-300/50" />
    </div>
  );
}
