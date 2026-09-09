export const SCHOOL_NAME =
  process.env.NEXT_PUBLIC_SCHOOL_NAME || "Sekolah";

// Prioritas tidak lagi dipilih siswa / tidak ditampilkan ke admin.
// Semua kritik masuk dengan prioritas default "BIASA" di database,
// dan admin tidak mengelola prioritas di UI.

export const STATUSES = [
  { value: "BARU", label: "Baru" },
  { value: "DIBACA", label: "Dibaca" },
  { value: "DIPROSES", label: "Diproses" },
  { value: "SELESAI", label: "Selesai" },
] as const;

export type StatusValue = (typeof STATUSES)[number]["value"];

export function statusLabel(v: string) {
  return STATUSES.find((s) => s.value === v)?.label ?? v;
}
