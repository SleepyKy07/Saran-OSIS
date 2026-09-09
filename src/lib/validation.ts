import { z } from "zod";

export const suggestionSchema = z.object({
  message: z.string().trim().min(10, "Isi kritik minimal 10 karakter.").max(2000),
  consent: z.literal(true, { message: "Centang persetujuan terlebih dahulu." }),
});

export const adminLoginSchema = z.object({
  username: z.string().trim().min(3).max(50),
  password: z.string().min(1).max(100),
});

// Membuat admin baru (hanya super). username unik, password min 6 karakter.
export const adminCreateSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter.").max(100),
  username: z
    .string()
    .trim()
    .min(3, "Username minimal 3 karakter.")
    .max(50)
    .regex(/^[a-zA-Z0-9_.-]+$/, "Username hanya boleh huruf, angka, titik, garis bawah, dan strip."),
  password: z.string().min(6, "Password minimal 6 karakter.").max(100),
});

// Mengubah admin: nama dan/atau password baru (wajib minimal satu).
export const adminUpdateSchema = z
  .object({
    name: z.string().trim().min(2, "Nama minimal 2 karakter.").max(100).optional(),
    password: z.string().min(6, "Password minimal 6 karakter.").max(100).optional(),
  })
  .refine((v) => v.name !== undefined || v.password !== undefined, {
    message: "Isi nama atau password baru.",
  });

export const updateSuggestionSchema = z.object({
  status: z.enum(["BARU", "DIBACA", "DIPROSES", "SELESAI"]).optional(),
  isFlagged: z.boolean().optional(),
  archived: z.boolean().optional(),
});

export const resetAccountsSchema = z
  .object({
    ids: z.array(z.string().min(1).max(50)).max(1000).optional(),
    all: z.boolean().optional(),
  })
  .refine((v) => v.all === true || (v.ids && v.ids.length > 0), {
    message: "Pilih akun atau reset semua.",
  });

export const archiveScopeSchema = z.object({
  scope: z.enum(["selesai", "all"]),
});
