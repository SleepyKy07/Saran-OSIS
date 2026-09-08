import Link from "next/link";
import type { ReactNode } from "react";
import { SCHOOL_NAME } from "@/lib/constants";
import { OsisLogo, SchoolLogo } from "./school-logo";

export function SiteHeader({ right }: { right?: ReactNode }) {
  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-4">
        <Link href="/" className="flex items-center gap-3">
          <SchoolLogo />
          <span>
            <span className="block text-xs font-medium uppercase tracking-wide text-slate-500">
              {SCHOOL_NAME}
            </span>
            <span className="block text-base font-bold text-slate-900">
              Kotak Saran Digital OSIS
            </span>
          </span>
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          {right}
          <OsisLogo />
        </nav>
      </div>
    </header>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function Alert({ kind, children }: { kind: "error" | "success" | "info"; children: ReactNode }) {
  const styles =
    kind === "error"
      ? "border-red-200 bg-red-50 text-red-800"
      : kind === "success"
        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
        : "border-sky-200 bg-sky-50 text-sky-800";
  return <div className={`rounded-xl border px-4 py-3 text-sm ${styles}`}>{children}</div>;
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return <label className="mb-1.5 block text-sm font-semibold text-slate-700">{children}</label>;
}

export const inputCls =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-[15px] text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

export function PrimaryButton({
  children,
  disabled,
}: {
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="w-full rounded-xl bg-emerald-600 px-4 py-3.5 text-[15px] font-bold text-white transition hover:bg-emerald-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </button>
  );
}
