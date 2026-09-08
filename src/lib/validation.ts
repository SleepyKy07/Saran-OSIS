import { z } from "zod";

export const suggestionSchema = z.object({
  message: z.string().trim().min(10, "Isi kritik minimal 10 karakter.").max(2000),
  priority: z.enum(["BIASA", "PENTING", "SANGAT_PENTING"]).default("BIASA"),
  consent: z.literal(true, { message: "Centang persetujuan terlebih dahulu." }),
});

export const adminLoginSchema = z.object({
  username: z.string().trim().min(3).max(50),
  password: z.string().min(1).max(100),
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
