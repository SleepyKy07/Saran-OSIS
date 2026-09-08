export const SCHOOL_NAME =
  process.env.NEXT_PUBLIC_SCHOOL_NAME || "Sekolah";

export const PRIORITIES = [
  { value: "BIASA", label: "Biasa" },
  { value: "PENTING", label: "Penting" },
  { value: "SANGAT_PENTING", label: "Sangat penting" },
] as const;

export const STATUSES = [
  { value: "BARU", label: "Baru" },
  { value: "DIBACA", label: "Dibaca" },
  { value: "DIPROSES", label: "Diproses" },
  { value: "SELESAI", label: "Selesai" },
] as const;

export type PriorityValue = (typeof PRIORITIES)[number]["value"];
export type StatusValue = (typeof STATUSES)[number]["value"];

export function priorityLabel(v: string) {
  return PRIORITIES.find((p) => p.value === v)?.label ?? v;
}

export function statusLabel(v: string) {
  return STATUSES.find((s) => s.value === v)?.label ?? v;
}
