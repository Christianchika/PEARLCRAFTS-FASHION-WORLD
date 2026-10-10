-- AlterTable
ALTER TABLE "CustomOrder" ADD COLUMN     "quoteNotes" TEXT,
ADD COLUMN     "quoteValidUntil" TIMESTAMP(3),
ADD COLUMN     "quotedAmount" INTEGER,
ADD COLUMN     "quotedAt" TIMESTAMP(3);
