"use client";

import { useState, type ReactNode } from "react";
import { SCHOOL_NAME } from "@/lib/constants";

// Logo dengan fallback berlapis: coba `.png`, lalu `.jpg`,
// kalau tidak ada tampilkan `fallback` (kotak inisial).
// File ditaruh di `public/`, misal `public/logo-sekolah.png`.
export function SmartLogo({
  base,
  alt,
  className,
  fallback,
}: {
  base: string;
  alt: string;
  className?: string;
  fallback: ReactNode;
}) {
  const [idx, setIdx] = useState(0);
  const candidates = [`${base}.png`, `${base}.jpg`];
  if (idx >= candidates.length) return <>{fallback}</>;
  // Sengaja <img>, bukan next/image: src bertingkat (png -> jpg -> fallback)
  // dengan onError tidak didukung penuh oleh optimizer untuk file opsional.
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={candidates[idx]}
      alt={alt}
      draggable={false}
      onError={() => setIdx((i) => i + 1)}
      className={className ?? "h-10 w-10 rounded-xl bg-white object-contain"}
    />
  );
}

export function SchoolLogo({ className }: { className?: string }) {
  return (
    <SmartLogo
      base="/logo-sekolah"
      alt="Logo sekolah"
      className={className}
      fallback={
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-lg font-bold text-white">
          {SCHOOL_NAME.charAt(0)}
        </span>
      }
    />
  );
}

export function OsisLogo({ className }: { className?: string }) {
  return (
    <SmartLogo
      base="/logo-osis"
      alt="Logo OSIS"
      className={className}
      fallback={
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-lg font-bold text-white">
          O
        </span>
      }
    />
  );
}
