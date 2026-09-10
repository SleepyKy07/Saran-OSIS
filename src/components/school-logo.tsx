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
  // width/height mencegah layout shift (CLS); decoding async agar tak memblokir render.
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={candidates[idx]}
      alt={alt}
      width={128}
      height={128}
      decoding="async"
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
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-lg font-extrabold text-white shadow-md shadow-emerald-200">
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
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-lg font-extrabold text-white shadow-md shadow-amber-200">
          O
        </span>
      }
    />
  );
}
