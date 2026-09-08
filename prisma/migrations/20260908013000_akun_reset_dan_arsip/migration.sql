-- AlterTable
ALTER TABLE "students" ADD COLUMN     "displayCode" TEXT;

-- AlterTable
ALTER TABLE "suggestions" ADD COLUMN     "archived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "archivedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "students_displayCode_key" ON "students"("displayCode");

