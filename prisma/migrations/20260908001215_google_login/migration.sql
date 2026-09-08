-- CreateEnum
CREATE TYPE "Category" AS ENUM ('FASILITAS', 'KEGIATAN_SEKOLAH', 'PEMBELAJARAN', 'KEBERSIHAN', 'ORGANISASI_OSIS', 'LAINNYA');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('BIASA', 'PENTING', 'SANGAT_PENTING');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('BARU', 'DIBACA', 'DIPROSES', 'SELESAI');

-- CreateTable
CREATE TABLE "students" (
    "id" TEXT NOT NULL,
    "googleSubHash" TEXT NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suggestions" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "message" TEXT NOT NULL,
    "priority" "Priority" NOT NULL DEFAULT 'BIASA',
    "status" "Status" NOT NULL DEFAULT 'BARU',
    "isFlagged" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "students_googleSubHash_key" ON "students"("googleSubHash");

-- CreateIndex
CREATE UNIQUE INDEX "suggestions_publicId_key" ON "suggestions"("publicId");

-- CreateIndex
CREATE INDEX "suggestions_status_idx" ON "suggestions"("status");

-- CreateIndex
CREATE INDEX "suggestions_category_idx" ON "suggestions"("category");

-- CreateIndex
CREATE INDEX "suggestions_priority_idx" ON "suggestions"("priority");

-- CreateIndex
CREATE UNIQUE INDEX "admins_username_key" ON "admins"("username");
