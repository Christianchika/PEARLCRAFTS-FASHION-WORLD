/*
  Warnings:

  - A unique constraint covering the columns `[uploadTokenHash]` on the table `CustomOrder` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "UploadStatus" AS ENUM ('PENDING', 'COMPLETED');

-- AlterTable
ALTER TABLE "CustomOrder" ADD COLUMN     "uploadTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN     "uploadTokenHash" TEXT;

-- CreateTable
CREATE TABLE "CustomOrderUpload" (
    "id" TEXT NOT NULL,
    "customOrderId" TEXT NOT NULL,
    "objectKey" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "expectedSize" INTEGER NOT NULL,
    "status" "UploadStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "CustomOrderUpload_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomOrderUpload_objectKey_key" ON "CustomOrderUpload"("objectKey");

-- CreateIndex
CREATE INDEX "CustomOrderUpload_customOrderId_idx" ON "CustomOrderUpload"("customOrderId");

-- CreateIndex
CREATE INDEX "CustomOrderUpload_status_idx" ON "CustomOrderUpload"("status");

-- CreateIndex
CREATE UNIQUE INDEX "CustomOrder_uploadTokenHash_key" ON "CustomOrder"("uploadTokenHash");

-- AddForeignKey
ALTER TABLE "CustomOrderUpload" ADD CONSTRAINT "CustomOrderUpload_customOrderId_fkey" FOREIGN KEY ("customOrderId") REFERENCES "CustomOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
