-- DropIndex
DROP INDEX "suggestions_category_idx";

-- AlterTable
ALTER TABLE "suggestions" DROP COLUMN "category";

-- DropEnum
DROP TYPE "Category";

